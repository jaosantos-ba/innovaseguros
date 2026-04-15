const SHEET_NAME = 'Leads';
const HEADER_ROW = 2;
const FIRST_DATA_ROW = 3;
const DEFAULT_ORIGEM = 'site_innova';
const DEFAULT_STATUS = 'Novo';

const HEADER_ALIASES = {
  Telefone: ['whatsapp', 'celular', 'fone', 'telefonecontato'],
  Tipo_Seguro: ['tiposeguro', 'seguro', 'produto'],
  Nome_Completo: ['nome', 'nomecliente', 'nomedocliente'],
  CPF_CNPJ: ['documento', 'cpf', 'cnpj'],
  Cidade_Regiao: ['cidade', 'regiao'],
  Melhor_Horario: ['horariopreferencial', 'horario'],
  Observacoes_Gerais: ['mensagem', 'observacoes', 'descricao', 'detalhes', 'resumo'],
  Canal_Retorno: ['canalretorno', 'canalpreferido'],
  Data_Hora_Entrada: ['datahora', 'datahoraentrada', 'submittedat', 'timestamp'],
  URL_Origem: ['currenturl', 'urlorigem', 'url'],
  Pagina_Origem: ['pagepath', 'paginaorigem', 'pathname', 'path'],
  UTM_Source: ['utmsource', 'source'],
  UTM_Medium: ['utmmedium', 'medium'],
  UTM_Campaign: ['utmcampaign', 'campaign'],
  CEP_Pernoite: ['cep', 'cepresidencia'],
  Condutor_Principal_Nascimento: ['datanascimento', 'nascimento', 'nascimentocondutor'],
  Profissao_Condutor: ['profissao'],
  Nascimento_Segurado_Vida: ['nascimento', 'datanascimento'],
  Profissao_Segurado_Vida: ['profissao'],
  Capital_Segurado_Desejado: ['capitalsegurado', 'capitaldesejado'],
  Quantidade_Vidas: ['vidas', 'quantidadebeneficiarios'],
  Faixas_Etarias: ['faixasetarias', 'idades'],
  CNPJ_MEI: ['cnpj', 'mei'],
  Nome_Empresa: ['empresa', 'razaosocial']
};

const YES_NO_HEADERS = [
  'Zero_km', 'Blindado', 'Garagem_Residencia', 'Garagem_Trabalho',
  'Sinistro_5_Anos', 'Condutor_Jovem_Ate_25', 'Possui_Nota_Fiscal',
  'Possui_Alarme', 'Condominio_Fechado', 'Fumante', 'Esporte_Risco',
  'Doenca_Preexistente', 'Gestante', 'Cobertura_Esporte_Aventura',
  'CNPJ_Ativo_6m', 'LGPD_Consentimento'
];

const DATE_HEADERS = [
  'Data_Hora_Entrada', 'Data_Primeiro_Contato', 'Data_Proximo_Followup',
  'Condutor_Principal_Nascimento', 'Data_Compra', 'Nascimento_Segurado_Vida',
  'Data_Ida', 'Data_Volta', 'LGPD_Data_Hora', 'Data_Ganho_Perdido'
];

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'innova-leads-webapp' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = parseRequestData_(e);
    const sheet = getLeadSheet_();
    const headers = sheet.getRange(HEADER_ROW, 1, 1, sheet.getLastColumn()).getValues()[0];
    const normalizedPayload = buildNormalizedPayload_(payload);

    const tipoSeguro = canonicalTipoSeguro_(firstNonEmpty_(
      normalizedPayload.tiposeguro,
      normalizedPayload.seguro,
      normalizedPayload.produto,
      normalizedPayload[normalizeKey_('Tipo_Seguro')]
    ));

    enrichContextualFields_(normalizedPayload, tipoSeguro);

    const consent = readLgpdConsent_(normalizedPayload);
    if (consent.present && !consent.accepted) {
      throw new Error('Consentimento LGPD obrigatório para enviar o formulário.');
    }

    const row = findNextRow_(sheet);
    ensureFormulaColumns_(sheet, row);

    const defaults = {
      Data_Hora_Entrada: parseDateValue_(firstNonEmpty_(
        normalizedPayload.datahoraentrada,
        normalizedPayload.datahora,
        normalizedPayload.submittedat
      )) || new Date(),
      Origem: firstNonEmpty_(normalizedPayload.origem, DEFAULT_ORIGEM),
      Tipo_Seguro: tipoSeguro || '',
      Status_Lead: firstNonEmpty_(normalizedPayload.statuslead, DEFAULT_STATUS),
      Canal_Retorno: firstNonEmpty_(
        normalizedPayload.canalretorno,
        normalizedPayload.telefone || normalizedPayload.whatsapp ? 'WhatsApp' : ''
      ),
      Observacoes_Gerais: firstNonEmpty_(
        normalizedPayload.observacoesgerais,
        normalizedPayload.mensagem,
        normalizedPayload.observacoes,
        ''
      ),
      LGPD_Consentimento: consent.present ? (consent.accepted ? 'Sim' : 'Não') : 'Não informado',
      LGPD_Data_Hora: consent.accepted
        ? (parseDateValue_(firstNonEmpty_(normalizedPayload.lgpddatahora, normalizedPayload.privacidadeaceitaem)) || new Date())
        : ''
    };

    headers.forEach(function(header, index) {
      const column = index + 1;
      let value = resolveValueForHeader_(header, normalizedPayload, tipoSeguro);

      if ((value === '' || value === null || typeof value === 'undefined') && Object.prototype.hasOwnProperty.call(defaults, header)) {
        value = defaults[header];
      }

      if (value === '' || value === null || typeof value === 'undefined') {
        return;
      }

      value = coerceValueForHeader_(header, value);
      sheet.getRange(row, column).setValue(value);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, row: row }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getLeadSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('A aba "' + SHEET_NAME + '" não foi encontrada na planilha vinculada.');
  }
  return sheet;
}

function parseRequestData_(e) {
  if (!e || !e.postData) {
    return {};
  }

  if (e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (jsonError) {
      // fallback para payload de formulário
    }
  }

  if (e.parameter && Object.keys(e.parameter).length) {
    return e.parameter;
  }

  return {};
}

function buildNormalizedPayload_(payload) {
  const flat = {};
  flattenObject_(payload, flat);
  return flat;
}

function flattenObject_(source, target) {
  if (!source || typeof source !== 'object') return;

  Object.keys(source).forEach(function(key) {
    const value = source[key];
    const normalizedKey = normalizeKey_(key);

    if (value === null || typeof value === 'undefined' || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      target[normalizedKey] = value.map(function(item) {
        if (item && typeof item === 'object') {
          return JSON.stringify(item);
        }
        return String(item);
      }).join(', ');
      return;
    }

    if (Object.prototype.toString.call(value) === '[object Date]') {
      target[normalizedKey] = value;
      return;
    }

    if (typeof value === 'object') {
      flattenObject_(value, target);
      return;
    }

    target[normalizedKey] = value;
  });
}

function normalizeKey_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function canonicalTipoSeguro_(value) {
  const normalized = normalizeKey_(value);
  const map = {
    auto: 'Auto',
    moto: 'Moto',
    eletronicos: 'Eletrônicos',
    eletronico: 'Eletrônicos',
    residencial: 'Residencial',
    vida: 'Vida',
    viagem: 'Viagem',
    planodesaude: 'Plano de Saúde',
    saude: 'Plano de Saúde',
    planoodontologico: 'Plano Odontológico',
    odontologico: 'Plano Odontológico',
    odonto: 'Plano Odontológico'
  };
  return map[normalized] || value || '';
}

function enrichContextualFields_(flat, tipoSeguro) {
  const tipo = normalizeKey_(tipoSeguro);

  if (tipo === 'auto' || tipo === 'moto') {
    if (!flat.marcaveiculo && flat.marca) flat.marcaveiculo = flat.marca;
    if (!flat.modeloveiculo && flat.modelo) flat.modeloveiculo = flat.modelo;
    if (!flat.anomodelo && flat.ano) flat.anomodelo = flat.ano;
    if (!flat.tipoveiculo) flat.tipoveiculo = tipoSeguro;
  }

  if (tipo === 'eletronicos') {
    if (!flat.categoriaaparelho && flat.categoria) flat.categoriaaparelho = flat.categoria;
    if (!flat.marcaaparelho && flat.marca) flat.marcaaparelho = flat.marca;
    if (!flat.modeloaparelho && flat.modelo) flat.modeloaparelho = flat.modelo;
    if (!flat.valornota && flat.valor) flat.valornota = flat.valor;
  }

  if (tipo === 'residencial') {
    if (!flat.cepimovel && flat.cep) flat.cepimovel = flat.cep;
  }

  if (tipo === 'viagem') {
    if (!flat.paisdestino && flat.pais) flat.paisdestino = flat.pais;
  }

  if (tipo === 'planodesaude' || tipo === 'planoodontologico') {
    if (!flat.quantidadevidas && flat.vidas) flat.quantidadevidas = flat.vidas;
    if (!flat.nomeempresa && flat.empresa) flat.nomeempresa = flat.empresa;
  }
}

function readLgpdConsent_(flat) {
  const raw = firstNonEmpty_(
    flat.lgpdconsentimento,
    flat.aceitoulgpd,
    flat.privacidadeaceita,
    flat.aceitoupoliticaprivacidade,
    flat.consentimentolgpd
  );

  if (raw === '' || raw === null || typeof raw === 'undefined') {
    return { present: false, accepted: false };
  }

  return {
    present: true,
    accepted: toYesNo_(raw) === 'Sim'
  };
}

function resolveValueForHeader_(header, flat, tipoSeguro) {
  const directKey = normalizeKey_(header);
  if (Object.prototype.hasOwnProperty.call(flat, directKey)) {
    return flat[directKey];
  }

  const aliases = HEADER_ALIASES[header] || [];
  for (var i = 0; i < aliases.length; i += 1) {
    const aliasKey = normalizeKey_(aliases[i]);
    if (Object.prototype.hasOwnProperty.call(flat, aliasKey)) {
      return flat[aliasKey];
    }
  }

  if (header === 'Tipo_Veiculo' && (tipoSeguro === 'Auto' || tipoSeguro === 'Moto')) {
    return tipoSeguro;
  }

  return '';
}

function coerceValueForHeader_(header, value) {
  if (YES_NO_HEADERS.indexOf(header) > -1) {
    return toYesNo_(value);
  }

  if (DATE_HEADERS.indexOf(header) > -1) {
    return parseDateValue_(value) || value;
  }

  if (header === 'Tipo_Seguro') {
    return canonicalTipoSeguro_(value);
  }

  return value;
}

function toYesNo_(value) {
  const normalized = normalizeKey_(value);
  if (['sim', 'true', '1', 'yes', 'checked', 'aceito', 'accepted'].indexOf(normalized) > -1) {
    return 'Sim';
  }
  if (['nao', 'false', '0', 'no', 'unchecked', 'recusado', 'declined'].indexOf(normalized) > -1) {
    return 'Não';
  }
  return value;
}

function parseDateValue_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') return value;

  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return '';
}

function findNextRow_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), FIRST_DATA_ROW);
  const values = sheet.getRange(FIRST_DATA_ROW, 1, lastRow - FIRST_DATA_ROW + 1, 1).getDisplayValues();

  for (var i = 0; i < values.length; i += 1) {
    if (!values[i][0]) {
      return FIRST_DATA_ROW + i;
    }
  }

  return lastRow + 1;
}

function ensureFormulaColumns_(sheet, row) {
  if (!sheet.getRange(row, 2).getFormula()) {
    sheet.getRange(row, 2).setFormula('=IF(A' + row + '="","","LEAD-"&TEXT(ROW()-2,"00000"))');
  }

  if (!sheet.getRange(row, 87).getFormula()) {
    sheet.getRange(row, 87).setFormula('=IF(LEN(L' + row + ')=0,"",IF(L' + row + '="Ganhou","Fechado",IF(L' + row + '="Perdeu","Perdido","Em aberto")))');
  }

  if (!sheet.getRange(row, 88).getFormula()) {
    sheet.getRange(row, 88).setFormula('=IF(A' + row + '="","",TODAY()-A' + row + ')');
  }
}

function firstNonEmpty_() {
  for (var i = 0; i < arguments.length; i += 1) {
    if (arguments[i] !== '' && arguments[i] !== null && typeof arguments[i] !== 'undefined') {
      return arguments[i];
    }
  }
  return '';
}

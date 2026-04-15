const CONFIG = {
  SPREADSHEET_ID: '1ZEPUPoH5IWhew2Skn-CQFHs_UR0HklORu46RvDeba_o',
  SHEET_NAME: 'Leads',
  HEADER_ROW: 2
};

const FIELD_ALIASES = {
  nome: 'Nome_Completo',
  nomeCompleto: 'Nome_Completo',
  whatsapp: 'Telefone',
  telefone: 'Telefone',
  email: 'Email',
  tipoSeguro: 'Tipo_Seguro',
  mensagem: 'Observacoes_Gerais',
  observacoes: 'Observacoes_Gerais',
  origem: 'Origem_Lead',
  paginaOrigem: 'Pagina_Origem',
  urlOrigem: 'URL_Origem',
  utmSource: 'UTM_Source',
  utmMedium: 'UTM_Medium',
  utmCampaign: 'UTM_Campaign',
  utmTerm: 'UTM_Term',
  utmContent: 'UTM_Content',
  lgpdConsentimento: 'LGPD_Consentimento',
  lgpdTexto: 'LGPD_Texto',
  produto: 'Tipo_Seguro',

  // auto / moto
  marcaVeiculo: 'Marca_Veiculo',
  modeloVeiculo: 'Modelo_Veiculo',
  anoVeiculo: 'Ano_Veiculo',
  placaVeiculo: 'Placa_Veiculo',
  renavam: 'Renavam',
  combustivel: 'Combustivel',
  usoVeiculo: 'Uso_Veiculo',
  cepPernoite: 'CEP_Pernoite',
  condutorPrincipal: 'Condutor_Principal',
  dataNascimentoCondutor: 'Data_Nascimento_Condutor',
  sexoCondutor: 'Sexo_Condutor',
  estadoCivilCondutor: 'Estado_Civil_Condutor',
  tempoHabilitacao: 'Tempo_Habilitacao',
  possuiGaragem: 'Possui_Garagem',
  bonusClasse: 'Bonus_Classe',
  sinistroUltimos12Meses: 'Sinistro_Ultimos_12_Meses',
  blindado: 'Blindado',
  rastreador: 'Rastreador',
  cilindrada: 'Cilindrada',

  // eletrônicos
  tipoEletronico: 'Tipo_Eletronico',
  marcaEletronico: 'Marca_Eletronico',
  modeloEletronico: 'Modelo_Eletronico',
  valorBem: 'Valor_Bem',
  dataCompra: 'Data_Compra',
  notaFiscal: 'Possui_Nota_Fiscal',

  // residencial
  tipoImovel: 'Tipo_Imovel',
  finalidadeImovel: 'Finalidade_Imovel',
  ocupacaoImovel: 'Ocupacao_Imovel',
  cepImovel: 'CEP_Imovel',
  cidadeImovel: 'Cidade_Imovel',
  estadoImovel: 'Estado_Imovel',
  metragemImovel: 'Metragem_Imovel',
  tipoConstrucao: 'Tipo_Construcao',
  valorImovel: 'Valor_Imovel',
  valorConteudo: 'Valor_Conteudo',
  possuiAlarme: 'Possui_Alarme',
  possuiPortaria: 'Possui_Portaria',

  // vida
  dataNascimento: 'Data_Nascimento',
  idade: 'Idade',
  profissao: 'Profissao',
  rendaMensal: 'Renda_Mensal',
  fumante: 'Fumante',
  praticaEsporteRisco: 'Pratica_Esporte_Risco',
  possuiDoencaPreexistente: 'Possui_Doenca_Preexistente',
  quantidadeDependentes: 'Quantidade_Dependentes',
  coberturaDesejada: 'Cobertura_Desejada',
  beneficiarios: 'Beneficiarios',

  // viagem
  destino: 'Destino',
  dataIda: 'Data_Ida',
  dataVolta: 'Data_Volta',
  quantidadeViajantes: 'Quantidade_Viajantes',
  idadeViajantes: 'Idade_Viajantes',
  tipoViagem: 'Tipo_Viagem',
  coberturaEspecial: 'Cobertura_Especial',

  // saúde / odonto
  modalidadePlano: 'Modalidade_Plano',
  quantidadeVidas: 'Quantidade_Vidas',
  faixaEtaria: 'Faixa_Etaria',
  abrangencia: 'Abrangencia',
  acomodacao: 'Acomodacao',
  coparticipacao: 'Coparticipacao',
  cnpjMei: 'CNPJ_MEI',
  nomeEmpresa: 'Nome_Empresa',
  interesseOrtodontia: 'Interesse_Ortodontia'
};

function doGet(e) {
  return jsonOutput({
    ok: true,
    message: 'Web App ativo'
  });
}

function doPost(e) {
  try {
    const payload = parseRequestData_(e);
    const sheet = getSheet_();
    const headers = getHeaders_(sheet);

    const normalizedPayload = normalizePayload_(payload);
    const row = buildRowFromHeaders_(headers, normalizedPayload);

    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

    return jsonOutput({
      ok: true,
      message: 'Lead gravado com sucesso',
      row: nextRow
    });
  } catch (error) {
    return jsonOutput({
      ok: false,
      message: error.message
    });
  }
}

function parseRequestData_(e) {
  const data = {};

  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(function(key) {
      data[key] = e.parameter[key];
    });
  }

  if (e && e.postData && e.postData.contents) {
    const raw = e.postData.contents;
    const type = (e.postData.type || '').toLowerCase();

    if (type.indexOf('application/json') !== -1) {
      const json = JSON.parse(raw);
      Object.keys(json).forEach(function(key) {
        data[key] = json[key];
      });
    } else if (type.indexOf('application/x-www-form-urlencoded') !== -1) {
      const parsed = parseQueryString_(raw);
      Object.keys(parsed).forEach(function(key) {
        data[key] = parsed[key];
      });
    }
  }

  return data;
}

function parseQueryString_(query) {
  const obj = {};
  if (!query) return obj;

  query.split('&').forEach(function(part) {
    const pair = part.split('=');
    const key = decodeURIComponent((pair[0] || '').replace(/\+/g, ' '));
    const value = decodeURIComponent((pair[1] || '').replace(/\+/g, ' '));
    obj[key] = value;
  });

  return obj;
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    throw new Error('A aba "' + CONFIG.SHEET_NAME + '" não foi encontrada.');
  }

  return sheet;
}

function getHeaders_(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    throw new Error('A aba Leads está sem colunas.');
  }

  const headers = sheet
    .getRange(CONFIG.HEADER_ROW, 1, 1, lastColumn)
    .getValues()[0]
    .map(function(h) {
      return String(h || '').trim();
    });

  if (!headers.some(Boolean)) {
    throw new Error('A linha de cabeçalho configurada está vazia.');
  }

  return headers;
}

function normalizePayload_(payload) {
  const normalized = {};

  Object.keys(payload).forEach(function(originalKey) {
    const value = payload[originalKey];
    const mappedKey = FIELD_ALIASES[originalKey] || originalKey;
    normalized[mappedKey] = sanitizeValue_(value);
  });

  if (!normalized.Data_Recebimento) {
    normalized.Data_Recebimento = new Date();
  }

  if (!normalized.Status_Lead) {
    normalized.Status_Lead = 'Novo';
  }

  if (!normalized.LGPD_Consentimento) {
    normalized.LGPD_Consentimento = 'Não';
  }

  return normalized;
}

function sanitizeValue_(value) {
  if (value === null || value === undefined) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return value;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value).trim();
}

function buildRowFromHeaders_(headers, payload) {
  return headers.map(function(header) {
    if (!header) return '';

    if (header === 'Data_Recebimento' && !payload[header]) {
      return new Date();
    }

    return payload.hasOwnProperty(header) ? payload[header] : '';
  });
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
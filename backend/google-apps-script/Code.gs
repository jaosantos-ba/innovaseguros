/**
 * =========================================================
 * INNOVA CORRETORA DE SEGUROS
 * Google Apps Script - múltiplas planilhas por tipo de seguro
 * =========================================================
 *
 * O que este script faz:
 * 1. Recebe os dados enviados pelo formulário do site
 * 2. Identifica o tipo de seguro (Auto, Moto, Vida, etc.)
 * 3. Escolhe a planilha correta com base no tipo de seguro
 * 4. Localiza a aba "Leads"
 * 5. Lê os cabeçalhos da linha 2
 * 6. Monta a linha de dados
 * 7. Grava o lead na próxima linha disponível
 *
 * IMPORTANTE:
 * - Você precisa preencher os IDs das planilhas abaixo
 * - Em cada planilha precisa existir uma aba chamada "Leads"
 * - Os cabeçalhos devem estar na linha 2
 */


/**
 * =========================================================
 * CONFIGURAÇÕES PRINCIPAIS
 * =========================================================
 */
const CONFIG = {
  /**
   * Nome da aba onde os leads serão gravados
   * Deve existir em TODAS as planilhas
   */
  SHEET_NAME: 'Leads',

  /**
   * Linha onde estão os cabeçalhos da planilha
   * Exemplo:
   * Linha 1 = título visual
   * Linha 2 = cabeçalhos reais
   */
  HEADER_ROW: 2,

  /**
   * IDs das planilhas por tipo de seguro
   *
   * COMO PEGAR O ID:
   * Se a URL da planilha for:
   * https://docs.google.com/spreadsheets/d/1ABCxyz1234567890/edit
   *
   * O ID será:
   * 1ABCxyz1234567890
   */
  SPREADSHEET_IDS_BY_INSURANCE: {
    auto: '13RNonmhKAWTLhLqMRoVIGj-ar3uSTqV0jcFziEI4m-0',
    moto: '1oad4okmXXGculHD8vK_RLGy85L_0jmZWkiuxlX30e60',
    eletronicos: '19MKcFVHhanyQJ5LuIdiFjuszCwS9JlPtokVRCy1ZaJ8',
    residencial: '1Y_3DdMMIGesmYk2NZ7Z2DWMyv3IuS2weAXCN83UUr7U',
    vida: '1z_OuBL8CEq8St018z9v1-dSOAuyoIvN4Ix_cC5cXrx0',
    viagem: '1G7lMXNfHFns0onvg7X77C38HBqC4Yx2KtQBRtUBd0NY',
    saude: '1FGa78uev722OKu0kfIjVtDQPt98f2FOFOHmEpsjL54Q',
    odonto: '1weZC9y5n2eo8HUFhAw_s-6W1f3dfVjuaMHWVtZLpnjU'
  }
};


/**
 * =========================================================
 * ALIASES DE CAMPOS
 * =========================================================
 *
 * Serve para aceitar tanto:
 * - nomes simples vindos do frontend
 * quanto:
 * - nomes exatos dos cabeçalhos da planilha
 *
 * Exemplo:
 * Se o frontend enviar "nome",
 * o script converte para "Nome_Completo"
 */
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


/**
 * =========================================================
 * TESTE RÁPIDO DO WEB APP
 * =========================================================
 *
 * Quando você abrir a URL do Web App no navegador,
 * esse método responde informando que está ativo.
 */
function doGet() {
  return jsonOutput({
    ok: true,
    message: 'Web App ativo'
  });
}


/**
 * =========================================================
 * RECEBIMENTO DOS DADOS DO FORMULÁRIO
 * =========================================================
 *
 * Esse é o ponto principal.
 * O site envia os dados para cá via POST.
 */
function doPost(e) {
  try {
    // 1. Lê os dados enviados pelo site
    const payload = parseRequestData_(e);

    // 2. Normaliza nomes de campos e valores
    const normalizedPayload = normalizePayload_(payload);

    // 3. Descobre qual é o tipo de seguro enviado
    const insuranceKey = getInsuranceKey_(normalizedPayload);

    // 4. Pega o ID da planilha correta
    const spreadsheetId = getSpreadsheetIdByInsurance_(insuranceKey);

    // 5. Abre a planilha correta e a aba Leads
    const sheet = getSheet_(spreadsheetId);

    // 6. Lê os cabeçalhos da linha 2
    const headers = getHeaders_(sheet);

    // 7. Monta a linha respeitando a ordem das colunas
    const row = buildRowFromHeaders_(headers, normalizedPayload);

    // 8. Descobre a próxima linha vazia
    const nextRow = sheet.getLastRow() + 1;

    // 9. Grava a linha
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

    // 10. Retorna sucesso
    return jsonOutput({
      ok: true,
      message: 'Lead gravado com sucesso',
      insurance: insuranceKey,
      row: nextRow
    });

  } catch (error) {
    // Em caso de erro, responde com mensagem clara
    return jsonOutput({
      ok: false,
      message: error.message
    });
  }
}


/**
 * =========================================================
 * LÊ OS DADOS RECEBIDOS DO FRONTEND
 * =========================================================
 *
 * Esse método tenta ler:
 * - e.parameter (form-urlencoded)
 * - JSON puro, se existir
 */
function parseRequestData_(e) {
  const data = {};

  // Dados recebidos em formato tradicional de formulário
  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(function(key) {
      data[key] = e.parameter[key];
    });
  }

  // Caso venha body cru no postData
  if (e && e.postData && e.postData.contents) {
    const raw = e.postData.contents;
    const type = (e.postData.type || '').toLowerCase();

    // Se vier JSON
    if (type.indexOf('application/json') !== -1) {
      const json = JSON.parse(raw);
      Object.keys(json).forEach(function(key) {
        data[key] = json[key];
      });

    // Se vier form-urlencoded
    } else if (type.indexOf('application/x-www-form-urlencoded') !== -1) {
      const parsed = parseQueryString_(raw);
      Object.keys(parsed).forEach(function(key) {
        data[key] = parsed[key];
      });
    }
  }

  return data;
}


/**
 * =========================================================
 * FAZ O PARSE DE UMA QUERY STRING
 * =========================================================
 *
 * Exemplo:
 * nome=Jose&telefone=71999999999
 */
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


/**
 * =========================================================
 * NORMALIZA OS CAMPOS RECEBIDOS
 * =========================================================
 *
 * Converte aliases em nomes oficiais de coluna.
 * Exemplo:
 * nome -> Nome_Completo
 */
function normalizePayload_(payload) {
  const normalized = {};

  Object.keys(payload).forEach(function(originalKey) {
    const value = payload[originalKey];
    const mappedKey = FIELD_ALIASES[originalKey] || originalKey;
    normalized[mappedKey] = sanitizeValue_(value);
  });

  // Preenchimentos automáticos caso não venham do frontend
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


/**
 * =========================================================
 * LIMPA E PADRONIZA VALORES
 * =========================================================
 */
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


/**
 * =========================================================
 * DESCOBRE O TIPO DE SEGURO
 * =========================================================
 *
 * O frontend geralmente envia:
 * Tipo_Seguro = Auto / Moto / Vida / etc.
 *
 * Esse método transforma isso em uma chave interna:
 * auto, moto, vida...
 */
function getInsuranceKey_(payload) {
  const rawType = String(payload.Tipo_Seguro || '').toLowerCase().trim();

  if (!rawType) {
    throw new Error('Tipo_Seguro não foi enviado pelo formulário.');
  }

  if (rawType.indexOf('auto') !== -1) return 'auto';
  if (rawType.indexOf('moto') !== -1) return 'moto';
  if (rawType.indexOf('eletr') !== -1) return 'eletronicos';
  if (rawType.indexOf('resid') !== -1) return 'residencial';
  if (rawType.indexOf('vida') !== -1) return 'vida';
  if (rawType.indexOf('viag') !== -1) return 'viagem';
  if (rawType.indexOf('sa') !== -1) return 'saude';
  if (rawType.indexOf('odont') !== -1) return 'odonto';

  throw new Error('Tipo_Seguro não reconhecido: ' + payload.Tipo_Seguro);
}


/**
 * =========================================================
 * RETORNA O ID DA PLANILHA PELO TIPO DE SEGURO
 * =========================================================
 */
function getSpreadsheetIdByInsurance_(insuranceKey) {
  const spreadsheetId = CONFIG.SPREADSHEET_IDS_BY_INSURANCE[insuranceKey];

  if (!spreadsheetId || spreadsheetId.indexOf('COLE_AQUI') !== -1) {
    throw new Error(
      'ID da planilha não configurado para o seguro: ' + insuranceKey
    );
  }

  return spreadsheetId;
}


/**
 * =========================================================
 * ABRE A PLANILHA E PEGA A ABA Leads
 * =========================================================
 */
function getSheet_(spreadsheetId) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    throw new Error(
      'A aba "' + CONFIG.SHEET_NAME + '" não foi encontrada na planilha.'
    );
  }

  return sheet;
}


/**
 * =========================================================
 * LÊ OS CABEÇALHOS DA LINHA CONFIGURADA
 * =========================================================
 */
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
    throw new Error('A linha de cabeçalhos está vazia.');
  }

  return headers;
}


/**
 * =========================================================
 * MONTA A LINHA NA MESMA ORDEM DOS CABEÇALHOS
 * =========================================================
 *
 * Se a coluna existir no cabeçalho, o valor é colocado nela.
 * Se não existir, fica vazio.
 */
function buildRowFromHeaders_(headers, payload) {
  return headers.map(function(header) {
    if (!header) return '';

    // Se não existir Data_Recebimento no payload, preenche automaticamente
    if (header === 'Data_Recebimento' && !payload[header]) {
      return new Date();
    }

    return payload.hasOwnProperty(header) ? payload[header] : '';
  });
}


/**
 * =========================================================
 * RETORNA JSON PARA O FRONTEND
 * =========================================================
 */
function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
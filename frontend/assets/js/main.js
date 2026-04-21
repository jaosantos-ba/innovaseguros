(function () {
  const DEFAULT_CONFIG = {
    whatsappNumber: '5571981125225',
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbxaez2Npo9wnmS8k5bQGyQ0l_ctlFrzAKZ1U7ypM_-W5J3dlzeS6uc1McH7CFEfQzS-/exec'
  };

  const CONFIG = Object.assign({}, DEFAULT_CONFIG, window.INNOVA_CONFIG || {});

  const COMMON_FIELD_ORDER = [
    'Nome_Completo',
    'Telefone',
    'Email',
    'CPF_CNPJ',
    'Cidade_Regiao',
    'Atendimento',
    'Melhor_Horario',
    'Canal_Retorno'
  ];

  const INSURANCE_FIELD_ORDER = {
    auto: [
      'Tipo_Veiculo', 'Marca_Veiculo', 'Modelo_Veiculo', 'Ano_Modelo', 'Ano_Fabricacao', 'Placa',
      'Combustivel', 'Uso_Veiculo', 'CEP_Pernoite', 'Condutor_Principal_Nascimento', 'Condutor_Principal_Sexo',
      'Estado_Civil', 'Profissao_Condutor', 'Bonus_Classe', 'Zero_km', 'Blindado',
      'Garagem_Residencia', 'Garagem_Trabalho', 'Sinistro_5_Anos', 'Condutor_Jovem_Ate_25'
    ],
    moto: [
      'Tipo_Veiculo', 'Marca_Veiculo', 'Modelo_Veiculo', 'Ano_Modelo', 'Ano_Fabricacao', 'Placa',
      'Combustivel', 'Uso_Veiculo', 'CEP_Pernoite', 'Condutor_Principal_Nascimento', 'Condutor_Principal_Sexo',
      'Estado_Civil', 'Profissao_Condutor', 'Sinistro_5_Anos', 'Condutor_Jovem_Ate_25'
    ],
    eletronicos: [
      'Categoria_Aparelho', 'Marca_Aparelho', 'Modelo_Aparelho', 'Valor_Nota', 'Data_Compra',
      'Possui_Nota_Fiscal', 'Uso_Predominante'
    ],
    residencial: [
      'Tipo_Imovel', 'Finalidade_Imovel', 'Ocupacao_Imovel', 'Tipo_Construcao', 'Metragem_Aprox_m2',
      'Valor_Imovel', 'Valor_Conteudo', 'Possui_Alarme', 'Condominio_Fechado', 'CEP_Imovel'
    ],
    vida: [
      'Nascimento_Segurado_Vida', 'Profissao_Segurado_Vida', 'Renda_Mensal', 'Fumante', 'Esporte_Risco',
      'Doenca_Preexistente', 'Capital_Segurado_Desejado', 'Numero_Dependentes'
    ],
    viagem: [
      'Destino', 'Pais_Destino', 'Data_Ida', 'Data_Volta', 'Quantidade_Viajantes', 'Idades_Viajantes',
      'Gestante', 'Cobertura_Esporte_Aventura'
    ],
    saude: [
      'Modalidade_Plano', 'Tipo_Contratacao', 'Quantidade_Vidas', 'Faixas_Etarias', 'CNPJ_MEI',
      'CNPJ_Ativo_6m', 'Abrangencia', 'Acomodacao', 'Coparticipacao', 'Nome_Empresa'
    ],
    odonto: [
      'Modalidade_Plano', 'Tipo_Contratacao', 'Quantidade_Vidas', 'Faixas_Etarias', 'CNPJ_MEI',
      'CNPJ_Ativo_6m', 'Abrangencia', 'Ortodontia', 'Nome_Empresa'
    ]
  };

  const LABELS = {
    Tipo_Seguro: 'Tipo de seguro',
    Nome_Completo: 'Nome completo',
    Telefone: 'WhatsApp',
    Email: 'E-mail',
    CPF_CNPJ: 'CPF',
    Cidade_Regiao: 'Cidade ou região',
    Atendimento: 'Preferência de atendimento',
    Melhor_Horario: 'Melhor horário para contato',
    Canal_Retorno: 'Canal de retorno preferido',
    Tipo_Veiculo: 'Tipo de veículo',
    Marca_Veiculo: 'Marca do veículo',
    Modelo_Veiculo: 'Modelo do veículo',
    Ano_Modelo: 'Ano/modelo',
    Ano_Fabricacao: 'Ano de fabricação',
    Placa: 'Placa',
    Combustivel: 'Combustível',
    Uso_Veiculo: 'Uso do veículo',
    CEP_Pernoite: 'CEP de pernoite',
    Condutor_Principal_Nascimento: 'Nascimento do condutor principal',
    Condutor_Principal_Sexo: 'Sexo do condutor principal',
    Estado_Civil: 'Estado civil',
    Profissao_Condutor: 'Profissão do condutor',
    Bonus_Classe: 'Classe de bônus',
    Zero_km: 'Veículo zero km',
    Blindado: 'Veículo blindado',
    Garagem_Residencia: 'Possui garagem na residência',
    Garagem_Trabalho: 'Possui garagem no trabalho',
    Sinistro_5_Anos: 'Teve sinistro nos últimos 5 anos',
    Condutor_Jovem_Ate_25: 'Há condutor jovem até 25 anos',
    Categoria_Aparelho: 'Categoria do aparelho',
    Marca_Aparelho: 'Marca do aparelho',
    Modelo_Aparelho: 'Modelo do aparelho',
    Valor_Nota: 'Valor da nota',
    Data_Compra: 'Data da compra',
    Possui_Nota_Fiscal: 'Possui nota fiscal',
    Uso_Predominante: 'Uso predominante',
    Tipo_Imovel: 'Tipo de imóvel',
    Finalidade_Imovel: 'Finalidade do imóvel',
    Ocupacao_Imovel: 'Ocupação do imóvel',
    Tipo_Construcao: 'Tipo de construção',
    Metragem_Aprox_m2: 'Metragem aproximada (m²)',
    Valor_Imovel: 'Valor do imóvel',
    Valor_Conteudo: 'Valor do conteúdo',
    Possui_Alarme: 'Possui alarme',
    Condominio_Fechado: 'Condomínio fechado',
    CEP_Imovel: 'CEP do imóvel',
    Nascimento_Segurado_Vida: 'Nascimento do segurado',
    Profissao_Segurado_Vida: 'Profissão do segurado',
    Renda_Mensal: 'Renda mensal',
    Fumante: 'Fumante',
    Esporte_Risco: 'Pratica esporte de risco',
    Doenca_Preexistente: 'Doença preexistente',
    Capital_Segurado_Desejado: 'Capital segurado desejado',
    Numero_Dependentes: 'Número de dependentes',
    Destino: 'Destino',
    Pais_Destino: 'País de destino',
    Data_Ida: 'Data de ida',
    Data_Volta: 'Data de volta',
    Quantidade_Viajantes: 'Quantidade de viajantes',
    Idades_Viajantes: 'Idades dos viajantes',
    Gestante: 'Gestante',
    Cobertura_Esporte_Aventura: 'Cobertura para esporte/aventura',
    Modalidade_Plano: 'Modalidade do plano',
    Tipo_Contratacao: 'Tipo de contratação',
    Quantidade_Vidas: 'Quantidade de vidas',
    Faixas_Etarias: 'Faixas etárias',
    CNPJ_MEI: 'CNPJ/MEI',
    CNPJ_Ativo_6m: 'CNPJ ativo há 6 meses',
    Abrangencia: 'Abrangência',
    Acomodacao: 'Acomodação',
    Coparticipacao: 'Coparticipação',
    Nome_Empresa: 'Nome da empresa',
    Ortodontia: 'Ortodontia',
    Observacoes_Gerais: 'Observações adicionais',
    LGPD_Consentimento: 'Consentimento LGPD'
  };

  function onlyDigits(value) {
    return String(value || '').replace(/\D+/g, '');
  }

  function formatPhone(value) {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function formatCEP(value) {
    const digits = onlyDigits(value).slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  }

  function formatCpfCnpj(value) {
    const digits = onlyDigits(value).slice(0, 14);
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  function applyMasks() {
    document.querySelectorAll('input[type="tel"], input[name="Telefone"], input[name="WhatsApp"]').forEach((input) => {
      input.addEventListener('input', () => input.value = formatPhone(input.value));
    });
    document.querySelectorAll('input[data-mask="cep"], input[name^="CEP_"]').forEach((input) => {
      input.addEventListener('input', () => input.value = formatCEP(input.value));
    });
    document.querySelectorAll('input[name="CPF_CNPJ"], input[name="CNPJ_MEI"]').forEach((input) => {
      input.addEventListener('input', () => input.value = formatCpfCnpj(input.value));
    });
  }

  function getUTMs() {
    const params = new URLSearchParams(window.location.search);
    return {
      UTM_Source: params.get('utm_source') || '',
      UTM_Medium: params.get('utm_medium') || '',
      UTM_Campaign: params.get('utm_campaign') || ''
    };
  }

  function setFieldError(fieldWrap, message) {
    if (!fieldWrap) return;
    fieldWrap.classList.add('has-error');
    const error = fieldWrap.querySelector('.field-error');
    if (error) error.textContent = message;
  }

  function clearFieldError(fieldWrap) {
    if (!fieldWrap) return;
    fieldWrap.classList.remove('has-error');
  }

  function validateForm(form) {
    let valid = true;
    form.querySelectorAll('.field').forEach((field) => clearFieldError(field));

    form.querySelectorAll('[required]').forEach((input) => {
      const field = input.closest('.field') || input.closest('label');
      const type = input.getAttribute('type');
      let ok = !!String(input.value || '').trim();
      if (type === 'checkbox') ok = input.checked;
      if (type === 'email' && ok) ok = /.+@.+\..+/.test(input.value.trim());
      if (input.name === 'Telefone' && ok) ok = onlyDigits(input.value).length >= 10;
      if (!ok) {
        valid = false;
        setFieldError(field, type === 'checkbox' ? 'É necessário aceitar para continuar.' : 'Preencha este campo corretamente.');
      }
    });

    return valid;
  }

  function collectPayload(form) {
    const payload = {
      Origem: 'site_innova',
      Data_Hora_Entrada: new Date().toISOString(),
      URL_Origem: window.location.href,
      Pagina_Origem: window.location.pathname,
      ...getUTMs()
    };

    const elements = form.querySelectorAll('input, select, textarea');
    elements.forEach((el) => {
      if (!el.name) return;
      if (el.type === 'checkbox') {
        payload[el.name] = el.checked ? 'Sim' : 'Não';
        if (el.name === 'LGPD_Consentimento' && el.checked) {
          payload.LGPD_Data_Hora = new Date().toISOString();
        }
        return;
      }
      payload[el.name] = String(el.value || '').trim();
    });

    if (!payload.Canal_Retorno) payload.Canal_Retorno = 'WhatsApp';
    return payload;
  }

  async function sendToGoogleSheets(payload) {
    if (!CONFIG.googleScriptUrl || CONFIG.googleScriptUrl.includes('COLE_AQUI')) {
      return { ok: false, skipped: true };
    }

    const formData = new URLSearchParams();
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      formData.append(key, value == null ? '' : String(value));
    });

    try {
      await fetch(CONFIG.googleScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
      return { ok: true, opaque: true };
    } catch (error) {
      throw new Error('Não foi possível conectar ao envio da planilha. Verifique a URL publicada do Apps Script e as permissões do Web App.');
    }
  }

  function normalizeInsuranceKey(value) {
    const raw = String(value || '').trim().toLowerCase();
    const normalized = raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/plano\s+de\s+/g, '')
      .replace(/seguro\s+de\s+/g, '')
      .replace(/seguro\s+/g, '')
      .replace(/[^a-z0-9]+/g, '');

    const map = {
      auto: 'auto',
      moto: 'moto',
      eletronico: 'eletronicos',
      eletronicos: 'eletronicos',
      residencial: 'residencial',
      vida: 'vida',
      viagem: 'viagem',
      saude: 'saude',
      odontologico: 'odonto',
      odonto: 'odonto'
    };

    return map[normalized] || normalized;
  }

  function getOrderedFieldNames(payload) {
    const insuranceKey = normalizeInsuranceKey(payload.Tipo_Seguro);
    const ordered = ['Tipo_Seguro', ...COMMON_FIELD_ORDER, ...(INSURANCE_FIELD_ORDER[insuranceKey] || []), 'Observacoes_Gerais', 'LGPD_Consentimento'];
    const unique = [];

    ordered.forEach((name) => {
      if (!unique.includes(name)) unique.push(name);
    });

    Object.keys(payload).forEach((name) => {
      if (!unique.includes(name)) unique.push(name);
    });

    return unique;
  }

  function shouldIncludeInWhatsApp(name, value) {
    if (value == null) return false;
    const text = String(value).trim();
    if (!text) return false;

    const excluded = [
      'Origem', 'Data_Hora_Entrada', 'URL_Origem', 'Pagina_Origem',
      'UTM_Source', 'UTM_Medium', 'UTM_Campaign', 'LGPD_Data_Hora'
    ];

    return !excluded.includes(name);
  }

  function getFieldLabel(name) {
    return LABELS[name] || name.replace(/_/g, ' ');
  }

  function buildWhatsAppMessage(payload) {
    const insuranceKey = normalizeInsuranceKey(payload.Tipo_Seguro);
    const lines = [
      'Olá! Quero avançar com uma cotação da Innova.',
      '',
      '*Resumo do formulário*'
    ];

    const orderedFields = getOrderedFieldNames(payload);

    orderedFields.forEach((name) => {
      const value = payload[name];
      if (!shouldIncludeInWhatsApp(name, value)) return;
      lines.push(`${getFieldLabel(name)}: ${value}`);
    });

    if (insuranceKey && INSURANCE_FIELD_ORDER[insuranceKey]) {
      lines.push('', 'Aguardo o retorno com a análise inicial da cotação.');
    }

    return lines.join('\n');
  }

  function openWhatsApp(payload) {
    const text = encodeURIComponent(buildWhatsAppMessage(payload));
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
    window.open(url, '_blank', 'noopener');
  }

  function setStatus(form, message, isError) {
    const box = form.querySelector('.status-message');
    if (!box) return;
    box.textContent = message;
    box.className = `status-message is-visible ${isError ? 'is-error' : 'is-success'}`;
  }

  function setLoading(form, loading) {
    const button = form.querySelector('[type="submit"]');
    if (!button) return;
    if (!button.dataset.originalText) button.dataset.originalText = button.textContent;
    button.disabled = loading;
    button.classList.toggle('is-loading', loading);
    button.textContent = loading ? 'Enviando...' : button.dataset.originalText;
  }

  function bindLeadForms() {
    document.querySelectorAll('.js-lead-form').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        setStatus(form, '', false);
        if (!validateForm(form)) {
          setStatus(form, 'Revise os campos obrigatórios para continuar.', true);
          return;
        }

        const payload = collectPayload(form);
        setLoading(form, true);

        try {
          const result = await sendToGoogleSheets(payload);
          if (!result.ok && !result.skipped) {
            throw new Error((result.data && result.data.message) || 'Não foi possível enviar os dados neste momento.');
          }
          setStatus(form, result.skipped
            ? 'Formulário validado. Configure a URL do Apps Script para gravar automaticamente na planilha.'
            : 'Dados enviados com sucesso. Vamos abrir o WhatsApp para agilizar o seu atendimento.', false);
          openWhatsApp(payload);
          if (!result.skipped) form.reset();
        } catch (error) {
          setStatus(form, error.message || 'Ocorreu um erro ao enviar o formulário.', true);
        } finally {
          setLoading(form, false);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyMasks();
    bindLeadForms();
  });
})();

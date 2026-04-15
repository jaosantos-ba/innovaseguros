(function () {
  const DEFAULT_CONFIG = {
    whatsappNumber: '5571981125225',
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbzcSiNYZQBEiVxgwgBZUKJYOR5BnnvDsbg-YONHK2sfJHrVVdTIA8MI28osSFauo_8b8A/exec'
  };

  const CONFIG = Object.assign({}, DEFAULT_CONFIG, window.INNOVA_CONFIG || {});

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

  function buildWhatsAppMessage(payload) {
    const linhas = [
      `Olá! Quero avançar com uma cotação da Innova.`,
      `Seguro: ${payload.Tipo_Seguro || '-'}`,
      `Nome: ${payload.Nome_Completo || '-'}`,
      `Telefone: ${payload.Telefone || '-'}`
    ];
    if (payload.Email) linhas.push(`E-mail: ${payload.Email}`);
    if (payload.Cidade_Regiao) linhas.push(`Região: ${payload.Cidade_Regiao}`);
    if (payload.Observacoes_Gerais) linhas.push(`Observações: ${payload.Observacoes_Gerais}`);
    return linhas.join('\n');
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
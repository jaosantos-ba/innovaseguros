# Innova Corretora de Seguros

Estrutura profissional do projeto institucional da Innova Corretora de Seguros, com foco em captação de leads, armazenamento em Google Sheets e continuidade do atendimento via WhatsApp.

## Estrutura

```text
innova-corretora-professional/
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── assets/
│       ├── css/
│       ├── js/
│       └── img/
├── backend/
│   └── google-apps-script/
├── spreadsheets/
│   └── innova-planilha-leads-google-sheets.xlsx
└── docs/
    ├── arquitetura.md
    ├── implantacao.md
    └── formulario-leads.md
```

## Stack adotada
- Frontend estático em HTML, CSS e JavaScript
- Integração com Google Apps Script
- Armazenamento de leads em Google Sheets
- Encaminhamento comercial via WhatsApp

## Fluxo
1. O cliente preenche o formulário.
2. O JavaScript envia o lead para o Google Apps Script.
3. O script grava as informações na planilha Google.
4. O site abre o WhatsApp com mensagem pré-formatada.

## Dados oficiais
- Telefone: (71) 98112-5225
- E-mail: contato@innovaseguros.net.br
- Instagram: https://www.instagram.com/innovacorretoradeseguros/
- Facebook: https://www.facebook.com/innovacorretoradeseguros/
- LinkedIn: https://www.linkedin.com/innovacorretoradeseguros/
- YouTube: https://www.youtube.com/innovacorretoradeseguros/


## Planilha estruturada e Apps Script
- A planilha em `spreadsheets/innova-planilha-leads-google-sheets.xlsx` está pronta para importação no Google Sheets.
- O `Code.gs` foi adaptado para gravar cada campo do payload em colunas específicas da aba `Leads`.
- Para máxima compatibilidade, use nos formulários os mesmos nomes dos cabeçalhos da linha 2 da aba `Leads` (ex.: `Nome_Completo`, `Tipo_Seguro`, `Marca_Veiculo`).
- O script também aceita aliases comuns, como `nome`, `whatsapp`, `tipoSeguro`, `mensagem`, `utm_source` e `lgpdConsentimento`.


## Atualização do frontend
- Landing page em `frontend/public/index.html`
- Uma página de formulário por tipo de seguro em `frontend/public/seguros/`
- Configuração central em `frontend/public/config/env.js`
- Todos os formulários enviam nomes de campos compatíveis com a planilha estruturada
- Envio condicionado ao consentimento LGPD

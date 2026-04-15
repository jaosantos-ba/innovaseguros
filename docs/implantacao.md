# Implantação

## Frontend
Hospede a pasta `frontend/` em qualquer serviço de hospedagem estática.

## Google Apps Script
1. Importe a planilha `spreadsheets/innova-planilha-leads-google-sheets.xlsx` para o Google Sheets.
2. Crie um novo projeto no Google Apps Script vinculado à planilha importada.
3. Copie `backend/google-apps-script/Code.gs`.
4. Copie `backend/google-apps-script/appsscript.json`.
5. Publique como Web App com acesso apropriado.
6. Cole a URL do Web App em `frontend/assets/js/main.js` na chave `googleScriptUrl`.

## Como a integração grava os dados
- O script lê os cabeçalhos da linha 2 da aba `Leads`.
- Cada campo do formulário é gravado em sua coluna específica.
- Sempre que possível, use no frontend os mesmos nomes dos cabeçalhos da planilha.
- O script também reconhece aliases comuns:
  - `nome` -> `Nome_Completo`
  - `whatsapp` -> `Telefone`
  - `tipoSeguro` -> `Tipo_Seguro`
  - `mensagem` -> `Observacoes_Gerais`
  - `lgpdConsentimento` -> `LGPD_Consentimento`
  - `lgpdDataHora` -> `LGPD_Data_Hora`
  - `utm_source`, `utm_medium`, `utm_campaign` -> colunas de marketing

## Observações importantes
- A aba `Leads` já vem preparada com fórmulas para `Lead_ID`, `Situacao_Conversao` e `Dias_Em_Aberto`.
- O Apps Script injeta essas fórmulas automaticamente quando a gravação acontecer abaixo das linhas pré-formatadas.
- Se o frontend enviar `lgpdConsentimento=false`, o Apps Script bloqueia o envio.
- Se o campo de LGPD não vier no payload, o script registra `Não informado` para manter compatibilidade com formulários antigos.

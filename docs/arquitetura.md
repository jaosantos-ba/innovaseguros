# Arquitetura do projeto

## Frontend
Responsável pela apresentação institucional, captação do lead e abertura do atendimento no WhatsApp.

## Backend de integração
O backend deste projeto não usa banco de dados. A camada de integração é executada com Google Apps Script, recebendo os dados do formulário e gravando na planilha.

## Persistência
Os leads são armazenados no Google Sheets, o que simplifica operação, acompanhamento comercial e implantação.

## Documentação
A pasta `docs/` concentra instruções de implantação, lógica do formulário e visão arquitetural para facilitar manutenção futura.

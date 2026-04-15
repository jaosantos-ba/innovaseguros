# Formulário de leads

## Objetivo
Captar leads por tipo de seguro e gravar cada resposta em uma coluna específica da planilha Google.

## Campos gerais recomendados
- Nome_Completo
- Telefone
- Email
- CPF_CNPJ
- Cidade_Regiao
- Atendimento
- Melhor_Horario
- Tipo_Seguro
- Observacoes_Gerais
- LGPD_Consentimento
- LGPD_Data_Hora
- URL_Origem
- Pagina_Origem
- UTM_Source
- UTM_Medium
- UTM_Campaign

## Campos específicos por produto
Use os mesmos nomes dos cabeçalhos da aba `Leads`:
- Auto e Moto: `Marca_Veiculo`, `Modelo_Veiculo`, `Ano_Modelo`, `CEP_Pernoite`, `Uso_Veiculo`, `Condutor_Principal_Nascimento`, `Bonus_Classe`, `Sinistro_5_Anos`
- Eletrônicos: `Categoria_Aparelho`, `Marca_Aparelho`, `Modelo_Aparelho`, `Valor_Nota`, `Data_Compra`, `Possui_Nota_Fiscal`
- Residencial: `Tipo_Imovel`, `Finalidade_Imovel`, `Ocupacao_Imovel`, `Tipo_Construcao`, `Metragem_Aprox_m2`, `Valor_Imovel`, `Valor_Conteudo`, `CEP_Imovel`
- Vida: `Nascimento_Segurado_Vida`, `Profissao_Segurado_Vida`, `Renda_Mensal`, `Fumante`, `Capital_Segurado_Desejado`, `Numero_Dependentes`
- Viagem: `Destino`, `Pais_Destino`, `Data_Ida`, `Data_Volta`, `Quantidade_Viajantes`, `Idades_Viajantes`
- Plano de Saúde / Odontológico: `Modalidade_Plano`, `Tipo_Contratacao`, `Quantidade_Vidas`, `Faixas_Etarias`, `CNPJ_MEI`, `Abrangencia`, `Acomodacao`, `Coparticipacao`, `Nome_Empresa`, `Ortodontia`

## Compatibilidade
O Apps Script atual também aceita aliases comuns como `nome`, `whatsapp`, `tipoSeguro` e `mensagem`, mas o ideal é padronizar o frontend com os mesmos nomes da planilha.

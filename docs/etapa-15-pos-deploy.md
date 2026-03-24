# Etapa 15 - Pos-deploy e endurecimento de producao

## Objetivo

Estabilizar a operacao da aplicacao ja publicada, reduzir risco e definir uma rotina segura de deploy.

## Estado atual

- aplicacao publicada com sucesso na Vercel
- banco de producao ativo no Neon
- login em producao validado com sucesso
- branch de producao: `main`
- URL publica atual: `https://financeiro-backend-gamma.vercel.app`

## Checklist operacional imediato

### 1. Revisar logs de producao na Vercel

No projeto da Vercel, revisar:

- `Deployments` para build logs
- `Logs` para runtime logs
- `Observability` para erros, latencia e invocacoes

Pontos de atencao iniciais:

- erros 4xx e 5xx
- falhas de autenticacao inesperadas
- erros de conexao com banco
- paginas com tempo de resposta alto

Observacao:

- a documentacao atual da Vercel informa que runtime logs ficam retidos por 3 dias nos planos gerais, e para retencao maior e recomendado usar Log Drains

### 2. Validar os fluxos principais em producao

Validar manualmente na URL publica:

- login
- cadastro de usuario
- cadastro de categoria
- cadastro de receita
- cadastro de despesa
- dashboard principal
- relatorios

### 3. Confirmar rotina de rollback

Se um deploy futuro falhar:

- abrir `Deployments` na Vercel
- localizar o ultimo deploy estavel
- usar `Instant Rollback`

### 4. Revisar seguranca basica

Confirmar no painel da Vercel:

- `DATABASE_URL` configurada apenas em producao
- `AUTH_SECRET` configurado e mantido em segredo
- acesso ao projeto limitado apenas a quem administra o sistema

### 5. Revisar monitoramento do Neon

No painel do Neon, acompanhar:

- disponibilidade do banco
- uso de conexoes
- consumo geral do projeto
- politica de backup e recuperacao disponivel no plano utilizado

## Rotina recomendada de deploy

Fluxo recomendado para novas entregas:

1. criar branch a partir da `develop`
2. desenvolver e validar localmente
3. abrir PR para `develop`
4. testar preview deployment da Vercel
5. promover para `main`
6. validar rapidamente a producao apos o deploy

## Checklist minimo apos cada deploy

- abrir a tela `/login`
- autenticar com usuario valido
- abrir `/dashboard`
- criar ou editar um registro simples
- revisar `Logs` e `Deployments` na Vercel

## Proximo passo recomendado

Depois desta etapa, o melhor proximo movimento e criar uma rotina de homologacao usando a branch `develop`, com variaveis de ambiente de preview separadas da producao.

## Referencias oficiais

- https://vercel.com/docs/observability/logs
- https://vercel.com/docs/cli/logs
- https://vercel.com/docs/production-checklist
- https://vercel.com/docs/observability
- https://neon.com/docs

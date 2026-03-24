# Plano Inicial - Aplicacao de Controle Financeiro Pessoal

## Objetivo

Construir uma aplicacao para armazenar e organizar informacoes financeiras pessoais, incluindo:

- cadastro de cartoes
- valor de fatura
- contas fixas como luz, agua, aluguel e internet
- compras parceladas
- PIX recebidos e realizados
- valores a receber
- salario e outras entradas
- relatorios e visao mensal do fluxo financeiro

## Estrategia Recomendada

A melhor estrategia para comecar e desenvolver um **MVP como monolito modular web**, evitando microservicos no inicio.

Isso reduz complexidade, acelera a entrega e facilita manutencao para um projeto individual ou pequeno time.

### Recomendacao principal de stack

- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Backend:** Next.js full-stack com Route Handlers e Server Actions
- **Banco de dados:** PostgreSQL
- **ORM:** Prisma
- **Autenticacao / Infra:** Supabase
- **Validacao:** Zod
- **Formularios:** React Hook Form
- **Estado assinado no cliente:** TanStack Query apenas onde fizer sentido

## Por que essa stack

### Next.js

- permite construir frontend e backend no mesmo projeto
- acelera o desenvolvimento do MVP
- facilita deploy
- reduz custo cognitivo e operacional

### TypeScript

- melhora seguranca de tipos
- reduz erros em regras financeiras
- facilita manutencao futura

### PostgreSQL

- e o melhor encaixe para dados financeiros relacionais
- oferece integridade, consistencia e bom suporte a consultas
- lida bem com historico, agregacoes e relatorios

### Prisma

- facilita modelagem do banco
- oferece migrations
- melhora produtividade com tipagem forte

### Supabase

- simplifica provisionamento de Postgres
- oferece autenticacao pronta
- pode oferecer storage e recursos adicionais sem montar tudo do zero

### Tailwind CSS

- acelera construcao da interface
- reduz custo inicial de design system
- funciona bem com Next.js

## O que evitar no inicio

- microservicos
- arquitetura excessivamente distribuida
- backend separado logo no primeiro momento
- MongoDB para esse tipo de dominio
- guardar dados sensiveis de cartao sem necessidade real

## Arquitetura recomendada

Comecar com um **monolito modular**, separando bem as responsabilidades do dominio.

### Modulos sugeridos

- `auth`
- `usuarios`
- `cartoes`
- `faturas`
- `contas-fixas`
- `transacoes`
- `pix`
- `parcelamentos`
- `recebiveis`
- `receitas`
- `categorias`
- `relatorios`

## Principios de modelagem

### 1. Modelar o dominio antes da interface

Antes de construir telas, vale definir as entidades, relacoes e regras do sistema.

### 2. Separar lancamento financeiro da origem

Exemplos:

- uma compra parcelada gera varias parcelas futuras
- uma fatura agrega lancamentos do cartao
- uma conta recorrente gera obrigacoes mensais

### 3. Tratar recorrencia desde o inicio

Contas como aluguel, luz, agua, internet, salario e assinaturas devem ser tratadas como recorrentes.

### 4. Manter historico

O sistema deve preservar competencia, vencimento, pagamento, status e alteracoes relevantes, evitando sobrescrever dados importantes.

## Entidades iniciais sugeridas

- `users`
- `accounts` ou `wallets`
- `cards`
- `card_invoices`
- `fixed_bills`
- `installments`
- `transactions`
- `pix_transactions`
- `receivables`
- `income_entries`
- `categories`
- `tags`

## Modelagem funcional recomendada

### Cartoes

Armazenar:

- nome do cartao
- bandeira
- apelido
- ultimos 4 digitos
- limite
- dia de fechamento
- dia de vencimento

### Faturas

Cada fatura deve registrar:

- competencia
- periodo
- valor total
- valor pago
- status
- data de vencimento

### Contas fixas

Cada conta fixa deve permitir:

- nome
- categoria
- valor esperado
- recorrencia
- vencimento
- status de pagamento

### Parcelamentos

Uma compra parcelada deve registrar:

- descricao
- valor total
- numero de parcelas
- valor por parcela
- cartao associado
- data da compra
- parcelas futuras e pagas

### PIX

Separar:

- PIX enviados
- PIX recebidos

Campos uteis:

- valor
- data
- descricao
- conta de origem ou destino
- categoria
- observacoes

### Receitas e valores a receber

Registrar:

- salario
- renda extra
- valores previstos
- data esperada
- status de recebimento

## Seguranca

### Regras importantes

- nao armazenar CVV
- evitar armazenar numero completo do cartao
- preferir apenas ultimos 4 digitos
- criptografar apenas o que realmente for necessario
- usar autenticacao com controle por usuario
- registrar logs e trilha basica de auditoria

### Observacao

Mesmo em projeto pessoal, dados financeiros exigem cuidado. O ideal e minimizar a superficie de risco desde o inicio.

## Estrategia de backend

### Melhor escolha para iniciar

**Next.js full-stack**

Ideal para:

- desenvolvimento rapido
- projeto solo
- MVP
- menor manutencao operacional

### Alternativa para crescer depois

**Next.js no frontend + NestJS no backend**

Faz sentido quando houver:

- regras de negocio muito complexas
- equipe maior
- necessidade clara de separar API e aplicacao web

## Estrategia de banco de dados

### Melhor escolha

**PostgreSQL**

Motivos:

- relacional
- confiavel
- excelente para consultas financeiras
- suporta integridade e historico

### O que nao e ideal para esse caso

- MongoDB como banco principal
- SQLite como banco final de producao

## Roadmap de desenvolvimento

### Fase 1 - MVP

Implementar:

- autenticacao
- cadastro de cartoes
- cadastro de contas fixas
- cadastro de receitas
- cadastro de despesas
- cadastro de PIX
- parcelamentos
- faturas
- dashboard mensal

### Fase 2 - Consolidacao

Implementar:

- categorias e subcategorias
- filtros por periodo
- recorrencia automatica
- anexos
- importacao CSV
- relatorios mensais

### Fase 3 - Produto mais maduro

Implementar:

- metas financeiras
- projecao de fluxo de caixa
- conciliacao
- notificacoes
- multi-conta
- trilha de auditoria
- versao mobile

## Ordem recomendada de desenvolvimento

1. Definir entidades e regras de negocio
2. Modelar banco de dados
3. Criar autenticacao e estrutura base
4. Implementar CRUD de receitas, despesas e contas fixas
5. Implementar cartoes, compras e faturas
6. Implementar parcelamentos
7. Implementar PIX e valores a receber
8. Criar dashboard e relatorios
9. Refinar seguranca, validacoes e testes

## Recomendacao final

Se fosse para escolher uma stack unica para comecar hoje, a recomendacao seria:

**Next.js + TypeScript + PostgreSQL + Prisma + Supabase**

Essa combinacao oferece o melhor equilibrio entre:

- produtividade
- qualidade tecnica
- facilidade de manutencao
- seguranca
- capacidade de evolucao

## Proximo passo sugerido

Transformar este plano em um documento de arquitetura inicial contendo:

- modulos detalhados
- modelagem de tabelas
- fluxo de telas
- backlog inicial
- sprints de implementacao

## Roadmap de publicacao web

### Objetivo

Publicar a aplicacao na web com ambiente de producao acessivel por navegador, banco PostgreSQL hospedado e fluxo seguro de deploy.

### Estrategia recomendada

- **Aplicacao web:** Vercel
- **Banco de dados de producao:** PostgreSQL gerenciado em nuvem
- **Deploy de producao:** branch `main`
- **Deploy de homologacao futura:** branch `develop`, se quisermos depois

### Premissas importantes

- o banco local `localhost` nao serve para producao web
- a aplicacao precisa de `DATABASE_URL` publica/privada de nuvem
- o projeto usa Next.js com renderizacao no servidor e Prisma, portanto nao deve ser publicado como site estatico
- a branch `main` sera nossa referencia de producao

## Etapas de publicacao

### Etapa 10 - Escolher e provisionar infraestrutura de producao

Objetivo:

Definir onde a aplicacao e o banco vao rodar.

Entregas:

- escolher provedor do banco PostgreSQL
- criar instancia de banco de producao
- obter `DATABASE_URL` de producao
- definir se o deploy sera apenas producao ou tambem homologacao

Sugestao:

- Vercel para aplicacao
- Neon, Supabase, Railway ou Render para PostgreSQL

### Etapa 11 - Preparar ambiente para deploy

Objetivo:

Garantir que o projeto esteja pronto para rodar fora do ambiente local.

Entregas:

- revisar variaveis de ambiente obrigatorias
- validar `AUTH_SECRET` forte para producao
- revisar configuracao do Prisma para producao
- confirmar que `npm run build` passa localmente
- validar que o `script_inicial.sql` cria a estrutura esperada no banco

Variaveis minimas esperadas:

- `DATABASE_URL`
- `AUTH_SECRET`

### Etapa 12 - Criar banco de producao e aplicar estrutura inicial

Objetivo:

Subir a estrutura do banco fora do ambiente local.

Entregas:

- conectar no banco PostgreSQL hospedado
- criar schema inicial do sistema
- validar tabelas principais
- criar usuario administrador inicial de producao
- testar leitura e escrita basica no banco remoto

Observacao:

- essa etapa deve ser feita com cuidado para nao misturar dados locais e dados de producao

### Etapa 13 - Configurar projeto na Vercel

Objetivo:

Conectar o repositorio ao servico de hospedagem da aplicacao.

Entregas:

- importar repositorio GitHub na Vercel
- configurar branch `main` como producao
- cadastrar variaveis de ambiente de producao
- validar build na infraestrutura da Vercel

### Etapa 14 - Primeiro deploy publico

Objetivo:

Publicar a primeira versao acessivel na web.

Entregas:

- gerar URL publica da aplicacao
- validar tela de login online
- validar autenticacao com usuario de producao
- validar dashboard e consultas principais
- validar cadastro de receitas, despesas e categorias

### Etapa 15 - Pos-deploy e endurecimento de producao

Objetivo:

Reduzir risco operacional apos a primeira publicacao.

Entregas:

- revisar logs de aplicacao
- revisar erros de build ou runtime
- validar desempenho inicial
- revisar politica de backup do banco
- documentar rotina de deploy
- planejar ambiente de homologacao baseado na `develop`

## Ordem recomendada para execucao da publicacao

10. Escolher e provisionar infraestrutura de producao
11. Preparar ambiente para deploy
12. Criar banco de producao e aplicar estrutura inicial
13. Configurar projeto na Vercel
14. Primeiro deploy publico
15. Pos-deploy e endurecimento de producao

## Definicao atual da Etapa 10

Escolha confirmada para publicacao:

- **Aplicacao web:** Vercel
- **Banco de dados:** Neon PostgreSQL
- **Ambiente inicial:** producao primeiro
- **Branch de producao:** `main`

Checklist de saida da Etapa 10:

- criar projeto na Vercel conectado ao GitHub
- criar projeto e database no Neon
- obter `DATABASE_URL` de producao
- confirmar uso da `main` como branch de producao

## Definicao atual da Etapa 12

Objetivo atual:

- criar o banco de producao no Neon
- obter a `DATABASE_URL` de producao
- aplicar o `script_inicial.sql`
- criar o administrador inicial com `script_admin_inicial.sql`

Arquivos de apoio criados para a Etapa 12:

- [docs/etapa-12-neon-banco.md](/D:/Pessoal1/Projeto/financeiro/docs/etapa-12-neon-banco.md)
- [script_admin_inicial.sql](/D:/Pessoal1/Projeto/financeiro/script_admin_inicial.sql)

## Definicao atual da Etapa 13

Objetivo atual:

- importar o repositorio `Pablovincenzi/financeiro-backend` na Vercel
- confirmar a `main` como branch de producao
- cadastrar `DATABASE_URL` e `AUTH_SECRET`
- disparar o primeiro deploy de producao

Arquivos de apoio criados para a Etapa 13:

- [docs/deploy-vercel-neon.md](/D:/Pessoal1/Projeto/financeiro/docs/deploy-vercel-neon.md)
- [docs/etapa-13-vercel.md](/D:/Pessoal1/Projeto/financeiro/docs/etapa-13-vercel.md)

## Definicao atual da Etapa 15

Objetivo atual:

- revisar logs e observabilidade da Vercel
- validar os fluxos principais em producao
- documentar rollback e rotina de deploy
- revisar monitoramento e backup do Neon
- preparar o caminho para homologacao futura com `develop`

Arquivos de apoio criados para a Etapa 15:

- [docs/deploy-vercel-neon.md](/D:/Pessoal1/Projeto/financeiro/docs/deploy-vercel-neon.md)
- [docs/etapa-15-pos-deploy.md](/D:/Pessoal1/Projeto/financeiro/docs/etapa-15-pos-deploy.md)

Proximo passo do deploy:

- revisar `Logs`, `Deployments` e `Observability` na Vercel
- validar os fluxos principais na URL publica
- definir a estrategia de homologacao da branch `develop`

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

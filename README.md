# Financeiro

Aplicacao web de controle financeiro pessoal construida com Next.js, Prisma e PostgreSQL.

## Stack

- Next.js 16
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth com login por credenciais

## Ambiente local

1. Instale as dependencias:

```bash
npm install
```

2. Crie seu arquivo `.env` a partir de `.env.example`.

3. Gere o client do Prisma:

```bash
npm run db:generate
```

4. Rode a aplicacao:

```bash
npm run dev
```

## Variaveis de ambiente

As variaveis minimas para a aplicacao funcionar sao:

- `DATABASE_URL`
- `AUTH_SECRET`

### Regras

- `DATABASE_URL` deve apontar para um PostgreSQL valido
- `AUTH_SECRET` deve ter pelo menos 32 caracteres
- em producao, nao usar `localhost` no banco

## Build local

Para validar o projeto antes de publicar:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Deploy

O plano atual de publicacao usa:

- Vercel para a aplicacao
- Neon PostgreSQL para o banco

O passo a passo detalhado esta em [docs/deploy-vercel-neon.md](/D:/Pessoal1/Projeto/financeiro/docs/deploy-vercel-neon.md).
O roteiro especifico da configuracao na Vercel esta em [docs/etapa-13-vercel.md](/D:/Pessoal1/Projeto/financeiro/docs/etapa-13-vercel.md).

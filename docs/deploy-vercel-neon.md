# Deploy com Vercel e Neon

## Objetivo

Preparar o projeto para rodar em producao com:

- Vercel para hospedagem da aplicacao
- Neon PostgreSQL para banco de dados

## Etapa 11 - Preparacao do ambiente

### Variaveis obrigatorias

- `DATABASE_URL`
- `AUTH_SECRET`

### Regras para producao

- usar um banco PostgreSQL hospedado, nao `localhost`
- usar `AUTH_SECRET` forte com pelo menos 32 caracteres
- validar `npm run build` antes do deploy

### Exemplo de `DATABASE_URL`

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/financeiro?sslmode=require&schema=public"
```

### Exemplo de geracao de `AUTH_SECRET`

No PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

## Etapa 12 - Banco no Neon

1. Criar projeto no Neon
2. Criar database de producao
3. Copiar a `DATABASE_URL`
4. Aplicar a estrutura inicial com `script_inicial.sql`
5. Criar usuario administrador inicial

## Etapa 13 - Projeto na Vercel

1. Importar o repositorio do GitHub
2. Configurar a branch `main` como producao
3. Adicionar:
   - `DATABASE_URL`
   - `AUTH_SECRET`
4. Executar o primeiro deploy
5. Validar o build do Next.js na infraestrutura da Vercel

Roteiro detalhado:

- [docs/etapa-13-vercel.md](/D:/Pessoal1/Projeto/financeiro/docs/etapa-13-vercel.md)

## Etapa 15 - Pos-deploy

1. Revisar logs da Vercel
2. Validar os fluxos principais em producao
3. Confirmar estrategia de rollback
4. Revisar monitoramento do Neon
5. Documentar a rotina de deploy

Roteiro detalhado:

- [docs/etapa-15-pos-deploy.md](/D:/Pessoal1/Projeto/financeiro/docs/etapa-15-pos-deploy.md)

## Validacao final

Depois do deploy, validar:

- tela de login
- autenticacao
- dashboard
- cadastro de receitas
- cadastro de despesas
- cadastro de categorias

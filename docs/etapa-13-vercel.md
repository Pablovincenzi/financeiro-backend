# Etapa 13 - Configurar projeto na Vercel

## Objetivo

Conectar o repositorio `Pablovincenzi/financeiro-backend` a Vercel e deixar a `main` pronta para gerar deploy de producao.

## Decisoes desta etapa

- plataforma de hospedagem: Vercel
- banco de producao: Neon
- branch de producao: `main`
- preview deployments: automaticos para as demais branches

## Checklist da configuracao

1. Acessar o dashboard da Vercel em `Add New > Project`.
2. Importar o repositorio `Pablovincenzi/financeiro-backend` via GitHub.
3. Confirmar o preset de framework como `Next.js`.
4. Manter o diretorio raiz como `/`.
5. Confirmar `main` como Production Branch.
6. Cadastrar as variaveis de ambiente de producao:
   - `DATABASE_URL`
   - `AUTH_SECRET`
7. Executar o primeiro deploy.

## Valores esperados das variaveis

### DATABASE_URL

Usar a string de conexao do Neon em producao.

Formato esperado:

```env
postgresql://USUARIO:SENHA@HOST/DB?sslmode=require&channel_binding=require
```

### AUTH_SECRET

Usar um segredo forte com pelo menos 32 caracteres.

Exemplo para gerar no PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

## Validacoes recomendadas na Vercel

- o build deve concluir sem erro
- o framework detectado deve ser `Next.js`
- a primeira URL publica deve abrir a tela `/login`
- a autenticacao deve funcionar com o usuario administrador criado no Neon

## Como fica o fluxo de deploy

- push em `main`: gera deploy de producao
- push em outras branches: gera preview deployment

Isso segue a documentacao oficial da Vercel para Git Deployments e Projects importados do GitHub.

## Referencias oficiais

- https://vercel.com/docs/getting-started-with-vercel/import
- https://vercel.com/docs/deployments/git
- https://vercel.com/docs/environment-variables/manage-across-environments
- https://vercel.com/docs/frameworks/full-stack/nextjs

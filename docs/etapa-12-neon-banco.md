# Etapa 12 - Banco de producao no Neon

## Objetivo

Subir a estrutura do sistema no banco PostgreSQL de producao hospedado no Neon.

## O que precisamos no Neon

- projeto criado
- database criada
- connection string de producao (`DATABASE_URL`)
- acesso de escrita ao banco

## Passo a passo recomendado

### 1. Criar o projeto no Neon

No console do Neon:

- crie um novo projeto
- mantenha a branch principal `main`
- crie a database `financeiro` se ela nao vier pronta com esse nome

Referencias oficiais do Neon:

- criar projeto: https://api-docs.neon.tech/reference/createproject
- criar database: https://api-docs.neon.tech/reference/createprojectbranchdatabase
- obter connection string: https://api-docs.neon.tech/reference/getconnectionuri

### 2. Copiar a `DATABASE_URL`

A URL precisa ser semelhante a:

```env
postgresql://USUARIO:SENHA@HOST/financeiro?sslmode=require&channel_binding=require
```

Observacao:

- o nome exato do database deve ser o mesmo que sera usado em producao
- para o nosso projeto, preferimos `financeiro`

### 3. Aplicar a estrutura inicial

Com a `DATABASE_URL` configurada no ambiente, executar:

```powershell
$env:DATABASE_URL="SUA_DATABASE_URL_DO_NEON"
```

Depois, aplicar o schema inicial com `psql`:

```powershell
psql "SUA_DATABASE_URL_DO_NEON" -f script_inicial.sql
```

### 4. Criar o usuario administrador inicial

Preparar o arquivo [script_admin_inicial.sql](/D:/Pessoal1/Projeto/financeiro/script_admin_inicial.sql):

- trocar `__NOME_COMPLETO__`
- trocar `__CPF__`
- trocar `__EMAIL__`
- trocar `__LOGIN__`
- trocar `__SENHA_HASH_BCRYPT__`

Para executar:

```powershell
psql "SUA_DATABASE_URL_DO_NEON" -f script_admin_inicial.sql
```

### 5. Validar o banco remoto

Validacoes minimas:

- tabela `usuarios` criada
- tabela `despesas` criada
- tabela `categorias_despesa` criada
- usuario administrador criado
- leitura basica funcionando

Exemplo:

```powershell
psql "SUA_DATABASE_URL_DO_NEON" -c "SELECT login, nivel_acesso FROM usuarios;"
```

## Observacoes de seguranca

- nao reutilizar a senha padrao local em producao
- gerar um bcrypt novo para o admin de producao
- guardar a `DATABASE_URL` e o `AUTH_SECRET` apenas na Vercel e no ambiente seguro de administracao
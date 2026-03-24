-- Script base para criar o usuario administrador inicial em producao.
-- Dados preenchidos para o administrador inicial da aplicacao.

BEGIN;

WITH nova_pessoa AS (
  INSERT INTO pessoas (
    nome_completo,
    cpf,
    email,
    ativo,
    created_at,
    updated_at
  )
  VALUES (
    'Pablo Vincenzi',
    '08726217902',
    'pablo.tech88@gmail.com',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  RETURNING id
)
INSERT INTO usuarios (
  pessoa_id,
  login,
  email_login,
  senha_hash,
  nivel_acesso,
  ativo,
  created_at,
  updated_at
)
SELECT
  id,
  'pablovincenzi',
  'pablo.tech88@gmail.com',
  '$2b$10$AOBne1BFQlChC4z9M0KyD.1Gy0rmTHBOetptjLck78vMoSVQIvJBi',
  'administrador',
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM nova_pessoa;

COMMIT;
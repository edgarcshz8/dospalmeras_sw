-- Nuevo usuario: usr_dospal_3020
-- Ejecutar contra la base de datos configurada en DATABASE_URL

INSERT INTO users (username, password_hash)
VALUES (
  'usr_dospal_3020',
  '$2a$10$LRhPqNL4q1LDcS7xjH.6qunfuC2ztB9ybPR0CIsrZVUtdsunfDfdq'
)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

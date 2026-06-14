DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'usuarios_pkey'
       AND conrelid = 'usuarios'::regclass
  ) THEN
    ALTER TABLE usuarios ADD PRIMARY KEY (id_usuario);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id_refresh_token SERIAL PRIMARY KEY,
  id_usuario       INT NOT NULL REFERENCES usuarios(id_usuario),
  jti              VARCHAR(64) NOT NULL UNIQUE,
  expires_at       TIMESTAMPTZ NOT NULL,
  revoked_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_usuario ON refresh_tokens(id_usuario);

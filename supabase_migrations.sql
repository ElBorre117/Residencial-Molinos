-- Supabase / PostgreSQL migration for Residencial-Molinos
-- Run in SQL editor (Supabase dashboard) or via psql

-- Usuarios (opcional: puedes usar Auth de Supabase en lugar de guardar contraseñas aquí)
CREATE TABLE IF NOT EXISTS users (
  id               BIGSERIAL PRIMARY KEY,
  name             TEXT,
  email            TEXT UNIQUE NOT NULL,
  password_hash    TEXT,
  role             TEXT DEFAULT 'resident',
  phone            TEXT,
  depto            TEXT,
  depto_status     TEXT,
  fee              NUMERIC(10,2),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Residentes (detalles por departamento)
CREATE TABLE IF NOT EXISTS residents (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  depto      TEXT,
  status     TEXT DEFAULT 'pending',
  fee        NUMERIC(10,2),
  user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pagos / comprobantes
CREATE TABLE IF NOT EXISTS payments (
  id           BIGSERIAL PRIMARY KEY,
  resident_id  BIGINT REFERENCES residents(id) ON DELETE SET NULL,
  resident_name TEXT,
  depto        TEXT,
  month        TEXT,
  amount       NUMERIC(12,2),
  status       TEXT DEFAULT 'pending',
  sent_date    DATE,
  approved_date DATE,
  receipt_num  TEXT,
  has_voucher  BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Finanzas (ingresos y egresos)
CREATE TABLE IF NOT EXISTS finances (
  id         BIGSERIAL PRIMARY KEY,
  date       DATE,
  description TEXT,
  category   TEXT,
  type       TEXT,
  amount     NUMERIC(12,2),
  reference  TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contactos (como JSON para flexibilidad)
CREATE TABLE IF NOT EXISTS contacts (
  id      BIGSERIAL PRIMARY KEY,
  name    TEXT,
  data    JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices sugeridos
CREATE INDEX IF NOT EXISTS idx_residents_depto ON residents(depto);
CREATE INDEX IF NOT EXISTS idx_payments_month ON payments(month);
CREATE INDEX IF NOT EXISTS idx_finances_date ON finances(date);

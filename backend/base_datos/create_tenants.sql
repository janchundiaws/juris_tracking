-- Script para crear nuevos tenants

-- 1. Crear tenant "acme"
INSERT INTO tenants (id, name, subdomain, domain, status, settings, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ACME Law Firm',
  'acme',
  NULL,
  'active',
  '{"timezone": "America/Mexico_City", "language": "es", "theme": "light"}'::jsonb,
  NOW(),
  NOW()
);

-- 2. Crear tenant "lawfirm"
INSERT INTO tenants (id, name, subdomain, domain, status, settings, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Law Firm International',
  'lawfirm',
  NULL,
  'active',
  '{"timezone": "America/New_York", "language": "en", "theme": "dark"}'::jsonb,
  NOW(),
  NOW()
);

-- 3. Crear tenant "bufete"
INSERT INTO tenants (id, name, subdomain, domain, status, settings, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Bufete Jurídico González',
  'bufete',
  'bufetegonzalez.com',
  'active',
  '{"timezone": "America/Bogota", "language": "es", "theme": "light"}'::jsonb,
  NOW(),
  NOW()
);

-- Verificar tenants creados
SELECT id, name, subdomain, domain, status, settings 
FROM tenants 
ORDER BY created_at DESC;

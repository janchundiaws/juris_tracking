-- Migración para agregar soporte multi-tenant
-- Ejecutar este script después de crear la tabla tenants

-- Crear tabla de tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  subdomain VARCHAR(100) NOT NULL UNIQUE,
  domain VARCHAR(200),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_status ON tenants(status);

-- Insertar tenant por defecto para desarrollo
-- INSERT INTO tenants (name, subdomain, status, settings) 
-- VALUES ('Default Tenant', 'default', 'active', '{}')
-- ON CONFLICT (subdomain) DO NOTHING;

-- Agregar columna tenant_id a las tablas existentes
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE creditors ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE judicial_processes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Las tablas maestro y provincies NO llevan tenant_id porque son compartidas entre todos los tenants

-- Crear índices para mejorar el rendimiento de las consultas por tenant
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lawyers_tenant ON lawyers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_creditors_tenant ON creditors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_judicial_processes_tenant ON judicial_processes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activities_tenant ON activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_roles_tenant ON roles(tenant_id);

-- Asignar el tenant por defecto a todos los registros existentes que no tengan tenant_id
UPDATE users SET tenant_id = (SELECT id FROM tenants WHERE subdomain = 'default') WHERE tenant_id IS NULL;
UPDATE lawyers SET tenant_id = (SELECT id FROM tenants WHERE subdomain = 'default') WHERE tenant_id IS NULL;
UPDATE creditors SET tenant_id = (SELECT id FROM tenants WHERE subdomain = 'default') WHERE tenant_id IS NULL;
UPDATE judicial_processes SET tenant_id = (SELECT id FROM tenants WHERE subdomain = 'default') WHERE tenant_id IS NULL;
UPDATE documents SET tenant_id = (SELECT id FROM tenants WHERE subdomain = 'default') WHERE tenant_id IS NULL;
UPDATE activities SET tenant_id = (SELECT id FROM tenants WHERE subdomain = 'default') WHERE tenant_id IS NULL;
UPDATE roles SET tenant_id = (SELECT id FROM tenants WHERE subdomain = 'default') WHERE tenant_id IS NULL;

-- Hacer tenant_id obligatorio después de asignar valores
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE lawyers ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE creditors ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE judicial_processes ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE documents ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE activities ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE roles ALTER COLUMN tenant_id SET NOT NULL;

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para tenants
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

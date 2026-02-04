-- ============================================
--  EXTENSIONES NECESARIAS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
--  TABLA MAESTRA: ROLES
-- ============================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Datos iniciales de roles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrador del sistema'),
('abogado', 'Abogado del estudio jurídico'),
('asistente', 'Asistente legal'),
('cliente', 'Cliente del estudio jurídico');

-- ============================================
--  TABLA USERS
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    role_id INT NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,

    status VARCHAR(20) NOT NULL CHECK (status IN ('activo', 'inactivo', 'suspendido')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
--  ÍNDICES
-- ============================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role_id ON users(role_id);

-- ============================================
--  TRIGGER PARA updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


-- ============================================
--  TABLA MAESTRA: PROVINCIAS
-- ============================================
CREATE TABLE provincies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    postal_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name)
);
CREATE INDEX idx_provincies_name ON provincies(name);

-- ============================================
--  TABLA MAESTRA GENÉRICA
-- ============================================
CREATE TABLE maestro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    value VARCHAR(150) NOT NULL,
    code_maestro VARCHAR(100) NOT NULL UNIQUE,

    status VARCHAR(20) NOT NULL CHECK (status IN ('activo', 'inactivo')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
--  ÍNDICES
-- ============================================
CREATE INDEX idx_maestro_value ON maestro(value);
CREATE INDEX idx_maestro_status ON maestro(status);

-- ============================================
--  TRIGGER PARA updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_maestro
BEFORE UPDATE ON maestro
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();



-- ============================================
--  Abogados TABLE
-- ============================================
CREATE TABLE lawyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),

    -- Indicates whether the lawyer belongs to the firm or is external
    lawyer_type VARCHAR(20) NOT NULL CHECK (lawyer_type IN ('internal', 'external')),

    -- Record status
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),

    -- Optional link to users table
    user_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
--  INDEXES
-- ============================================
CREATE INDEX idx_lawyers_email ON lawyers(email);
CREATE INDEX idx_lawyers_type ON lawyers(lawyer_type);
CREATE INDEX idx_lawyers_status ON lawyers(status);

-- ============================================
--  TRIGGER FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_lawyers
BEFORE UPDATE ON lawyers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();



-- ============================================
--  ACREEDOR TABLE
-- ============================================
CREATE TABLE creditors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,
    ruc VARCHAR(20) NOT NULL UNIQUE,

    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
--  INDEXES
-- ============================================
CREATE INDEX idx_creditors_name ON creditors(name);
CREATE INDEX idx_creditors_status ON creditors(status);

-- ============================================
--  TRIGGER FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_creditors
BEFORE UPDATE ON creditors
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


-- ============================================
--  MAIN TABLE: JUDICIAL PROCESSES
-- ============================================
CREATE TABLE judicial_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    internal_lawyer_id UUID REFERENCES lawyers(id) ON UPDATE CASCADE ON DELETE SET NULL,
    external_lawyer_id UUID REFERENCES lawyers(id) ON UPDATE CASCADE ON DELETE SET NULL,
    provincie_id UUID REFERENCES provincies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    creditor_id UUID REFERENCES creditors(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    product UUID REFERENCES maestro(id) ON UPDATE CASCADE ON DELETE RESTRICT,  -- PRODUCTO
    guarantee UUID REFERENCES maestro(id) ON UPDATE CASCADE ON DELETE RESTRICT, -- GARANTÍA

    -- Personal data
    identification VARCHAR(13) NOT NULL,         -- CÉDULA o RUC
    full_name VARCHAR(200) NOT NULL,             -- NOMBRES

    -- Case details
    operation VARCHAR(150),                     -- OPERACIÓN

    area_assignment_date DATE,                   -- FECHA DE ASIGNACIÓN ÁREA (120 días)
    internal_assignment_date DATE,               -- FECHA DE ASIGNACIÓN AB INTERNO (120 días)
    external_assignment_date DATE,               -- FECHA DE ASIGNACIÓN AB EXTERNO (90 días)

    process_type VARCHAR(150) NOT NULL,          -- TIPO DE PROCESO
    case_number VARCHAR(100),                    -- N° JUICIO

    procedural_summary TEXT,                     -- RESUMEN AVANCE PROCESAL
    procedural_progress TEXT,                    -- AVANCE PROCESAL

    demand_date DATE,                            -- FECHA DE DEMANDA

    status VARCHAR(50) NOT NULL CHECK (status IN ('activo', 'inactivo', 'suspendido')),

    -- Audit fields
    created_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
--  INDEXES
-- ============================================
CREATE INDEX idx_jp_internal_lawyer ON judicial_processes(internal_lawyer_id);
CREATE INDEX idx_jp_external_lawyer ON judicial_processes(external_lawyer_id);
CREATE INDEX idx_jp_city ON judicial_processes(city_id);
CREATE INDEX idx_jp_creditor ON judicial_processes(creditor_id);
CREATE INDEX idx_jp_identification ON judicial_processes(identification);
CREATE INDEX idx_jp_case_number ON judicial_processes(case_number);
CREATE INDEX idx_jp_process_type ON judicial_processes(process_type);

-- ============================================
--  TRIGGER FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_judicial_processes
BEFORE UPDATE ON judicial_processes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


-- ============================================
--  DOCUMENTS TABLE
-- ============================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relation to judicial processes
    judicial_process_id UUID NOT NULL
        REFERENCES judicial_processes(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,

    -- File stored directly in the database
    file_data BYTEA NOT NULL,

    description TEXT,

    uploaded_by UUID REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    updated_by UUID REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'deleted')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
--  INDEXES
-- ============================================
CREATE INDEX idx_documents_process ON documents(judicial_process_id);
CREATE INDEX idx_documents_status ON documents(status);

-- ============================================
--  TRIGGER FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_documents
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
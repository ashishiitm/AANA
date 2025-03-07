-- protocols.sql
-- Protocol data table

-- Protocols Table
CREATE TABLE IF NOT EXISTS protocols (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL DEFAULT '1.0',
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  
  -- Molecule information
  molecule_name VARCHAR(255) NOT NULL,
  molecule_description TEXT,
  molecule_type VARCHAR(100),
  molecule_mechanism TEXT,
  molecule_structure TEXT,
  
  -- Clinical trial information
  phase VARCHAR(50) NOT NULL,
  therapeutic_area VARCHAR(100) NOT NULL,
  condition VARCHAR(255) NOT NULL,
  
  -- Study design information
  study_design JSONB,
  criteria JSONB,
  endpoints JSONB,
  
  -- Company and user information
  company VARCHAR(255) NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  
  -- Content and generation information
  template_used VARCHAR(100),
  protocol_outline TEXT,
  uncertainty_flags JSONB,
  compliance_score INTEGER,
  compliance_issues JSONB,
  
  -- Document management
  generated_document_url VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Team members for protocols
CREATE TABLE IF NOT EXISTS protocol_team_members (
  id SERIAL PRIMARY KEY,
  protocol_id INTEGER NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  role VARCHAR(100),
  permissions VARCHAR(50) CHECK (permissions IN ('view', 'edit', 'approve', 'admin')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(protocol_id, user_id)
);

-- Protocol version history
CREATE TABLE IF NOT EXISTS protocol_history (
  id SERIAL PRIMARY KEY,
  protocol_id INTEGER NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  changed_by INTEGER REFERENCES users(id),
  changes TEXT,
  document_snapshot JSONB
);

-- Protocol objectives
CREATE TABLE IF NOT EXISTS protocol_objectives (
  id SERIAL PRIMARY KEY,
  protocol_id INTEGER NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('primary', 'secondary', 'exploratory')),
  description TEXT NOT NULL,
  endpoints JSONB,
  timepoints JSONB
);

-- Protocol-site relationships
CREATE TABLE IF NOT EXISTS protocol_sites (
  id SERIAL PRIMARY KEY,
  protocol_id INTEGER NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  site_id INTEGER NOT NULL REFERENCES sites(id),
  status VARCHAR(50) NOT NULL CHECK (status IN ('selected', 'contacted', 'confirmed', 'active', 'completed', 'withdrawn')),
  contact_date TIMESTAMP,
  confirmation_date TIMESTAMP,
  compatibility_score FLOAT,
  recruitment_potential FLOAT,
  strengths JSONB,
  weaknesses JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(protocol_id, site_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_protocols_created_by ON protocols(created_by);
CREATE INDEX IF NOT EXISTS idx_protocols_company ON protocols(company);
CREATE INDEX IF NOT EXISTS idx_protocols_therapeutic_area ON protocols(therapeutic_area);
CREATE INDEX IF NOT EXISTS idx_protocols_phase ON protocols(phase);
CREATE INDEX IF NOT EXISTS idx_protocols_status ON protocols(status);
CREATE INDEX IF NOT EXISTS idx_protocol_team_protocol_id ON protocol_team_members(protocol_id);
CREATE INDEX IF NOT EXISTS idx_protocol_team_user_id ON protocol_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_protocol_site_protocol_id ON protocol_sites(protocol_id);
CREATE INDEX IF NOT EXISTS idx_protocol_site_site_id ON protocol_sites(site_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_protocols_modtime
    BEFORE UPDATE ON protocols
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_protocol_sites_modtime
    BEFORE UPDATE ON protocol_sites
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column(); 
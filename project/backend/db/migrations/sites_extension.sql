-- sites_extension.sql
-- Additional tables for site matching functionality

-- Site location table
CREATE TABLE IF NOT EXISTS site_locations (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  address1 VARCHAR(255),
  address2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  latitude FLOAT,
  longitude FLOAT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Site metrics table
CREATE TABLE IF NOT EXISTS site_metrics (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  recruitment_rate FLOAT, -- patients per month
  screen_failure_rate FLOAT, -- percentage
  retention_rate FLOAT, -- percentage
  data_quality_score INTEGER, -- 0-100
  startup_time INTEGER, -- days
  past_trial_count INTEGER,
  completed_trial_count INTEGER,
  avg_enrollment_efficiency FLOAT, -- percentage of target achieved
  last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(site_id)
);

-- Therapeutic area experience
CREATE TABLE IF NOT EXISTS therapeutic_experience (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  area VARCHAR(100) NOT NULL,
  trial_count INTEGER DEFAULT 0,
  patient_count INTEGER DEFAULT 0,
  is_specialization BOOLEAN DEFAULT FALSE,
  publication_count INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(site_id, area)
);

-- Site trial experience by phase
CREATE TABLE IF NOT EXISTS site_trial_experience (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  phase1_count INTEGER DEFAULT 0,
  phase2_count INTEGER DEFAULT 0,
  phase3_count INTEGER DEFAULT 0,
  phase4_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(site_id)
);

-- Site past trials
CREATE TABLE IF NOT EXISTS site_past_trials (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  trial_id VARCHAR(100),
  therapeutic_area VARCHAR(100),
  phase VARCHAR(50),
  year_completed INTEGER,
  patients_enrolled INTEGER,
  performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5)
);

-- Site patient demographics
CREATE TABLE IF NOT EXISTS site_patient_demographics (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  pediatric_percent FLOAT DEFAULT 0,
  adult_percent FLOAT DEFAULT 0,
  geriatric_percent FLOAT DEFAULT 0,
  male_percent FLOAT DEFAULT 0,
  female_percent FLOAT DEFAULT 0,
  ethnicity_data JSONB,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(site_id)
);

-- Site outreach history
CREATE TABLE IF NOT EXISTS site_outreach_history (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  protocol_id INTEGER REFERENCES protocols(id) ON DELETE SET NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  method VARCHAR(50) CHECK (method IN ('email', 'phone', 'mail', 'in-person')),
  status VARCHAR(50) CHECK (status IN ('sent', 'received', 'responded', 'declined', 'accepted')),
  response_date TIMESTAMP,
  notes TEXT
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_site_locations_site_id ON site_locations(site_id);
CREATE INDEX IF NOT EXISTS idx_site_locations_state_city ON site_locations(state, city);
CREATE INDEX IF NOT EXISTS idx_therapeutic_experience_area ON therapeutic_experience(area);
CREATE INDEX IF NOT EXISTS idx_therapeutic_experience_site_id ON therapeutic_experience(site_id);
CREATE INDEX IF NOT EXISTS idx_site_outreach_protocol_id ON site_outreach_history(protocol_id);

-- Triggers for updated_at
CREATE TRIGGER update_site_locations_modtime
    BEFORE UPDATE ON site_locations
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_site_trial_experience_modtime
    BEFORE UPDATE ON site_trial_experience
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_site_patient_demographics_modtime
    BEFORE UPDATE ON site_patient_demographics
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column(); 
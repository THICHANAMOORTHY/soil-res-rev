-- ============================================================
-- CropSmart & Uzhavu Kaappaan + DairyFeed AI: Full Supabase Schema
-- ============================================================

-- 0. Clean Slate: Drop old tables if re-initializing
DROP TABLE IF EXISTS b2b_advisories CASCADE;
DROP TABLE IF EXISTS org_sensors CASCADE;
DROP TABLE IF EXISTS org_clusters CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS silage_samples CASCADE;
DROP TABLE IF EXISTS silage_devices CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS soil_simulation_log CASCADE;
DROP TABLE IF EXISTS rotation_plan_seasons CASCADE;
DROP TABLE IF EXISTS rotation_plans CASCADE;
DROP TABLE IF EXISTS crop_evaluations CASCADE;
DROP TABLE IF EXISTS crop_history CASCADE;
DROP TABLE IF EXISTS weather_data CASCADE;
DROP TABLE IF EXISTS soil_data CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS farmers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Farmers
CREATE TABLE IF NOT EXISTS farmers (
    farmer_id       SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    phone           VARCHAR(20) UNIQUE,
    email           VARCHAR(150),
    preferred_lang  VARCHAR(20) DEFAULT 'en',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Farms
CREATE TABLE IF NOT EXISTS farms (
    farm_id         SERIAL PRIMARY KEY,
    farmer_id       INT REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    org_id          INT,
    cluster_id      INT,
    location_name   VARCHAR(150),
    latitude        DECIMAL(9,6),
    longitude       DECIMAL(9,6),
    area_acres      DECIMAL(6,2) NOT NULL,
    irrigation_type VARCHAR(30) CHECK (irrigation_type IN
                        ('Rainfed','Low','Moderate','High','Drip','Canal')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Seasons
CREATE TABLE IF NOT EXISTS seasons (
    season_id     SERIAL PRIMARY KEY,
    name          VARCHAR(20) UNIQUE NOT NULL,   -- Kharif, Rabi, Zaid
    start_month   INT,
    end_month     INT
);

-- 4. Crops Master Reference (enriched with Kaggle dataset attributes)
CREATE TABLE IF NOT EXISTS crops (
    crop_id              SERIAL PRIMARY KEY,
    name                 VARCHAR(80) UNIQUE NOT NULL,
    crop_family          VARCHAR(50),
    growth_duration_days INT,
    water_requirement    VARCHAR(20) CHECK (water_requirement IN ('Low','Medium','High')),
    ideal_ph_min         DECIMAL(3,1),
    ideal_ph_max         DECIMAL(3,1),
    n_demand             DECIMAL(6,2),
    p_demand             DECIMAL(6,2),
    k_demand             DECIMAL(6,2),
    is_nitrogen_fixer    BOOLEAN DEFAULT FALSE,
    avg_yield_per_acre   DECIMAL(10,2),
    avg_market_price     DECIMAL(10,2),
    avg_cultivation_cost DECIMAL(10,2),
    disease_risk_index   DECIMAL(5,2),
    suitable_seasons     JSONB,
    avg_temperature_c    DECIMAL(5,2),
    avg_humidity_pct     DECIMAL(5,2),
    avg_rainfall_mm      DECIMAL(7,2),
    preferred_soil_types JSONB,
    stats                JSONB,
    total_rows           INT,
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Soil Data
CREATE TABLE IF NOT EXISTS soil_data (
    soil_id             SERIAL PRIMARY KEY,
    farm_id             INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    recorded_date       DATE DEFAULT CURRENT_DATE,
    nitrogen            DECIMAL(6,2),
    phosphorus          DECIMAL(6,2),
    potassium           DECIMAL(6,2),
    ph                  DECIMAL(3,1),
    organic_carbon      DECIMAL(4,2),
    soil_health_score   DECIMAL(5,2),
    deficiencies        JSONB,
    adequate            JSONB,
    source              VARCHAR(30) DEFAULT 'manual',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Weather Data
CREATE TABLE IF NOT EXISTS weather_data (
    weather_id               SERIAL PRIMARY KEY,
    farm_id                  INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    season_id                INT REFERENCES seasons(season_id),
    year                     INT,
    rainfall_mm              DECIMAL(7,2),
    avg_temp_c               DECIMAL(5,2),
    humidity_pct             DECIMAL(5,2),
    water_availability_index DECIMAL(5,2),
    created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Crop History
CREATE TABLE IF NOT EXISTS crop_history (
    history_id      SERIAL PRIMARY KEY,
    farm_id         INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    crop_id         INT REFERENCES crops(crop_id),
    season_id       INT REFERENCES seasons(season_id),
    year            INT,
    sequence_order  INT,
    yield_actual    DECIMAL(10,2),
    cost_actual     DECIMAL(10,2),
    revenue_actual  DECIMAL(10,2),
    profit_actual   DECIMAL(10,2),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Crop Evaluations
CREATE TABLE IF NOT EXISTS crop_evaluations (
    evaluation_id       SERIAL PRIMARY KEY,
    farm_id             INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    crop_id             INT REFERENCES crops(crop_id),
    run_id              UUID NOT NULL,
    soil_suitability    DECIMAL(5,2),
    season_suitability  DECIMAL(5,2),
    rotation_score      DECIMAL(5,2),
    water_score         DECIMAL(5,2),
    profit_score        DECIMAL(5,2),
    risk_score          DECIMAL(5,2),
    climate_score       DECIMAL(5,2),
    predicted_yield     DECIMAL(10,2),
    predicted_revenue   DECIMAL(10,2),
    predicted_cost      DECIMAL(10,2),
    predicted_profit    DECIMAL(10,2),
    final_score         DECIMAL(5,2),
    rank                INT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Rotation Plans
CREATE TABLE IF NOT EXISTS rotation_plans (
    plan_id                SERIAL PRIMARY KEY,
    farm_id                INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    run_id                 UUID NOT NULL,
    plan_label             VARCHAR(10),
    total_projected_profit DECIMAL(12,2),
    final_soil_health      DECIMAL(5,2),
    is_recommended         BOOLEAN DEFAULT FALSE,
    sequence               JSONB,
    seasonal_profit        JSONB,
    created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Rotation Plan Seasons
CREATE TABLE IF NOT EXISTS rotation_plan_seasons (
    plan_season_id      SERIAL PRIMARY KEY,
    plan_id             INT REFERENCES rotation_plans(plan_id) ON DELETE CASCADE,
    season_order        INT,
    crop_id             INT REFERENCES crops(crop_id),
    expected_profit     DECIMAL(10,2),
    soil_health_before  DECIMAL(5,2),
    soil_health_after   DECIMAL(5,2)
);

-- 11. Soil Simulation Log
CREATE TABLE IF NOT EXISTS soil_simulation_log (
    sim_id                SERIAL PRIMARY KEY,
    plan_id               INT REFERENCES rotation_plans(plan_id) ON DELETE CASCADE,
    season_order          INT,
    predicted_n           VARCHAR(20),
    predicted_p           VARCHAR(20),
    predicted_k           VARCHAR(20),
    predicted_oc          VARCHAR(20),
    predicted_soil_health DECIMAL(5,2),
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id   SERIAL PRIMARY KEY,
    farm_id             INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    plan_id             INT REFERENCES rotation_plans(plan_id),
    recommended_crop_id INT REFERENCES crops(crop_id),
    final_score         DECIMAL(5,2),
    reasoning           JSONB,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Users — Account credentials for farmers
CREATE TABLE IF NOT EXISTS users (
    user_id              SERIAL PRIMARY KEY,
    role                 VARCHAR(10) NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer')),
    name                 VARCHAR(120) NOT NULL,
    email                VARCHAR(150) UNIQUE NOT NULL,
    phone                VARCHAR(20),
    -- No foreign keys on purpose: farmer/farm profiles are rebuilt in memory
    -- from this row at login (see ensureProfile in backend/routes/auth.js), so the
    -- farmers table doesn't contain these IDs. If you created this table earlier
    -- with a FK, run: ALTER TABLE users DROP CONSTRAINT IF EXISTS users_farmer_id_fkey;
    farmer_id            INT,
    password_hash       VARCHAR(255) NOT NULL,
    email_verified        BOOLEAN DEFAULT FALSE,
    verification_token   VARCHAR(255),
    verification_expires  TIMESTAMPTZ,
    token_version        INT DEFAULT 0,
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access on users" ON users;
CREATE POLICY "Public access on users" ON users FOR ALL USING (true) WITH CHECK (true);
-- NOTE: This app authenticates with its own JWTs (see backend/routes/auth.js), not
-- Supabase Auth, so RLS can't scope rows to "the current user" — the API layer is
-- the trust boundary. Tighten this policy if you ever expose the Supabase anon key
-- to a client that talks to Supabase directly.

-- ─────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_soil_farm ON soil_data(farm_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_history_farm_seq ON crop_history(farm_id, sequence_order DESC);
CREATE INDEX IF NOT EXISTS idx_eval_run ON crop_evaluations(run_id, final_score DESC);
CREATE INDEX IF NOT EXISTS idx_plan_farm ON rotation_plans(farm_id, is_recommended);
CREATE INDEX IF NOT EXISTS idx_crops_name ON crops(name);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security (RLS) & Development Policies
-- ─────────────────────────────────────────────────────────────
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotation_plan_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_simulation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Allow public read & write for app access (or tighten per user with Supabase Auth)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('farmers','farms','crops','soil_data','seasons','weather_data',
                             'crop_history','crop_evaluations','rotation_plans',
                             'rotation_plan_seasons','soil_simulation_log','recommendations')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access on %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public access on %I" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────
-- DairyFeed AI (Silage Monitoring & IoT Diagnostics)
-- ─────────────────────────────────────────────────────────────

-- 14. Silage Devices (sensor nodes)
CREATE TABLE IF NOT EXISTS silage_devices (
    device_id        TEXT PRIMARY KEY,               -- e.g. 'DF01'
    name             TEXT,
    last_seen_at     TIMESTAMPTZ,
    pending_sync     INTEGER NOT NULL DEFAULT 0,     -- queued readings the device reports
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Silage Samples (tests with pH, moisture, temp, RGB, scores, advisory)
CREATE TABLE IF NOT EXISTS silage_samples (
    id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sample_id            TEXT NOT NULL UNIQUE,        -- e.g. 'DF01-20261002T103015-0007'
    device_id            TEXT NOT NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    time_source          TEXT NOT NULL DEFAULT 'server'
                         CHECK (time_source IN ('ntp', 'server')),
    feed_type            TEXT NOT NULL DEFAULT 'other'
                         CHECK (feed_type IN ('maize_silage', 'sorghum_silage', 'napier_silage', 'other')),
    farm_id              TEXT,

    -- Sensor readings
    ph                   NUMERIC(4, 2) CHECK (ph BETWEEN 0 AND 14),
    moisture_raw         INTEGER,
    moisture_pct         NUMERIC(5, 2) CHECK (moisture_pct BETWEEN 0 AND 100),
    sample_temp_c        NUMERIC(5, 2),
    ambient_temp_c       NUMERIC(5, 2),
    rgb_r                SMALLINT CHECK (rgb_r BETWEEN 0 AND 255),
    rgb_g                SMALLINT CHECK (rgb_g BETWEEN 0 AND 255),
    rgb_b                SMALLINT CHECK (rgb_b BETWEEN 0 AND 255),

    -- Silage photo
    image_path           TEXT,
    image_received_at    TIMESTAMPTZ,

    -- AI Predictions
    quality              TEXT CHECK (quality IN ('Good', 'Moderate', 'Poor')),
    spoilage_risk        TEXT CHECK (spoilage_risk IN ('Low', 'Medium', 'High')),
    mould_risk           TEXT CHECK (mould_risk IN ('Low', 'High', 'Unknown')),
    score                SMALLINT CHECK (score BETWEEN 0 AND 100),
    method               TEXT CHECK (method IN ('rules', 'ml')),
    model_version        TEXT,
    mould_model_version  TEXT,
    breakdown            JSONB,

    -- Advisory feedback
    advisory_level       TEXT CHECK (advisory_level IN ('ok', 'warn', 'danger')),
    advisory_en          TEXT,
    advisory_ta          TEXT,

    -- Expert label (ground truth for ML training)
    label_quality        TEXT CHECK (label_quality IN ('Good', 'Moderate', 'Poor')),
    label_mould          TEXT CHECK (label_mould IN ('Low', 'High')),
    label_spoilage       TEXT CHECK (label_spoilage IN ('Low', 'Medium', 'High')),
    labelled_by          TEXT,
    label_reference      TEXT,
    labelled_at          TIMESTAMPTZ,

    -- Data integrity flags
    is_simulated         BOOLEAN NOT NULL DEFAULT FALSE,
    is_demo              BOOLEAN NOT NULL DEFAULT FALSE,
    synced_from_offline  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS silage_samples_device_time_idx
    ON silage_samples (device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS silage_samples_label_quality_idx
    ON silage_samples (label_quality);

ALTER TABLE silage_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE silage_samples ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access on silage_devices" ON silage_devices;
CREATE POLICY "Public access on silage_devices" ON silage_devices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on silage_samples" ON silage_samples;
CREATE POLICY "Public access on silage_samples" ON silage_samples FOR ALL USING (true) WITH CHECK (true);

-- Private storage bucket for sample photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('silage-images', 'silage-images', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 15. B2B Enterprise & FPO Multi-Tenant Architecture
-- ============================================================

-- A. Organizations (FPOs, Cooperatives, Agribusinesses)
CREATE TABLE IF NOT EXISTS organizations (
    org_id              SERIAL PRIMARY KEY,
    name                VARCHAR(200) NOT NULL,
    org_type            VARCHAR(50) NOT NULL CHECK (org_type IN ('FPO', 'Dairy Cooperative', 'Agribusiness', 'Institution')),
    region              VARCHAR(150) NOT NULL,
    admin_name          VARCHAR(120),
    admin_email         VARCHAR(150),
    admin_phone         VARCHAR(20),
    license_tier        VARCHAR(50) DEFAULT 'Enterprise',
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- B. Regional Village Micro-Clusters
CREATE TABLE IF NOT EXISTS org_clusters (
    cluster_id          SERIAL PRIMARY KEY,
    org_id              INT REFERENCES organizations(org_id) ON DELETE CASCADE,
    cluster_code        VARCHAR(30),
    name                VARCHAR(120) NOT NULL,
    district            VARCHAR(100),
    state               VARCHAR(100) DEFAULT 'Tamil Nadu',
    target_crops        JSONB DEFAULT '["Tomato", "Maize", "Groundnut", "Sorghum"]'::jsonb,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign Key Constraints for farms linking to B2B Orgs and Clusters
ALTER TABLE farms 
    ADD CONSTRAINT fk_farms_org FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_farms_cluster FOREIGN KEY (cluster_id) REFERENCES org_clusters(cluster_id) ON DELETE SET NULL;

-- C. IoT Telemetry Fleet Nodes (7-in-1 RS485 & Silage Probes)
CREATE TABLE IF NOT EXISTS org_sensors (
    sensor_id           VARCHAR(50) PRIMARY KEY,
    org_id              INT REFERENCES organizations(org_id) ON DELETE CASCADE,
    farm_id             INT REFERENCES farms(farm_id) ON DELETE SET NULL,
    cluster_id          INT REFERENCES org_clusters(cluster_id) ON DELETE SET NULL,
    sensor_type         VARCHAR(60) NOT NULL,   -- 'Soil Scout 7-in-1', 'DairyFeed Dual-Node Silage', 'Weather Station'
    hardware_model      VARCHAR(60) DEFAULT 'ESP32-RS485-MAX485',
    battery_pct         INT DEFAULT 95 CHECK (battery_pct BETWEEN 0 AND 100),
    status              VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
    last_reading_val    JSONB,
    last_heartbeat      TIMESTAMPTZ DEFAULT NOW(),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- D. Regional Agronomic Directives & Action Alerts
CREATE TABLE IF NOT EXISTS b2b_advisories (
    advisory_id         SERIAL PRIMARY KEY,
    org_id              INT REFERENCES organizations(org_id) ON DELETE CASCADE,
    cluster_id          INT REFERENCES org_clusters(cluster_id) ON DELETE SET NULL,
    title               VARCHAR(200) NOT NULL,
    level               VARCHAR(20) DEFAULT 'WARNING' CHECK (level IN ('INFO', 'WARNING', 'DANGER')),
    recommended_action  TEXT NOT NULL,
    affected_farms_count INT DEFAULT 1,
    broadcast_sms       BOOLEAN DEFAULT FALSE,
    broadcast_whatsapp  BOOLEAN DEFAULT FALSE,
    dispatched_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes & RLS for B2B Tables
CREATE INDEX IF NOT EXISTS idx_clusters_org ON org_clusters(org_id);
CREATE INDEX IF NOT EXISTS idx_sensors_org ON org_sensors(org_id);
CREATE INDEX IF NOT EXISTS idx_advisories_org ON b2b_advisories(org_id);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_advisories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access on organizations" ON organizations;
CREATE POLICY "Public access on organizations" ON organizations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on org_clusters" ON org_clusters;
CREATE POLICY "Public access on org_clusters" ON org_clusters FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on org_sensors" ON org_sensors;
CREATE POLICY "Public access on org_sensors" ON org_sensors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on b2b_advisories" ON b2b_advisories;
CREATE POLICY "Public access on b2b_advisories" ON b2b_advisories FOR ALL USING (true) WITH CHECK (true);

-- Seed B2B Default Organizations
INSERT INTO organizations (org_id, name, org_type, region, admin_name, admin_email, admin_phone, license_tier)
VALUES
(1, 'Kovai Farmer Producer Organization (Kovai FPO)', 'FPO', 'Coimbatore & Tiruppur, TN', 'Dr. K. Swaminathan', 'admin@kovaifpo.org', '+91 94431 82910', 'Enterprise Tier'),
(2, 'Aavin Dairy Cooperative Federation', 'Dairy Cooperative', 'Western Tamil Nadu Milk Shed', 'S. Rajendran', 'coop@aavin-dairy.org', '+91 98422 10928', 'Cooperative Tier'),
(3, 'Kisan Shakti Agribusiness Consortium', 'Agribusiness', 'All-India Contract Agri Network', 'Meera Iyer', 'partner@kisanshakticonsortium.in', '+91 97110 54321', 'Corporate Tier')
ON CONFLICT (org_id) DO UPDATE SET
    name = EXCLUDED.name,
    org_type = EXCLUDED.org_type,
    region = EXCLUDED.region;

-- Seed FPO Clusters for Kovai FPO
INSERT INTO org_clusters (cluster_id, org_id, cluster_code, name, district, state)
VALUES
(1, 1, 'CLUSTER-01', 'Pollachi North Cluster', 'Coimbatore', 'Tamil Nadu'),
(2, 1, 'CLUSTER-02', 'Sulur Belt Cluster', 'Coimbatore', 'Tamil Nadu'),
(3, 1, 'CLUSTER-03', 'Thondamuthur Foothills', 'Coimbatore', 'Tamil Nadu'),
(4, 1, 'CLUSTER-04', 'Kinathukadavu Red Soil Cluster', 'Coimbatore', 'Tamil Nadu'),
(5, 1, 'CLUSTER-05', 'Annur Semi-Arid Cluster', 'Tiruppur', 'Tamil Nadu')
ON CONFLICT (cluster_id) DO NOTHING;

-- Seed Initial IoT Sensor Hardware Nodes
INSERT INTO org_sensors (sensor_id, org_id, sensor_type, hardware_model, battery_pct, status)
VALUES
('SS-NODE-01', 1, 'Soil Scout 7-in-1', 'ESP32-RS485-MAX485', 96, 'online'),
('SS-NODE-02', 1, 'Soil Scout 7-in-1', 'ESP32-RS485-MAX485', 88, 'online'),
('SS-NODE-03', 1, 'Soil Scout 7-in-1', 'ESP32-RS485-MAX485', 92, 'online'),
('DF-PROBE-01', 1, 'DairyFeed Dual-Node Silage', 'ESP32-DS18B20-TCS3200', 95, 'online'),
('DF-PROBE-02', 2, 'DairyFeed Dual-Node Silage', 'ESP32-DS18B20-TCS3200', 91, 'online')
ON CONFLICT (sensor_id) DO NOTHING;

-- Seed Sample Agronomic Action Alerts
INSERT INTO b2b_advisories (advisory_id, org_id, cluster_id, title, level, recommended_action, affected_farms_count)
VALUES
(1, 1, 2, 'Nitrogen Depletion across Sulur Cluster', 'WARNING', 'Trigger pulse rotation (Cowpea / Green Gram) to restore 40–60 kg/ha atmospheric nitrogen', 6),
(2, 1, 1, 'Monoculture Risk on Solanaceous Vegetables', 'DANGER', 'Rotate out of Tomato to prevent bacterial wilt build-up; sow Maize or Fodder Sorghum', 3),
(3, 1, 4, 'Soil Acidification Detected (pH < 5.8)', 'WARNING', 'Apply 200 kg/acre agricultural lime prior to Kharif sowing', 4)
ON CONFLICT (advisory_id) DO NOTHING;



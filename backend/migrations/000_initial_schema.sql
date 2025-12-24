-- Migration: Initial database schema
-- Description: Create users and health_features tables for Railway deployment
-- Date: 2025-11-30

-- Create users table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'users' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.users (
    user_cd INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT uq_users_username UNIQUE (username)
  );
END;

-- Create health_features table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'health_features' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.health_features (
    record_id INT IDENTITY(1,1) PRIMARY KEY,
    user_cd INT NOT NULL,

    -- Basic health inputs
    age_years INT NOT NULL,
    gender TINYINT NOT NULL, -- 0=male, 1=female
    height DECIMAL(5,2) NOT NULL, -- Height in cm
    weight DECIMAL(5,2) NOT NULL, -- Weight in kg
    ap_hi INT NOT NULL, -- Systolic blood pressure
    ap_lo INT NOT NULL, -- Diastolic blood pressure
    cholesterol TINYINT NOT NULL, -- 1=normal, 2=above normal, 3=well above normal
    gluc TINYINT NOT NULL, -- 1=normal, 2=above normal, 3=well above normal
    smoke TINYINT NOT NULL DEFAULT 0, -- 0=no, 1=yes
    alco TINYINT NOT NULL DEFAULT 0, -- 0=no, 1=yes
    [active] TINYINT NOT NULL DEFAULT 0, -- 0=no, 1=yes

    -- Engineered features
    bmi DECIMAL(5,2) NOT NULL, -- Body Mass Index
    pulse_pressure INT NOT NULL, -- Systolic - Diastolic BP
    age_group TINYINT NOT NULL, -- Age category 0-5
    bmi_group TINYINT NOT NULL, -- BMI category 0-3
    smoke_age INT NOT NULL, -- Smoke * Age interaction
    chol_bmi DECIMAL(8,2) NOT NULL, -- Cholesterol * BMI interaction

    -- ML Model predictions
    base_model1_score DECIMAL(5,4) NULL, -- CatBoost prediction score
    base_model2_score DECIMAL(5,4) NULL, -- LightGBM prediction score
    base_model3_score DECIMAL(5,4) NULL, -- Logistic Regression prediction score

    -- Stacked model results
    stacked_probability DECIMAL(5,4) NULL, -- Final ensemble prediction probability
    risk_label NVARCHAR(50) NULL, -- Risk category: Low/Moderate/High

    -- AI-generated advice
    advice_text NVARCHAR(MAX) NULL, -- Personalized health recommendations from Gemini AI

    -- Timestamp
    recorded_at DATETIME2 DEFAULT SYSUTCDATETIME(),

    -- Foreign key constraint
    CONSTRAINT fk_health_features_users FOREIGN KEY (user_cd) REFERENCES dbo.users(user_cd) ON DELETE CASCADE
  );
END;

-- Indexes
IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'idx_health_features_user_cd'
    AND object_id = OBJECT_ID(N'dbo.health_features')
)
BEGIN
  CREATE INDEX idx_health_features_user_cd ON dbo.health_features(user_cd);
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'idx_health_features_recorded_at'
    AND object_id = OBJECT_ID(N'dbo.health_features')
)
BEGIN
  CREATE INDEX idx_health_features_recorded_at ON dbo.health_features(recorded_at);
END;

-- Migration: Initial database schema
-- Description: Create users and health_features tables for Railway deployment
-- Date: 2025-11-30

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  user_cd INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create health_features table
CREATE TABLE IF NOT EXISTS health_features (
  record_id INT AUTO_INCREMENT PRIMARY KEY,
  user_cd INT NOT NULL,
  
  -- Basic health inputs
  age_years INT NOT NULL,
  gender TINYINT NOT NULL COMMENT '0=male, 1=female',
  height DECIMAL(5,2) NOT NULL COMMENT 'Height in cm',
  weight DECIMAL(5,2) NOT NULL COMMENT 'Weight in kg',
  ap_hi INT NOT NULL COMMENT 'Systolic blood pressure',
  ap_lo INT NOT NULL COMMENT 'Diastolic blood pressure',
  cholesterol TINYINT NOT NULL COMMENT '1=normal, 2=above normal, 3=well above normal',
  gluc TINYINT NOT NULL COMMENT '1=normal, 2=above normal, 3=well above normal',
  smoke TINYINT NOT NULL DEFAULT 0 COMMENT '0=no, 1=yes',
  alco TINYINT NOT NULL DEFAULT 0 COMMENT '0=no, 1=yes',
  ACTIVE TINYINT NOT NULL DEFAULT 0 COMMENT '0=no, 1=yes',
  
  -- Engineered features
  bmi DECIMAL(5,2) NOT NULL COMMENT 'Body Mass Index',
  pulse_pressure INT NOT NULL COMMENT 'Systolic - Diastolic BP',
  age_group TINYINT NOT NULL COMMENT 'Age category 0-5',
  bmi_group TINYINT NOT NULL COMMENT 'BMI category 0-3',
  smoke_age INT NOT NULL COMMENT 'Smoke * Age interaction',
  chol_bmi DECIMAL(8,2) NOT NULL COMMENT 'Cholesterol * BMI interaction',
  
  -- ML Model predictions
  base_model1_score DECIMAL(5,4) DEFAULT NULL COMMENT 'CatBoost prediction score',
  base_model2_score DECIMAL(5,4) DEFAULT NULL COMMENT 'LightGBM prediction score',
  base_model3_score DECIMAL(5,4) DEFAULT NULL COMMENT 'Logistic Regression prediction score',
  
  -- Stacked model results
  stacked_probability DECIMAL(5,4) DEFAULT NULL COMMENT 'Final ensemble prediction probability',
  risk_label VARCHAR(50) DEFAULT NULL COMMENT 'Risk category: Low/Moderate/High',
  
  -- AI-generated advice
  advice_text TEXT DEFAULT NULL COMMENT 'Personalized health recommendations from Gemini AI',
  
  -- Timestamp
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  FOREIGN KEY (user_cd) REFERENCES users(user_cd) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_user_cd (user_cd),
  INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration: Add base_model4_score and base_model5_score columns
-- Description: Add columns for Random Forest (model4) and XGBoost (model5) predictions
-- Date: 2025-11-30

ALTER TABLE health_features
ADD COLUMN base_model4_score DECIMAL(5,4) DEFAULT NULL COMMENT 'Random Forest prediction score' AFTER base_model3_score,
ADD COLUMN base_model5_score DECIMAL(5,4) DEFAULT NULL COMMENT 'XGBoost prediction score' AFTER base_model4_score;

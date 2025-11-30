-- Migration: Create user_profiles table
-- Description: Store user demographic and medical information
-- Date: 2025-11-30

CREATE TABLE IF NOT EXISTS user_profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_cd INT NOT NULL,
  full_name VARCHAR(255) DEFAULT NULL,
  date_of_birth DATE DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  emergency_contact_name VARCHAR(255) DEFAULT NULL,
  emergency_contact_phone VARCHAR(20) DEFAULT NULL,
  blood_group VARCHAR(10) DEFAULT NULL,
  medical_history TEXT DEFAULT NULL,
  allergies TEXT DEFAULT NULL,
  current_medications TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_profile (user_cd),
  INDEX idx_user_cd (user_cd),
  FOREIGN KEY (user_cd) REFERENCES users(user_cd) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 * Server-side validation for health features
 * Mirrors the frontend validation in InputForm.jsx
 */

const ranges = {
  age_years: { min: 20, max: 80 },
  height: { min: 120, max: 220 },
  weight: { min: 30, max: 200 },
  ap_hi: { min: 50, max: 250 },
  ap_lo: { min: 30, max: 150 },
  cholesterol: { min: 1, max: 3 },
  gluc: { min: 1, max: 3 }
};

/**
 * Validates and normalizes health features from the request
 * @param {Object} healthFeatures - Raw health features from request body
 * @returns {Object} - { valid: boolean, errors?: Object, normalizedFeatures?: Object }
 */
function validateHealthFeatures(healthFeatures) {
  if (!healthFeatures || typeof healthFeatures !== 'object') {
    return { valid: false, errors: { general: 'Health features are required' } };
  }

  const errors = {};

  // Validate numeric fields
  for (const [field, range] of Object.entries(ranges)) {
    const value = Number(healthFeatures[field]);
    
    if (isNaN(value)) {
      errors[field] = `${field} must be a valid number`;
    } else if (value < range.min || value > range.max) {
      errors[field] = `${field} must be between ${range.min} and ${range.max}`;
    }
  }

  // Validate gender
  const gender = Number(healthFeatures.gender);
  if (isNaN(gender) || (gender !== 0 && gender !== 1)) {
    errors.gender = 'Gender must be 0 (female) or 1 (male)';
  }

  // Validate BP relationship
  const ap_hi = Number(healthFeatures.ap_hi);
  const ap_lo = Number(healthFeatures.ap_lo);
  if (!isNaN(ap_hi) && !isNaN(ap_lo) && ap_lo > ap_hi) {
    errors.ap_lo = 'Diastolic BP cannot be greater than Systolic BP';
    errors.ap_hi = 'Systolic BP must be higher than Diastolic BP';
  }

  // Validate boolean fields
  const booleanFields = ['smoke', 'alco', 'ACTIVE'];
  for (const field of booleanFields) {
    const value = healthFeatures[field];
    if (value !== 0 && value !== 1 && value !== true && value !== false) {
      errors[field] = `${field} must be 0, 1, true, or false`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  // Normalize features
  const normalizedFeatures = {
    age_years: Number(healthFeatures.age_years),
    gender: Number(healthFeatures.gender),
    height: Number(healthFeatures.height),
    weight: Number(healthFeatures.weight),
    ap_hi: Number(healthFeatures.ap_hi),
    ap_lo: Number(healthFeatures.ap_lo),
    cholesterol: Number(healthFeatures.cholesterol),
    gluc: Number(healthFeatures.gluc),
    smoke: healthFeatures.smoke ? 1 : 0,
    alco: healthFeatures.alco ? 1 : 0,
    ACTIVE: healthFeatures.ACTIVE ? 1 : 0
  };

  return { valid: true, normalizedFeatures };
}

/**
 * Compute engineered features from raw health data
 * @param {Object} features - Normalized health features
 * @returns {Object} - Engineered features (bmi, pulse_pressure, age_group, etc.)
 */
function computeEngineeredFeatures(features) {
  const { age_years, height, weight, ap_hi, ap_lo, cholesterol, smoke } = features;

  const bmi = weight / ((height / 100) ** 2);
  const pulse_pressure = ap_hi - ap_lo;

  const age_group = 
    age_years < 30 ? 0 :
    age_years < 40 ? 1 :
    age_years < 50 ? 2 :
    age_years < 60 ? 3 :
    age_years < 70 ? 4 : 5;

  const bmi_group =
    bmi < 18.5 ? 1 :
    bmi < 25 ? 0 :
    bmi < 30 ? 2 : 3;

  const smoke_age = smoke * age_years;
  const chol_bmi = cholesterol * bmi;

  return {
    bmi: parseFloat(bmi.toFixed(2)),
    pulse_pressure,
    age_group,
    bmi_group,
    smoke_age,
    chol_bmi: parseFloat(chol_bmi.toFixed(2))
  };
}

export {
  validateHealthFeatures,
  computeEngineeredFeatures
};

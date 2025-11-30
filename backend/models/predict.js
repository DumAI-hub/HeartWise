/**
 * ML Prediction Module
 * Integrates with Python microservice running your stacking ML models
 */

/**
 * Predict cardiovascular risk using stacking models via Python microservice
 * @param {Object} features - Complete feature object (raw + engineered)
 * @returns {Promise<Object>} - Prediction results
 */
async function predictRisk(features) {
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  
  console.log('[INFO] Calling ML service at:', mlServiceUrl);

  // Prepare payload with all 17 features (base + engineered)
  const payload = {
    age_years: features.age_years,
    gender: features.gender,
    height: features.height,
    weight: features.weight,
    ap_hi: features.ap_hi,
    ap_lo: features.ap_lo,
    cholesterol: features.cholesterol,
    gluc: features.gluc,
    smoke: features.smoke,
    alco: features.alco,
    ACTIVE: features.ACTIVE,
    bmi: features.bmi,
    pulse_pressure: features.pulse_pressure,
    age_group: features.age_group,
    bmi_group: features.bmi_group,
    smoke_age: features.smoke_age,
    chol_bmi: features.chol_bmi
  };

  try {
    const response = await fetch(`${mlServiceUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ML service error: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();
    console.log('[INFO] Prediction received:', prediction.stacked);
    
    return prediction;
    
  } catch (error) {
    console.error('[ERROR] ML service error:', error.message);
    
    // Fallback to placeholder if ML service is unavailable
    console.warn('[WARNING] Using fallback prediction logic');
    return getFallbackPrediction(features);
  }
}

/**
 * Fallback prediction if ML service is unavailable
 */
function getFallbackPrediction(features) {
  const { age_years, bmi, ap_hi, cholesterol, smoke } = features;
  
  let riskScore = 0;
  if (age_years > 50) riskScore += 0.2;
  if (bmi > 30) riskScore += 0.15;
  if (ap_hi > 140) riskScore += 0.25;
  if (cholesterol > 2) riskScore += 0.15;
  if (smoke === 1) riskScore += 0.25;

  const probability = Math.min(riskScore, 0.95);
  
  let label = 'Low';
  if (probability > 0.6) label = 'High';
  else if (probability > 0.3) label = 'Moderate';

  return {
    base_predictions: {
      model1: 0.2 + Math.random() * 0.3,
      model2: 0.25 + Math.random() * 0.3,
      model3: 0.15 + Math.random() * 0.3
    },
    stacked: {
      probability: parseFloat(probability.toFixed(3)),
      label
    }
  };
}

export {
  predictRisk
};

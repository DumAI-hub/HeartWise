/**
 * LLM Client for generating AI-powered health advice
 * Uses Google Gemini API
 */

/**
 * Generate personalized health advice based on risk prediction
 * @param {Object} params - { features, prediction }
 * @returns {Promise<string>} - AI-generated advice text
 */
async function generateAdvice({ features, prediction }) {
  // 1. Clean the key (trim whitespace)
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('⚠️  GEMINI_API_KEY not configured, using placeholder advice');
    return generatePlaceholderAdvice({ features, prediction });
  }

  const prompt = buildPrompt({ features, prediction });
  
  console.log('🤖 Calling Gemini API for health advice...');

  try {
    // 2. UPDATED URL: Changed 'gemini-1.5-flash' to 'gemini-1.5-flash-001'
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Log the full error text to help debugging
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    const adviceText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!adviceText) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    console.log('✅ Gemini advice generated successfully');
    return adviceText;
    
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    console.warn('⚠️  Falling back to placeholder advice');
    return generatePlaceholderAdvice({ features, prediction });
  }
}

/**
 * Build prompt for LLM based on user features and prediction
 * @param {Object} params - { features, prediction }
 * @returns {string} - Formatted prompt
 */
function buildPrompt({ features, prediction }) {
  const { age_years, bmi, ap_hi, ap_lo, cholesterol, gluc, smoke, alco, ACTIVE } = features;
  const { probability, label } = prediction.stacked;

  return `You are a cardiovascular health advisor. Based on the following patient data, provide a brief, compassionate summary and lifestyle recommendations.

Patient Profile:
- Age: ${age_years} years
- BMI: ${bmi.toFixed(1)} kg/m²
- Blood Pressure: ${ap_hi}/${ap_lo} mmHg
- Cholesterol Level: ${cholesterol} (scale 1-3)
- Glucose Level: ${gluc} (scale 1-3)
- Smoking: ${smoke ? 'Yes' : 'No'}
- Alcohol: ${alco ? 'Yes' : 'No'}
- Physical Activity: ${ACTIVE ? 'Yes' : 'No'}

Risk Assessment:
- Cardiovascular Disease Risk: ${label} (${(probability * 100).toFixed(1)}%)

Please provide:
1. A brief summary of the risk factors (2-3 sentences)
2. 3-4 specific lifestyle recommendations
3. A reminder to consult with a healthcare provider

Keep the tone supportive and actionable. Limit response to 150 words.`;
}

/**
 * Generate placeholder advice when Gemini API is not configured
 * @param {Object} params - { features, prediction }
 * @returns {string} - Placeholder advice text
 */
function generatePlaceholderAdvice({ features, prediction }) {
  const { age_years, bmi, ap_hi, smoke, ACTIVE } = features;
  const { probability, label } = prediction.stacked;

  let advice = `At ${age_years} years old, your cardiovascular disease risk is assessed as ${label} (${(probability * 100).toFixed(1)}% probability).\n\n`;

  // Risk factors
  const riskFactors = [];
  if (ap_hi > 140) riskFactors.push('elevated blood pressure');
  if (bmi > 30) riskFactors.push('high BMI');
  if (smoke === 1) riskFactors.push('smoking');
  if (ACTIVE === 0) riskFactors.push('low physical activity');

  if (riskFactors.length > 0) {
    advice += `Key risk factors identified: ${riskFactors.join(', ')}.\n\n`;
  }

  // Recommendations
  advice += 'Recommendations:\n';
  if (ap_hi > 140) advice += '• Monitor and manage your blood pressure through diet and medication if prescribed\n';
  if (bmi > 30) advice += '• Consider a balanced diet and gradual weight management program\n';
  if (smoke === 1) advice += '• Seek support to quit smoking - this is the single most impactful change\n';
  if (ACTIVE === 0) advice += '• Aim for 150 minutes of moderate exercise per week\n';
  
  advice += '\n⚠️ This is an AI-generated assessment. Please consult with a healthcare provider for personalized medical advice.';

  return advice;
}

export { generateAdvice };

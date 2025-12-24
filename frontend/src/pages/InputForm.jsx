import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navigation from "../components/Navigation";
import { getApiUrl, axiosConfig } from "../config/api";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get(getApiUrl('checkSession'), axiosConfig);
        if (response.data.isLoggedIn) {
          setUsername(response.data.username || "");
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Session check error:", err);
        navigate("/login");
      }
    };
    fetchSession();
  }, [navigate]);

  const [healthFeatures, setHealthFeatures] = useState({
    age_years: "",
    gender: "",
    height: "",
    weight: "",
    ap_hi: "",
    ap_lo: "",
    cholesterol: "",
    gluc: "",
    smoke: false,
    alco: false,
    ACTIVE: false
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const ranges = {
    age_years: { min: 20, max: 80 },
    height: { min: 120, max: 220 },
    weight: { min: 30, max: 200 },
    ap_hi: { min: 50, max: 250 },
    ap_lo: { min: 30, max: 150 }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setHealthFeatures(prev => ({ ...prev, [name]: val }));

    let newErrors = { ...errors };

    if (ranges[name]) {
      const { min, max } = ranges[name];
      if (val !== "" && (Number(val) < min || Number(val) > max)) {
        newErrors[name] = `Value must be between ${min} and ${max}`;
      } else {
        newErrors[name] = null;
      }
    }

    const ap_hiVal = name === "ap_hi" ? Number(val) : Number(healthFeatures.ap_hi);
    const ap_loVal = name === "ap_lo" ? Number(val) : Number(healthFeatures.ap_lo);

    if (!isNaN(ap_hiVal) && !isNaN(ap_loVal)) {
      if (ap_loVal > ap_hiVal) {
        newErrors["ap_lo"] = "Diastolic BP cannot be greater than Systolic BP";
        newErrors["ap_hi"] = "Systolic BP must be higher than Diastolic BP";
      } else {
        if (newErrors["ap_lo"] === "Diastolic BP cannot be greater than Systolic BP") newErrors["ap_lo"] = null;
        if (newErrors["ap_hi"] === "Systolic BP must be higher than Diastolic BP") newErrors["ap_hi"] = null;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    setAdvice("");
    setMessage("");

    for (let key in ranges) {
      const val = Number(healthFeatures[key]);
      const { min, max } = ranges[key];
      if (val < min || val > max || isNaN(val)) {
        setErrors(prev => ({ ...prev, [key]: `Value must be between ${min} and ${max}` }));
        setLoading(false);
        return;
      }
    }

    if (Number(healthFeatures.ap_lo) > Number(healthFeatures.ap_hi)) {
      setErrors(prev => ({
        ...prev,
        ap_lo: "Diastolic BP cannot be greater than Systolic BP",
        ap_hi: "Systolic BP must be higher than Diastolic BP"
      }));
      setLoading(false);
      return;
    }

    try {
      const payload = {
        username,
        healthFeatures: {
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
        }
      };

      const response = await axios.post(getApiUrl('predictAndSave'), payload, {
        ...axiosConfig,
        headers: { "Content-Type": "application/json" }
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setPrediction(response.data.prediction);
        setAdvice(response.data.advice_text);
      } else {
        setMessage("Error: " + response.data.message);
      }
    } catch (err) {
      console.error("Axios error:", err.response ? err.response.data : err.message);
      setMessage("Error submitting form: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navigation />
      
      <div className="min-h-screen">
      {/* Main Form Container */}
      <div className="max-w-6xl mx-auto p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          padding: '2rem',
          marginTop: '1.5rem'
        }}>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3" style={{ color: 'white' }}>
              Cardiovascular Risk Assessment
            </h2>
            <p className="text-lg mb-4" style={{ color: '#cbd5f5' }}>
              Enter your health details for AI-powered cardiovascular disease risk estimation.
            </p>
            <div
              className="mx-auto text-sm font-medium"
              style={{
                maxWidth: '56rem',
                textAlign: 'left',
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(248, 113, 113, 0.7)',
                padding: '1rem 1.25rem',
                color: '#fecaca',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)'
              }}
            >
              <p className="mb-1" style={{ fontWeight: 700 }}>
                Medical Disclaimer
              </p>
              <p className="mb-1">
                This tool provides an estimated cardiovascular risk score for information and
                awareness only. It does <span style={{ fontWeight: 700 }}>not</span> provide a
                medical diagnosis and must not replace advice from a doctor or other qualified
                healthcare professional.
              </p>
              <p className="mb-1">
                Always consult a healthcare professional about your symptoms, medications, and
                test results. Do not ignore or delay seeking medical care because of results you
                see here.
              </p>
              <p>
                If you think you may be experiencing a medical emergency (for example, chest
                pain, severe shortness of breath, or sudden weakness), call your local emergency
                number or go to the nearest hospital immediately.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Health Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { name: "age_years", label: "Age", range: "20-80 years" },
                { name: "height", label: "Height", range: "120-220 cm" },
                { name: "weight", label: "Weight", range: "30-200 kg" },
                { name: "ap_hi", label: "Systolic BP", range: "50-250 mmHg" },
                { name: "ap_lo", label: "Diastolic BP", range: "30-150 mmHg" }
              ].map((field) => (
                <div key={field.name} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem'
                }}>
                  <div className="flex justify-between items-start mb-3">
                    <label className="block text-lg font-semibold" style={{ color: 'white' }}>
                      {field.label}
                    </label>
                    <span className="text-sm px-2 py-1 rounded" style={{ 
                      color: '#94a3b8',
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}>
                      {field.range}
                    </span>
                  </div>
                  <input
                    type="number"
                    name={field.name}
                    min={ranges[field.name].min}
                    max={ranges[field.name].max}
                    value={healthFeatures[field.name]}
                    onChange={handleChange}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      fontSize: '1.125rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                  />
                  {errors[field.name] && (
                    <p className="text-sm mt-2 font-medium px-3 py-1 rounded" style={{
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.15)'
                    }}>{errors[field.name]}</p>
                  )}
                </div>
              ))}

              {/* Cholesterol Select */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}>
                <div className="flex justify-between items-start mb-3">
                  <label className="block text-lg font-semibold" style={{ color: 'white' }}>
                    Cholesterol Level
                  </label>
                  <span className="text-sm px-2 py-1 rounded" style={{ 
                    color: '#94a3b8',
                    background: 'rgba(255, 255, 255, 0.05)'
                  }}>
                    Low / Normal / High (mg/dL)
                  </span>
                </div>
                <select
                  name="cholesterol"
                  value={healthFeatures.cholesterol}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '1.125rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                >
                  <option value="" style={{ background: '#1e293b' }}>Select cholesterol category</option>
                  <option value="1" style={{ background: '#1e293b' }}>Low (&lt; 200 mg/dL)</option>
                  <option value="2" style={{ background: '#1e293b' }}>Normal (200–239 mg/dL)</option>
                  <option value="3" style={{ background: '#1e293b' }}>High (≥ 240 mg/dL)</option>
                </select>
                <p className="text-sm mt-2" style={{ color: '#94a3b8' }}>
                  Tip: Exact cholesterol values usually come from a blood test done by a doctor or
                  laboratory. If you do not know your value, you can select the option that feels
                  safest for you (for example, "Low"), and discuss precise numbers with a
                  healthcare professional.
                </p>
              </div>

              {/* Glucose Select */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}>
                <div className="flex justify-between items-start mb-3">
                  <label className="block text-lg font-semibold" style={{ color: 'white' }}>
                    Fasting Glucose
                  </label>
                  <span className="text-sm px-2 py-1 rounded" style={{ 
                    color: '#94a3b8',
                    background: 'rgba(255, 255, 255, 0.05)'
                  }}>
                    Low / Normal / High (mg/dL)
                  </span>
                </div>
                <select
                  name="gluc"
                  value={healthFeatures.gluc}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '1.125rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                >
                  <option value="" style={{ background: '#1e293b' }}>Select glucose category</option>
                  <option value="1" style={{ background: '#1e293b' }}>Low / Normal (&lt; 100 mg/dL)</option>
                  <option value="2" style={{ background: '#1e293b' }}>Normal (100–125 mg/dL)</option>
                  <option value="3" style={{ background: '#1e293b' }}>High (≥ 126 mg/dL)</option>
                </select>
                <p className="text-sm mt-2" style={{ color: '#94a3b8' }}>
                  Tip: Fasting blood sugar is usually measured with a home glucometer or a lab
                  blood test. If you do not know your exact value, choose the category that seems
                  safest (for example, "Low / Normal") rather than guessing a higher level.
                </p>
              </div>

              {/* Gender Select */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}>
                <label className="block text-lg font-semibold mb-3" style={{ color: 'white' }}>Gender</label>
                <select
                  name="gender"
                  value={healthFeatures.gender}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '1.125rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                >
                  <option value="" style={{ background: '#1e293b' }}>Select Gender</option>
                  <option value="1" style={{ background: '#1e293b' }}>Male</option>
                  <option value="0" style={{ background: '#1e293b' }}>Female</option>
                </select>
              </div>
            </div>

            {/* Checkboxes Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              padding: '2rem'
            }}>
              <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: 'white' }}>Lifestyle Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "smoke", label: "Smoking Habit", description: "Do you smoke regularly?" },
                  { name: "alco", label: "Alcohol Consumption", description: "Do you consume alcohol?" },
                  { name: "ACTIVE", label: "Physical Activity", description: "Are you physically active?" }
                ].map((field) => (
                  <div key={field.name} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                  }}>
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={healthFeatures[field.name]}
                        onChange={handleChange}
                        className="w-5 h-5"
                        style={{ accentColor: '#667eea' }}
                      />
                      <div>
                        <label className="text-lg font-semibold block" style={{ color: 'white' }}>
                          {field.label}
                        </label>
                        <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                          {field.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  maxWidth: '28rem',
                  margin: '0 auto',
                  background: loading ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                  display: 'block'
                }}
              >
                {loading ? "Analyzing..." : "Analyze Cardiovascular Risk"}
              </button>
              
            </div>
          </form>

          {/* Prediction Results */}
          {prediction && (
            <div className="mt-8" style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '2px solid rgba(102, 126, 234, 0.3)'
            }}>
              <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: 'white' }}>
                Risk Assessment Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}>
                  <p className="text-sm mb-1" style={{ color: '#94a3b8' }}>Risk Level</p>
                  <p className={`text-3xl font-bold`} style={{
                    color: prediction.label === 'Low' ? '#10b981' :
                           prediction.label === 'Moderate' ? '#f59e0b' :
                           '#ef4444'
                  }}>
                    {prediction.label}
                  </p>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}>
                  <p className="text-sm mb-1" style={{ color: '#94a3b8' }}>Risk Probability</p>
                  <p className="text-3xl font-bold" style={{ color: 'white' }}>
                    {(prediction.probability * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Advice */}
          {advice && (
            <div className="mt-6" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '2px solid rgba(16, 185, 129, 0.3)'
            }}>
              <h3 className="text-2xl font-bold mb-4 flex items-center" style={{ color: 'white' }}>
                <span className="mr-2">💡</span>
                Personalized Health Advice
              </h3>
              <div className="prose prose-sm max-w-none">
                <p style={{
                  color: '#e2e8f0',
                  whiteSpace: 'pre-line',
                  lineHeight: '1.75'
                }}>
                  {advice}
                </p>
              </div>
            </div>
          )}

          {message && !prediction && (
            <div className="mt-8 p-6 rounded-xl text-center font-semibold text-lg" style={{
              background: message.includes("Error") 
                ? 'rgba(239, 68, 68, 0.15)' 
                : 'rgba(16, 185, 129, 0.15)',
              color: message.includes("Error") 
                ? '#ef4444' 
                : '#10b981',
              border: message.includes("Error")
                ? '2px solid rgba(239, 68, 68, 0.3)'
                : '2px solid rgba(16, 185, 129, 0.3)'
            }}>
              {message}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default RegisterForm;
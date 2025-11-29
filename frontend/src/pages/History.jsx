import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navigation from "../components/Navigation";
import { getApiUrl, axiosConfig } from "../config/api";

export default function History() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRecord, setExpandedRecord] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Step 1: Check session and get username
        const sessionResponse = await axios.get(getApiUrl('checkSession'), axiosConfig);

        if (!sessionResponse.data.isLoggedIn) {
          setError("Please log in to view your history");
          setLoading(false);
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const username = sessionResponse.data.username;

        // Step 2: Get user_cd using username
        const userResponse = await axios.get(getApiUrl(`getUserCd?username=${encodeURIComponent(username)}`), axiosConfig);

        if (!userResponse.data.success) {
          setError("Unable to fetch user information");
          setLoading(false);
          return;
        }

        const user_cd = userResponse.data.user_cd;

        // Step 3: Fetch history using user_cd
        const historyResponse = await axios.get(getApiUrl(`getUserHistory/${user_cd}`), axiosConfig);

        if (historyResponse.data.success) {
          setRecords(historyResponse.data.history);
        }
        setLoading(false);
      } catch (err) {
        console.error("ERROR:", err);
        setError("Failed to load history data");
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const getRiskColor = (label) => {
    if (!label) return "#6B7280";
    if (label.toLowerCase().includes("low")) return "#10B981";
    if (label.toLowerCase().includes("moderate")) return "#F59E0B";
    return "#EF4444";
  };

  const getRiskBadgeClass = (label) => {
    if (!label) return "risk-badge-unknown";
    if (label.toLowerCase().includes("low")) return "risk-badge-low";
    if (label.toLowerCase().includes("moderate")) return "risk-badge-moderate";
    return "risk-badge-high";
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Loading your health history...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>{error}</h2>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>No Health Records Found</h2>
          <p>Start your cardiovascular health journey by taking your first assessment.</p>
          <button onClick={() => navigate("/input")} className="btn-primary">
            Start Detection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navigation />
      
      <div className="history-container">
        <div className="history-header">
          <div>
            <h1 className="history-title">Health History</h1>
            <p className="history-subtitle">
              Track your cardiovascular health assessments over time
            </p>
          </div>
          <div className="history-stats">
            <div className="stat-card">
              <div className="stat-number">{records.length}</div>
              <div className="stat-label">Total Records</div>
            </div>
          </div>
        </div>

        <div className="records-grid">
          {records.map((rec) => (
            <div key={rec.record_id} className="record-card">
              <div className="record-header">
                <div className="record-date">
                  <span className="date-icon">📅</span>
                  {new Date(rec.recorded_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  <span className="date-time">
                    {new Date(rec.recorded_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className={`risk-badge ${getRiskBadgeClass(rec.risk_label)}`}>
                  {rec.risk_label || "Unknown"}
                </div>
              </div>

              <div className="record-summary">
                <div className="summary-item">
                  <span className="summary-label">Risk Probability</span>
                  <span className="summary-value" style={{ color: getRiskColor(rec.risk_label) }}>
                    {rec.stacked_probability 
                      ? `${(rec.stacked_probability * 100).toFixed(1)}%`
                      : "N/A"}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Age</span>
                  <span className="summary-value">{rec.age_years} years</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">BMI</span>
                  <span className="summary-value">{rec.bmi?.toFixed(1) || "N/A"}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Blood Pressure</span>
                  <span className="summary-value">{rec.ap_hi}/{rec.ap_lo}</span>
                </div>
              </div>

              <button
                className="expand-button"
                onClick={() => setExpandedRecord(expandedRecord === (rec.record_id || rec.id) ? null : (rec.record_id || rec.id))}
              >
                {expandedRecord === (rec.record_id || rec.id) ? "Hide Details ▲" : "View Details ▼"}
              </button>

              {expandedRecord === (rec.record_id || rec.id) && (
                <div className="record-details">
                  <div className="details-section">
                    <h4>Personal Information</h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Gender</span>
                        <span className="detail-value">{rec.gender === 1 ? "Female" : "Male"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Height</span>
                        <span className="detail-value">{rec.height} cm</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Weight</span>
                        <span className="detail-value">{rec.weight} kg</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Pulse Pressure</span>
                        <span className="detail-value">{rec.pulse_pressure}</span>
                      </div>
                    </div>
                  </div>

                  <div className="details-section">
                    <h4>Health Indicators</h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Cholesterol</span>
                        <span className="detail-value">Level {rec.cholesterol}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Glucose</span>
                        <span className="detail-value">Level {rec.gluc}</span>
                      </div>
                    </div>
                  </div>

                  <div className="details-section">
                    <h4>Lifestyle Factors</h4>
                    <div className="lifestyle-badges">
                      <span className={`lifestyle-badge ${rec.smoke ? "badge-negative" : "badge-positive"}`}>
                        {rec.smoke ? "🚬 Smoker" : "🚭 Non-smoker"}
                      </span>
                      <span className={`lifestyle-badge ${rec.alco ? "badge-negative" : "badge-positive"}`}>
                        {rec.alco ? "🍺 Alcohol" : "🚫 No Alcohol"}
                      </span>
                      <span className={`lifestyle-badge ${rec.ACTIVE ? "badge-positive" : "badge-negative"}`}>
                        {rec.ACTIVE ? "🏃 Active" : "💺 Inactive"}
                      </span>
                    </div>
                  </div>

                  {rec.advice_text && (
                    <div className="details-section advice-section">
                      <h4>💡 AI Health Advice</h4>
                      <p className="advice-text">{rec.advice_text}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

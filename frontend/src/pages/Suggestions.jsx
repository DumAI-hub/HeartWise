import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navigation from "../components/Navigation";
import { getApiUrl, axiosConfig } from "../config/api";
import "../App.css";

export default function Suggestions() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // Check session
        const sessionResponse = await axios.get(getApiUrl('checkSession'), axiosConfig);

        if (!sessionResponse.data.isLoggedIn) {
          setError("Please log in to view AI suggestions");
          setLoading(false);
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const username = sessionResponse.data.username;

        // Get user_cd
        const userResponse = await axios.get(getApiUrl(`getUserCd?username=${encodeURIComponent(username)}`), axiosConfig);

        if (!userResponse.data.success) {
          setError("Unable to fetch user information");
          setLoading(false);
          return;
        }

        const user_cd = userResponse.data.user_cd;

        // Fetch history with advice
        const historyResponse = await axios.get(getApiUrl(`getUserHistory/${user_cd}`), axiosConfig);

        if (historyResponse.data.success) {
          // Filter records that have advice
          const recordsWithAdvice = historyResponse.data.history.filter(
            rec => rec.advice_text && rec.advice_text.trim() !== ""
          );
          setRecords(recordsWithAdvice);
          if (recordsWithAdvice.length > 0) {
            setSelectedRecord(recordsWithAdvice[0]);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("ERROR:", err);
        setError("Failed to load AI suggestions");
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [navigate]);

  const getRiskColor = (label) => {
    if (!label) return "#6B7280";
    if (label.toLowerCase().includes("low")) return "#10B981";
    if (label.toLowerCase().includes("moderate")) return "#F59E0B";
    return "#EF4444";
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Loading AI insights...</h2>
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
          <div className="empty-icon">💡</div>
          <h2>No AI Suggestions Available</h2>
          <p>Complete a cardiovascular assessment to receive personalized AI-powered health insights.</p>
          <button onClick={() => navigate("/input")} className="btn-primary">
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navigation />
      
      <div className="suggestions-container">
        <div className="suggestions-header">
          <div>
            <h1 className="suggestions-title">AI Health Insights</h1>
            <p className="suggestions-subtitle">
              Personalized recommendations based on your cardiovascular assessments
            </p>
          </div>
        </div>

        <div className="suggestions-layout">
          {/* Sidebar with record list */}
          <div className="suggestions-sidebar">
            <h3 className="sidebar-title">Assessment History</h3>
            <div className="sidebar-list">
              {records.map((rec) => (
                <div
                  key={rec.record_id}
                  className={`sidebar-item ${selectedRecord?.record_id === rec.record_id ? "active" : ""}`}
                  onClick={() => setSelectedRecord(rec)}
                >
                  <div className="sidebar-item-date">
                    {new Date(rec.recorded_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div
                    className="sidebar-item-risk"
                    style={{ color: getRiskColor(rec.risk_label) }}
                  >
                    {rec.risk_label || "Unknown"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main content area */}
          <div className="suggestions-content">
            {selectedRecord && (
              <>
                <div className="advice-card">
                  <div className="advice-header">
                    <div className="advice-icon">🤖</div>
                    <div>
                      <h2>AI-Generated Health Advice</h2>
                      <p className="advice-date">
                        Assessment from {new Date(selectedRecord.recorded_at).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="risk-summary">
                    <div className="risk-summary-item">
                      <span className="risk-summary-label">Risk Level</span>
                      <span
                        className="risk-summary-value"
                        style={{ color: getRiskColor(selectedRecord.risk_label) }}
                      >
                        {selectedRecord.risk_label || "Unknown"}
                      </span>
                    </div>
                    <div className="risk-summary-item">
                      <span className="risk-summary-label">Probability</span>
                      <span className="risk-summary-value">
                        {selectedRecord.stacked_probability
                          ? `${(selectedRecord.stacked_probability * 100).toFixed(1)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="advice-content">
                    <p className="advice-text">{selectedRecord.advice_text}</p>
                  </div>
                </div>

                <div className="health-metrics">
                  <h3>Health Metrics Summary</h3>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <span className="metric-icon">👤</span>
                      <div>
                        <div className="metric-label">Age</div>
                        <div className="metric-value">{selectedRecord.age_years} years</div>
                      </div>
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">⚖️</span>
                      <div>
                        <div className="metric-label">BMI</div>
                        <div className="metric-value">{selectedRecord.bmi?.toFixed(1) || "N/A"}</div>
                      </div>
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">❤️</span>
                      <div>
                        <div className="metric-label">Blood Pressure</div>
                        <div className="metric-value">{selectedRecord.ap_hi}/{selectedRecord.ap_lo}</div>
                      </div>
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">📊</span>
                      <div>
                        <div className="metric-label">Cholesterol</div>
                        <div className="metric-value">Level {selectedRecord.cholesterol}</div>
                      </div>
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">🍬</span>
                      <div>
                        <div className="metric-label">Glucose</div>
                        <div className="metric-value">Level {selectedRecord.gluc}</div>
                      </div>
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">💪</span>
                      <div>
                        <div className="metric-label">Activity</div>
                        <div className="metric-value">{selectedRecord.ACTIVE ? "Active" : "Inactive"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navigation from "../components/Navigation";
import { getApiUrl, axiosConfig } from "../config/api";

export default function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get(getApiUrl('checkSession'), axiosConfig);
      setIsLoggedIn(response.data.isLoggedIn);
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  const handleStartDetection = async () => {
    try {
      const response = await axios.get(getApiUrl('checkSession'), axiosConfig);

      if (response.data.isLoggedIn) {
        navigate("/input");
      } else {
        navigate("/login");
      }
    } catch (err) {
      navigate("/login");
    }
  };

  const handleCardClick = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="homepage" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navigation />

      {/* Hero Section */}
      <section className="hero-modern">
        <div className="hero-container">
          <div className="hero-content-wrapper">
            <div className="hero-badge">
              <span className="badge-icon">🏥</span>
              <span className="badge-text">AI-Powered Health Monitoring</span>
            </div>
            
            <h1 className="hero-main-title">
              Predict Your
              <span className="gradient-text"> Heart Health</span>
              <br />
              With Confidence
            </h1>
            
            <p className="hero-lead">
              Advanced machine learning technology helps you understand your cardiovascular 
              risk profile. Get instant assessments, personalized insights, and take control 
              of your heart health journey.
            </p>
            
            <div className="hero-cta">
              <button 
                className="cta-primary" 
                onClick={handleStartDetection}
              >
                <span>Start Free Assessment</span>
                <span className="cta-icon">→</span>
              </button>
              
              {!isLoggedIn && (
                <button 
                  className="cta-secondary" 
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
              )}
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Assessments</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Available</div>
              </div>
            </div>
          </div>
          
          <div className="hero-visual-wrapper">
            <div className="visual-card">
              <div className="visual-pulse">
                <div className="pulse-ring"></div>
                <div className="pulse-ring pulse-ring-2"></div>
                <div className="pulse-icon">❤️</div>
              </div>
              <div className="visual-stats-mini">
                <div className="mini-stat">
                  <span className="mini-label">Blood Pressure</span>
                  <span className="mini-value">120/80</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-label">Heart Rate</span>
                  <span className="mini-value">72 bpm</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-label">Risk Level</span>
                  <span className="mini-value status-low">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-modern">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">Everything You Need</h2>
            <p className="features-subtitle">
              Comprehensive cardiovascular health monitoring in one place
            </p>
          </div>
          
          <div className="features-grid-modern">
            <div 
              className="feature-card-modern primary-card" 
              onClick={handleStartDetection}
            >
              <div className="feature-icon-wrapper primary-icon">
                <svg className="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="feature-card-title">Risk Assessment</h3>
              <p className="feature-card-description">
                Get instant cardiovascular risk evaluation using advanced AI algorithms 
                trained on thousands of health profiles.
              </p>
              <button className="feature-action">
                Start Now <span className="action-arrow">→</span>
              </button>
            </div>

            <div 
              className="feature-card-modern" 
              onClick={() => handleCardClick("/history")}
            >
              <div className="feature-icon-wrapper">
                <svg className="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="feature-card-title">Health History</h3>
              <p className="feature-card-description">
                Track your cardiovascular health metrics over time and visualize 
                your progress with detailed records.
              </p>
              <button className="feature-action">
                View History <span className="action-arrow">→</span>
              </button>
            </div>

            <div 
              className="feature-card-modern" 
              onClick={() => handleCardClick("/suggestions")}
            >
              <div className="feature-icon-wrapper">
                <svg className="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="feature-card-title">AI Insights</h3>
              <p className="feature-card-description">
                Receive personalized recommendations and actionable health tips 
                powered by artificial intelligence.
              </p>
              <button className="feature-action">
                Get Insights <span className="action-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="works-container">
          <h2 className="works-title">How It Works</h2>
          <div className="works-steps">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Enter Your Data</h3>
                <p>Provide basic health parameters like age, blood pressure, and lifestyle factors</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>AI Analysis</h3>
                <p>Our machine learning model analyzes your data instantly</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Get Results</h3>
                <p>Receive your risk assessment and personalized health advice</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">❤️ CardioPredict</div>
            <p className="footer-tagline">Your AI-powered heart health companion</p>
          </div>
          <div className="footer-info">
            <p>© 2025 CardioPredict. Advanced cardiovascular risk assessment.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
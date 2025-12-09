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
            
            <h1 className="hero-main-title">
              Predict Your
              <span className="gradient-text"> Heart Health</span>
              <br />
              With Confidence
            </h1>
            
            <p className="hero-lead">
              Machine learning technology helps you understand your cardiovascular 
              risk profile. Get instant assessments, personalized insights, and take control 
              of your heart health journey.
            </p>
          </div>
          
          <div className="hero-visual-wrapper">
             <div className="visual-card ">
              <img
                src="https://media.clinicaladvisor.com/images/2017/03/29/heartillustrationts51811362_1191108.jpg"
                
              />
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

     
    </div>
  );
}
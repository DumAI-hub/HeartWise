import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getApiUrl, axiosConfig } from "../config/api";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(getApiUrl('login'), 
        { username, password },
        axiosConfig
      );

      if (response.data.success) {
        navigate("/input");
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="auth-page">
      <div className="auth-background"></div>
      
      <div className="auth-container">
      

        <div className="auth-card">
          <div className="auth-card-header">
           
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Login to continue your health journey</p>
=======
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: 'var(--space-xl)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px'
      }}>
        {/* Back Button */}
        <button 
          onClick={() => navigate("/")}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: 'var(--space-lg)'
          }}
        >
          ← Back to Home
        </button>

        {/* Login Card */}
        <div className="classic-card" style={{ padding: 'var(--space-2xl)' }}>
          {/* Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 'var(--space-2xl)',
            borderBottom: '2px solid var(--color-border)',
            paddingBottom: 'var(--space-lg)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>❤️</div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-xs)'
            }}>
              Welcome Back
            </h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)'
            }}>
              Login to continue your health journey
            </p>
>>>>>>> 75328f06e185ad1e8cab25884412466dcb2d6635
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && (
<<<<<<< HEAD
              <div className="error-message">
                
=======
              <div style={{
                padding: 'var(--space-md)',
                background: 'rgba(230, 57, 70, 0.1)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-error)',
                fontSize: 'var(--text-sm)',
                marginBottom: 'var(--space-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)'
              }}>
                <span>⚠️</span>
>>>>>>> 75328f06e185ad1e8cab25884412466dcb2d6635
                {error}
              </div>
            )}

            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label className="classic-label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="classic-input"
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <label className="classic-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="classic-input"
              />
            </div>

            <button
              type="submit"
              className="classic-btn classic-btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                fontSize: 'var(--text-base)',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div style={{
              textAlign: 'center',
              marginTop: 'var(--space-xl)',
              paddingTop: 'var(--space-lg)',
              borderTop: '1px solid var(--color-border)'
            }}>
              <p style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)'
              }}>
                Don't have an account?{" "}
                <Link 
                  to="/signup"
                  style={{
                    color: 'var(--color-primary)',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
         <button onClick={() => navigate("/")} className="back-button">
          ← Home
        </button>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getApiUrl, axiosConfig } from "../config/api";

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(getApiUrl('signup'), 
        { username, password },
        axiosConfig
      );

      if (response.data.success) {
        navigate("/");
      } else {
        setError(response.data.message || "Signup failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
            color: '#e5e7eb',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: 'var(--space-lg)'
          }}
        >
          ← Back to Home
        </button>

        {/* Signup Card */}
        <div className="classic-card" style={{ padding: 'var(--space-2xl)', backgroundColor: '#ffffff', color: '#111827' }}>
          {/* Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 'var(--space-2xl)',
            borderBottom: '2px solid var(--color-border)',
            paddingBottom: 'var(--space-lg)'
          }}>
            
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-xs)'
            }}>
              Create Account
            </h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)'
            }}>
              Join us to start monitoring your heart health
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && (
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
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="classic-input"
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label className="classic-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="classic-input"
                minLength={6}
              />
              <p className="classic-helper-text">
                Must be at least 6 characters long
              </p>
            </div>

            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <label className="classic-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Creating account..." : "Create Account"}
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
                Already have an account?{" "}
                <Link 
                  to="/login"
                  style={{
                    color: 'var(--color-primary)',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
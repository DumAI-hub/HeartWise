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
        navigate("/input");
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
    <div className="auth-page">
      <div className="auth-background"></div>
      
      <div className="auth-container">
        <button onClick={() => navigate("/")} className="back-button">
          ← Back to Home
        </button>

        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-logo">❤️</div>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join us to start monitoring your heart health</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <span className="button-loading">
                  <span className="mini-spinner"></span>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="auth-footer">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="auth-link">
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
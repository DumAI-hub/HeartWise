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
    <div className="auth-page">
      <div className="auth-background"></div>
      
      <div className="auth-container">
      

        <div className="auth-card">
          <div className="auth-card-header">
           
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Login to continue your health journey</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>

            <div className="auth-footer">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="auth-link">
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
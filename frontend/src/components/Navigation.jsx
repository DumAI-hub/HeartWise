import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getApiUrl, axiosConfig } from "../config/api";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get(getApiUrl('checkSession'), axiosConfig);
      if (response.data.isLoggedIn) {
        setIsLoggedIn(true);
        setUsername(response.data.username);
      } else {
        setIsLoggedIn(false);
        setUsername("");
      }
    } catch (err) {
      console.error("Session check error:", err);
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(getApiUrl('logout'), {}, axiosConfig);
      setIsLoggedIn(false);
      setUsername("");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <div className="brand-icon">❤️</div>
          <h1 className="brand-name">CardioPredict</h1>
        </div>

        <div className="navbar-links">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/input")}
                className={`nav-link ${isActive("/input") ? "active" : ""}`}
              >
                <span className="nav-icon">🔬</span>
                Detection
              </button>
              <button
                onClick={() => navigate("/history")}
                className={`nav-link ${isActive("/history") ? "active" : ""}`}
              >
                <span className="nav-icon">📊</span>
                History
              </button>
              <button
                onClick={() => navigate("/suggestions")}
                className={`nav-link ${isActive("/suggestions") ? "active" : ""}`}
              >
                <span className="nav-icon">💡</span>
                AI Insights
              </button>

              <div className="user-menu">
                <button
                  className="user-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-avatar">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{username}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={() => navigate("/")}>
                      <span>🏠</span> Home
                    </button>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="nav-link-button login-btn"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="nav-link-button signup-btn"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

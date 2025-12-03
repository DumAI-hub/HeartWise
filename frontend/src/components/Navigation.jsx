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
    <nav style={{
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div 
          onClick={() => navigate("/")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '1.75rem' }}>❤️</div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-2xl)',
            color: 'var(--color-primary)',
            fontWeight: '700'
          }}>
            HeartWise
          </h1>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/input")}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: isActive("/input") ? 'var(--color-primary)' : 'transparent',
                  color: isActive("/input") ? 'white' : 'var(--color-text)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: '500',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer'
                }}
              >
                Health Check
              </button>
              
              <button
                onClick={() => navigate("/history")}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: isActive("/history") ? 'var(--color-primary)' : 'transparent',
                  color: isActive("/history") ? 'white' : 'var(--color-text)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: '500',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer'
                }}
              >
                History
              </button>

              <button
                onClick={() => navigate("/suggestions")}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: isActive("/suggestions") ? 'var(--color-primary)' : 'transparent',
                  color: isActive("/suggestions") ? 'white' : 'var(--color-text)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: '500',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer'
                }}
              >
                Insights
              </button>

              <div style={{ 
                width: '1px', 
                height: '24px', 
                background: 'var(--color-border)',
                margin: '0 0.5rem'
              }} />

              {/* User Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--color-bg)',
                    border: '2px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: 'var(--text-sm)'
                  }}>
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span style={{
                    fontWeight: '600',
                    color: 'var(--color-text)',
                    fontSize: 'var(--text-sm)'
                  }}>
                    {username}
                  </span>
                  <span style={{
                    fontSize: '0.625rem',
                    color: 'var(--color-text-tertiary)',
                    transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)'
                  }}>
                    ▼
                  </span>
                </button>

                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: '180px',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/profile");
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text)',
                        cursor: 'pointer'
                      }}
                    >
                      👤 Profile
                    </button>
                    <div style={{
                      height: '1px',
                      background: 'var(--color-border)',
                      margin: '0.25rem 0'
                    }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-error)',
                        cursor: 'pointer'
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: '0.625rem 1.5rem',
                  background: 'transparent',
                  color: 'var(--color-primary)',
                  border: '2px solid var(--color-primary)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: '600',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer'
                }}
              >
                Login
              </button>
              
              <button
                onClick={() => navigate("/signup")}
                style={{
                  padding: '0.625rem 1.5rem',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: '600',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
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

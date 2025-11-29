import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { getApiUrl, axiosConfig } from "./config/api";

export default function PrivateRoute({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(getApiUrl('checkSession'), axiosConfig);
        setIsLoggedIn(response.data.isLoggedIn);
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoggedIn === null) {
    return <div>Loading...</div>;
  }
  
  if (!isLoggedIn) {
    alert("Please login first to access this page.");
    return <Navigate to="/login" />;
  }

  return children;
}

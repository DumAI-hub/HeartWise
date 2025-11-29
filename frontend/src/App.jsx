import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import InputForm from "./pages/InputForm";
import History from "./pages/History";
import Suggestions from "./pages/Suggestions";
import PrivateRoute from "./PrivateRoute";
import "./App.css";

export default function App() {
  return (
    <div className = "appContainer">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/input"
          element={
            <PrivateRoute>
              <InputForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          }
        />
        <Route
          path="/suggestions"
          element={
            <PrivateRoute>
              <Suggestions />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

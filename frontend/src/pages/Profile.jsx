import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navigation from "../components/Navigation";
import { getApiUrl, axiosConfig } from "../config/api";
import "../App.css";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [username, setUsername] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    blood_group: "",
    medical_history: "",
    allergies: "",
    current_medications: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check session
        const sessionResponse = await axios.get(getApiUrl('checkSession'), axiosConfig);

        if (!sessionResponse.data.isLoggedIn) {
          setError("Please log in to view your profile");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const currentUsername = sessionResponse.data.username;
        setUsername(currentUsername);

        // Fetch profile data
        const profileResponse = await axios.get(
          getApiUrl(`profile/get?username=${encodeURIComponent(currentUsername)}`),
          axiosConfig
        );

        if (profileResponse.data.success && profileResponse.data.profile) {
          const profile = profileResponse.data.profile;
          setFormData({
            full_name: profile.full_name || "",
            date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : "",
            phone: profile.phone || "",
            address: profile.address || "",
            city: profile.city || "",
            state: profile.state || "",
            country: profile.country || "",
            emergency_contact_name: profile.emergency_contact_name || "",
            emergency_contact_phone: profile.emergency_contact_phone || "",
            blood_group: profile.blood_group || "",
            medical_history: profile.medical_history || "",
            allergies: profile.allergies || "",
            current_medications: profile.current_medications || ""
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("ERROR:", err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        getApiUrl('profile/save'),
        {
          username,
          ...formData
        },
        axiosConfig
      );

      if (response.data.success) {
        setSuccess("Profile saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Loading profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navigation />

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-icon">👤</div>
          <div>
            <h1 className="profile-title">My Profile</h1>
            <p className="profile-subtitle">Manage your personal and medical information</p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Personal Information Section */}
          <div className="form-section">
            <h2 className="section-title">Personal Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="full_name">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date_of_birth">Date of Birth</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="blood_group">Blood Group</label>
                <select
                  id="blood_group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                rows="2"
                placeholder="Street address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State/Province</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="State"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="form-section">
            <h2 className="section-title">Emergency Contact</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergency_contact_name">Contact Name</label>
                <input
                  type="text"
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Emergency contact name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergency_contact_phone">Contact Phone</label>
                <input
                  type="tel"
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+1 (555) 987-6543"
                />
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="form-section">
            <h2 className="section-title">Medical Information</h2>

            <div className="form-group">
              <label htmlFor="medical_history">Medical History</label>
              <textarea
                id="medical_history"
                name="medical_history"
                value={formData.medical_history}
                onChange={handleChange}
                className="form-input"
                rows="3"
                placeholder="Previous surgeries, chronic conditions, family history, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="allergies">Allergies</label>
              <textarea
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="form-input"
                rows="2"
                placeholder="Drug allergies, food allergies, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="current_medications">Current Medications</label>
              <textarea
                id="current_medications"
                name="current_medications"
                value={formData.current_medications}
                onChange={handleChange}
                className="form-input"
                rows="3"
                placeholder="List all medications you're currently taking"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={saving}
            >
              {saving ? (
                <span className="button-loading">
                  <span className="mini-spinner"></span>
                  Saving...
                </span>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

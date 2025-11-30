import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import mysql from "mysql2";
import { validateHealthFeatures, computeEngineeredFeatures } from "./validators.js";
import { predictRisk } from "./models/predict.js";
import { generateAdvice } from "./llmClient.js";
import runMigrations from "./migrations/run_migrations.js";

dotenv.config();

const app = express();

// Configure CORS to allow frontend requests
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL, /\.vercel\.app$/]
  : true;

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // for cross-site cookies in production
  }
}));

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "dibs",
  port: process.env.DB_PORT || 3306,
  connectTimeout: 10000 // 10 seconds
});

db.connect(async (err) => {
  if (err) {
    console.error("[ERROR] DB connection failed:", err.message);
    if (process.env.NODE_ENV === 'production') {
      console.error("[ERROR] Database connection is required in production. Exiting...");
      process.exit(1);
    }
  } else {
    console.log(`[INFO] Connected to MySQL database: ${process.env.DB_NAME || 'dibs'}`);
    
    // Auto-run migrations on server startup
    try {
      console.log('[INFO] Running database migrations...');
      await runMigrations();
      console.log('[INFO] Database schema is up to date');
    } catch (migrationError) {
      console.error('[ERROR] Migration failed:', migrationError.message);
      if (process.env.NODE_ENV === 'production') {
        console.error('[ERROR] Migration is required in production. Exiting...');
        process.exit(1);
      }
    }
  }
});

// ============================================
// Authentication Endpoints
// ============================================

// Login endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required"
    });
  }

  const query = "SELECT user_cd, username FROM users WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "DB error", error: err.message });
    }

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Set session
    req.session.isLoggedIn = true;
    req.session.username = result[0].username;
    req.session.user_cd = result[0].user_cd;

    return res.json({
      success: true,
      message: "Login successful",
      username: result[0].username,
      user_cd: result[0].user_cd
    });
  });
});

// Signup endpoint
app.post("/api/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required"
    });
  }

  // Check if user already exists
  const checkQuery = "SELECT user_cd FROM users WHERE username = ?";
  db.query(checkQuery, [username], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "DB error", error: err.message });
    }

    if (result.length > 0) {
      return res.status(409).json({ success: false, message: "Username already exists" });
    }

    // Create new user
    const insertQuery = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(insertQuery, [username, password], (err, insertResult) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Failed to create user", error: err.message });
      }

      // Set session
      req.session.isLoggedIn = true;
      req.session.username = username;
      req.session.user_cd = insertResult.insertId;

      return res.json({
        success: true,
        message: "Signup successful",
        username: username,
        user_cd: insertResult.insertId
      });
    });
  });
});

// Check session endpoint
app.get("/api/checkSession", (req, res) => {
  if (req.session.isLoggedIn) {
    return res.json({
      success: true,
      isLoggedIn: true,
      username: req.session.username,
      user_cd: req.session.user_cd
    });
  } else {
    return res.json({
      success: true,
      isLoggedIn: false
    });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: "Logout successful" });
  });
});

// ============================================
// Main Register Endpoint
// ============================================
app.post("/api/register", (req, res) => {
  const { username, password, healthFeatures } = req.body;

  if (!username || !password || !healthFeatures) {
    return res.status(400).json({
      success: false,
      message: "Missing username, password, or health data",
    });
  }

  const checkQuery = "SELECT user_cd FROM users WHERE username = ?";
  db.query(checkQuery, [username], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "DB check error" });

    let user_cd;

    if (result.length > 0) {
      user_cd = result[0].user_cd;
      saveHealthRecord();
    } else {
      const insertUserQuery = "INSERT INTO users (username, password) VALUES (?, ?)";
      db.query(insertUserQuery, [username, password], (err, userResult) => {
        if (err) return res.status(500).json({ success: false, message: "User insert error" });

        user_cd = userResult.insertId;
        saveHealthRecord();
      });
    }

    // Insert Health Record
    function saveHealthRecord() {
      const h = healthFeatures;

      // numeric conversion
      const age = Number(h.age_years);
      const height = Number(h.height);
      const weight = Number(h.weight);
      const ap_hi = Number(h.ap_hi);
      const ap_lo = Number(h.ap_lo);
      const cholesterol = Number(h.cholesterol);
      const gluc = Number(h.gluc);

      // gender encode
      let gender = 0;
      if (String(h.gender).toLowerCase() === "female") gender = 1;

      // boolean encode
      const smoke = h.smoke ? 1 : 0;
      const alco = h.alco ? 1 : 0;
      const active = h.active ? 1 : 0;

      // engineered features
      const bmi = weight / ((height / 100) ** 2);
      const pulse_pressure = ap_hi - ap_lo;

      let age_group = 
        age < 30 ? 0 :
        age < 40 ? 1 :
        age < 50 ? 2 :
        age < 60 ? 3 :
        age < 70 ? 4 : 5;

      let bmi_group =
        bmi < 18.5 ? 1 :
        bmi < 25 ? 0 :
        bmi < 30 ? 2 : 3;

      const smoke_age = smoke * age;
      const chol_bmi = cholesterol * bmi;

      const healthQuery = `
        INSERT INTO health_features
        (user_cd, age_years, gender, height, weight, ap_hi, ap_lo, cholesterol, gluc,
         smoke, alco, ACTIVE, bmi, pulse_pressure, age_group, bmi_group, smoke_age, chol_bmi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        user_cd,
        age,
        gender,
        height,
        weight,
        ap_hi,
        ap_lo,
        cholesterol,
        gluc,
        smoke,
        alco,
        active,
        bmi,
        pulse_pressure,
        age_group,
        bmi_group,
        smoke_age,
        chol_bmi
      ];

      db.query(healthQuery, values, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Health insert error", error: err });

        return res.json({
          success: true,
          message: "User & numeric health features stored ✔",
          user_cd,
          record_id: result.insertId,
        });
      });
    }
  });
});

// ============================================
// NEW: Prediction & Advice Endpoint
// ============================================
app.post("/api/predictAndSave", async (req, res) => {
  const { username, healthFeatures } = req.body;

  if (!username || !healthFeatures) {
    return res.status(400).json({
      success: false,
      message: "Missing username or health data",
    });
  }

  // Validate health features
  const validation = validateHealthFeatures(healthFeatures);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors
    });
  }

  const normalized = validation.normalizedFeatures;

  // Compute engineered features
  const engineered = computeEngineeredFeatures(normalized);

  // Combine all features for ML model
  const allFeatures = { ...normalized, ...engineered };

  console.log('[INFO] Normalized features:', normalized);
  console.log('[INFO] Engineered features:', engineered);
  console.log('[INFO] All features being sent to ML:', allFeatures);

  try {
    // Helper function to promisify db queries
    const queryAsync = (sql, params) => {
      return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };

    // Get user_cd from username
    const checkQuery = "SELECT user_cd FROM users WHERE username = ?";
    const userResult = await queryAsync(checkQuery, [username]);

    let user_cd;

    if (userResult.length > 0) {
      user_cd = userResult[0].user_cd;
    } else {
      return res.status(404).json({
        success: false,
        message: "User not found. Please login first."
      });
    }

    // Step 1: Run ML prediction
    const prediction = await predictRisk(allFeatures);

    // Step 2: Fetch previous health records for context
    const previousRecordsQuery = `
      SELECT age_years, bmi, ap_hi, ap_lo, risk_label, stacked_probability, recorded_at
      FROM health_features
      WHERE user_cd = ?
      ORDER BY recorded_at DESC
      LIMIT 1
    `;
    
    const previousRecords = await queryAsync(previousRecordsQuery, [user_cd]);
    const previousRecord = previousRecords.length > 0 ? previousRecords[0] : null;

    // Step 3: Generate AI advice with historical context
    const adviceText = await generateAdvice({
      features: allFeatures,
      prediction,
      previousRecord
    });

    // Step 4: Save to database with prediction results
    const healthQuery = `
      INSERT INTO health_features
      (user_cd, age_years, gender, height, weight, ap_hi, ap_lo, cholesterol, gluc,
        smoke, alco, ACTIVE, bmi, pulse_pressure, age_group, bmi_group, smoke_age, chol_bmi,
        base_model1_score, base_model2_score, base_model3_score, base_model4_score, base_model5_score,
        stacked_probability, risk_label, advice_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user_cd,
      normalized.age_years,
      normalized.gender,
      normalized.height,
      normalized.weight,
      normalized.ap_hi,
      normalized.ap_lo,
      normalized.cholesterol,
      normalized.gluc,
      normalized.smoke,
      normalized.alco,
      normalized.ACTIVE,
      engineered.bmi,
      engineered.pulse_pressure,
      engineered.age_group,
      engineered.bmi_group,
      engineered.smoke_age,
      engineered.chol_bmi,
      prediction.base_predictions.model1,  // CatBoost
      prediction.base_predictions.model2,  // LightGBM
      prediction.base_predictions.model3,  // Logistic Regression
      prediction.base_predictions.model4,  // Random Forest
      prediction.base_predictions.model5,  // XGBoost
      prediction.stacked.probability,
      prediction.stacked.label,
      adviceText
    ];

    const insertResult = await queryAsync(healthQuery, values);

    return res.json({
      success: true,
      message: "Prediction completed successfully",
      user_cd: user_cd,
      record_id: insertResult.insertId,
      prediction: prediction.stacked,
      advice_text: adviceText
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// ============================================
// History Endpoints
// ============================================
// Health check endpoint for Railway
app.get('/api/test', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        message: 'Backend server is running',
        timestamp: new Date().toISOString()
    });
});
// Get user_cd by username
app.get("/api/getUserCd", (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username is required"
    });
  }

  const query = "SELECT user_cd FROM users WHERE username = ?";
  db.query(query, [username], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "DB error", error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user_cd: result[0].user_cd
    });
  });
});

// Get user history
app.get("/api/getUserHistory/:userId", (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required"
    });
  }

  const query = `
    SELECT 
      *
    FROM health_features
    WHERE user_cd = ?
    ORDER BY recorded_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: "DB error", 
        error: err.message 
      });
    }

    return res.json({
      success: true,
      count: results.length,
      history: results
    });
  });
});

// ============================================
// Profile Endpoints
// ============================================

// Get user profile
app.get("/api/profile/get", (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username is required"
    });
  }

  // First get user_cd
  const userQuery = "SELECT user_cd FROM users WHERE username = ?";
  db.query(userQuery, [username], (err, userResult) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: "DB error", 
        error: err.message 
      });
    }

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user_cd = userResult[0].user_cd;

    // Get profile data
    const profileQuery = "SELECT * FROM user_profiles WHERE user_cd = ?";
    db.query(profileQuery, [user_cd], (err, profileResult) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "DB error", 
          error: err.message 
        });
      }

      if (profileResult.length === 0) {
        // No profile exists yet
        return res.json({
          success: true,
          profile: null,
          message: "No profile found"
        });
      }

      return res.json({
        success: true,
        profile: profileResult[0]
      });
    });
  });
});

// Save or update user profile
app.post("/api/profile/save", (req, res) => {
  const {
    username,
    full_name,
    date_of_birth,
    phone,
    address,
    city,
    state,
    country,
    emergency_contact_name,
    emergency_contact_phone,
    blood_group,
    medical_history,
    allergies,
    current_medications
  } = req.body;

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username is required"
    });
  }

  // First get user_cd
  const userQuery = "SELECT user_cd FROM users WHERE username = ?";
  db.query(userQuery, [username], (err, userResult) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: "DB error", 
        error: err.message 
      });
    }

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user_cd = userResult[0].user_cd;

    // Check if profile exists
    const checkQuery = "SELECT profile_id FROM user_profiles WHERE user_cd = ?";
    db.query(checkQuery, [user_cd], (err, checkResult) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "DB error", 
          error: err.message 
        });
      }

      if (checkResult.length > 0) {
        // Update existing profile
        const updateQuery = `
          UPDATE user_profiles SET
            full_name = ?,
            date_of_birth = ?,
            phone = ?,
            address = ?,
            city = ?,
            state = ?,
            country = ?,
            emergency_contact_name = ?,
            emergency_contact_phone = ?,
            blood_group = ?,
            medical_history = ?,
            allergies = ?,
            current_medications = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_cd = ?
        `;

        const updateValues = [
          full_name, date_of_birth, phone, address, city, state, country,
          emergency_contact_name, emergency_contact_phone, blood_group,
          medical_history, allergies, current_medications, user_cd
        ];

        db.query(updateQuery, updateValues, (err, result) => {
          if (err) {
            return res.status(500).json({ 
              success: false, 
              message: "DB error", 
              error: err.message 
            });
          }

          return res.json({
            success: true,
            message: "Profile updated successfully"
          });
        });
      } else {
        // Insert new profile
        const insertQuery = `
          INSERT INTO user_profiles
          (user_cd, full_name, date_of_birth, phone, address, city, state, country,
            emergency_contact_name, emergency_contact_phone, blood_group,
            medical_history, allergies, current_medications)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertValues = [
          user_cd, full_name, date_of_birth, phone, address, city, state, country,
          emergency_contact_name, emergency_contact_phone, blood_group,
          medical_history, allergies, current_medications
        ];

        db.query(insertQuery, insertValues, (err, result) => {
          if (err) {
            return res.status(500).json({ 
              success: false, 
              message: "DB error", 
              error: err.message 
            });
          }

          return res.json({
            success: true,
            message: "Profile created successfully",
            profile_id: result.insertId
          });
        });
      }
    });
  });
});

// Start Server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`[INFO] Server running on port ${PORT}`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[INFO] Local: http://localhost:${PORT}`);
  }
});

# 📁 Project Structure

Complete directory structure of the Cardiovascular Health Prediction App.

## Overview

```
just_checking/
├── frontend/              # React + Vite Application
├── backend/               # Node.js + Express API
├── ml_service/            # Python + Flask ML Service
├── logs/                  # Application logs
├── docs/                  # Documentation files
└── config files           # Root configuration
```

---

## 📱 Frontend (`frontend/`)

React-based single-page application with modern UI.

```
frontend/
├── src/
│   ├── components/
│   │   └── Navigation.jsx         # Navigation bar component
│   ├── pages/
│   │   ├── HomePage.jsx           # Landing page
│   │   ├── Login.jsx              # Login page
│   │   ├── Signup.jsx             # Signup page
│   │   ├── InputForm.jsx          # Health assessment form
│   │   ├── History.jsx            # Past assessments
│   │   └── Suggestions.jsx        # AI insights
│   ├── assets/                    # Images and static assets
│   ├── App.jsx                    # Root component
│   ├── App.css                    # Global styles
│   ├── main.jsx                   # Entry point
│   ├── firebase.js                # Firebase config (if used)
│   └── PrivateRoute.jsx           # Protected route wrapper
├── public/                        # Static public files
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS config
├── postcss.config.js              # PostCSS config
├── package.json                   # Frontend dependencies
└── .env                           # Frontend environment variables
```

### Key Files

- **`src/main.jsx`**: Application entry point
- **`src/App.jsx`**: Main routing and app structure
- **`src/pages/`**: All page components
- **`src/components/`**: Reusable UI components

---

## 🔧 Backend (`backend/`)

Express.js REST API with MySQL database integration.

```
backend/
├── server.js                      # Main Express server
├── validators.js                  # Input validation functions
├── llmClient.js                   # Gemini AI integration
├── models/
│   └── predict.js                 # ML prediction integration
├── data/                          # Database-related files
├── package.json                   # Backend dependencies
└── .env                           # Backend environment variables
```

### Key Files

- **`server.js`**: Main API server with all routes
- **`validators.js`**: Health data validation logic
- **`llmClient.js`**: Google Gemini AI client for advice generation
- **`models/predict.js`**: ML model prediction interface

### API Endpoints

```
Authentication:
POST   /api/signup              # Create new account
POST   /api/login               # User login
POST   /api/logout              # User logout
GET    /api/checkSession        # Verify session

Health Assessment:
POST   /api/register            # Submit health data & get prediction
GET    /api/getUserHistory/:id  # Get user's assessment history
GET    /api/getAISuggestions/:id # Get AI-generated insights

Utility:
GET    /api/test                # Health check endpoint
```

---

## 🤖 ML Service (`ml_service/`)

Flask-based machine learning service with trained models.

```
ml_service/
├── app.py                         # Flask application
├── models/
│   ├── cat_pipeline_tuned.joblib      # CatBoost model
│   ├── lgbm_pipeline_tuned.joblib     # LightGBM model
│   ├── logreg_pipeline_tuned.joblib   # Logistic Regression
│   ├── rf_pipeline_tuned.joblib       # Random Forest
│   ├── stacking_pipeline_tuned.joblib # Stacking Ensemble
│   └── xgb_pipeline_tuned.joblib      # XGBoost model
├── requirements.txt               # Python dependencies
├── README.md                      # ML service documentation
└── .env                          # ML service environment variables
```

### Key Files

- **`app.py`**: Flask API server
- **`models/`**: Pre-trained ML models (joblib files)
- **`requirements.txt`**: Python package dependencies

### ML Endpoints

```
POST   /predict                 # Get cardiovascular risk prediction
POST   /generate_advice         # Generate personalized health advice
GET    /health                  # Service health check
```

---

## 📚 Documentation

```
├── README.md                    # Project overview
├── QUICKSTART.md               # Quick setup guide
├── deployment.md               # Full deployment guide
├── USER_GUIDE.md               # User manual
├── IMPLEMENTATION_SUMMARY.md   # Development summary
└── PROJECT_STRUCTURE.md        # This file
```

---

## 🔧 Configuration Files

### Root Level

```
├── package.json               # Workspace configuration
├── setup.sh                   # Automated setup script
├── .gitignore                # Git ignore rules
├── .env                      # Root environment variables (deprecated)
└── .env.example              # Environment template
```

### Frontend Config

```
frontend/
├── .env                      # Development environment
├── .env.example              # Environment template
├── .env.production           # Production environment
├── vite.config.js            # Vite bundler config
├── tailwind.config.js        # Tailwind CSS config
└── postcss.config.js         # PostCSS config
```

### Backend Config

```
backend/
├── .env                      # Development environment
└── .env.example              # Environment template
```

### ML Service Config

```
ml_service/
├── .env                      # Development environment
└── .env.example              # Environment template
```

---

## 🗄️ Database Schema

**Database Name:** `dibs`

**Tables:**

1. **`users`**
   - `user_cd` (Primary Key)
   - `username`
   - `password` (hashed)
   - `created_at`

2. **`health_features`**
   - `record_id` (Primary Key)
   - `user_cd` (Foreign Key → users)
   - `age_years`, `gender`, `height`, `weight`
   - `ap_hi`, `ap_lo` (blood pressure)
   - `cholesterol`, `gluc` (levels)
   - `smoke`, `alco`, `ACTIVE` (boolean)
   - `bmi`, `pulse_pressure`, `map` (calculated)
   - `prediction_label`, `prediction_probability`
   - `advice_text` (AI-generated)
   - `recorded_at` (timestamp)

---

## 📦 Dependencies

### Frontend (Node.js)

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "vite": "^5.x"
}
```

### Backend (Node.js)

```json
{
  "express": "^4.18.0",
  "mysql2": "^3.x",
  "express-session": "^1.x",
  "cors": "^2.x",
  "dotenv": "^16.x",
  "@google/generative-ai": "^0.x"
}
```

### ML Service (Python)

```
Flask==2.3.0
flask-cors==4.0.0
numpy==1.24.0
pandas==2.0.0
scikit-learn==1.3.0
joblib==1.3.0
google-generativeai==0.3.0
```

---

## 🌐 Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 3001 | http://localhost:3001 |
| ML Service | 5000 | http://localhost:5000 |
| MySQL | 3306 | localhost:3306 |

---

## 🔄 Data Flow

```
User Browser (Frontend)
    ↓ (HTTP Request)
Express API (Backend)
    ↓ (Health Data)
Flask ML Service
    ↓ (Prediction)
Gemini AI
    ↓ (Advice)
MySQL Database
    ↓ (Store/Retrieve)
User Browser (Response)
```

---

## 📊 File Sizes (Approximate)

```
Total Project: ~500 MB (with dependencies)
├── frontend/node_modules: ~200 MB
├── backend/node_modules: ~50 MB
├── .venv (Python): ~200 MB
├── ML models: ~20 MB
└── Source code: ~5 MB
```

---

## 🚀 Getting Started

1. **Quick Setup:**
   ```bash
   ./setup.sh
   ```

2. **Manual Setup:**
   See [QUICKSTART.md](QUICKSTART.md)

3. **Deployment:**
   See [deployment.md](deployment.md)

---

**Last Updated:** November 30, 2024
**Maintainer:** @mauryaabha991-arch

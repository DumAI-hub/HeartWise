# Railway Deployment Guide

## Overview

This application consists of three services deployed on Railway:
1. **Backend** (Node.js/Express) - API server with automatic database migrations
2. **ML Service** (Python/FastAPI) - Machine learning prediction service with 6 models
3. **Database** (MySQL) - Persistent data storage

The Frontend is deployed separately on Vercel.

## Architecture

```
Frontend (Vercel)
    ↓
Backend (Railway) → MySQL (Railway)
    ↓
ML Service (Railway)
```

## Pre-Deployment Checklist

### 1. Backend Service
- ✅ Automatic database migrations on startup
- ✅ Persistent database connection (never closed after migrations)
- ✅ Environment variables configured
- ✅ Health check endpoint: `/api/test`
- ✅ Clean logging (no emojis)

### 2. ML Service
- ✅ All 6 model files included in repository (196MB total)
  - `cat_pipeline_tuned.joblib` (552KB)
  - `lgbm_pipeline_tuned.joblib` (1.9MB)
  - `logreg_pipeline_tuned.joblib` (2KB)
  - `rf_pipeline_tuned.joblib` (64MB)
  - `xgb_pipeline_tuned.joblib` (599KB)
  - `stacking_pipeline_tuned.joblib` (131MB)
- ✅ Graceful model loading with error handling
- ✅ Service continues with partial models if some fail
- ✅ Health check endpoint: `/health`
- ✅ Clean logging (no emojis)

### 3. Database
- ✅ MySQL database service
- ✅ Automatic schema creation via migrations
- ✅ Three migration files ready:
  - `000_initial_schema.sql` - Creates users and health_features tables
  - `001_add_model_columns.sql` - Adds base_model4_score and base_model5_score
  - `002_create_user_profiles.sql` - Creates user_profiles table

## Railway Setup Instructions

### Step 1: Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository

### Step 2: Add MySQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add MySQL"
3. Railway will automatically create the database and provide connection details
4. **Important**: Note the connection variables:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

### Step 3: Deploy Backend Service

1. Click "New" → "GitHub Repo"
2. Select your repository
3. Railway will detect it's a Node.js project
4. Set **Root Directory**: `backend`
5. Configure **Environment Variables**:

```env
# Database Configuration (use Railway MySQL variables)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}

# Application Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=<generate-random-string>

# Frontend URL (your Vercel URL)
FRONTEND_URL=https://your-app.vercel.app

# ML Service URL (will be set after ML service deployment)
ML_SERVICE_URL=https://your-ml-service.up.railway.app

# Gemini API Configuration
GEMINI_API_KEY=<your-gemini-api-key>
```

6. **Verify Deployment**:
   - Check logs for: `[INFO] Connected to MySQL database`
   - Check logs for: `[MIGRATION] Completed! Executed X new migration(s)`
   - Check logs for: `[INFO] Database schema is up to date`
   - Verify health endpoint: `https://your-backend.up.railway.app/api/test`

### Step 4: Deploy ML Service

1. Click "New" → "GitHub Repo"
2. Select your repository
3. Set **Root Directory**: `ml_service`
4. Configure **Environment Variables**:

```env
# No environment variables needed
# Models are included in the repository
PORT=8000
```

5. **Verify Deployment**:
   - Check logs for: `[MIGRATION] Found 6 model file(s)`
   - Check logs for: `[INFO] Loaded X/6 models` (at least 2 models should load)
   - Verify health endpoint: `https://your-ml-service.up.railway.app/health`
   - Service should start even if some models fail to load

6. **Update Backend Environment**:
   - Copy the ML Service URL from Railway
   - Update `ML_SERVICE_URL` in Backend service environment variables

### Step 5: Deploy Frontend on Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure **Root Directory**: `./` (root of repository)
4. Configure **Environment Variables**:

```env
VITE_API_BASE_URL=https://your-backend.up.railway.app
```

5. Deploy and verify

## How Automatic Setup Works

### Database Migrations (Backend)

When the backend starts:

1. **Connection**: Establishes MySQL connection
2. **Migration Check**: Creates `migrations` table if not exists
3. **Execute Migrations**: Runs any pending SQL migrations in order
4. **Keep Connection**: Database connection remains open for application use
5. **Start Server**: Begins accepting requests

The database connection is **NEVER closed** after migrations, ensuring the application can access the database.

### Model Loading (ML Service)

When the ML service starts:

1. **Scan Models**: Checks `models/` directory for `.joblib` files
2. **Load Individually**: Attempts to load each model with error handling
3. **Track Success**: Maintains `loaded_models` set of successfully loaded models
4. **Continue on Failure**: Service starts even if some models fail
5. **Graceful Prediction**: Uses available models, averages predictions, fills missing values

Example startup logs:
```
[MIGRATION] Found 6 model file(s)
[INFO] Loaded CatBoost (552K)
[INFO] Loaded LightGBM (1.9M)
[ERROR] Failed to load Logistic Regression: Pipeline is not fitted yet
[INFO] Loaded Random Forest (64M)
[INFO] Loaded XGBoost (599K)
[INFO] Loaded Stacking Ensemble (131M)
[WARNING] Partially loaded: 5/6 models
```

## Monitoring & Troubleshooting

### Backend Health Check

```bash
curl https://your-backend.up.railway.app/api/test
```

Expected response:
```json
{
  "success": true,
  "message": "API is working!"
}
```

### ML Service Health Check

```bash
curl https://your-ml-service.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "models_loaded": 5,
  "models_total": 6
}
```

### Common Issues

#### 1. Backend Fails to Start

**Symptom**: Logs show `[ERROR] DB connection failed`

**Solution**:
- Verify MySQL service is running
- Check environment variables are correctly set
- Ensure database name exists

#### 2. Migrations Don't Run

**Symptom**: Tables not created, application crashes

**Solution**:
- Check migration files exist in `backend/migrations/`
- Verify SQL syntax is correct
- Check logs for specific migration errors
- Railway will automatically retry on failure

#### 3. ML Service Models Not Loading

**Symptom**: All models fail to load

**Solution**:
- Verify model files are in `ml_service/models/` directory
- Check model files are committed to Git (they're large but included)
- Verify Dockerfile copies models: `COPY models/ ./models/`
- Service should still start and use fallback predictions

#### 4. Some Models Fail

**Symptom**: Logs show `[ERROR] Failed to load X model`

**Solution**:
- This is expected behavior with graceful degradation
- Service continues with working models
- Predictions use average of available models
- Not a critical issue if at least 2 models work

## Environment Variables Summary

### Backend Service

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | MySQL host | `containers-us-west-123.railway.app` | ✅ |
| `DB_PORT` | MySQL port | `6789` | ✅ |
| `DB_USER` | MySQL user | `root` | ✅ |
| `DB_PASSWORD` | MySQL password | `abc123xyz` | ✅ |
| `DB_NAME` | Database name | `railway` | ✅ |
| `NODE_ENV` | Environment | `production` | ✅ |
| `SESSION_SECRET` | Session encryption key | Random 32+ char string | ✅ |
| `FRONTEND_URL` | Vercel frontend URL | `https://app.vercel.app` | ✅ |
| `ML_SERVICE_URL` | ML service URL | `https://ml.railway.app` | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` | ✅ |

### ML Service

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PORT` | Service port | `8000` | ❌ (Railway sets automatically) |

### Frontend (Vercel)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | `https://backend.railway.app` | ✅ |

## Database Schema

The automated migrations create the following schema:

### `users` Table
- `user_cd` (INT, Primary Key)
- `username` (VARCHAR)
- `password` (VARCHAR)
- `created_at` (TIMESTAMP)

### `health_features` Table
- All base features (age, gender, height, weight, BP, etc.)
- Engineered features (bmi, pulse_pressure, age_group, etc.)
- Model scores (base_model1-5_score)
- Predictions (stacked_probability, risk_label)
- AI advice (advice_text)

### `user_profiles` Table
- `profile_id` (INT, Primary Key)
- `user_cd` (INT, Foreign Key)
- Demographic data (14 fields)
- Emergency contact information
- Medical history

### `migrations` Table (System)
- `id` (INT, Primary Key)
- `migration_name` (VARCHAR)
- `executed_at` (TIMESTAMP)

## Post-Deployment Verification

1. **Test Health Endpoints**:
   ```bash
   curl https://your-backend.up.railway.app/api/test
   curl https://your-ml-service.up.railway.app/health
   ```

2. **Test User Signup**:
   - Visit frontend URL
   - Create new account
   - Verify in Railway logs: `[INFO] User registered successfully`

3. **Test Prediction**:
   - Login and fill health form
   - Submit prediction
   - Verify in logs:
     - Backend: `[INFO] All features being sent to ML`
     - ML Service: `[INFO] CatBoost: 0.XXX`, `[INFO] LightGBM: 0.XXX`
     - Backend: `[INFO] Prediction received`
     - Backend: `[INFO] Health record saved successfully`

4. **Verify Database**:
   - Connect to Railway MySQL
   - Check tables exist: `SHOW TABLES;`
   - Check migrations: `SELECT * FROM migrations;`
   - Check data: `SELECT COUNT(*) FROM users;`

## Scaling Considerations

### Backend
- Railway auto-scales based on load
- Database connection pool can be configured
- Session store can be moved to Redis for multiple instances

### ML Service
- Models loaded once at startup (cached in memory)
- Each prediction is stateless
- Can horizontally scale by deploying multiple instances
- Consider using Railway's autoscaling features

### Database
- MySQL handles concurrent connections automatically
- Connection pooling configured in server.js
- Consider increasing connection limits for high traffic

## Logs Format

All services use clean logging without emojis:

```
[INFO] - Informational messages
[WARNING] - Non-critical issues
[ERROR] - Error messages
[MIGRATION] - Database migration messages
```

## Backup & Recovery

### Database Backup
1. Railway provides automatic backups
2. Manual backup: Use Railway CLI or MySQL dump
3. Migrations ensure reproducible schema

### Model Files
- Models are version-controlled in Git
- No need for separate backup
- Re-deploying rebuilds from repository

## Support & Resources

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Project Repository: https://github.com/DumAI-hub/HeartWise

## Version Information

- Node.js: 18.x
- Python: 3.11
- MySQL: 8.x
- Models: 6 trained models (196MB total)
- Migrations: 3 SQL files

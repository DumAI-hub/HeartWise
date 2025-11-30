# Railway Deployment Guide - Automated Database Setup

## 🎯 Problem Solved
Railway's MySQL database starts empty with no schema. This automated migration system sets up the entire database structure on first deployment without manual intervention.

## ✅ What's Automated

### On Every Railway Deployment:
1. ✅ Backend service connects to MySQL
2. ✅ Migration system automatically runs
3. ✅ Creates all tables if they don't exist:
   - `users` (authentication)
   - `health_features` (health records + ML predictions)
   - `user_profiles` (demographic data)
4. ✅ Adds new columns/tables from updates
5. ✅ Server starts accepting requests

**No manual SQL execution required!**

## 🚀 Railway Setup Steps

### 1. Create MySQL Database on Railway
```
Dashboard → New → Database → Add MySQL
```
Save these environment variables:
- `MYSQL_URL`
- `MYSQL_HOST` → use as `DB_HOST`
- `MYSQL_USER` → use as `DB_USER`
- `MYSQL_PASSWORD` → use as `DB_PASSWORD`
- `MYSQL_DATABASE` → use as `DB_NAME`
- `MYSQL_PORT` → use as `DB_PORT`

### 2. Deploy Backend Service
```
Dashboard → New → GitHub Repo → Select HeartWise
```

### 3. Set Environment Variables
In Railway backend service settings, add:

```env
# Database (from MySQL service)
DB_HOST=mysql-host.railway.app
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=railway
DB_PORT=3306

# Server
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Session
SESSION_SECRET=your-secure-random-string-change-this

# ML Service
ML_SERVICE_URL=https://your-ml-service.railway.app

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Frontend
FRONTEND_URL=https://your-app.vercel.app
```

### 4. Deploy & Watch Logs
Railway automatically builds and deploys. Check logs for:

```
✅ Connected to MySQL database: railway
🔄 Running database migrations...
🔗 Connecting to database...
✅ Connected to database
✅ Migrations table ready
📋 Found 3 migration file(s)
📄 Executing 000_initial_schema.sql...
✅ Successfully executed 000_initial_schema.sql
📄 Executing 001_add_model_columns.sql...
✅ Successfully executed 001_add_model_columns.sql
📄 Executing 002_create_user_profiles.sql...
✅ Successfully executed 002_create_user_profiles.sql
🎉 Migration completed! Executed 3 new migration(s)
✅ Database schema is up to date
✅ Server running on port 3001
```

## 🔍 Verify Deployment

### Check Database Tables
Connect to Railway MySQL via Railway CLI or MySQL client:

```bash
# List tables
SHOW TABLES;

# Should show:
# - migrations
# - users
# - health_features
# - user_profiles

# Check migration history
SELECT * FROM migrations ORDER BY executed_at;
```

### Test API Endpoints
```bash
# Health check
curl https://your-backend.railway.app/api/test

# Expected: {"status":"healthy","message":"Backend server is running"}
```

## 🔄 Updating Database Schema

### Add New Migration
1. Create new file: `backend/migrations/003_your_change.sql`
2. Write SQL:
   ```sql
   -- Migration: Add new feature
   -- Date: 2025-12-01
   
   ALTER TABLE health_features
   ADD COLUMN new_field VARCHAR(255);
   ```
3. Commit and push to GitHub
4. Railway auto-deploys
5. Migration runs automatically ✅

### Migration runs on EVERY deployment
- ✅ Safe: Only executes new migrations
- ✅ Fast: Skips completed migrations
- ✅ Tracked: Records execution in `migrations` table

## 🛠️ Troubleshooting

### Migration Fails
**Symptom**: Server exits immediately after deployment

**Solution**:
1. Check Railway logs for SQL error
2. Fix SQL in migration file
3. Delete from `migrations` table if needed:
   ```sql
   DELETE FROM migrations WHERE migration_name = '003_failed_migration';
   ```
4. Redeploy

### Database Connection Fails
**Symptom**: "DB connection failed" in logs

**Solution**:
- Verify all DB_* environment variables
- Check MySQL service is running
- Ensure backend service has access to MySQL

### Tables Already Exist
**Symptom**: "Table 'users' already exists" error

**Solution**:
- Check `000_initial_schema.sql` uses `CREATE TABLE IF NOT EXISTS`
- This should never happen - file already has `IF NOT EXISTS`

## 📊 Database Schema Reference

### `users` Table
- `user_cd` (INT, PK) - User ID
- `username` (VARCHAR) - Unique username
- `password` (VARCHAR) - Hashed password
- `created_at` (TIMESTAMP) - Account creation

### `health_features` Table  
- `record_id` (INT, PK) - Record ID
- `user_cd` (INT, FK) - User reference
- Health inputs: age, gender, height, weight, BP, cholesterol, glucose, lifestyle
- Engineered features: BMI, pulse pressure, age groups, interactions
- ML scores: base_model1-5_score, stacked_probability, risk_label
- AI advice: advice_text
- `recorded_at` (TIMESTAMP)

### `user_profiles` Table
- `profile_id` (INT, PK) - Profile ID
- `user_cd` (INT, FK) - User reference
- Personal: full_name, date_of_birth, phone, address, city, state, country
- Emergency: emergency_contact_name, emergency_contact_phone
- Medical: blood_group, medical_history, allergies, current_medications
- Timestamps: created_at, updated_at

## 🎉 Benefits

✅ **Zero Manual Setup** - No SQL scripts to run manually  
✅ **Always Up-to-Date** - Schema automatically updates with code  
✅ **Production-Safe** - Exits on failure, never corrupts data  
✅ **Team-Friendly** - New developers get correct schema automatically  
✅ **Railway-Ready** - Works perfectly with Railway's deployment flow  
✅ **Version Controlled** - All schema changes tracked in Git  

## 📚 Related Documentation
- [Backend Migrations README](./migrations/README.md) - Detailed migration system docs
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - Full deployment instructions
- [README.md](../README.md) - Project overview

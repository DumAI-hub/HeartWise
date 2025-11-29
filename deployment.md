# 🚀 Deployment Guide - Vercel + Railway

Complete step-by-step guide to deploy your Cardiovascular Health Prediction app to production.

---

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Railway account (sign up at [railway.app](https://railway.app))
- Your code pushed to GitHub repository

---

## 🎯 Deployment Architecture

```
Frontend (React + Vite) → Vercel
Backend (Node.js + Express) → Railway
ML Service (Python + Flask) → Railway
Database → Railway PostgreSQL (or your existing MySQL)
```

---

## 📦 Part 1: Prepare Your Code for Deployment

### Step 1.1: Project Structure

Your project should now have this structure:
```
just_checking/
├── frontend/          # React + Vite app
├── backend/           # Express.js API
├── ml_service/        # Flask ML service
├── setup.sh          # Setup script
└── package.json      # Root package file
```

### Step 1.2: Create Environment Variable Files

**Frontend environment (`frontend/.env.example`):**
```env
VITE_API_URL=http://localhost:3001/api
VITE_ML_API_URL=http://localhost:5000
```

**Backend environment (`backend/.env.example`):**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cardio_health
PORT=3001
ML_SERVICE_URL=http://localhost:5000
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key
```

**ML Service environment (`ml_service/.env.example`):**
```env
PORT=5000
FLASK_ENV=production
GEMINI_API_KEY=your_gemini_api_key
```

### Step 1.2: Update Backend for Production

**Update `backend/server.js` - Add at the top:**
```javascript
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Update CORS to use environment variable
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL, /\.vercel\.app$/]
        : true,
    credentials: true
}));

// At the end, use PORT variable
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Step 1.3: Update ML Service for Production

**Update `ml_service/app.py` - Add at the top:**
```python
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Update CORS for production
if os.getenv('FLASK_ENV') == 'production':
    CORS(app, origins=[os.getenv('FRONTEND_URL'), r".*\.vercel\.app$"])
else:
    CORS(app)

# At the end
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

### Step 1.4: Create Deployment Configuration Files

**Create `backend/railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Create `ml_service/railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python app.py",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Create `ml_service/requirements.txt`** (if not exists):
```txt
Flask==2.3.0
flask-cors==4.0.0
numpy==1.24.0
pandas==2.0.0
scikit-learn==1.3.0
joblib==1.3.0
google-generativeai==0.3.0
python-dotenv==1.0.0
```

**Update `backend/package.json` - add:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Update root `package.json` - ensure you have:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Step 1.5: Create `.gitignore` (if not exists)

```gitignore
# Dependencies
node_modules/
__pycache__/
*.pyc

# Environment variables
.env
.env.local
.env.production.local

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

### Step 1.6: Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## 🗄️ Part 2: Deploy Database to Railway

### Step 2.1: Create Railway Account & Database

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Provision MySQL"** (or PostgreSQL)
5. Wait for deployment (~2 minutes)

### Step 2.2: Get Database Credentials

1. Click on your MySQL database
2. Go to **"Variables"** tab
3. Copy these values:
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_PORT`

### Step 2.3: Import Your Database

**Option A: Using MySQL Workbench**
1. Connect to Railway database using credentials
2. Import your local database SQL dump

**Option B: Using Command Line**
```bash
# Export your local database
mysqldump -u root -p cardio_health > database_backup.sql

# Import to Railway (replace with your Railway credentials)
mysql -h [RAILWAY_HOST] -u [RAILWAY_USER] -p[RAILWAY_PASSWORD] [RAILWAY_DATABASE] < database_backup.sql
```

---

## 🔧 Part 3: Deploy Backend to Railway

### Step 3.1: Create Backend Service

1. In Railway dashboard, click **"New"** → **"GitHub Repo"**
2. Select your repository
3. Click **"Add Service"**
4. Name it: `cardiovascular-backend`
5. Root directory: `/backend`

### Step 3.2: Configure Environment Variables

In Railway backend service, go to **"Variables"** tab and add:

```env
DB_HOST=[Your Railway MySQL Host]
DB_USER=[Your Railway MySQL User]
DB_PASSWORD=[Your Railway MySQL Password]
DB_NAME=[Your Railway MySQL Database]
DB_PORT=3306
PORT=3001
NODE_ENV=production
GEMINI_API_KEY=[Your Gemini API Key]
```

### Step 3.3: Generate Domain

1. Go to **"Settings"** tab
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://cardiovascular-backend.railway.app`)
4. Save this URL - you'll need it!

### Step 3.4: Verify Deployment

Wait for deployment to complete (~2-3 minutes). Check logs for any errors.

Test the endpoint:
```bash
curl https://your-backend.railway.app/api/test
```

---

## 🤖 Part 4: Deploy ML Service to Railway

### Step 4.1: Create ML Service

1. In Railway dashboard, click **"New"** → **"GitHub Repo"**
2. Select same repository
3. Click **"Add Service"**
4. Name it: `cardiovascular-ml-service`
5. Root directory: `/ml_service`

### Step 4.2: Configure Environment Variables

In Railway ML service, go to **"Variables"** tab and add:

```env
PORT=5000
FLASK_ENV=production
GEMINI_API_KEY=[Your Gemini API Key]
```

### Step 4.3: Generate Domain

1. Go to **"Settings"** tab
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://cardiovascular-ml.railway.app`)
4. Save this URL!

### Step 4.4: Update Backend with ML Service URL

Go back to **Backend service** → **"Variables"** → Add:

```env
ML_SERVICE_URL=https://cardiovascular-ml.railway.app
FRONTEND_URL=https://your-app.vercel.app
```

(We'll get the Vercel URL in next step)

### Step 4.5: Verify ML Service

Test the endpoint:
```bash
curl https://your-ml-service.railway.app/health
```

---

## 🎨 Part 5: Deploy Frontend to Vercel

### Step 5.1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 5.2: Login to Vercel

```bash
vercel login
```

### Step 5.3: Create Production Environment Variables

**Create `frontend/.env.production`:**

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_ML_API_URL=https://your-ml-service.railway.app
```

Replace with your actual Railway URLs from Steps 3.3 and 4.3!

### Step 5.4: Deploy to Vercel

```bash
# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - What's your project's name? cardiovascular-health-app
# - In which directory is your code located? ./
# - Want to override settings? No
```

### Step 5.5: Set Environment Variables in Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **"Settings"** → **"Environment Variables"**
4. Add:
   - `VITE_API_URL` = `https://your-backend.railway.app/api`
   - `VITE_ML_API_URL` = `https://your-ml-service.railway.app`

### Step 5.6: Deploy to Production

```bash
# From frontend directory
vercel --prod
```

### Step 5.7: Get Your Production URL

After deployment completes, you'll get a URL like:
```
https://cardiovascular-health-app.vercel.app
```

---

## 🔗 Part 6: Connect Everything Together

### Step 6.1: Update Backend with Frontend URL

In Railway Backend service → Variables → Add/Update:

```env
FRONTEND_URL=https://cardiovascular-health-app.vercel.app
```

This updates CORS to allow requests from your Vercel frontend.

### Step 6.2: Update ML Service with Frontend URL

In Railway ML service → Variables → Add/Update:

```env
FRONTEND_URL=https://cardiovascular-health-app.vercel.app
```

### Step 6.3: Redeploy Services

Railway will auto-redeploy when you change environment variables.

Wait ~2 minutes for both services to restart.

---

## ✅ Part 7: Verify Deployment

### Test Your Production App

1. **Visit your Vercel URL**: `https://your-app.vercel.app`
2. **Sign up** for a new account
3. **Complete a health assessment**
4. **Check history** page
5. **View AI insights**

### Test Individual Services

**Backend Health Check:**
```bash
curl https://your-backend.railway.app/api/test
```

**ML Service Health Check:**
```bash
curl https://your-ml-service.railway.app/health
```

**Database Connection:**
Check Railway MySQL logs to ensure connections are working.

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. **CORS Errors**
**Symptom:** "Access to fetch blocked by CORS policy"

**Solution:**
- Ensure `FRONTEND_URL` is set in both Backend and ML service
- Verify the URLs match exactly (no trailing slashes)
- Check Railway logs for CORS errors

#### 2. **Database Connection Failed**
**Symptom:** "DB error" or "Connection refused"

**Solution:**
- Verify all DB environment variables in Railway
- Check if Railway MySQL is running
- Ensure DB_PORT is set to 3306
- Check Railway MySQL logs

#### 3. **ML Predictions Not Working**
**Symptom:** Predictions fail but form submits

**Solution:**
- Check ML service logs in Railway
- Verify `ML_SERVICE_URL` is set in Backend
- Ensure model files are included in repository
- Test ML endpoint directly

#### 4. **Environment Variables Not Working**
**Symptom:** App works locally but not in production

**Solution:**
- Redeploy Vercel after adding variables
- Restart Railway services after adding variables
- Use `VITE_` prefix for all frontend environment variables
- Don't commit `.env` files (use `.env.example` instead)

#### 5. **Build Fails on Vercel**
**Symptom:** Deployment fails during build

**Solution:**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
# Check for missing dependencies
# Ensure all imports are correct
```

#### 6. **Railway Service Won't Start**
**Symptom:** Service crashes immediately after deployment

**Solution:**
- Check Railway logs for error messages
- Verify `package.json` has correct start script
- Ensure `PORT` environment variable is set
- Check if all dependencies are in `package.json`

---

## 🔄 Updating Your Deployed App

### For Code Changes

**Frontend:**
```bash
git add .
git commit -m "Update frontend"
git push origin main

# Vercel auto-deploys from GitHub
# Or manually: vercel --prod
```

**Backend/ML Service:**
```bash
git add .
git commit -m "Update backend"
git push origin main

# Railway auto-deploys from GitHub
```

### For Environment Variable Changes

**Vercel:**
1. Dashboard → Project → Settings → Environment Variables
2. Update variables
3. Redeploy from Deployments tab

**Railway:**
1. Service → Variables tab
2. Update variables
3. Auto-redeploys in ~30 seconds

---

## 💰 Cost Breakdown (All FREE Tier)

| Service | Free Tier Limits | Sufficient For |
|---------|-----------------|----------------|
| **Vercel** | 100GB bandwidth/month | ~100K page views |
| **Railway** | $5 credit/month | Small-medium traffic |
| **Railway MySQL** | Included in credit | Development/small apps |

**Total Monthly Cost:** $0 (with free tiers)

---

## 📊 Monitoring Your App

### Vercel Analytics
1. Go to your project dashboard
2. Click **"Analytics"** tab
3. View visitors, page views, performance

### Railway Metrics
1. Open your service
2. Click **"Metrics"** tab
3. View CPU, Memory, Network usage

### Set Up Alerts
- Vercel: Settings → Notifications
- Railway: Settings → Notifications
- Get email alerts for failures

---

## 🎯 Post-Deployment Checklist

- [ ] All services deployed and running
- [ ] Database imported successfully
- [ ] Environment variables set correctly
- [ ] Frontend loads without errors
- [ ] Login/Signup working
- [ ] Health assessments working
- [ ] ML predictions returning results
- [ ] AI advice generating properly
- [ ] History page showing data
- [ ] Suggestions page displaying insights
- [ ] Mobile responsive (test on phone)
- [ ] SSL certificates active (https://)
- [ ] Custom domain configured (optional)

---

## 🚀 Next Steps (Optional)

### 1. Add Custom Domain
**Vercel:**
- Settings → Domains → Add Domain
- Point DNS to Vercel

**Railway:**
- Settings → Domains → Custom Domain
- Point CNAME to Railway

### 2. Set Up CI/CD
Already configured! Push to GitHub = Auto-deploy

### 3. Enable Monitoring
- Vercel Analytics (built-in)
- Railway Metrics (built-in)
- Add Sentry for error tracking

### 4. Optimize Performance
- Enable Vercel Edge Network
- Add caching headers
- Optimize images
- Implement code splitting

---

## 📞 Support & Resources

**Vercel Docs:** https://vercel.com/docs
**Railway Docs:** https://docs.railway.app
**This Guide:** Keep it for reference!

---

## 🎉 Congratulations!

Your Cardiovascular Health Prediction app is now live and accessible from anywhere in the world!

**Share your app URL:**
`https://your-app.vercel.app`

---

**Last Updated:** December 2024
**Deployment Stack:** Vercel + Railway
**Author:** Dibakar Patar
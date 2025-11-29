# Frontend Environment Variables Update - Summary

## ✅ Changes Made

All frontend components now use **centralized API configuration** with environment variables instead of hardcoded URLs.

---

## 📁 Files Updated

### New Files Created
1. **`frontend/src/config/api.js`** - Centralized API configuration
   - Exports `getApiUrl()` and `getMlApiUrl()` helper functions
   - Exports `axiosConfig` with default settings
   - Uses Vite environment variables (`VITE_API_URL`, `VITE_ML_API_URL`)
   - Falls back to localhost URLs for development

2. **`frontend/.env`** - Local development environment variables
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_ML_API_URL=http://localhost:5000
   ```

### Files Modified (9 files)
All files now import and use the API config:

1. **`frontend/src/pages/Login.jsx`**
   - ✅ Import: `getApiUrl, axiosConfig`
   - ✅ Updated: `login` endpoint

2. **`frontend/src/pages/Signup.jsx`**
   - ✅ Import: `getApiUrl, axiosConfig`
   - ✅ Updated: `signup` endpoint

3. **`frontend/src/pages/HomePage.jsx`**
   - ✅ Import: `getApiUrl, axiosConfig`
   - ✅ Updated: 2× `checkSession` endpoints

4. **`frontend/src/pages/InputForm.jsx`**
   - ✅ Import: `getApiUrl, axiosConfig`
   - ✅ Updated: `checkSession` endpoint
   - ✅ Updated: `predictAndSave` endpoint

5. **`frontend/src/pages/History.jsx`**
   - ✅ Import: `getApiUrl, axiosConfig`
   - ✅ Updated: `checkSession` endpoint
   - ✅ Updated: `getUserCd` endpoint
   - ✅ Updated: `getUserHistory` endpoint

6. **`frontend/src/pages/Suggestions.jsx`**
   - ✅ Import: `getApiUrl, axiosConfig`
   - ✅ Updated: `checkSession` endpoint
   - ✅ Updated: `getUserCd` endpoint
   - ✅ Updated: `getUserHistory` endpoint

7. **`frontend/src/components/Navigation.jsx`**
   - ✅ Import: `getApiUrl, axiosConfig`
   - ✅ Updated: `checkSession` endpoint
   - ✅ Updated: `logout` endpoint

8. **`frontend/src/PrivateRoute.jsx`**
   - ✅ Import: `getApiUrl, axiosConfig`
   - ✅ Updated: `checkSession` endpoint

---

## 🔧 How It Works

### Before (Hardcoded)
```javascript
const response = await axios.get("http://localhost:3001/api/checkSession", {
  withCredentials: true
});
```

### After (Environment-Based)
```javascript
import { getApiUrl, axiosConfig } from "../config/api";

const response = await axios.get(getApiUrl('checkSession'), axiosConfig);
```

---

## 🌍 Environment Files

### Development: `frontend/.env`
```env
VITE_API_URL=http://localhost:3001/api
VITE_ML_API_URL=http://localhost:5000
```

### Production: `frontend/.env.production`
```env
VITE_API_URL=https://your-backend.up.railway.app/api
VITE_ML_API_URL=https://your-ml-service.up.railway.app
```

---

## 🎯 Benefits

1. **No More Hardcoded URLs**: All API URLs configurable via environment
2. **Environment-Specific**: Different URLs for dev/staging/production
3. **Single Source of Truth**: `api.js` config file manages all API settings
4. **Consistent Config**: All requests use same `axiosConfig` (withCredentials, headers)
5. **Easy Updates**: Change URLs in one place (`.env` file)
6. **Production Ready**: Just update `.env.production` with Railway URLs

---

## 📝 Usage Guide

### For Local Development
1. URLs automatically use `frontend/.env`
2. Default: `http://localhost:3001/api` and `http://localhost:5000`

### For Production Deployment
1. Update `frontend/.env.production` with actual Railway URLs:
   ```env
   VITE_API_URL=https://your-backend.up.railway.app/api
   VITE_ML_API_URL=https://your-ml-service.up.railway.app
   ```
2. Vercel automatically uses `.env.production` during build
3. Or set environment variables in Vercel dashboard

### Testing Different Environments
```bash
# Development (uses .env)
npm run dev

# Production build (uses .env.production)
npm run build

# Preview production build
npm run preview
```

---

## 🔐 Security Notes

- ✅ `.env` files already in `.gitignore`
- ✅ Environment variables not committed to git
- ✅ `.env.example` and `.env.production` templates provided
- ✅ `axiosConfig` includes `withCredentials: true` for sessions

---

## 🚀 Next Steps

1. **Test locally**: Run `cd frontend && npm run dev`
2. **Verify URLs**: Check browser console/network tab for correct API calls
3. **Update production**: After Railway deployment, update `.env.production`
4. **Deploy to Vercel**: Environment variables will be used automatically

---

## 📋 API Endpoints Used

All endpoints now configured through `getApiUrl()`:
- `checkSession` - Session validation
- `login` - User login
- `signup` - User registration
- `logout` - User logout
- `getUserCd` - Get user ID by username
- `getUserHistory/{user_cd}` - Get user history
- `predictAndSave` - Submit health data and get prediction

---

## ✨ All Set!

Your frontend now uses environment variables for all API calls. No more hardcoded URLs! 🎉

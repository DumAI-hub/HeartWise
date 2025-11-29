# 🎯 Quick Reference: Environment Variables

## Frontend Environment Setup

### Local Development
**File**: `frontend/.env`
```env
VITE_API_URL=http://localhost:3001/api
VITE_ML_API_URL=http://localhost:5000
```

### Production Deployment
**File**: `frontend/.env.production`
```env
VITE_API_URL=https://your-backend.up.railway.app/api
VITE_ML_API_URL=https://your-ml-service.up.railway.app
```

---

## Usage in Code

### Import API Config
```javascript
import { getApiUrl, axiosConfig } from '../config/api';
```

### Make API Calls
```javascript
// GET request
const response = await axios.get(getApiUrl('checkSession'), axiosConfig);

// POST request
const response = await axios.post(getApiUrl('login'), 
  { username, password },
  axiosConfig
);

// GET with params
const response = await axios.get(
  getApiUrl(`getUserHistory/${user_cd}`), 
  axiosConfig
);
```

---

## Common Endpoints

| Endpoint | Method | Usage |
|----------|--------|-------|
| `checkSession` | GET | Verify user session |
| `login` | POST | User login |
| `signup` | POST | User registration |
| `logout` | POST | User logout |
| `getUserCd?username=...` | GET | Get user ID |
| `getUserHistory/{id}` | GET | Get user history |
| `predictAndSave` | POST | Submit health data |

---

## Commands

```bash
# Development (uses .env)
cd frontend && npm run dev

# Build for production (uses .env.production)
cd frontend && npm run build

# Preview production build
cd frontend && npm run preview
```

---

## Files Updated

✅ All 9 frontend files now use environment variables:
- Login.jsx
- Signup.jsx  
- HomePage.jsx
- InputForm.jsx
- History.jsx
- Suggestions.jsx
- Navigation.jsx
- PrivateRoute.jsx

✅ New config: `frontend/src/config/api.js`
✅ New env: `frontend/.env`

---

## Deployment Steps

1. **Deploy Backend & ML to Railway** → Get URLs
2. **Update `frontend/.env.production`** with Railway URLs
3. **Deploy Frontend to Vercel** → Automatic env detection
4. **Done!** ✨

See **PRODUCTION_READY.md** for full deployment guide.

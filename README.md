# 🫀 Cardiovascular Health Prediction App

AI-powered cardiovascular disease risk assessment with personalized health insights.

**✨ Production-Ready** | Configured for **Vercel + Railway** deployment

## 📁 Project Structure

```
just_checking/
├── frontend/              # React + Vite frontend (→ Vercel)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── assets/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json       # Vercel configuration
│   └── .env.production   # Production environment variables
├── backend/              # Node.js + Express API (→ Railway)
│   ├── server.js
│   ├── models/
│   ├── data/
│   ├── package.json
│   └── railway.json      # Railway configuration
├── ml_service/           # Python + FastAPI ML service (→ Railway)
│   ├── app.py
│   ├── models/
│   ├── requirements.txt
│   └── railway.json      # Railway configuration
├── PRODUCTION_READY.md   # Production deployment guide
├── QUICKSTART.md         # Quick local setup
└── deployment.md         # Detailed deployment instructions
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MySQL 8.0+

### 1. Clone Repository
```bash
git clone https://github.com/mauryaabha991-arch/just_checking.git
cd just_checking
```

### Option A: Automated Setup (Recommended)
```bash
chmod +x setup.sh
./setup.sh
```

### Option B: Manual Setup
See [QUICKSTART.md](QUICKSTART.md) for detailed instructions

### Quick Test
```bash
# Check production readiness
chmod +x deploy_check.sh
./deploy_check.sh
```

## 🌐 Production Deployment

**Ready to deploy!** This app is configured for production deployment:

### Deploy to Production
1. **Backend + ML Service** → Railway
2. **Frontend** → Vercel

📖 **See [PRODUCTION_READY.md](PRODUCTION_READY.md)** for step-by-step deployment guide

### What's Configured
- ✅ Environment-aware CORS settings
- ✅ Secure HTTPS cookies for production
- ✅ Railway deployment configs (`railway.json`)
- ✅ Vercel deployment config (`vercel.json`)
- ✅ Production environment templates
- ✅ Database connection with error handling
- ✅ All security best practices

## 🎯 Local Development

### Access Points
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **ML Service**: http://localhost:5000

### Development Commands
```bash
# Backend
cd backend && npm run dev        # With auto-reload

# ML Service  
cd ml_service && python app.py

# Frontend
cd frontend && npm run dev       # Vite dev server
```

## 📦 Features

- ✅ User authentication (signup/login)
- ✅ Health data input form with validation
- ✅ AI-powered cardiovascular risk prediction
- ✅ Personalized health advice using Gemini AI
- ✅ Assessment history tracking
- ✅ Responsive modern UI with dark theme
- ✅ **Production-ready deployment configuration**

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite 7
- React Router
- Axios
- Tailwind CSS
- Firebase (optional)

**Backend:**
- Node.js 18+
- Express.js 5
- MySQL 8
- express-session
- CORS middleware

**ML Service:**
- Python 3.8+
- FastAPI
- scikit-learn, LightGBM, XGBoost, CatBoost
- uvicorn
- joblib

**AI Integration:**
- Google Generative AI (Gemini)

**Deployment:**
- Vercel (Frontend)
- Railway (Backend + ML Service)

## 📚 Documentation

### Setup & Development
- [QUICKSTART.md](QUICKSTART.md) - Quick local development setup
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Detailed project architecture

### Production Deployment
- [PRODUCTION_READY.md](PRODUCTION_READY.md) - **Start here for deployment**
- [deployment.md](deployment.md) - Detailed Vercel + Railway guide
- [.env.production.example](.env.production.example) - Environment variables template

### Utilities
- `setup.sh` - Automated local setup script
- `deploy_check.sh` - Verify production readiness

## 🌐 Production Deployment

**Your app is production-ready!** See [PRODUCTION_READY.md](PRODUCTION_READY.md) for:
- ✅ Complete deployment checklist
- ✅ Environment variables setup
- ✅ Railway + Vercel configuration
- ✅ Security best practices
- ✅ Testing and verification steps

## 🔧 Environment Variables

**See [.env.production.example](.env.production.example)** for complete production configuration.

### Local Development

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3001/api
VITE_ML_API_URL=http://localhost:5000
```

#### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dibs
DB_PORT=3306
SESSION_SECRET=your-secret-key
GEMINI_API_KEY=your_gemini_api_key
```

#### ML Service (`ml_service/.env`)
```env
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
MODEL_PATH=./models/
```
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors
- [@DumAI-hub](https://github.com/DumAI-hub)]
- [@mauryaabha991-arch](https://github.com/mauryaabha991-arch)
- @Sajeed-ahmed
- @rehana-debbarma
- @bimal-mochahary
Under the guidance of: Prof. Debdutta Kandar
## 🙏 Acknowledgments

- Machine Learning models for cardiovascular risk prediction
- Google Gemini AI for personalized health insights
- Open source community

---

**Made with ❤️ for better health**

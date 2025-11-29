# CardioPredict ML Microservice

Python FastAPI service that runs your 3 base models + stacking model.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Place your model files in the `models/` directory:
```
ml_service/
├── models/
│   ├── cat_pipeline_tuned.joblib
│   ├── lgbm_pipeline_tuned.joblib
│   ├── logreg_pipeline_tuned.joblib
│   └── stacking_pipeline_tuned.joblib
└── app.py
```

3. (Optional) Create `.env` file:
```bash
cp .env.example .env
# Edit paths if your models are elsewhere
```

4. Start the service:
```bash
python app.py
```

Or with uvicorn directly:
```bash
uvicorn app:app --reload --port 8000
```

## API Endpoints

- `GET /` - Service info
- `GET /health` - Health check with model status
- `POST /predict` - Run prediction

## Testing

Test the service:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "models": {
    "model1_loaded": true,
    "model2_loaded": true,
    "model3_loaded": true,
    "stacking_loaded": true
  }
}
```

## Integration with Backend

The Node.js backend will call `POST http://localhost:8000/predict` with health features.

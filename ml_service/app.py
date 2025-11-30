"""
ML Prediction Microservice for CardioPredict
Loads and runs 3 base models + stacking model for cardiovascular risk prediction
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import joblib
import pandas as pd
import numpy as np
import os
from pathlib import Path

# Load models at startup
MODELS = {}

def load_models():
    """Load all ML models from disk"""
    try:
        base_dir = Path(__file__).parent
        models_dir = base_dir / "models"
        
        # Read paths from environment or use defaults
        model1_path = os.getenv('MODEL1_PATH', 'models/cat_pipeline_tuned.joblib')
        model2_path = os.getenv('MODEL2_PATH', 'models/lgbm_pipeline_tuned.joblib')
        model3_path = os.getenv('MODEL3_PATH', 'models/rf_pipeline_tuned.joblib')
        stacking_path = os.getenv('STACKING_MODEL_PATH', 'models/stacking_pipeline_tuned.joblib')
        
        print(f"Loading models from:")
        print(f"  Model 1 (CatBoost): {model1_path}")
        print(f"  Model 2 (LightGBM): {model2_path}")
        print(f"  Model 3 (RandomForest): {model3_path}")
        print(f"  Stacking: {stacking_path}")
        
        # Try loading each model individually with error handling
        try:
            MODELS['model1'] = joblib.load(model1_path)
            print("✅ Model 1 (CatBoost) loaded")
        except Exception as e:
            print(f"❌ Failed to load Model 1: {e}")
            
        try:
            MODELS['model2'] = joblib.load(model2_path)
            print("✅ Model 2 (LightGBM) loaded")
        except Exception as e:
            print(f"❌ Failed to load Model 2: {e}")
            
        try:
            MODELS['model3'] = joblib.load(model3_path)
            print("✅ Model 3 (RandomForest) loaded")
        except Exception as e:
            print(f"❌ Failed to load Model 3: {e}")
            
        try:
            MODELS['stacking'] = joblib.load(stacking_path)
            print("✅ Stacking model loaded")
        except Exception as e:
            print(f"❌ Failed to load Stacking model: {e}")
        
        if len(MODELS) == 0:
            raise Exception("No models loaded successfully!")
        
        print(f"✅ Loaded {len(MODELS)}/4 models successfully!")
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        raise

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    load_models()
    yield
    # Shutdown (if needed)
    pass

app = FastAPI(title="CardioPredict ML Service", version="1.0.0", lifespan=lifespan)

# CORS middleware - production-ready configuration
allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',') if os.getenv('ALLOWED_ORIGINS') else ['*']

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthFeatures(BaseModel):
    """Input features for prediction - matches Streamlit model expectations"""
    age_years: float
    gender: int
    bmi: float  # Required - calculated from height/weight
    ap_hi: float
    ap_lo: float
    cholesterol: int
    gluc: int
    smoke: int
    alco: int
    ACTIVE: int

class PredictionResponse(BaseModel):
    """Prediction output format"""
    base_predictions: dict
    stacked: dict

def prepare_features(features: HealthFeatures) -> pd.DataFrame:
    """Convert features dict to pandas DataFrame with correct column names"""
    # Create DataFrame with proper column names matching model training
    feature_dict = {
        'age_years': [features.age_years],
        'gender': [features.gender],
        'bmi': [features.bmi],
        'ap_hi': [features.ap_hi],
        'ap_lo': [features.ap_lo],
        'cholesterol': [features.cholesterol],
        'gluc': [features.gluc],
        'smoke': [features.smoke],
        'alco': [features.alco],
        'active': [features.ACTIVE]  # Note: column name is 'active' not 'ACTIVE'
    }
    return pd.DataFrame(feature_dict)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "CardioPredict ML Service",
        "status": "running",
        "models_loaded": len(MODELS) == 4
    }

@app.get("/health")
async def health():
    """Health check with model status"""
    return {
        "status": "healthy",
        "server running on port" : os.getenv("ML_SERVICE_PORT", "8000"),
        # "models": {
        #     "model1_catboost": "model1" in MODELS,
        #     "model2_lightgbm": "model2" in MODELS,
        #     "model3_randomforest": "model3" in MODELS,
        #     "stacking_loaded": "stacking" in MODELS
        # }
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(features: HealthFeatures):
    """
    Run prediction using stacking model (handles base models internally)
    """
    try:
        # Prepare feature DataFrame
        X = prepare_features(features)
        print(f"Input features: {X.to_dict()}")
        
        # Use stacking model which handles everything internally
        if 'stacking' not in MODELS:
            raise HTTPException(status_code=500, detail="Stacking model not loaded")
        
        try:
            # Get stacking prediction
            if hasattr(MODELS['stacking'], 'predict_proba'):
                final_prob = MODELS['stacking'].predict_proba(X)[0][1]
            else:
                final_prob = MODELS['stacking'].predict(X)[0]
            
            print(f"✅ Stacking prediction: {final_prob:.4f}")
            
            # Try to get base model predictions from stacking classifier's estimators
            base_predictions = {}
            if hasattr(MODELS['stacking'], 'estimators_'):
                for i, (name, _) in enumerate(MODELS['stacking'].estimators):
                    try:
                        estimator = MODELS['stacking'].estimators_[i]
                        if hasattr(estimator, 'predict_proba'):
                            pred = estimator.predict_proba(X)[0][1]
                        else:
                            pred = estimator.predict(X)[0]
                        base_predictions[f'model{i+1}'] = float(pred)
                        print(f"✅ Base model {i+1} ({name}): {pred:.4f}")
                    except Exception as e:
                        print(f"⚠️ Base model {i+1} failed: {e}")
                        base_predictions[f'model{i+1}'] = float(final_prob)
            else:
                # Fallback if estimators not available
                base_predictions = {
                    'model1': float(final_prob),
                    'model2': float(final_prob),
                    'model3': float(final_prob)
                }
            
        except Exception as e:
            print(f"❌ Prediction failed: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
        
        # Determine risk label
        if final_prob < 0.3:
            label = "Low"
        elif final_prob < 0.6:
            label = "Moderate"
        else:
            label = "High"
        
        return {
            "base_predictions": base_predictions,
            "stacked": {
                "probability": float(final_prob),
                "label": label
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Prediction error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_SERVICE_PORT", 8000))  # Railway uses PORT
    host = os.getenv("HOST", "0.0.0.0")
    log_level = "info" if os.getenv("ENV") == "production" else "debug"
    
    print(f"\u2705 Starting ML Service on {host}:{port}")
    # print(f"\ud83c\udf10 Environment: {os.getenv('ENV', 'development')}")
    
    uvicorn.run(app, host=host, port=port, log_level=log_level)

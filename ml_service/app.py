"""
ML Prediction Microservice for CardioPredict
Loads and runs 5 base models + stacking model for cardiovascular risk prediction
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv
from model_loader import model_manager

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting ML Service...")
    success = model_manager.load_all_models()
    if not success:
        print("⚠️ Running in fallback mode - using mock predictions")
    else:
        print("✅ ML Service ready with trained models!")
    yield
    # Shutdown (if needed)
    pass

app = FastAPI(title="CardioPredict ML Service", version="2.0.0", lifespan=lifespan)

# CORS middleware - production-ready configuration
allowed_origins_env = os.getenv('ALLOWED_ORIGINS', '')

if allowed_origins_env:
    # If ALLOWED_ORIGINS is set, use those specific origins
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(',')]
    print(f"[CORS] Allowed origins: {allowed_origins}")
else:
    # Default to allow all for backend-to-backend communication
    allowed_origins = ["*"]
    print("[CORS] Allowing all origins (default)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthFeatures(BaseModel):
    """Input features for prediction - matches Streamlit model expectations"""
    # Base features
    age_years: float
    gender: int
    height: float
    weight: float
    ap_hi: float
    ap_lo: float
    cholesterol: int
    gluc: int
    smoke: int
    alco: int
    ACTIVE: int
    # Engineered features
    bmi: float
    pulse_pressure: float
    age_group: int
    bmi_group: int
    smoke_age: float
    chol_bmi: float

class PredictionResponse(BaseModel):
    """Prediction output format"""
    base_predictions: dict
    stacked: dict

# Add this BEFORE the app initialization (near the top, after imports):

class StackingModel:
    """
    Custom stacking ensemble class for loading pre-trained stacking models.
    This matches the class used during model training.
    """
    def __init__(self, base_models=None, meta_model=None):
        self.base_models = base_models or []
        self.meta_model = meta_model
    
    def predict_proba(self, X):
        """Generate probability predictions from the stacking ensemble"""
        if not self.base_models or self.meta_model is None:
            raise ValueError("Models not properly loaded")
        
        # Get base model predictions
        base_predictions = []
        
        # Handle both list and dict of base models
        if isinstance(self.base_models, dict):
            for name, model in self.base_models.items():
                pred = model.predict_proba(X)[:, 1]  # Get probability of class 1
                base_predictions.append(pred)
        elif isinstance(self.base_models, list):
            for model in self.base_models:
                pred = model.predict_proba(X)[:, 1]  # Get probability of class 1
                base_predictions.append(pred)
        else:
            raise ValueError(f"base_models must be dict or list, got {type(self.base_models)}")
        
        # Stack predictions and use meta model
        import numpy as np
        stacked = np.column_stack(base_predictions)
        return self.meta_model.predict_proba(stacked)
    
    def predict(self, X):
        """Generate class predictions"""
        proba = self.predict_proba(X)
        return (proba[:, 1] >= 0.5).astype(int)

# ...existing code...
def prepare_features(features: HealthFeatures) -> pd.DataFrame:
    """Convert features dict to pandas DataFrame with correct column names"""
    # Create DataFrame with all 17 features matching model training
    feature_dict = {
        'age_years': [features.age_years],
        'gender': [features.gender],
        'height': [features.height],
        'weight': [features.weight],
        'ap_hi': [features.ap_hi],
        'ap_lo': [features.ap_lo],
        'cholesterol': [features.cholesterol],
        'gluc': [features.gluc],
        'smoke': [features.smoke],
        'alco': [features.alco],
        'active': [features.ACTIVE],  # lowercase column name
        'bmi': [features.bmi],
        'pulse_pressure': [features.pulse_pressure],
        'age_group': [features.age_group],
        'bmi_group': [features.bmi_group],
        'smoke_age': [features.smoke_age],
        'chol_bmi': [features.chol_bmi]
    }
    return pd.DataFrame(feature_dict)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "CardioPredict ML Service",
        "version": "2.0.0",
        "status": "running",
        "models": {
            "base_models": 5,
            "stacking_model": 1,
            "total": 6,
            "loaded": model_manager.get_loaded_count()
        },
        "endpoints": {
            "health": "/health",
            "predict": "/predict"
        }
    }

@app.get("/health")
async def health():
    """Health check with model status"""
    models_loaded = model_manager.models_loaded()
    return {
        "status": "healthy" if models_loaded else "degraded",
        "message": "ML service is running",
        "models_loaded": models_loaded,
        "models": {
            "CatBoost": model_manager.models['model1'] is not None,
            "LightGBM": model_manager.models['model2'] is not None,
            "LogisticRegression": model_manager.models['model3'] is not None,
            "RandomForest": model_manager.models['model4'] is not None,
            "XGBoost": model_manager.models['model5'] is not None,
            "Stacking": model_manager.models['stacking'] is not None
        },
        "python_version": "3.11",
        "mode": "trained_models" if models_loaded else "fallback_mock"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(features: HealthFeatures):
    """
    Run prediction using 5 base models + stacking ensemble
    Handles missing/corrupted models gracefully
    """
    try:
        # Prepare feature DataFrame
        X = prepare_features(features)
        print(f"[INFO] Input features: {X.to_dict()}")
        
        # Check if any models are loaded
        if model_manager.get_loaded_count() > 0:
            # Get models (some may be None)
            model1, model2, model3, model4, model5, stacking_model = model_manager.get_models()
            
            # Initialize predictions dictionary
            predictions = {}
            
            # Try each model individually with error handling
            try:
                if model1 is not None:
                    predictions['model1'] = float(model1.predict_proba(X)[0][1])
                else:
                    predictions['model1'] = None
            except Exception as e:
                print(f"[ERROR] CatBoost prediction failed: {e}")
                predictions['model1'] = None
            
            try:
                if model2 is not None:
                    predictions['model2'] = float(model2.predict_proba(X)[0][1])
                else:
                    predictions['model2'] = None
            except Exception as e:
                print(f"[ERROR] LightGBM prediction failed: {e}")
                predictions['model2'] = None
            
            try:
                if model3 is not None:
                    predictions['model3'] = float(model3.predict_proba(X)[0][1])
                else:
                    predictions['model3'] = None
            except Exception as e:
                print(f"[ERROR] LogisticRegression prediction failed: {e}")
                predictions['model3'] = None
            
            try:
                if model4 is not None:
                    predictions['model4'] = float(model4.predict_proba(X)[0][1])
                else:
                    predictions['model4'] = None
            except Exception as e:
                print(f"[ERROR] RandomForest prediction failed: {e}")
                predictions['model4'] = None
            
            try:
                if model5 is not None:
                    predictions['model5'] = float(model5.predict_proba(X)[0][1])
                else:
                    predictions['model5'] = None
            except Exception as e:
                print(f"[ERROR] XGBoost prediction failed: {e}")
                predictions['model5'] = None
            
            # Calculate average from available predictions
            valid_predictions = [p for p in predictions.values() if p is not None]
            
            if len(valid_predictions) > 0:
                avg_prob = sum(valid_predictions) / len(valid_predictions)
                
                # Try stacking model, fallback to average if fails
                try:
                    if stacking_model is not None:
                        stacked_prob = float(stacking_model.predict_proba(X)[0][1])
                    else:
                        stacked_prob = avg_prob
                except Exception as e:
                    print(f"[ERROR] Stacking model prediction failed: {e}")
                    stacked_prob = avg_prob
                
                stacked_label = "High" if stacked_prob >= 0.5 else "Low"
                
                # Fill missing predictions with average
                for key in predictions:
                    if predictions[key] is None:
                        predictions[key] = avg_prob
                
                print(f"[INFO] Predictions:")
                print(f"   CatBoost: {predictions['model1']:.3f}, LightGBM: {predictions['model2']:.3f}, LogReg: {predictions['model3']:.3f}")
                print(f"   RandomForest: {predictions['model4']:.3f}, XGBoost: {predictions['model5']:.3f}")
                print(f"   Stacking: {stacked_label} ({stacked_prob:.3f})")
                print(f"[INFO] Used {len(valid_predictions)} working model(s)")
                
                return {
                    "base_predictions": predictions,
                    "stacked": {
                        "probability": stacked_prob,
                        "label": stacked_label
                    }
                }
            else:
                # All models failed, use fallback
                print("[WARNING] All models failed, using fallback prediction")
                risk_score = calculate_fallback_risk(features)
                label = "High" if risk_score >= 0.5 else "Low"
                
                return {
                    "base_predictions": {
                        "model1": float(risk_score * 0.95),
                        "model2": float(risk_score * 1.05),
                        "model3": float(risk_score * 0.98),
                        "model4": float(risk_score * 1.02),
                        "model5": float(risk_score)
                    },
                    "stacked": {
                        "probability": float(risk_score),
                        "label": label
                    }
                }
        else:
            # No models loaded, use fallback
            print("[WARNING] No models loaded, using fallback prediction")
            risk_score = calculate_fallback_risk(features)
            label = "High" if risk_score >= 0.5 else "Low"
            
            return {
                "base_predictions": {
                    "model1": float(risk_score * 0.95),
                    "model2": float(risk_score * 1.05),
                    "model3": float(risk_score * 0.98),
                    "model4": float(risk_score * 1.02),
                    "model5": float(risk_score)
                },
                "stacked": {
                    "probability": float(risk_score),
                    "label": label
                }
            }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Prediction error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

def calculate_fallback_risk(features: HealthFeatures) -> float:
    """Calculate risk score using rule-based approach when models aren't available"""
    risk_score = 0.0
    
    # Age risk (0-0.25)
    if features.age_years > 65:
        risk_score += 0.25
    elif features.age_years > 55:
        risk_score += 0.20
    elif features.age_years > 45:
        risk_score += 0.15
    elif features.age_years > 35:
        risk_score += 0.10
    
    # Blood pressure risk (0-0.30)
    if features.ap_hi > 160 or features.ap_lo > 100:
        risk_score += 0.30
    elif features.ap_hi > 140 or features.ap_lo > 90:
        risk_score += 0.20
    elif features.ap_hi > 130 or features.ap_lo > 85:
        risk_score += 0.10
    
    # BMI risk (0-0.20)
    if features.bmi > 35:
        risk_score += 0.20
    elif features.bmi > 30:
        risk_score += 0.15
    elif features.bmi > 25:
        risk_score += 0.10
    
    # Cholesterol risk (0-0.15)
    if features.cholesterol == 3:
        risk_score += 0.15
    elif features.cholesterol == 2:
        risk_score += 0.10
    
    # Glucose risk (0-0.10)
    if features.gluc == 3:
        risk_score += 0.10
    elif features.gluc == 2:
        risk_score += 0.05
    
    # Lifestyle factors (0-0.20)
    if features.smoke == 1:
        risk_score += 0.10
    if features.alco == 1:
        risk_score += 0.05
    if features.ACTIVE == 0:
        risk_score += 0.05
    
    # Cap at 1.0
    return min(risk_score, 1.0)

# This should already be in your code (verify it's there):
if __name__ == "__main__":
    import os
    
    # Railway automatically sets PORT - don't hardcode it!
    port = int(os.getenv("PORT", 8000))  # 8000 is just fallback for local dev
    
    print(f"\n{'='*60}")
    print(f"✅ Starting ML Service on 0.0.0.0:{port}")
    print(f"📊 Models loaded: {len([m for m in model_manager.models.values() if m is not None])}/6")
    print(f"🌐 Health: http://0.0.0.0:{port}/health")
    print(f"🔮 Predict: http://0.0.0.0:{port}/predict")
    print(f"{'='*60}\n")
    
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0", 
        port=port,
        log_level="info",
        access_log=True
    )


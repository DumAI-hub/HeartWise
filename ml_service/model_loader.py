import os
import joblib
from pathlib import Path

class ModelManager:
    def __init__(self):
        # Use local models directory only
        self.models_dir = os.getenv('MODEL_DIR', './models')
        Path(self.models_dir).mkdir(parents=True, exist_ok=True)
        
        self.models = {
            'model1': None,  # CatBoost
            'model2': None,  # LightGBM
            'model3': None,  # Logistic Regression
            'model4': None,  # Random Forest
            'model5': None,  # XGBoost
            'stacking': None  # Stacking Ensemble
        }
        
        # Model filenames
        self.filenames = {
            'model1': 'cat_pipeline_tuned.joblib',
            'model2': 'lgbm_pipeline_tuned.joblib',
            'model3': 'logreg_pipeline_tuned.joblib',
            'model4': 'rf_pipeline_tuned.joblib',
            'model5': 'xgb_pipeline_tuned.joblib',
            'stacking': 'stacking_pipeline_tuned.joblib'
        }
        
        # Model names for display
        self.display_names = {
            'model1': 'CatBoost',
            'model2': 'LightGBM',
            'model3': 'Logistic Regression',
            'model4': 'Random Forest',
            'model5': 'XGBoost',
            'stacking': 'Stacking Ensemble'
        }
        
        # Track which models loaded successfully
        self.loaded_models = set()
    
    def load_local_model(self, model_name):
        """Load model from local directory"""
        filename = self.filenames[model_name]
        display_name = self.display_names[model_name]
        output_path = os.path.join(self.models_dir, filename)
        
        if not os.path.exists(output_path):
            print(f"[WARNING] Model file not found: {output_path}")
            return None
        
        try:
            # Load the model
            model = joblib.load(output_path)
            
            # Verify the model is fitted (has required attributes)
            if hasattr(model, 'predict_proba'):
                file_size = os.path.getsize(output_path) / (1024 * 1024)
                print(f"[INFO] Loaded {display_name} from {output_path} ({file_size:.2f} MB)")
                self.loaded_models.add(model_name)
                return model
            else:
                print(f"[WARNING] {display_name} does not have predict_proba method")
                return None
                
        except Exception as e:
            print(f"[ERROR] Failed to load {display_name}: {str(e)}")
            return None
    
    def load_all_models(self):
        """Load all models from local directory"""
        print("=" * 60)
        print("[MIGRATION] Starting model loading process...")
        print(f"[MIGRATION] Model directory: {self.models_dir}")
        print("=" * 60)
        
        # Check what's in the directory
        if os.path.exists(self.models_dir):
            existing_files = os.listdir(self.models_dir)
            joblib_files = [f for f in existing_files if f.endswith('.joblib')]
            if joblib_files:
                print(f"[MIGRATION] Found {len(joblib_files)} model file(s):")
                for f in joblib_files:
                    file_path = os.path.join(self.models_dir, f)
                    size_mb = os.path.getsize(file_path) / (1024 * 1024)
                    print(f"   - {f} ({size_mb:.2f} MB)")
            else:
                print("[MIGRATION] No model files found in directory")
        else:
            print(f"[ERROR] Model directory does not exist: {self.models_dir}")
        
        print("=" * 60)
        
        try:
            # Load all 5 base models + 1 stacking model
            for model_name in ['model1', 'model2', 'model3', 'model4', 'model5', 'stacking']:
                display_name = self.display_names[model_name]
                print(f"\n[MIGRATION] Loading {display_name}...")
                self.models[model_name] = self.load_local_model(model_name)
            
            print("=" * 60)
            loaded_count = len(self.loaded_models)
            total_count = len(self.models)
            
            if loaded_count == total_count:
                print(f"[MIGRATION] All {total_count} models loaded successfully!")
                print("   • 5 Base Models: CatBoost, LightGBM, LogReg, RF, XGBoost")
                print("   • 1 Stacking Ensemble Model")
            elif loaded_count > 0:
                print(f"[WARNING] Partially loaded: {loaded_count}/{total_count} models")
                print(f"[WARNING] Loaded models: {', '.join(sorted(self.loaded_models))}")
                print(f"[WARNING] Service will continue with available models")
            else:
                print("[ERROR] No models loaded successfully")
                print("[WARNING] Service will run in fallback mode")
            print("=" * 60)
            return loaded_count > 0
            
        except Exception as e:
            print("=" * 60)
            print(f"[ERROR] Error loading models: {str(e)}")
            print("[WARNING] Service will run in fallback mode")
            print("=" * 60)
            return False
    
    def get_models(self):
        """Get all loaded models"""
        return (
            self.models['model1'],  # CatBoost
            self.models['model2'],  # LightGBM
            self.models['model3'],  # LogReg
            self.models['model4'],  # Random Forest
            self.models['model5'],  # XGBoost
            self.models['stacking']  # Stacking
        )
    
    def models_loaded(self):
        """Check if all models are loaded"""
        return all(model is not None for model in self.models.values())
    
    def get_loaded_count(self):
        """Get count of loaded models"""
        return sum(1 for model in self.models.values() if model is not None)

# Global model manager instance
model_manager = ModelManager()

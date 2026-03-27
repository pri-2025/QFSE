import sys
import json
import pickle
import numpy as np
import os
import warnings
warnings.filterwarnings('ignore') # Suppress sklearn warnings about feature names so stdout is pure JSON

def main():
    try:
        if len(sys.argv) < 2:
            raise ValueError("Missing JSON input argument")
            
        input_data = json.loads(sys.argv[1])
        
        # Expected features in the exact order requested
        features = [
            float(input_data.get('income', 0.0)),
            float(input_data.get('emi_ratio', 0.0)),
            float(input_data.get('savings_ratio', 0.0)),
            float(input_data.get('credit_utilization', 0.0)),
            float(input_data.get('spending_volatility', 0.0)),
            float(input_data.get('transaction_irregularity', 0.0))
        ]
        
        # Resolve model path safely based on current script path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, 'xgb_model.pkl')
        
        if not os.path.exists(model_path):
             raise FileNotFoundError(f"Missing model file at {model_path}")

        # Load standard pickle model
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
            
        # Predict using shape (1, n_features)
        X = np.array([features])
        
        probabilities = model.predict_proba(X)[0]
        prob_default = float(probabilities[1] if len(probabilities) > 1 else probabilities[0])
        
        # Simple thresholding constraint exactly as ordered
        if prob_default < 0.30:
            risk_level = "LOW"
        elif prob_default < 0.75:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"
            
        result = {
            "risk_score": round(prob_default * 100, 2), # Exposing scaled risk score 
            "risk_level": risk_level,
            "probability": prob_default
        }
        
        # Only print pure JSON to STDOUT
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()

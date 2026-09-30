# pyrefly: ignore [missing-import]
import numpy as np 
import pandas as pd
from sklearn.linear_model import LinearRegression
# pyrefly: ignore [missing-import]
import joblib
import os

def create_and_train_model(model_path='model.pkl'):
    np.random.seed(42)
    # Generate synthetic data
    # Study hours between 0 and 15
    study_hours = np.random.uniform(0, 15, 200)
    # Attendance between 50 and 100
    attendance = np.random.uniform(50, 100, 200)
    
    # Calculate score: baseline 10, + 3.5 per study hour, + 0.4 per attendance point + noise
    scores = 10 + (3.5 * study_hours) + (0.4 * attendance) + np.random.normal(0, 3, 200)
    scores = np.clip(scores, 0, 100) # Ensure scores are between 0 and 100
    
    X = pd.DataFrame({'study_hours': study_hours, 'attendance': attendance})
    y = scores
    
    # Train model
    model = LinearRegression()
    model.fit(X, y)
    
    # Save model
    joblib.dump(model, model_path)
    print(f"Model trained and saved to {model_path}")

def load_or_train_model(model_path='model.pkl'):
    if not os.path.exists(model_path):
        create_and_train_model(model_path)
    return joblib.load(model_path)

if __name__ == '__main__':
    create_and_train_model()

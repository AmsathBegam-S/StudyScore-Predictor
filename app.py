# pyrefly: ignore [missing-import]
from flask import Flask, render_template, request, jsonify
from model import load_or_train_model
import pandas as pd

app = Flask(__name__)

# Load the model on startup
model = load_or_train_model()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        study_hours = float(data.get('study_hours', 0))
        attendance = float(data.get('attendance', 0))
        
        # Prepare input for prediction
        input_data = pd.DataFrame({'study_hours': [study_hours], 'attendance': [attendance]})
        
        # Predict
        predicted_score = model.predict(input_data)[0]
        
        # Cap the score at 100
        predicted_score = min(max(predicted_score, 0), 100)
        
        # We also return some data points for the graph
        # E.g., how the score would change if we vary study hours (0 to 15) keeping attendance constant
        hours_range = list(range(0, 16))
        trend_data = pd.DataFrame({'study_hours': hours_range, 'attendance': [attendance]*16})
        trend_scores = model.predict(trend_data)
        trend_scores = [min(max(s, 0), 100) for s in trend_scores]
        
        return jsonify({
            'success': True,
            'predicted_score': round(predicted_score, 2),
            'trend_x': hours_range,
            'trend_y': [round(s, 2) for s in trend_scores]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    from waitress import serve
    print(" * Serving Flask app 'app' using Waitress")
    print(" * Running on http://127.0.0.1:5000")
    serve(app, host='127.0.0.1', port=5000)

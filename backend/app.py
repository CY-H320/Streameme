from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import cv2
import random
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# Create necessary directories
os.makedirs('uploads', exist_ok=True)
os.makedirs('results', exist_ok=True)
os.makedirs('memes', exist_ok=True)

# Mock meme data
MEMES = [
    {"file": "meme_1.jpg", "type": "happy", "description": "Success Kid - an excited reaction"},
    {"file": "meme_2.jpg", "type": "sad", "description": "Sad Cat - a disappointed reaction"},
    {"file": "meme_3.jpg", "type": "angry", "description": "Angry Baby - an frustrated reaction"},
]

def analyze_video(video_path):
    """
    Mock AI analysis function that returns meme suggestions at different timestamps
    In a real implementation, this would use computer vision/ML models
    """
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    duration = frame_count / fps if fps > 0 else 30
    cap.release()
    
    # Generate mock suggestions at random intervals
    suggestions = []
    num_suggestions = random.randint(3, 6)
    
    for i in range(num_suggestions):
        timestamp = round(random.uniform(0, duration), 2)
        meme = random.choice(MEMES)
        
        suggestion = {
            "timestamp": timestamp,
            "end_timestamp": round(timestamp + 5, 2),  # 5 second segments
            "meme_file": meme["file"],
            "description": meme["description"],
            "confidence": round(random.uniform(0.7, 0.95), 2)
        }
        suggestions.append(suggestion)
    
    # Sort by timestamp
    suggestions.sort(key=lambda x: x["timestamp"])
    return suggestions

@app.route('/upload', methods=['POST'])
def upload_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        filename = f"{file_id}_{file.filename}"
        filepath = os.path.join('uploads', filename)
        
        # Save uploaded file
        file.save(filepath)
        
        # Analyze video (mock AI processing)
        suggestions = analyze_video(filepath)
        
        # Save results to JSON file
        result_filename = f"result_{file_id}.json"
        result_path = os.path.join('results', result_filename)
        
        result_data = {
            "video_file": filename,
            "processed_at": datetime.now().isoformat(),
            "suggestions": suggestions
        }
        
        with open(result_path, 'w') as f:
            json.dump(result_data, f, indent=2)
        
        return jsonify({
            'success': True,
            'file_id': file_id,
            'result_file': result_filename,
            'video_file': filename,
            'suggestions': suggestions
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/results/<file_id>', methods=['GET'])
def get_results(file_id):
    try:
        result_filename = f"result_{file_id}.json"
        result_path = os.path.join('results', result_filename)
        
        if not os.path.exists(result_path):
            return jsonify({'error': 'Results not found'}), 404
        
        with open(result_path, 'r') as f:
            result_data = json.load(f)
        
        return jsonify(result_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/video/<filename>', methods=['GET'])
def serve_video(filename):
    """Serve uploaded videos"""
    try:
        from flask import send_from_directory
        return send_from_directory('uploads', filename)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/meme/<filename>', methods=['GET'])
def serve_meme(filename):
    """Serve meme images"""
    try:
        from flask import send_from_directory
        return send_from_directory('memes', filename)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    print("Starting Video Meme Analysis API...")
    print("Make sure to place meme_1.jpg, meme_2.jpg, meme_3.jpg in the 'memes' folder")
    app.run(debug=True, host='0.0.0.0', port=5050)
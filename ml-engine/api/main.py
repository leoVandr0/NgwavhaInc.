from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services.recommendation_service import RecommendationService

load_dotenv()

app = Flask(__name__)
CORS(app)

recommendation_service = RecommendationService()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'service': 'ML Recommendation Engine'}), 200

@app.route('/api/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    """
    Get personalized course recommendations for a user
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        recommendations = recommendation_service.get_recommendations(user_id, limit)
        return jsonify({
            'user_id': user_id,
            'recommendations': recommendations
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/similar-courses/<course_id>', methods=['GET'])
def get_similar_courses(course_id):
    """
    Get similar courses based on course content and metadata
    """
    try:
        limit = request.args.get('limit', 5, type=int)
        similar = recommendation_service.get_similar_courses(course_id, limit)
        return jsonify({
            'course_id': course_id,
            'similar_courses': similar
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/train', methods=['POST'])
def train_model():
    """
    Retrain the recommendation model with latest data
    """
    try:
        recommendation_service.train_model()
        return jsonify({'message': 'Model trained successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('ML_PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)

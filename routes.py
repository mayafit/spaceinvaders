from flask import jsonify, request, render_template
from app import app
import logging
from score_handler import get_high_scores, save_score

@app.route('/')
def index():
    return render_template('index.html', db_available=True)

@app.route('/api/scores', methods=['GET'])
def get_scores():
    try:
        scores = get_high_scores(10)
        return jsonify(scores)
    except Exception as e:
        logging.error(f"Error retrieving scores: {e}")
        return jsonify([])

@app.route('/api/scores', methods=['POST'])
def save_player_score():
    try:
        data = request.get_json()
        player_name = data.get('player_name', 'Anonymous')
        score = data.get('score', 0)

        new_score = save_score(player_name, score)
        if new_score:
            return jsonify(new_score), 201
        else:
            return jsonify({'message': 'Failed to save score.'}), 500
    except Exception as e:
        logging.error(f"Error saving score: {e}")
        return jsonify({'message': 'Failed to save score.'}), 500
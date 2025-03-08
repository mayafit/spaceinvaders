from flask import jsonify, request
from app import app, db
from datetime import datetime, timedelta
import logging

@app.route('/')
def index():
    from flask import render_template
    return render_template('index.html', db_available=app.config["DB_AVAILABLE"])

@app.route('/api/scores', methods=['GET'])
def get_high_scores():
    if not app.config["DB_AVAILABLE"]:
        # Return empty scores list when database is unavailable
        return jsonify([])
    
    try:
        from models import HighScore
        scores = HighScore.query.order_by(HighScore.score.desc()).limit(10).all()
        return jsonify([score.to_dict() for score in scores])
    except Exception as e:
        logging.error(f"Error retrieving scores: {e}")
        # Mark database as unavailable for future requests
        app.config["DB_AVAILABLE"] = False
        return jsonify([])

@app.route('/api/scores', methods=['POST'])
def save_score():
    if not app.config["DB_AVAILABLE"]:
        # Return success but with offline notice when database is unavailable
        return jsonify({'message': 'Game in offline mode. Scores not saved.'}), 200
    
    try:
        from models import HighScore
        data = request.get_json()
        player_name = data.get('player_name', 'Anonymous')
        score = data.get('score', 0)

        # Check for recent duplicate submissions (within last minute)
        recent_duplicate = HighScore.query.filter_by(
            player_name=player_name,
            score=score
        ).filter(
            HighScore.created_at >= datetime.utcnow() - timedelta(minutes=1)
        ).first()

        if recent_duplicate:
            return jsonify({'error': 'Duplicate score submission'}), 400

        new_score = HighScore(
            player_name=player_name,
            score=score
        )
        db.session.add(new_score)
        db.session.commit()
        return jsonify(new_score.to_dict()), 201
    except Exception as e:
        logging.error(f"Error saving score: {e}")
        # Mark database as unavailable for future requests
        app.config["DB_AVAILABLE"] = False
        return jsonify({'message': 'Failed to save score. Game now in offline mode.'}), 200
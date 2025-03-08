from flask import jsonify, request
from app import app, db
from models import HighScore
from datetime import datetime, timedelta

@app.route('/')
def index():
    from flask import render_template
    return render_template('index.html')

@app.route('/api/scores', methods=['GET'])
def get_high_scores():
    scores = HighScore.query.order_by(HighScore.score.desc()).limit(10).all()
    return jsonify([score.to_dict() for score in scores])

@app.route('/api/scores', methods=['POST'])
def save_score():
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
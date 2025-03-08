from flask import jsonify, request
from app import app, db
from models import HighScore

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
    new_score = HighScore(
        player_name=data.get('player_name', 'Anonymous'),
        score=data.get('score', 0)
    )
    db.session.add(new_score)
    db.session.commit()
    return jsonify(new_score.to_dict()), 201

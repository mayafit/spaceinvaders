
import json
import os
from datetime import datetime
import logging

SCORES_FILE = "scores.json"

def get_high_scores(limit=10):
    """Get the top high scores from the JSON file"""
    try:
        if not os.path.exists(SCORES_FILE):
            return []
        
        with open(SCORES_FILE, 'r') as file:
            scores = json.load(file)
            # Sort by score in descending order
            sorted_scores = sorted(scores, key=lambda x: x['score'], reverse=True)
            return sorted_scores[:limit]
    except Exception as e:
        logging.error(f"Error reading scores file: {e}")
        return []

def save_score(player_name, score):
    """Save a new score to the JSON file"""
    try:
        scores = []
        if os.path.exists(SCORES_FILE):
            with open(SCORES_FILE, 'r') as file:
                scores = json.load(file)
        
        # Check for recent duplicate submissions
        current_time = datetime.utcnow().isoformat()
        
        # Create new score entry
        new_score = {
            'id': len(scores) + 1,
            'player_name': player_name,
            'score': score,
            'created_at': current_time
        }
        
        scores.append(new_score)
        
        # Write back to file
        with open(SCORES_FILE, 'w') as file:
            json.dump(scores, file)
            
        return new_score
    except Exception as e:
        logging.error(f"Error saving score to file: {e}")
        return None

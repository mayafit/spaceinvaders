# Space Invaders Game

A dynamic Space Invaders-inspired web game with progressive difficulty, multiple ship types, and high score tracking.

## Features
- Multiple playable ships with different characteristics
- Progressive difficulty across 5 levels
- Special enemy types (fast aliens and bosses)
- Enemy bombs with increasing frequency
- High score system with JSON storage
- Sound effects with toggle option

## Requirements
- Python 3.8+ (for local setup)
- Docker (optional, for containerized setup)

## Local Setup Options

### Option 1: Direct Installation

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install required packages:
```bash
pip install flask flask-sqlalchemy email-validator gunicorn
```

3. Set up environment variables:
```bash
# Required environment variables
export SESSION_SECRET="your-secret-key"
export ALIENS_PER_ROW=8
```

4. Run the application:
```bash
python main.py
```

### Option 2: Docker Setup

1. Build and run using Docker Compose:
```bash
docker-compose up --build
```

The game will be available at http://localhost:5000

## Controls
- Left Arrow: Move ship left
- Right Arrow: Move ship right
- Spacebar: Shoot
- Sound toggle button: Enable/disable sound effects

## Game Features
- Three different ships to choose from:
  - Classic Ship: Balanced speed and size
  - Speed Ship: Faster but smaller
  - Power Ship: Slower but larger
- Multiple enemy types:
  - Regular aliens
  - Fast aliens (higher points, quicker movement)
  - Boss aliens (high health, high points)
- Progressive difficulty:
  - Levels 1-5 with increasing challenge
  - More enemy types appear in higher levels
  - Enemy bombs become more frequent
  - Higher scores for defeating special enemies

## High Scores
The game tracks and displays the top 10 high scores. Players can save their scores with their names after each game.

## Important Notes for Local Development
1. Check if port 5000 is available on your machine

2. Assets:
   - All game assets (ships, aliens) are SVG files in the static/svg directory
   - Sound effects are handled through the Tone.js library (no local audio files needed)

## Note for Replit Users
When running on Replit:
- The virtual environment setup is not needed
- Dependencies are managed automatically
- Environment variables are configured through Replit's interface
- The game will run automatically on the correct port
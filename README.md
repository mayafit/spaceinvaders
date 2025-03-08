# Space Invaders Game

A dynamic Space Invaders-inspired web game with progressive difficulty, multiple ship types, and high score tracking.

## Features
- Multiple playable ships with different characteristics
- Progressive difficulty across 5 levels
- Special enemy types (fast aliens and bosses)
- Enemy bombs with increasing frequency
- High score system with database storage
- Sound effects with toggle option

## Requirements
- Python 3.8+
- PostgreSQL database

## Local Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install required packages:
```bash
pip install flask flask-sqlalchemy psycopg2-binary email-validator gunicorn
```

3. Set up environment variables:
```bash
# Required environment variables
export DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
export SESSION_SECRET="your-secret-key"
```

4. Initialize the database:
- Create a PostgreSQL database
- The tables will be automatically created when you first run the application

5. Run the application:
```bash
python main.py
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
1. Database Setup:
   - Make sure PostgreSQL is installed and running
   - Create a new database for the game
   - Update the DATABASE_URL with your local database credentials

2. Troubleshooting:
   - If you see database connection errors, verify your PostgreSQL service is running
   - Ensure all environment variables are properly set
   - Check if port 5000 is available on your machine

3. Assets:
   - All game assets (ships, aliens) are SVG files in the static/svg directory
   - Sound effects are handled through the Tone.js library (no local audio files needed)

## Note for Replit Users
When running on Replit:
- The virtual environment setup is not needed
- Dependencies are managed automatically
- Database and environment variables are configured through Replit's interface
- The game will run automatically on the correct port
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import logging

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)

# Flag to track database availability
app.config["DB_AVAILABLE"] = True

# Configure database
database_url = os.environ.get("DATABASE_URL")
if database_url:
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
else:
    app.config["DB_AVAILABLE"] = False
    logging.warning("DATABASE_URL not found. Running in offline mode without high scores.")

app.secret_key = os.environ.get("SESSION_SECRET", "dev_key")

# Initialize SQLAlchemy
db.init_app(app)

# Try to initialize the database
if app.config["DB_AVAILABLE"]:
    try:
        with app.app_context():
            import models
            db.create_all()
    except Exception as e:
        app.config["DB_AVAILABLE"] = False
        logging.error(f"Failed to connect to database: {e}. Running in offline mode without high scores.")

from routes import *

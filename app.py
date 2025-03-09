import os
from flask import Flask
import logging

app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO)

app.secret_key = os.environ.get("SESSION_SECRET", "dev_key")

# Game configuration
app.config["ALIENS_PER_ROW"] = int(os.environ.get("ALIENS_PER_ROW", "8"))

from routes import *
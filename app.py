import os
from flask import Flask
import logging

app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO)

# Always available since we're using local JSON
app.config["DB_AVAILABLE"] = True 

app.secret_key = os.environ.get("SESSION_SECRET", "dev_key")

from routes import *
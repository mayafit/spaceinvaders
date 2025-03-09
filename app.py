import os
from flask import Flask
import logging

app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO)

app.secret_key = os.environ.get("SESSION_SECRET", "dev_key")

from routes import *
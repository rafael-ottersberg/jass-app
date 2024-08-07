from flask import Flask
from flask_cors import CORS
from api.routes.game_api import game_api

app = Flask(__name__)
app.register_blueprint(game_api)
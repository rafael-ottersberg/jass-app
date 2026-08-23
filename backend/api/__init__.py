import os

from flask import Flask, jsonify
from flask_cors import CORS

from api.extensions import db, migrate


def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = os.environ['JWT_SECRET']
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql+psycopg2://"
        f"{os.environ.get('POSTGRES_USER', 'jassapp')}:{os.environ['POSTGRES_PASSWORD']}"
        f"@{os.environ.get('POSTGRES_HOST', 'db')}:{os.environ.get('POSTGRES_PORT', '5432')}"
        f"/{os.environ.get('POSTGRES_DB', 'jassapp')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

    from api.models.user import User  # noqa: F401
    from api.models.game_record import GameRecord  # noqa: F401
    from api.models.game_participant import GameParticipant  # noqa: F401
    from api.models.invite_code import InviteCode  # noqa: F401

    from api.routes.auth_api import auth_api
    from api.routes.game_api import game_api
    app.register_blueprint(auth_api)
    app.register_blueprint(game_api)

    @app.errorhandler(400)
    @app.errorhandler(401)
    @app.errorhandler(403)
    @app.errorhandler(404)
    def handle_error(e):
        return jsonify({'message': getattr(e, 'description', str(e))}), e.code

    return app


app = create_app()

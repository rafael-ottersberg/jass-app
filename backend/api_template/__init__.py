#!/usr/bin/env python
from flask import Flask
from flask_mail import Mail
from flask_migrate import Migrate

from .extensions import db
from .extensions import scheduler

from api.routes.user_api import user_api
from api.routes.db_api import db_api
from api.routes.question_api import question_api
import api.tasks.tasks # this is no unnecessary import! neede to the scheduler registers jobs

import os
import socket
import logging
from logging.config import dictConfig

app = Flask(__name__)

dictConfig({
    "version": 1,
    "disable_existing_loggers": True,
    "formatters": {
        "default": {
            "format": "[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
        },
        "access": {
            "format": "%(message)s",
        }
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "default",
            "stream": "ext://sys.stdout",
        },
        "error_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "default",
            "filename": "/var/log/gunicorn.error.log",
            "maxBytes": 10000,
            "backupCount": 10,
            "delay": "True",
        },
        "access_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "access",
            "filename": "/var/log/gunicorn.access.log",
            "maxBytes": 10000,
            "backupCount": 10,
            "delay": "True",
        }
    },
    "loggers": {
        "gunicorn.error": {
            "handlers": ["console", "error_file"],
            "level": "DEBUG",
            "propagate": False,
        },
        "gunicorn.access": {
            "handlers": ["console", "access_file"],
            "level": "DEBUG",
            "propagate": False,
        }
    },
    "root": {
        "level": "DEBUG",
        "handlers": ["console"],
    }
})

app.config['SECRET_KEY'] = 'the quick brown fox jumps over the lazy dog'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

app.config['MAIL_SERVER']='smtp.office365.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('EMAIL')
app.config['MAIL_USERNAME'] = os.getenv('EMAIL')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False


# extensions
mail = Mail(app)
mail.init_app(app)
db.init_app(app)
db.app = app

# start scheduled jobs
if not scheduler.running:
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.bind(("127.0.0.1", 47200))
    except socket.error as e:
        logging.debug(e)
        logging.warn("scheduler already started")
    else:     
        scheduler.init_app(app)
        scheduler.start()

migrate = Migrate(app, db)

app.register_blueprint(user_api)
app.register_blueprint(question_api)
app.register_blueprint(db_api)

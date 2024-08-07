from passlib.apps import custom_app_context as pwd_context
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)

from api import db


class Question(db.Model):
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(1048), index=True)
    name = db.Column(db.String(64), index=True)
    homecamp = db.Column(db.String(128), index=True)
    count = db.Column(db.Integer)
    time = db.Column(db.Integer)
    fingerprints = db.Column(db.String(32768))
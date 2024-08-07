from passlib.apps import custom_app_context as pwd_context
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)

from api import db
import os

secret_key = os.getenv('JWT_SECRET')

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    vorname = db.Column(db.String(64), index=False)
    nachname = db.Column(db.String(64), index=False)
    geburtstag = db.Column(db.String(64), index=False)
    email = db.Column(db.String(64), index=True)
    telefon = db.Column(db.String(64), index=True)
    password_hash = db.Column(db.String(64))
    adresse = db.Column(db.String(64), index=False)
    plz  = db.Column(db.Integer, index=False)
    ort  = db.Column(db.String(64), index=False)

    bemerkungen = db.Column(db.String(512), index=False)

    mail_verified = db.Column(db.Integer, index=False)
    user_db_access = db.Column(db.Integer)

    def hash_password(self, password):
        self.password_hash = pwd_context.encrypt(password)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)

    def generate_auth_token(self, expiration=172800):
        s = Serializer(secret_key, expires_in=expiration)
        return s.dumps({'id': self.id})

    def generate_reset_pwd_token(self, expiration=600):
        s = Serializer(secret_key, expires_in=expiration)
        return s.dumps({'id': self.id})

    @staticmethod
    def verify_auth_token(token):
        s = Serializer(secret_key)
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None    # valid token, but expired
        except BadSignature:
            return None    # invalid token
        user = User.query.get(data['id'])
        return user

    @staticmethod
    def verify_reset_pwd_token(token):
        s = Serializer(secret_key)
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None    # valid token, but expired
        except BadSignature:
            return None    # invalid token
        user = User.query.get(data['id'])
        return user

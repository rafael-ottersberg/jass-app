from sqlalchemy.dialects.postgresql import JSONB

from api.extensions import db


class GameRecord(db.Model):
    __tablename__ = 'games'

    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String(16), nullable=False, default='lobby', index=True)
    mode = db.Column(db.String(32), nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    state = db.Column(JSONB, nullable=True)

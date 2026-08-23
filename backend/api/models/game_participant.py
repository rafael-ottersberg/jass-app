from api.extensions import db


class GameParticipant(db.Model):
    __tablename__ = 'game_participants'
    __table_args__ = (
        db.UniqueConstraint('game_id', 'user_id', name='uq_game_participant'),
    )

    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    team = db.Column(db.String(64), nullable=False)
    status = db.Column(db.String(16), nullable=False, default='invited')

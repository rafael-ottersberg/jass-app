from api.extensions import db


class InviteCode(db.Model):
    __tablename__ = 'invite_codes'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(64), unique=True, nullable=False, index=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    used_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    used_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self, used_by_username=None):
        return {
            'code': self.code,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'usedBy': used_by_username,
            'usedAt': self.used_at.isoformat() if self.used_at else None,
        }

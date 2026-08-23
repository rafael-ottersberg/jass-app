import secrets
from datetime import datetime, timezone
from functools import wraps

from flask import Blueprint, request, jsonify, g, current_app
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from api.extensions import db
from api.models.user import User
from api.models.invite_code import InviteCode

auth_api = Blueprint('auth_api', __name__)

TOKEN_MAX_AGE = 60 * 60 * 24 * 30  # 30 days


def generate_token(user):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps({'id': user.id})


def verify_token(token):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        data = serializer.loads(token, max_age=TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired):
        return None

    return User.query.get(data['id'])


def require_auth(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Authentication required'}), 401

        user = verify_token(auth_header[len('Bearer '):])
        if user is None:
            return jsonify({'message': 'Invalid or expired token'}), 401

        g.current_user = user
        return view(*args, **kwargs)

    return wrapped


@auth_api.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    invite_code_value = (data.get('inviteCode') or '').strip()

    if len(username) < 2 or len(username) > 64:
        return jsonify({'message': 'Username must be between 2 and 64 characters'}), 400

    if len(password) < 8 or len(password) > 128:
        return jsonify({'message': 'Password must be at least 8 characters'}), 400

    # The very first account has nobody to hand it an invite code, so it
    # bootstraps the friend group; every account after that needs one.
    is_first_user = User.query.first() is None

    invite_code = None
    if not is_first_user:
        invite_code = InviteCode.query.filter_by(code=invite_code_value, used_by_id=None).first()
        if invite_code is None:
            return jsonify({'message': 'Invalid or already-used invite code'}), 400

    if User.query.filter_by(username=username).first() is not None:
        return jsonify({'message': 'Username already taken'}), 400

    user = User(username=username)
    user.hash_password(password)
    db.session.add(user)
    db.session.flush()

    if invite_code is not None:
        invite_code.used_by_id = user.id
        invite_code.used_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({'token': generate_token(user), 'username': user.username}), 201


@auth_api.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username') or ''
    password = data.get('password') or ''

    user = User.query.filter_by(username=username).first()
    if user is None or not user.verify_password(password):
        return jsonify({'message': 'Invalid username or password'}), 400

    return jsonify({'token': generate_token(user), 'username': user.username})


@auth_api.route('/api/users', methods=['GET'])
@require_auth
def list_users():
    users = User.query.order_by(User.username).all()
    return jsonify([user.to_dict() for user in users])


@auth_api.route('/api/invite-codes', methods=['POST'])
@require_auth
def create_invite_code():
    invite_code = InviteCode(code=secrets.token_urlsafe(12), created_by_id=g.current_user.id)
    db.session.add(invite_code)
    db.session.commit()

    return jsonify(invite_code.to_dict()), 201


@auth_api.route('/api/invite-codes', methods=['GET'])
@require_auth
def list_invite_codes():
    codes = InviteCode.query.filter_by(created_by_id=g.current_user.id).order_by(InviteCode.created_at.desc()).all()

    used_by_ids = {c.used_by_id for c in codes if c.used_by_id is not None}
    usernames_by_id = {
        u.id: u.username for u in User.query.filter(User.id.in_(used_by_ids)).all()
    } if used_by_ids else {}

    return jsonify([
        code.to_dict(used_by_username=usernames_by_id.get(code.used_by_id))
        for code in codes
    ])

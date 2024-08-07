from flask import Blueprint, abort, request, jsonify, g, url_for, current_app
from flask_httpauth import HTTPBasicAuth

from flask_mail import Message, Mail

from api.models.user import User
from api.extensions import db

db_api = Blueprint('db_api', __name__)
auth_begleitperson = HTTPBasicAuth()
auth_userdb_access = HTTPBasicAuth()

@auth_begleitperson.verify_password
def verify_password(email_or_token, password):
    # first try to authenticate by token
    user = User.verify_auth_token(email_or_token)
    if not user:
        # try to authenticate with username/password
        user = User.query.filter_by(email=email_or_token).first()
        if not user or not user.verify_password(password):
            return None

    if user.begleitperson_verified != 1:
        return None  

    return user


@auth_userdb_access.verify_password
def verify_password(email_or_token, password):
    # first try to authenticate by token
    user = User.verify_auth_token(email_or_token)
    if not user:
        # try to authenticate with username/password
        user = User.query.filter_by(email=email_or_token).first()
        if not user or not user.verify_password(password):
            return None

    if user.user_db_access != 1:
        return None  

    return user



## prevent browser credential prompt on failed login
@auth_begleitperson.error_handler
def auth_error(status):
    if status == 401:
        status = 400
    return {'message': "Access Denied"}, status


@db_api.route('/api/user-list')
@auth_userdb_access.login_required
def user_list():
    users = User.query.filter_by()

    users_list = []
    for u in users:
        if u.geburtstag is not None:
            year = str(u.geburtstag).rsplit('.', 1)[1]
        else:
            year = "-"
        users_list.append({
            "id": u.id, 
            "vorname": u.vorname, 
            "nachname": u.nachname, 
            "jahrgang": year, 
            "ort": u.ort,
            "bemerkungen": u.bemerkungen})
    
    return jsonify({"userList": users_list}, 200)

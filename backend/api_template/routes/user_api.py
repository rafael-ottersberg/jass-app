from flask import Blueprint, abort, request, jsonify, g, url_for, current_app
from flask_httpauth import HTTPBasicAuth

from flask_mail import Message, Mail

from api.models.user import User
from api.extensions import db


from api.routes.db_api import auth_userdb_access

import logging

user_api = Blueprint('user_api', __name__)
auth = HTTPBasicAuth()
auth_reset_pwd = HTTPBasicAuth()

@auth.verify_password
def verify_password(email_or_token, password):
    # first try to authenticate by token
    user = User.verify_auth_token(email_or_token)
    if not user:
        # try to authenticate with username/password
        user = User.query.filter_by(email=email_or_token).first()
        if not user or not user.verify_password(password):
            return None
    
    return user

@auth_reset_pwd.verify_password
def verify_password_reset_pwd(token, _):
    # first try to authenticate by token
    user = User.verify_reset_pwd_token(token)
    if not user:
        return None

    return user


## prevent browser credential prompt on failed login
@auth.error_handler
def auth_error(status):
    if status == 401:
        status = 400
    return {'message': "Access Denied"}, status

@auth_reset_pwd.error_handler
def auth_error(status):
    if status == 401:
        status = 400
    return {'message': "Access Denied"}, status



@user_api.route('/api/users', methods=['POST'])
def new_user():
    password = request.json.get('password')
    email = request.json.get('email')

    if password is None:
        return {'message': "Password fehlt"}, 400
    if email is None:
        return {'message': "E-mail Adresse fehlt"}, 400

    if User.query.filter_by(email=email).first() is not None:
        return {'message': "E-mail bereits vergeben"}, 400

    user_parameters = {
        "email": email,
        "vorname": request.json.get('vorname'),
        "nachname": request.json.get('nachname'),
        "geburtstag": request.json.get('geburtstagString'),
        "adresse": request.json.get('adresse'),
        "plz": request.json.get('plz'),
        "ort": request.json.get('ort'),
        "telefon": request.json.get('telefon'),
        "bemerkungen": request.json.get('bemerkungen'),
    }

    user = User(**user_parameters)
    user.hash_password(password)
    db.session.add(user)
    db.session.commit()

    subject = f"Anmeldebestätigung"
    text = write_submit_text(user_parameters["vorname"])
    try:
        send_mail(user_parameters["email"], subject, text)
    except Exception as e:
        logging.error('Failed to send registration email: ' + format(e))
    logging.info('Successfully registered new user')
    return (jsonify({'message': "success"}), 201)

@user_api.route('/api/login')
@auth.login_required
def login():
    duration = 172800 #2 days
    user = auth.current_user()
    token = user.generate_auth_token(duration)

    return jsonify({
        'vorname': user.vorname, 
        'email': user.email, 
        'token': token.decode('ascii'), 
        'duration': duration,
        'userDBAccess': bool(user.user_db_access)
    })


@user_api.route('/api/request-reset-mail', methods=['PUT'])
def request_reset_mail():
    email = request.json.get('email')

    user = User.query.filter_by(email=email).first()
    if user is not None:
        token = user.generate_reset_pwd_token()

        subject = f"Passwort zurücksetzen"
        text = write_reset_password_text(token, user.vorname)
        try:
            send_mail(email, subject, text)
        except Exception as e:
            logging.error('Failed to send reset password email: ' + format(e))
            return (jsonify({'message': "Die E-mail konnte wegen eines Fehlers nicht gesendet werden. Versuche es später noch einmal."}), 500)

    return (jsonify({'message': "success"}), 201)



@user_api.route('/api/verify-reset-token')
@auth_reset_pwd.login_required
def verify_reset_token():
    token = auth.current_user().generate_auth_token(600)
    return jsonify({'vorname': auth.current_user().vorname, 'email': auth.current_user().email, 'token': token.decode('ascii'), 'duration': 600})


@user_api.route('/api/set-password', methods=['PUT'])
@auth_reset_pwd.login_required
def reset_password():
    password = request.json.get('password')
    password_repeat = request.json.get('passwordRepeat')

    if password != password_repeat:
        return (jsonify({'message': "Passwörter stimmen nicht überein"}), 400)

    if len(password) < 8:
        return (jsonify({'message': "Passwort zu kurz"}), 400)

    if len(password) > 64:
        return (jsonify({'message': "Passwort zu lang"}), 400)

    auth_reset_pwd.current_user().hash_password(password)
    db.session.commit()

    return (jsonify({'message': "success"}), 201)


@user_api.route('/api/set-password-admin', methods=['PUT'])
@auth_userdb_access.login_required
def reset_password_admin():
    password = request.json.get('password')
    password_repeat = request.json.get('passwordRepeat')
    id = int(request.json.get('id'))

    if password != password_repeat:
        return (jsonify({'message': "Passwörter stimmen nicht überein"}), 400)

    if len(password) < 8:
        return (jsonify({'message': "Passwort zu kurz"}), 400)

    if len(password) > 64:
        return (jsonify({'message': "Passwort zu lang"}), 400)

    User.query.get(id).hash_password(password)
    db.session.commit()

    return (jsonify({'message': "success"}), 201)

@user_api.route('/api/get-user/<int:id>', methods=['GET'])
@auth_userdb_access.login_required
def get_user(id):
    user = User.query.get(id)

    return (jsonify({'vorname': user.vorname, 'nachname': user.nachname}), 201)

def send_mail(recipent, subject, text):
    msg = Message(
        subject=subject,
        recipients=[recipent],
        body=text
    )
    with current_app.app_context():
        mail = Mail()
        mail.send(msg)



def write_submit_text(vorname):
    text = \
f"""Hallo {vorname}

Toll bist du mit dabei! 
"""

    return text

def write_reset_password_text(token, username):
    text = \
f"""Hallo {username}

Klicke auf den folgenden Link um dein Passwort neu zu setzten.
https://jass.ottersberg.ch/set-password?token={token.decode('ascii')}

Falls du das Mail nicht angefordert hast, musst du nichts unternehmen.

"""

    return text

    

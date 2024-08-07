from api.extensions import db
from api import app
from api.models.user import User
from api.models.events import Event

from datetime import datetime
from collections import OrderedDict

app.app_context().push()
db.create_all()

user = User(vorname='Rafael', nachname='Admin', email="rafael.ottersberg@gmx.ch", user_db_access=1)
user.hash_password('0')
db.session.add(user)
db.session.commit()

names = ['simon', 'micha', 'rahel', 'rafael', 'joel']
for name in names:
	user = User(vorname=name, nachname=name, email=f"{name}@gmx.ch", angebot='Camp 4')
	user.hash_password('0')
	db.session.add(user)
db.session.commit()


from flask import Blueprint, abort, request, jsonify, g, url_for
from api.models.question import Question
from api.extensions import db
from api.routes.user_api import auth
from api.routes.db_api import auth_userdb_access

import time
from datetime import datetime
import logging

question_api = Blueprint('question_api', __name__)

@question_api.route('/api/question', methods=['POST'])
@auth.login_required
def new_question():
    user = auth.current_user()
    user_string = f"-{user.id}-"

    question_text = request.json.get('question')
    show_name = request.json.get('showName')
    if show_name:
        name = user.vorname
    else:
        name = None
    

    if question_text is None:
        return {'message': "Keine Frage!"}, 400

    question = Question(
        text=question_text, 
        count=1,
        time=int(time.time()),
        fingerprints=user_string,
        name=name
        )
    db.session.add(question)
    db.session.commit()

    return {'message': "Frage geposted"}, 201


@question_api.route('/api/question/<int:id>', methods=['put'])
@auth_userdb_access.login_required
def edit_question(id):
    question = Question.query.get(id)
    if not question:
        abort(400)

    question.text = request.json.get('question')
    db.session.commit()
    return (jsonify({'message': "success"}), 201)

@question_api.route('/api/question/<int:id>', methods=['DELETE'])
@auth_userdb_access.login_required
def delete_question(id):
    question = Question.query.get(id)
    if not question:
        abort(400)

    db.session.delete(question)
    db.session.commit()
    return (jsonify({'message': "success"}), 201)

@question_api.route('/api/get-question-list')
@auth.login_required
def get_question_list():
    user = auth.current_user()
    user_string = f"-{user.id}-"

    questions = Question.query.all()
    question_list = []

    def sort_key(qst):
        return qst['votes']

    present_time = datetime.now()
    
    for question in questions:
        question_list.append(
            {
                'text': question.text,
                'name': question.name,
                'id': question.id,
                'votes': question.count,
                'time': question.time,
                'disable': question.fingerprints.__contains__(user_string)
            }
        )
    
    question_list.sort(key=sort_key, reverse=True)

    return jsonify({'questions': question_list})


@question_api.route('/api/upvote-question', methods=['PUT'])
@auth.login_required
def upvote_question():
    question_id = request.json.get('questionId')
    user = auth.current_user()
    user_string = f"-{user.id}-"
    
    logging.debug(question_id)
    logging.debug(user_string)

    question = Question.query.get(question_id)
    if not question:
        logging.warn(f'Question {question_id} not found')
        abort(400)
    
    if question.fingerprints.__contains__(user_string):
        logging.warn(f'User {user.id} already voted')
        abort(400)


    question.count = Question.count + 1
    question.fingerprints = Question.fingerprints + user_string

    return jsonify({'message': 'done'}, 200)


from flask import Blueprint, jsonify, request, g, abort

from api.extensions import db
from api.models.game import Game
from api.models.game_record import GameRecord
from api.models.game_participant import GameParticipant
from api.models.user import User
from api.models.stats import NetworkStatistics
from api.routes.auth_api import require_auth

game_api = Blueprint('game_api', __name__)

stats = NetworkStatistics()


def load_active_game(game_id):
    record = GameRecord.query.filter_by(id=game_id, status='active').first()
    if record is None:
        return None, None

    return record, Game.from_dict(record.state)


def save_game(record, gm):
    record.state = gm.to_dict()
    db.session.commit()


def require_player_in_game(gm):
    username = g.current_user.username
    if username not in gm.players:
        abort(403, description='You are not part of this game')

    return username


def is_participant(game_id, user_id):
    return GameParticipant.query.filter_by(game_id=game_id, user_id=user_id).first() is not None


def participants_dict(game_id):
    participants = GameParticipant.query.filter_by(game_id=game_id).order_by(GameParticipant.id).all()
    user_ids = [p.user_id for p in participants]
    usernames = {
        u.id: u.username for u in User.query.filter(User.id.in_(user_ids)).all()
    } if user_ids else {}

    return [
        {'username': usernames.get(p.user_id), 'team': p.team, 'status': p.status}
        for p in participants
    ]


def game_summary_dict(record):
    return {
        'id': record.id,
        'status': record.status,
        'mode': record.mode,
        'isCreator': record.created_by_id == g.current_user.id,
        'participants': participants_dict(record.id),
        'score': (record.state or {}).get('score', {}),
    }


TEAM_SIZE_BY_MODE = {'default': 2, 'sidi': 2, 'zweier': 1}


@game_api.route('/api/games', methods=['POST'])
@require_auth
def create_game():
    data = request.json or {}
    mode = data.get('mode')
    teams = data.get('teams')

    if mode not in TEAM_SIZE_BY_MODE:
        return jsonify({'message': 'Invalid mode'}), 400

    if not isinstance(teams, dict) or len(teams) < 2:
        return jsonify({'message': 'At least two teams are required'}), 400

    if any(not isinstance(name, str) or not name.strip() for name in teams.keys()):
        return jsonify({'message': 'Team names cannot be empty'}), 400

    if len({name.strip() for name in teams.keys()}) != len(teams):
        return jsonify({'message': 'Team names must be unique'}), 400

    required_team_size = TEAM_SIZE_BY_MODE[mode]
    all_players = []
    for team_players in teams.values():
        if not isinstance(team_players, list) or len(team_players) != required_team_size:
            return jsonify({
                'message': f'Each team needs exactly {required_team_size} player(s) for this mode'
            }), 400
        all_players.extend(team_players)

    if len(all_players) != len(set(all_players)):
        return jsonify({'message': 'A player cannot be on more than one team'}), 400

    users_by_username = {u.username: u for u in User.query.filter(User.username.in_(all_players)).all()}
    missing = set(all_players) - set(users_by_username.keys())
    if missing:
        return jsonify({'message': f"Unknown players: {', '.join(sorted(missing))}"}), 400

    record = GameRecord(status='lobby', mode=mode, created_by_id=g.current_user.id, state=None)
    db.session.add(record)
    db.session.flush()

    for team_name, usernames in teams.items():
        for username in usernames:
            user = users_by_username[username]
            participant_status = 'accepted' if user.id == g.current_user.id else 'invited'
            db.session.add(GameParticipant(
                game_id=record.id,
                user_id=user.id,
                team=team_name,
                status=participant_status,
            ))

    db.session.commit()

    return jsonify({'id': record.id}), 201


@game_api.route('/api/games', methods=['GET'])
@require_auth
def list_games():
    my_game_ids = [
        gp.game_id for gp in GameParticipant.query.filter_by(user_id=g.current_user.id).all()
    ]

    if not my_game_ids:
        return jsonify([])

    records = GameRecord.query.filter(GameRecord.id.in_(my_game_ids)).order_by(GameRecord.created_at.desc()).all()

    return jsonify([game_summary_dict(record) for record in records])


@game_api.route('/api/games/<int:game_id>', methods=['GET'])
@require_auth
def get_game(game_id):
    record = GameRecord.query.get(game_id)
    if record is None or not is_participant(game_id, g.current_user.id):
        return jsonify({'message': 'Game not found'}), 404

    return jsonify(game_summary_dict(record))


@game_api.route('/api/games/<int:game_id>/respond', methods=['POST'])
@require_auth
def respond_to_game(game_id):
    record = GameRecord.query.get(game_id)
    if record is None:
        return jsonify({'message': 'Game not found'}), 404

    participant = GameParticipant.query.filter_by(game_id=game_id, user_id=g.current_user.id).first()
    if participant is None or participant.status != 'invited':
        return jsonify({'message': 'No pending invite for this game'}), 400

    data = request.json or {}
    accept = bool(data.get('accept'))

    participant.status = 'accepted' if accept else 'declined'
    db.session.commit()

    if accept:
        all_participants = GameParticipant.query.filter_by(game_id=game_id).order_by(GameParticipant.id).all()
        if all(p.status == 'accepted' for p in all_participants):
            usernames_by_id = {
                u.id: u.username
                for u in User.query.filter(User.id.in_([p.user_id for p in all_participants])).all()
            }

            teams = {}
            all_usernames = []
            for p in all_participants:
                username = usernames_by_id[p.user_id]
                teams.setdefault(p.team, []).append(username)
                all_usernames.append(username)

            gm = Game(mode=record.mode, players=all_usernames)
            gm.start_game(teams)

            record.status = 'active'
            record.state = gm.to_dict()
            db.session.commit()

    return jsonify(game_summary_dict(record))


@game_api.route('/api/games/<int:game_id>/cancel', methods=['POST'])
@require_auth
def cancel_game(game_id):
    record = GameRecord.query.get(game_id)
    if record is None:
        return jsonify({'message': 'Game not found'}), 404

    if record.created_by_id != g.current_user.id:
        return jsonify({'message': 'Only the creator can cancel this game'}), 403

    if record.status != 'lobby':
        return jsonify({'message': 'Only a game still in its lobby can be cancelled'}), 400

    record.status = 'cancelled'
    db.session.commit()

    return jsonify({'done': True})


@game_api.route('/api/games/<int:game_id>', methods=['DELETE'])
@require_auth
def delete_game(game_id):
    record = GameRecord.query.get(game_id)
    if record is None:
        return jsonify({'message': 'Game not found'}), 404

    if record.created_by_id != g.current_user.id:
        return jsonify({'message': 'Only the creator can delete this game'}), 403

    if record.status == 'active':
        return jsonify({'message': 'Finish or give up an active game before deleting it'}), 400

    GameParticipant.query.filter_by(game_id=game_id).delete()
    db.session.delete(record)
    db.session.commit()

    return jsonify({'done': True})


@game_api.route('/api/games/<int:game_id>/abandon', methods=['POST'])
@require_auth
def abandon_game(game_id):
    record, gm = load_active_game(game_id)
    if gm is None:
        return jsonify({'message': 'No active game'}), 404

    require_player_in_game(gm)

    record.status = 'abandoned'
    db.session.commit()

    return jsonify({'done': True})


@game_api.route('/api/games/<int:game_id>/round-state', methods=['GET'])
@require_auth
def get_round_state(game_id):
    record, gm = load_active_game(game_id)
    if gm is None:
        return jsonify({'message': 'No active game'}), 404

    player = require_player_in_game(gm)
    address = get_address(request)

    return jsonify(get_round_state_dict(gm, player, address))


@game_api.route('/api/games/<int:game_id>/define-trump', methods=['PUT'])
@require_auth
def define_trump(game_id):
    record, gm = load_active_game(game_id)
    if gm is None:
        return jsonify({'message': 'No active game'}), 404

    player = require_player_in_game(gm)
    data = request.json or {}
    trump = data.get('trump')

    message = gm.current_round.make_trump(trump, player)

    if message == "Trump set":
        save_game(record, gm)
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': message}), 400


@game_api.route('/api/games/<int:game_id>/add-bonus-to-score', methods=['PUT'])
@require_auth
def add_bonus_to_score(game_id):
    record, gm = load_active_game(game_id)
    if gm is None:
        return jsonify({'message': 'No active game'}), 404

    require_player_in_game(gm)
    data = request.json or {}
    points_per_team = data.get('pointsPerTeam')

    gm.add_to_score_team(points_per_team)
    save_game(record, gm)

    return jsonify(game_summary_dict(record)), 200


@game_api.route('/api/games/<int:game_id>/play-card', methods=['PUT'])
@require_auth
def play_card(game_id):
    record, gm = load_active_game(game_id)
    if gm is None:
        return jsonify({'message': 'No active game'}), 404

    player = require_player_in_game(gm)
    address = get_address(request)
    data = request.json or {}
    played_card_string = data.get('playedCard')

    status = gm.current_round.play_card(player, played_card_string)
    gm.update_game()
    save_game(record, gm)

    response = get_round_state_dict(gm, player, address)

    if status == "Card played":
        return jsonify(response), 200
    else:
        response['message'] = status
        return jsonify(response), 400


@game_api.route('/api/games/<int:game_id>/rearrange-cards', methods=['PUT'])
@require_auth
def rearrange_cards(game_id):
    record, gm = load_active_game(game_id)
    if gm is None:
        return jsonify({'message': 'No active game'}), 404

    player = require_player_in_game(gm)
    address = get_address(request)
    data = request.json or {}
    sorted_hand_cards = data.get('handCards')

    hand = gm.current_round.players[player].hand
    hand_cards = hand.get_cards()

    sorting_allowed = False
    if set(hand_cards) == set(sorted_hand_cards):
        hand.remove_all()

        for card_string in sorted_hand_cards:
            hand.add_card_from_string(card_string)

        sorting_allowed = True
        save_game(record, gm)

    response = get_round_state_dict(gm, player, address)

    if sorting_allowed:
        return jsonify(response), 200
    else:
        response['message'] = "Cards could not be sorted"
        return jsonify(response), 400


@game_api.route('/api/games/<int:game_id>/sort-cards', methods=['GET'])
@require_auth
def sort_cards(game_id):
    record, gm = load_active_game(game_id)
    if gm is None:
        return jsonify({'message': 'No active game'}), 404

    player = require_player_in_game(gm)
    address = get_address(request)

    reverse = player == "Andy"

    hand = gm.current_round.players[player].hand
    gm.current_round.players[player].hand = hand.sort_cards(reverse)
    save_game(record, gm)

    response = get_round_state_dict(gm, player, address)

    return jsonify(response), 200


@game_api.route('/api/games/<int:game_id>/process-stich', methods=['GET'])
@require_auth
def process_stich(game_id):
    record, gm = load_active_game(game_id)
    if gm is None:
        return jsonify({'message': 'No active game'}), 404

    require_player_in_game(gm)

    if gm.current_round.state == "stich_finished":
        gm.current_round.process_stich()
        gm.update_game()
        save_game(record, gm)
        return jsonify({'done': True}), 200
    else:
        return jsonify({'message': 'stich not finished'}), 400


@game_api.route('/api/games/<int:game_id>/start-next-round', methods=['GET'])
@require_auth
def start_next_round(game_id):
    record, gm = load_active_game(game_id)
    if gm is None:
        return jsonify({'message': 'No active game'}), 404

    require_player_in_game(gm)

    if gm.current_round.state != "round_finished":
        return jsonify({'message': 'Round not finished'}), 400

    if gm.state == "playing":
        gm.start_next_round()
        save_game(record, gm)
        return jsonify({'done': True}), 200
    else:
        if gm.state == 'finished':
            record.status = 'finished'
        save_game(record, gm)
        return jsonify({'message': f"Game {gm.state}"}), 200


@game_api.route('/api/games/<int:game_id>/skip-round', methods=['PUT'])
@require_auth
def skip_round(game_id):
    record, gm = load_active_game(game_id)
    if gm is None:
        return jsonify({'message': 'No active game'}), 404

    require_player_in_game(gm)
    gm.start_next_round()
    save_game(record, gm)

    return jsonify({'done': True}), 200


@game_api.route('/api/get-network-stats', methods=['GET'])
@require_auth
def get_network_stats():
    return jsonify({
        'count': stats.number_of_requests,
        'addr': stats.request_address,
    })


@game_api.route('/api/reset-network-stats', methods=['PUT'])
@require_auth
def reset_network_stats():
    stats.reset()
    return jsonify({'done': True})


def get_round_state_dict(gm, player, address):
    stack_info = None
    if gm.mode == 'zweier':
        if not gm.current_round.table.stack.is_empty():
            last_card = str(gm.current_round.table.stack.cards[-1])
            stack_info = {
                'stackSize': len(gm.current_round.table.stack.cards),
                'lastCardStack': last_card
            }

    response = {
        'roundState': gm.current_round.state,
        'orderedPlayers': gm.sorted_players,
        'trump': gm.current_round.trump,
        'played': gm.current_round.table.get_cards(),
        'hand': gm.current_round.players[player].hand.get_cards(),
        'scoreLastRound': gm.score_last_round,
        'stackInfo': stack_info
    }

    stats.count_request(player)
    stats.save_address(player, address)

    return response


def get_address(request):
    if not request.headers.getlist("X-Forwarded-For"):
        address = request.remote_addr
    else:
        address = request.headers.getlist("X-Forwarded-For")[0]

    return address

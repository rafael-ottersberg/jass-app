from flask import Blueprint, jsonify, request
from copy import deepcopy
from api.models.game import Game
from api.models.stats import NetworkStatistics

from flask_cors import CORS

game_api = Blueprint('game_api', __name__)
CORS(game_api)

gm = Game()
stats = NetworkStatistics()

def start_game(mode='sidi', players=["Rafael","Pädi","Andy","Gebek"], teams={"ToStayChamps":["Rafael","Andy"], "Cheffä":["Pädi","Gebek"]}):
    global gm

    gm = Game(players=players, mode=mode)
    gm.start_game(teams)

start_game()

@game_api.route('/api/add-player', methods=["POST"])
def add_player():
    data = request.json
    player = data['player']

    global gm
    message = gm.add_player(player)

    if message == "Player added" or message == "Rejoined":
        return "done", 200
    else:
        return {'message': message}, 400

@game_api.route('/api/reset-api', methods=["PUT"])
def reset_api():
    
    initialize_game(mode='sidi')

    return {"done": True}

@game_api.route('/api/skip-round', methods=["PUT"])
def skip_round():
    global gm
    gm.start_next_round()

    return {"done": True}

@game_api.route('/api/restart-game', methods=["PUT"])
def restart_game():
    data = request.json
    players = data['players']
    teams = data['teams']
    mode = data['mode']

    start_game(mode=mode, teams=teams, players=players)

    return {"done": True}

@game_api.route('/api/get-game-state', methods=["GET"])
def get_game_state():
    response = get_game_state_dict()
    return response

@game_api.route('/api/get-round-state', methods=["GET"])
def get_round_state():
    data = request.args
    address = get_address(request)
    player = data['player']

    response = get_round_state_dict(player, address)
    return response

@game_api.route('/api/define-trump', methods=["PUT"])
def define_trump():
    data = request.json
    trump = data['trump']
    player = data['player']

    global gm
    message = gm.current_round.make_trump(trump, player)

    response = {
        'message': message
    }

    if message == "Trump set":
        return response, 200

    else:
        return response, 400

@game_api.route('/api/add-bonus-to-score', methods=["PUT"])
def add_bonus_to_score():
    data = request.json
    points_per_team = data['pointsPerTeam']

    global gm
    gm.add_to_score_team(points_per_team)

    response = get_game_state()

    return response, 200

@game_api.route('/api/play-card', methods=["PUT"])
def play_card():
    data = request.json
    address = get_address(request)
    
    player_name = data["player"]
    played_card_string = data["playedCard"]

    global gm
    status = gm.current_round.play_card(player_name, played_card_string)

    gm.update_game()
    response = get_round_state_dict(player_name, address)

    if status == "Card played":
        return response, 200

    else:
        response['message'] = status
        return response, 400

@game_api.route('/api/rearrange-cards', methods=["PUT"])
def rearrange_cards():
    data = request.json
    address = get_address(request)

    player_name = data["player"]
    sorted_hand_cards = data["handCards"]

    global gm

    hand = gm.current_round.players[player_name].hand
    hand_cards = hand.get_cards()

    sorting_allowed = False
    if set(hand_cards) == set(sorted_hand_cards):
        hand.remove_all()
        
        for card_string in sorted_hand_cards:
            hand.add_card_from_string(card_string)

        sorting_allowed = True

    response = get_round_state_dict(player_name, address)
    
    if sorting_allowed:
        return response, 200

    else:
        response['message'] = "Cards could not be sorted"
        return response, 400

@game_api.route('/api/sort-cards', methods=["GET"])
def sort_cards():
    data = request.args
    address = get_address(request)

    reverse = False
    player_name = data["player"]

    if player_name == "Andy":
        reverse = True

    global gm

    hand = gm.current_round.players[player_name].hand
    gm.current_round.players[player_name].hand = hand.sort_cards(reverse)

    response = get_round_state_dict(player_name, address)

    return response, 200


@game_api.route('/api/process-stich', methods=["GET"])
def process_stich():
    global gm

    if gm.current_round.state == "stich_finished":
        gm.current_round.process_stich()
        gm.update_game()
        return "done", 200
    else:
        return "stich not finished", 400

@game_api.route('/api/start-next-round', methods=["GET"])
def start_next_round():
    global gm

    if gm.current_round.state == "round_finished":
        if gm.state == "playing":
            gm.start_next_round()
            return "done", 200
        else:
            return f"Game {gm.state}", 200
    else:
        return "Round not finished", 400

@game_api.route('/api/get-network-stats', methods=["GET"])
def get_network_stats():
    global stats
    res = {
        "count": stats.number_of_requests,
        "addr": stats.request_address
        }
    return res



@game_api.route('/api/reset-network-stats', methods=["PUT"])
def reset_network_stats():
    global stats
    stats.reset()

    return {"done": True}


def get_round_state_dict(player, address):
    global gm
    global stats

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

def get_game_state_dict():
    global gm
    response = {
        'gameState': gm.state,
        'score': gm.score,
        'mode': gm.mode
    }
    return response

def get_address(request):
    if not request.headers.getlist("X-Forwarded-For"):
        address = request.remote_addr
    else:
        address = request.headers.getlist("X-Forwarded-For")[0]

    return address
import random
from collections import OrderedDict

class Game:
    def __init__(self, game_id=1, mode="default", players = [], final_score=1000):
        self.game_id = game_id
        self.mode = mode
        self.state = 'joining'
        self.players = players
        self.final_score = final_score
        self.score = {}

    def __str__(self):
        return f"Game: {self.game_id} with players: {self.players}\nMode: {self.mode}\tState: {self.state}"

    def add_player(self, player):
        if self.state == 'joining':
            if player in self.players:
                return "Player name already taken"
                
            self.players.append(player)
            return "Player added"
        else:
            if player in self.players:
                return "Rejoined"
            
            else:
                return "Game state not joining"

    def start_game(self, teams):
        self.state = 'playing'
        self.teams = teams

        sorted_players = []
        for i in range(2): # max 3 players per team
            for team in teams.keys():
                if len(teams[team]) > i:
                    sorted_players.append(teams[team][i])
        
        score = dict()
        for team in teams.keys():
            score[team] = 0

        self.score = score
        self.score_last_round = dict()

        self.sorted_players = sorted_players
        self.starting_player = self.find_first_player()
        self.start_next_round(first_round=True)


    def game_finished(self):
        finished = False
        for team in self.score.keys():
            if self.score[team] >= self.final_score:
                finished = True
        return finished

    def find_first_player(self):
        return self.sorted_players[0]

    def find_next_player(self):
        starting_player_index = self.sorted_players.index(self.starting_player)
        next_player_index = (starting_player_index + 1) % (len(self.sorted_players))
        return self.sorted_players[next_player_index]

    def add_to_score(self, points_per_player):
        for team in self.teams.keys():
            self.score_last_round[team] = 0

        for player in points_per_player.keys():
            for team in self.teams.keys():
                if player in self.teams[team]:
                    self.score[team] += points_per_player[player]
                    self.score_last_round[team] += points_per_player[player]

    def add_to_score_team(self, points_per_team):
        for team in points_per_team.keys():
            if team in self.score.keys():
                self.score[team] += points_per_team[team]

    def update_game(self):
        # this method checks/updates the state of the game and the rounds

        if self.state == "playing":
            if self.current_round.state == "play":
            
                if self.current_round.table.slots[self.current_round.current_player].get_card() is not None:
                    # current player already has played
                    self.current_round.current_player = self.current_round.find_next_player()

                    if self.current_round.table.slots[self.current_round.current_player].get_card() is not None:
                        # all players have played a card
                        self.current_round.state = "stich_finished"
 

            elif self.current_round.state == "round_finished":
                # current round is finished
                self.add_to_score(self.current_round.count_points())

                if self.game_finished():
                    self.state == "finished"


    def start_next_round(self, first_round=False):
        Round_mode = {
            'default': Round,
            'sidi': SidiRound,
            'zweier': ZweierjassRound
        }

        if not first_round:
            self.starting_player = self.find_next_player()

        self.current_round = Round_mode[self.mode](self.mode, self.sorted_players, self.starting_player)


class Round:
    def __init__(self, mode, players, starting_player_round):
        self.mode = mode
        self.table = Table(mode, players)
        self.state = 'define_trump'
        self.trump = None
        self.number_of_played_stiche = 0

        players_dict = OrderedDict()
        for player in players:
            players_dict[player] = Player(player)

        for player in players_dict.keys():
            players_dict[player].hand.add_cards(self.table.stack.draw(9))

        self.players = players_dict

        self.current_player = starting_player_round
        self.starting_player = starting_player_round

    def finished(self):
        finito = False
        number_of_cards = []
        for player in self.players.keys():
            number_of_cards.append(len(self.players[player].hand.cards))
        
        if max(number_of_cards) == 0:
            finito = True
        
        return finito

    def find_next_player(self):
        player_names = list(self.players.keys())
        number_of_players = len(player_names)

        return player_names[((player_names.index(self.current_player) + 1) % number_of_players)]

    def play_card(self, player_name, card_string):
        if self.state != "play":
            return "Round has not started"

        if player_name != self.current_player:
            return "It's not your turn."
        
        if self.state == "stich_finished":
            return "Stich is finished"

        card_color = card_string.split("/")[0]
        card_value = card_string.split("/")[1]
        played_card = Card(card_color, card_value)

        if not self.check_card_allowed(played_card):
            return "Card not allowed."
        
        else:
            card = self.players[player_name].hand.remove_card_from_string(card_string)

            if card is None:
                return "Card is not in your hand!"
            
            else:
                self.table.slots[player_name].set_card(card)
                return "Card played"

    def find_idx_of_first_card(self):
        # Find the index of the card which has been played first
        first_card_idx = list(self.players.keys()).index(self.starting_player)  
        return first_card_idx 

    def check_card_allowed(self, card):
        # cards on table in played order
        played_cards = CardCollection()

        first_card_idx = self.find_idx_of_first_card()
        player_names = list(self.players.keys())
        number_of_players = len(player_names)

        for i in range(number_of_players):
            index = (first_card_idx + i) % number_of_players
            slot = self.table.slots[player_names[index]]

            if slot.get_card() is None:
                break
            else:
                played_cards.add_card(slot.get_card())

        # You are the first player and allowed to play anything
        if played_cards.is_empty():
            card_allowed = True
        
        # First card is a trump
        elif played_cards.cards[0].color == self.trump:
            # You play trump as well
            if card.color == self.trump:
                card_allowed = True
            else:
                # You don't play trump because you don't have any except trump J
                if all((c.color != self.trump) or ((c.color == self.trump) and (c.value == '11')) for c in self.players[self.current_player].hand.cards):
                    card_allowed = True
                # You don't play trump but you actually have trump
                else:
                    card_allowed = False

        # First card is not a trump
        else:
            # You play the same color as the first card
            if card.color == played_cards.cards[0].color:
                card_allowed = True
                
            # You play trump
            elif card.color == self.trump:
                # No other trump has been played
                if all(c.color != self.trump for c in played_cards.cards):
                    card_allowed = True
                # At least one other trump has been played (but the first card is not a trump)
                else:
                    #You only have trump on your hand
                    if all(c.color == self.trump for c in self.players[self.current_player].hand.cards):
                        card_allowed = True
                    else:
                        # Is your trump the highest? Check for "Undertrumpfe"
                        if any(c.value == '11' and c.color == self.trump for c in played_cards.cards):
                            card_allowed = False
                        elif any(c.value == '9' and c.color == self.trump for c in played_cards.cards) and card.value != '11':
                            card_allowed = False
                        elif card.value == '11':
                            card_allowed = True
                        elif card.value == '9' and not any(c.value == '11' and c.color == self.trump for c in played_cards.cards): 
                            card_allowed = True
                        elif any(int(c.value) > int(card.value) and c.color == self.trump for c in played_cards.cards):
                            card_allowed = False
                        else:
                            card_allowed = True
            
            # You play not the same color and it also isn't trump
            else:
                # You don't have a card of the appropriate color
                if all(c.color != played_cards.cards[0].color for c in self.players[self.current_player].hand.cards):
                    card_allowed = True
                # You do have a card of the appropriate color
                else:
                    card_allowed = False

        return card_allowed


    def make_trump(self, trump, player=None):
        if player is not None:
            if player != self.starting_player:
                return "You are not allowed to define trump"

        valid_trump = ['E', 'H', 'K', 'P', 'unde', 'obe', 'slalom_obe', 'slalom_unde']

        if self.state == 'define_trump' and trump in valid_trump:
            self.state = 'play'
            self.trump = trump
            return "Trump set"

        elif self.state == 'play':
            return f"Trump is already defined as {trump}"

        else:
            return f"{trump} is not a valid trump"

    def process_stich(self):
        # find the winning cards in table.slots and add the cards to the right Player.stiche
        stich, winning_player = self.empty_slots_and_find_winner()

        self.current_player = winning_player
        self.starting_player = winning_player

        self.number_of_played_stiche += 1
        self.players[winning_player].stiche.add_cards(stich)    

        if self.finished():
            self.players[winning_player].stiche.last_stich = True
            self.state = 'round_finished'
        else:
            self.state = "play"

    def empty_slots_and_find_winner(self):
        stich = CardCollection()
        player_names = []

        first_card_idx = self.find_idx_of_first_card()
        player_names_fromOrderedDict = list(self.players.keys())
        number_of_players = len(player_names_fromOrderedDict)

        for i in range(number_of_players):
            index = (first_card_idx + i) % number_of_players
            player_names.append(player_names_fromOrderedDict[index])
            slot = self.table.slots[player_names_fromOrderedDict[index]]
            stich.add_card(slot.pop_card())
        
    
        if self.trump == 'slalom_obe':
            if self.number_of_played_stiche % 2 == 0:
                trump_stich = 'obe'
            else:
                trump_stich = 'unde'
        
        elif self.trump == 'slalom_unde':
            if self.number_of_played_stiche % 2 == 0:
                trump_stich = 'unde'
            else:
                trump_stich = 'obe'

        else:
            trump_stich = self.trump


        highest_trump = 0
        highest_non_trump = 0

        first_card_color = stich.cards[0].color


        for idx, c in enumerate(stich.cards):
            # Check for trump J
            if c.color == trump_stich and c.value == '11':
                winning_idx = idx
                break
            # Check for trump 9, ensure that all other cards except trump J are worse by setting hightest_trump = highest_non_trump = 100
            elif c.color == trump_stich and c.value == '9':
                winning_idx = idx
                highest_trump = 100
                highest_non_trump = 100
                continue
            # Check for highest trump, ensure that non-trump cards are worse by setting highest_non_trump = 100
            elif c.color == trump_stich and int(c.value) > highest_trump:
                highest_trump = int(c.value)
                highest_non_trump = 100
                winning_idx = idx
                continue
            # Check for lowest card in unde
            elif trump_stich == 'unde' and c.color == first_card_color and 100 - int(c.value) > highest_non_trump:
                highest_non_trump = 100 - int(c.value)
                winning_idx = idx
                continue
            # Check for highest card in obe or if no trump has been played
            elif c.color == first_card_color and int(c.value) > highest_non_trump:
                highest_non_trump = int(c.value)
                winning_idx = idx
                continue
            else:
                continue
        
        winning_player_name = player_names[winning_idx]

        return stich, winning_player_name

    def count_points(self):
        points_per_player = dict()
        for player in self.players.keys():
            points_per_player[player] = self.players[player].stiche.count(mode = self.mode, trump = self.trump)
        
        return points_per_player


class Table:
    def __init__(self, mode, players):
        self.mode = mode
        self.stack = Stack()

        slots = dict()
        for player in players:
            slots[player] = Slot()
        
        self.slots = slots

    def get_cards(self):
        cards = dict()
        for player in self.slots.keys():
            card_value = str(self.slots[player].card)
            if card_value == 'None':
                cards[player] = None
            else:
                cards[player] = card_value

        return cards


class Slot:
    def __init__(self, card=None):
        self.card = card

    def set_card(self, card):
        self.card = card

    def get_card(self):
        return self.card

    def pop_card(self):
        card = self.card
        self.card = None
        return card


class Player:
    def __init__(self, name):
        self.name = name
        self.hand = Hand()
        self.stiche = Stiche()

    def __str__(self):
        return self.name


class Card:
    def __init__(self, color, value):
        self.color = color
        self.value = value

    def __str__(self):
        string = f'{self.color}/{self.value}'
        return string

class CardCollection:
    def __init__(self, cards=None):
        if cards is None:
            self.cards = []
        else:
            self.cards = cards

    def __str__(self):

        string = '['
        for card in self.cards:
            string += str(card) + ','
        string += ']'

        return string
    
    def is_empty(self):
        return self.cards == []

    def get_cards(self):
        return [str(c) for c in self.cards]

    def add_card(self, card):
        self.cards.append(card)

    def add_cards(self, card_collection):
        self.cards.extend(card_collection.cards)

    def remove_card(self, card):
        self.cards.remove(card)

    def add_card_from_string(self, card_string):
        color, value = card_string.split("/")
        self.cards.append(Card(color, value))
    
    def remove_card_from_string(self, card_value):
        for card in self.cards:
            if str(card) == card_value:
                self.cards.remove(card)
                return card

        #return None if Card is not in Card Collection
        return None
    
    def remove_all(self):
        self.cards = []

    def sort_cards(self, reverse=False):
        colors = []
        for card in self.cards:
            colors.append(card.color)

        # Define Boolean masks for the four colors
        # Ensure that black and red cards alternate (if possible)
        msk = []
        color_symb = ['P', 'E', 'K', 'H']
        for cs in color_symb:
            msk.append([c == cs for c in colors])

        # No K's
        if any(c == 'E' for c in colors) and not any(c == 'K' for c in colors):
            msk[0], msk[2] = msk[2], msk[0]

        # No E's
        elif not any(c == 'E' for c in colors) and any(c == 'K' for c in colors):
            msk[1], msk[3] = msk[3], msk[1]

        sorted_card_collection = CardCollection()

        # Iterate over the four colors
        for i in range(len(color_symb)):
            cards_per_color = [self.cards[m] for m in range(len(self.cards)) if msk[i][m]]
            values = [int(c.value) for c in cards_per_color]

            # List of indices of cards sorted by their value
            indices = sorted(range(len(values)), key = lambda k: values[k])

            # Iterate over all cards of a particular color
            for j in range(len(indices)):
                sorted_card_collection.add_card(cards_per_color[indices[j]])  


        if reverse:
            sorted_card_collection.revert_order()

        
        return sorted_card_collection

    def revert_order(self): 
        # For the scrubs who order their cards in a weird way
        self.cards.reverse()

    def check_wiis(self, wiis, trump, mode, leading_card = None): 
        # Check if the player has the cards of the Wiis he announced
        if wiis != 'vierneuni' and wiis != 'vierbuure' and wiis != 'stoeck' and leading_card == None:
            return 'A leading card is needed but has not yet been indicated.'
        
        elif wiis == 'vierneuni' and wiis == 'vierbuure' and wiis == 'stoeck' and leading_card != None:
            return 'A leading card has been indicated although it is not needed.'
        
        else:
            lc_value = leading_card.value
            lc_color = leading_card.color
            colors = ['P', 'E', 'H', 'K']
            wiisCorrect = True

            Nblatt_dict = {'dreiblatt': 3,
            'vierblatt': 4,
            'fuenfblatt': 5,
            'sechsblatt': 6,
            'siebeblatt': 7,
            'achtblatt': 8,
            'neunblatt': 9}

            if wiis == 'viergliichi':
                wiispoints = 100
                for color in colors:
                    if any((c.value == lc_value and c.color == color)  for c in self.cards):
                        continue
                    else:
                        wiisCorrect = False
                        break                
                    

            elif wiis == 'vierneuni':
                wiispoints = 150
                for color in colors:
                    if any((c.value == '9' and c.color == color)  for c in self.cards):
                        continue
                    else:
                        wiisCorrect = False
                        break                
                    

            elif wiis == 'vierbuure':
                wiispoints = 200
                for color in colors:
                    if any((c.value == '11' and c.color == color)  for c in self.cards):
                        continue
                    else:
                        wiisCorrect = False
                        break


            elif wiis == 'stoeck':
                wiispoints = 20
                if not any((c.value == '13' and c.color == trump) for c in self.cards) and any((c.value == '12' and c.color == trump) for c in self.cards):
                    wiisCorrect = False
        
                

            else:
                N = Nblatt_dict[wiis]
                if N == 3:
                    wiispoints = 20
                else:
                    wiispoints = (N-3) * 50

                for i in range(N):
                    needed_value = str(int(lc_value) - i)
                    if any((c.value == needed_value and c.color == lc_color) for c in self.cards):
                        continue
                    else:
                        wiisCorrect = False
                        break
            
            return wiisCorrect, wiispoints
            



class Stack(CardCollection):
    def __init__(self):
        cards = []

        colors = ['P', 'E', 'H', 'K']
        values = ['6', '7', '8', '9', '10', '11', '12', '13', '14']
        
        for c in colors:
            for v in values:
                cards.append(Card(c, v))
        

        self.cards = self.shuffle(cards)
    
    @staticmethod
    def shuffle(card_list):
        random.shuffle(card_list)
        return card_list
        
    
    def draw(self, number_of_cards):
        # draw a card from the stack
        drawn_cards = CardCollection()
        for _ in range(number_of_cards): 
            drawn_cards.add_card(self.cards.pop(0))

        return drawn_cards

class Hand(CardCollection):
    def __init__(self, cards = None):

        if cards is None:
            self.cards = []
        else:
            self.cards = cards

        super().__init__(cards)

class Stiche(CardCollection):
    def __init__(self):
        super().__init__()
        self.last_stich = False

    def count(self, mode, trump):
        # count the points in the Stiche of the player 
        # Non-trump colors when a trump is a color
        points_dict_regular = {'6': 0, '7': 0, '8': 0, '9': 0, '10': 10,
        '11': 2, '12': 3, '13': 4, '14': 11}
        # Trump color
        points_dict_trump = {'6': 0, '7': 0, '8': 0, '9': 14, '10': 10,
        '11': 20, '12': 3, '13': 4, '14': 11}
        # Obe
        points_dict_obe = {'6': 0, '7': 0, '8': 8, '9': 0, '10': 10,
        '11': 2, '12': 3, '13': 4, '14': 11}
        # Unde
        points_dict_unde = {'6': 11, '7': 0, '8': 8, '9': 0, '10': 10,
        '11': 2, '12': 3, '13': 4, '14': 0}

        if trump == 'obe' or trump == 'slalom_obe':
            points_dict = points_dict_obe
        
        elif trump == 'unde' or trump == 'slalom_unde':
            points_dict = points_dict_unde
        
        else:
            points_dict = points_dict_regular

        count = 0
        for c in self.cards:
            # If a color is trump, have a separate dictionary for cards with that color
            if c.color == trump:
                count += points_dict_trump[c.value]
            else:
                count += points_dict[c.value]

        # Check if the player won the last stich for five bonus points
        if self.last_stich:
            count += 5
        """
        if mode['multiplicator'] == '/O/U/Sx3':
            if trump == 'P' or trump == 'K':
                count *= 2
            elif trump == 'obe' or trump == 'slalom_obe' or trump == 'unde' or trump == 'slalom_unde':
                count *= 3
        """

        return count

class SidiRound(Round):

    def make_trump(self, trump, player):
        valid_trump = ['E', 'H', 'K', 'P', 'unde', 'obe', 'slalom_obe', 'slalom_unde']

        if self.state == 'define_trump' and trump in valid_trump:
            self.state = 'play'
            self.trump = trump

            self.starting_player = player
            self.current_player = player
            return "Trump set"

        elif self.state == 'play':
            return f"Trump is already defined as {trump}"

        else:
            return f"{trump} is not a valid trump"

class ZweierjassRound(Round):
    def __init__(self, mode, players, starting_player_round):
        self.state = "define_trump"
        self.mode = mode

        self.trump = None

        self.table = Table(mode, players)
        self.number_of_played_stiche = 0

        players_dict = OrderedDict()
        for player in players:
            players_dict[player] = Player(player)

        for player in players_dict.keys():
            players_dict[player].hand.add_cards(self.table.stack.draw(9))

        self.players = players_dict

        self.current_player = starting_player_round
        self.starting_player = starting_player_round

        self.make_trump()



    def make_trump(self):
        valid_trump = ['E', 'H', 'K', 'P', 'unde', 'obe', 'slalom_obe', 'slalom_unde']

        lowest_stack_card = self.table.stack.cards[-1]
        
        if lowest_stack_card.value == '6':
            trump = 'unde'
        elif lowest_stack_card.value == '10':
            trump = self.decide_which_slalom()
        elif lowest_stack_card.value == '14':
            trump = 'obe'
        else:
            trump = self.table.stack.cards[-1].color

        if self.state == 'define_trump' and trump in valid_trump:
            self.state = 'play'
            self.trump = trump
            return "Trump set"

        elif self.state == 'play':
            return f"Trump is already defined as {trump}"

        else:
            return f"{trump} is not a valid trump"

    def decide_which_slalom(self, trump='slalom_obe'):
        valid = ['slalom_obe', 'slalom_unde']
        if trump in valid:
            return trump
        else:
            return f"{trump} is not a valid trump, you can only choose slalom"

    def process_stich(self):
        # find the winning cards in table.slots and add the cards to the right Player.stiche
        stich, winning_player = self.empty_slots_and_find_winner()

        self.current_player = winning_player
        self.starting_player = winning_player

        self.number_of_played_stiche += 1
        self.players[winning_player].stiche.add_cards(stich)   

        # Draw a new card from the stack in the right order
        if not self.table.stack.is_empty():
            player_names_fromOrderedDict = list(self.players.keys())
            number_of_players = len(player_names_fromOrderedDict)
            winning_player_idx = player_names_fromOrderedDict.index(winning_player)

            for i in range(number_of_players):
                index = (winning_player_idx + i) % number_of_players
                player_name = player_names_fromOrderedDict[index]
                self.players[player_name].hand.add_cards(self.table.stack.draw(1))

        if self.finished():
            self.players[winning_player].stiche.last_stich = True
            self.state = 'round_finished'
        else:
            self.state = "play"



"""

Schieber = {'Round_class': Round,
'N_players': 4,
'Mode': 'O/U/S'
'Multiplicators': '1x',
'Wiis': 'Everything',
'Stoeck': 'Beginning',
'Starting_player': 'E10',
'Goal_mode': 'Points',
'Goal': 1000,
'Goal_order': 'StoeckWiisStich'}
"""
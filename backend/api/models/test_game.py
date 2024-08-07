import unittest

import game

class TestGame(unittest.TestCase):
    gm = game.Game(players=['player1','player2'])

    def test_string(self):
        gm = game.Game(players=['player1','player2'])
        gm_string = "Game: 1 with players: ['player1', 'player2']\nMode: default\tState: joining"

        self.assertEqual(str(gm), gm_string)

    def test_add_player(self):
        gm = game.Game(players=['player1','player2'])
        gm.add_player('player3')
        self.assertEqual(gm.players, ['player1','player2', 'player3'])
    
    def test_start_game(self):
        gm = game.Game(players=['player1','player2', 'Fritz', 'Franz'])
        teams = {
            'bots': ['player2', 'player1'],
            'Päpple': ['Fritz', 'Franz']
        }
        gm.start_game(teams)

        self.assertEqual(gm.state, 'playing')
        self.assertEqual(gm.sorted_players, ['player2', 'Fritz', 'player1', 'Franz'])
        self.assertEqual(gm.score, {'bots': 0, 'Päpple': 0})
        self.assertEqual(gm.starting_player, 'player2')
        assert isinstance(gm.current_round, game.Round)

    def test_add_to_score(self):
        gm = game.Game(players=['player1','player2', 'Fritz', 'Franz'])
        teams = {
            'bots': ['player2', 'player1'],
            'Päpple': ['Fritz', 'Franz']
        }
        gm.start_game(teams)
        points_per_player = {
            'player1': 30,
            'player2': 2,
            'Fritz': 60,
            'Franz': 13
        }

        gm.add_to_score(points_per_player)

        self.assertEqual(gm.score, {'bots': 32, 'Päpple': 73})

    def test_update_game_when_round_finished(self):
        gm = game.Game(players=['player1','player2', 'Fritz', 'Franz'])
        teams = {
            'bots': ['player2', 'player1'],
            'Päpple': ['Fritz', 'Franz']
        }
        gm.start_game(teams)

        for player in gm.current_round.players.values():
            player.hand = game.Hand()

        self.assertTrue(gm.current_round.finished())


class TestRound(unittest.TestCase):
    def test_play_card(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2'], starting_player_round='p2')
        rnd.make_trump("P")
        rnd.players['p2'].hand.add_card(game.Card('P', '12'))

        answer = rnd.play_card('p2', 'P/12')

        self.assertEqual(answer, "Card played")
        self.assertEqual(str(rnd.table.slots['p2'].get_card()), 'P/12')

    def test_play_card_wrong_player(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2'], starting_player_round='p2')
        rnd.make_trump("P")
        rnd.players['p2'].hand.add_card(game.Card('P', '12'))

        answer = rnd.play_card('p1', 'P/12')

        self.assertEqual(answer, "It's not your turn.")
    
    def test_count_stiche_trumpf(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2'], starting_player_round='p2')
        rnd.make_trump("P")

        rnd.players['p2'].stiche.add_card(game.Card('P', '11'))
        rnd.players['p2'].stiche.add_card(game.Card('P', '9'))
        rnd.players['p2'].stiche.add_card(game.Card('E', '13'))
        rnd.players['p2'].stiche.add_card(game.Card('E', '14'))
        rnd.players['p2'].stiche.add_card(game.Card('E', '9'))
        rnd.players['p2'].stiche.add_card(game.Card('E', '6'))

        count_result = rnd.count_points()

        points_p1 = 0
        points_p2 = 20 + 14 + 4 + 11 + 0 + 0

        self.assertEqual(count_result['p1'], points_p1)
        self.assertEqual(count_result['p2'], points_p2)

    def test_check_card_allowed_first_player(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2'], starting_player_round='p2')
        rnd.make_trump("P")

        card = game.Card(color = 'P', value = '12')

        allowed = rnd.check_card_allowed(card)

        self.assertTrue(allowed)

    def test_check_card_allowed_trumpf_usgspielt_second_player_halted_nid_lej(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p2'
        rnd.table.slots['p1'].card = game.Card(color = 'P', value = '12')


        hand_card_1 = game.Card(color = 'P', value = '10')
        hand_card_2 = game.Card(color = 'H', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'E', value = '8')

        allowed = rnd.check_card_allowed(card)

        self.assertFalse(allowed)

    def test_check_card_allowed_trumpf_usgspielt_second_player_halted_nid_lej_abr_het_nume_trumpfbuur(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p2'
        rnd.table.slots['p1'].card = game.Card(color = 'P', value = '12')


        hand_card_1 = game.Card(color = 'P', value = '11')
        hand_card_2 = game.Card(color = 'H', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'E', value = '8')

        allowed = rnd.check_card_allowed(card)

        self.assertTrue(allowed)

    def test_check_card_allowed_trumpf_usgspielt_second_player_halted_nid_lej_abr_het_ke_trumpf(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p2'
        rnd.table.slots['p1'].card = game.Card(color = 'P', value = '12')


        hand_card_1 = game.Card(color = 'E', value = '11')
        hand_card_2 = game.Card(color = 'H', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'E', value = '8')

        allowed = rnd.check_card_allowed(card)

        self.assertTrue(allowed)

    def test_check_card_allowed_ke_trumpf_usgspielt_second_player_halted_lej(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p2'
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')


        hand_card_1 = game.Card(color = 'E', value = '11')
        hand_card_2 = game.Card(color = 'H', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'E', value = '8')

        allowed = rnd.check_card_allowed(card)

        self.assertTrue(allowed)

    def test_check_card_allowed_ke_trumpf_usgspielt_second_player_spielt_trump(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p2'
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')


        hand_card_1 = game.Card(color = 'E', value = '11')
        hand_card_2 = game.Card(color = 'H', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'P', value = '8')

        allowed = rnd.check_card_allowed(card)

        self.assertTrue(allowed)

    def test_check_card_allowed_ke_trumpf_usgspielt_second_player_spielt_trumpf_third_player_hett_nume_trumpf(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2', 'p3'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p3'
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')
        rnd.table.slots['p2'].card = game.Card(color = 'P', value = '10')

        hand_card_1 = game.Card(color = 'P', value = '11')
        hand_card_2 = game.Card(color = 'P', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'P', value = '8')

        allowed = rnd.check_card_allowed(card)

        self.assertTrue(allowed)

    def test_check_card_allowed_ke_trumpf_usgspielt_second_player_spielt_trumpfbuur_third_player_undertrumpft(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2', 'p3'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p3'
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')
        rnd.table.slots['p2'].card = game.Card(color = 'P', value = '11')

        hand_card_1 = game.Card(color = 'E', value = '11')
        hand_card_2 = game.Card(color = 'P', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'P', value = '8')

        allowed = rnd.check_card_allowed(card)

        self.assertFalse(allowed)

    def test_check_card_allowed_ke_trumpf_usgspielt_second_player_spielt_nell_third_player_undertrumpft(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2', 'p3'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p3'
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')
        rnd.table.slots['p2'].card = game.Card(color = 'P', value = '9')

        hand_card_1 = game.Card(color = 'E', value = '11')
        hand_card_2 = game.Card(color = 'P', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'P', value = '8')

        allowed = rnd.check_card_allowed(card)

        self.assertFalse(allowed)

    def test_check_card_allowed_ke_trumpf_usgspielt_second_player_spielt_trumpf_third_player_spielt_trumpfbuur(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2', 'p3'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p3'
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')
        rnd.table.slots['p2'].card = game.Card(color = 'P', value = '10')

        hand_card_1 = game.Card(color = 'E', value = '11')
        hand_card_2 = game.Card(color = 'P', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'P', value = '11')

        allowed = rnd.check_card_allowed(card)

        self.assertTrue(allowed)

    def test_check_card_allowed_ke_trumpf_usgspielt_second_player_spielt_trumpf_third_player_spielt_nell(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2', 'p3'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p3'
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')
        rnd.table.slots['p2'].card = game.Card(color = 'P', value = '10')

        hand_card_1 = game.Card(color = 'E', value = '11')
        hand_card_2 = game.Card(color = 'P', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'P', value = '9')

        allowed = rnd.check_card_allowed(card)

        self.assertTrue(allowed)

    def test_check_card_allowed_ke_trumpf_usgspielt_second_player_spielt_trumpf_third_player_undertrumpft(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2', 'p3'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p3'
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')
        rnd.table.slots['p2'].card = game.Card(color = 'P', value = '10')

        hand_card_1 = game.Card(color = 'E', value = '11')
        hand_card_2 = game.Card(color = 'P', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'P', value = '8')

        allowed = rnd.check_card_allowed(card)

        self.assertFalse(allowed)


    def test_check_card_allowed_ke_trumpf_usgspielt_second_player_spielt_trumpf_third_player_uebertrumpft(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2', 'p3'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p3'
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')
        rnd.table.slots['p2'].card = game.Card(color = 'P', value = '10')

        hand_card_1 = game.Card(color = 'E', value = '11')
        hand_card_2 = game.Card(color = 'P', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'P', value = '12')

        allowed = rnd.check_card_allowed(card)

        self.assertTrue(allowed)

    def test_check_card_allowed_ke_trumpf_usgspielt_second_player_cha_nid_lej_halte(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p2'
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')


        hand_card_1 = game.Card(color = 'K', value = '11')
        hand_card_2 = game.Card(color = 'H', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'H', value = '8')

        allowed = rnd.check_card_allowed(card)

        self.assertTrue(allowed)

    def test_check_card_allowed_ke_trumpf_usgspielt_second_player_halted_nid_lej(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2'], starting_player_round='p1')
        rnd.make_trump("P")
        rnd.current_player = 'p2'
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')


        hand_card_1 = game.Card(color = 'K', value = '11')
        hand_card_2 = game.Card(color = 'E', value = '14')
        list_of_hand_cards = [hand_card_1, hand_card_2]
        hand_cards = game.Hand(cards = list_of_hand_cards)
        rnd.players[rnd.current_player].hand = hand_cards

        card = game.Card(color = 'H', value = '8')

        allowed = rnd.check_card_allowed(card)

        self.assertFalse(allowed)

    def test_empty_slots_and_find_winner(self):
        rnd = game.Round(mode='default', players = ['p1', 'p2'], starting_player_round='p2')
        rnd.make_trump("P")
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')
        rnd.table.slots['p2'].card = game.Card(color = 'P', value = '13')

        winning_player_name = rnd.empty_slots_and_find_winner()[1]

        self.assertEqual(winning_player_name, 'p2')


    def test_draw_first_card_from_stack(self):
        rnd = game.ZweierjassRound(mode='default', players = ['p1', 'p2'], starting_player_round='p2')
        rnd.trump = 'obe'
        first_card_stack = rnd.table.stack.cards[0]
        rnd.table.slots['p1'].card = game.Card(color = 'E', value = '12')
        rnd.table.slots['p2'].card = game.Card(color = 'E', value = '14')
        rnd.process_stich()



        added_hand_card = rnd.players['p2'].hand.cards[9] # Since the players do not really
        # play their cards in this test they have ten hand cards, such that
        # the newly taken card is on position 9
        self.assertEqual(added_hand_card, first_card_stack)

    
    def test_check_wiis(self):
        hand_card_1 = game.Card(color = 'P', value = '11')
        hand_card_2 = game.Card(color = 'P', value = '12')
        hand_card_3 = game.Card(color = 'P', value = '13')
        list_of_hand_cards = [hand_card_1, hand_card_2, hand_card_3]
        CC = game.CardCollection(list_of_hand_cards)

        wiisCorrect, wiispoints = CC.check_wiis('dreiblatt', trump = 'E', mode = 'default', leading_card = hand_card_3)

        self.assertTrue(wiisCorrect)
        self.assertEqual(wiispoints, 20)


if __name__ == '__main__':
    unittest.main()
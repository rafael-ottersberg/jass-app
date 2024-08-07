class NetworkStatistics:
    def __init__(self, game_id=1):
        self.game_id = game_id
        self.number_of_requests = dict()
        self.request_address = dict()


    def __str__(self):
        return "Stats"

    def save_address(self, player, address):
        if player in self.request_address.keys():
            if address not in self.request_address[player]:
                self.request_address[player].append(address)

        else:
            self.request_address[player] = [address]

    def count_request(self, player):
        if player in self.number_of_requests.keys():
            self.number_of_requests[player] += 1

        else:
            self.number_of_requests[player] = 1

    def reset(self):
        self.number_of_requests = dict()
        self.request_address = dict()
import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import axios from 'axios';
import './App.css';
import Table from './Table.js';

const apiURL = "/api"
var debug = false;

function App() {
  const [player, setPlayer] = useState("");
  const [gameState, setGameState] = useState({
    'gameState': "initialized",
    'score': {}
  })
  const [roundState, setRoundState] = useState({
    'roundState': "waiting",
    'orderedPlayers': [],
    'trump': undefined,
    'stackInfo': {},
    'handCards': [],
    'playedCards': {"": null},
    'scoreLastRound': {},
    'forceRerender': false
  })

  useInterval(() => {
    getGameState();

  }, 1000)

  useInterval(() => {
    if (player !== "") {
      getRoundState();
    }
  }, 300)

  const playCard = async (card) => {
    let request = { 
      'player': player,
      'playedCard': card
    }

    try {
      const response = await axios.put(apiURL + '/play-card', request);
      setRoundState({
        'roundState': response.data.roundState,
        'orderedPlayers': response.data.orderedPlayers,
        'trump': response.data.trump,
        'stackInfo': response.data.stackInfo,
        'handCards': response.data.hand,
        'playedCards': response.data.played,
        'scoreLastRound': response.data.scoreLastRound,
        'forceRerender': true
      });

    } catch (err) {
      setRoundState({
        'roundState': err.response.data.roundState,
        'orderedPlayers': err.response.data.orderedPlayers,
        'trump': err.response.data.trump,
        'stackInfo': err.response.data.stackInfo,
        'handCards': err.response.data.hand,
        'playedCards': err.response.data.played,
        'scoreLastRound': err.response.data.scoreLastRound,
        'forceRerender': true
      });
      alert(err.response.data.message);
    }
  }

  const addPlayer = async (player) => {
    let request = { 
      'player': player
    }

    try {
      await axios.post(apiURL + '/add-player', request);
    } catch (err) {
      alert(err.response.data.message)
    }
  }

  const defineTrump = async (trump) => {
    let request = {
      'trump': trump,
      'player': player
    }

    try {
      await axios.put(apiURL + '/define-trump', request);
    } catch (err) {
      alert(err.response.data.message);
    }
  }

  const addBonus = async (pointsPerTeam) => {
    let request = {
      'pointsPerTeam': pointsPerTeam
    }

    try {
      var response = await axios.put(apiURL + '/add-bonus-to-score', request);
      
      setGameState({
        'gameState': response.data.gameState,
        'score': response.data.score,
        'mode': response.data.mode
      });

    } catch (err) {
      alert(err.response);
    }
  }

  const rearrangeCards = async (handCards) => {
    let request = {
      'player': player,
      'handCards': handCards
    }
    try {
      const response = await axios.put(apiURL + '/rearrange-cards', request);
      setRoundState({
        'roundState': response.data.roundState,
        'orderedPlayers': response.data.orderedPlayers,
        'trump': response.data.trump,
        'stackInfo': response.data.stackInfo,
        'handCards': response.data.hand,
        'playedCards': response.data.played,
        'scoreLastRound': response.data.scoreLastRound,
        'forceRerender': true
      });
    } catch (err) {
      setRoundState({
        'roundState': err.response.data.roundState,
        'orderedPlayers': err.response.data.orderedPlayers,
        'trump': err.response.data.trump,
        'stackInfo': err.response.data.stackInfo,
        'handCards': err.response.data.hand,
        'playedCards': err.response.data.played,
        'scoreLastRound': err.response.data.scoreLastRound,
        'forceRerender': true
      });
      alert(err.response.data.message);
    }
  }

  const sortCards = async () => {
    let params = {
      'player': player
    }
    try {
      const response = await axios.get(apiURL + '/sort-cards', {'params': params});
      setRoundState({
        'roundState': response.data.roundState,
        'orderedPlayers': response.data.orderedPlayers,
        'trump': response.data.trump,
        'stackInfo': response.data.stackInfo,
        'handCards': response.data.hand,
        'playedCards': response.data.played,
        'scoreLastRound': response.data.scoreLastRound,
        'forceRerender': true
      });
    } catch (err) {
      setRoundState({
        'roundState': err.response.data.roundState,
        'orderedPlayers': err.response.data.orderedPlayers,
        'trump': err.response.data.trump,
        'stackInfo': err.response.data.stackInfo,
        'handCards': err.response.data.hand,
        'playedCards': err.response.data.played,
        'scoreLastRound': err.response.data.scoreLastRound,
        'forceRerender': true
      });
      alert(err.response);
    }
  }

  const processStich = async () => {
    try {
      await axios.get(apiURL + '/process-stich');

    } catch (err) {
      alert(err.response);
    }
  }

  const nextRound = async () => {
    try {
      await axios.get(apiURL + '/start-next-round');

    } catch (err) {
      alert(err.response);
    }
  }

  const getRoundState = async () => {
    let params = {'player': player}
    const response = await axios.get(apiURL + '/get-round-state', {'params': params});
    
    setRoundState({
      'roundState': response.data.roundState,
      'orderedPlayers': response.data.orderedPlayers,
      'trump': response.data.trump,
      'stackInfo': response.data.stackInfo,
      'handCards': response.data.hand,
      'playedCards': response.data.played,
      'scoreLastRound': response.data.scoreLastRound,
      'forceRerender': false
    });
  }

  const getGameState = async () => {
    const response = await axios.get(apiURL + '/get-game-state');
    
    setGameState({
      'gameState': response.data.gameState,
      'score': response.data.score,
      'mode': response.data.mode
    });
  }

  return (
    <div className="App">
      <div className="header-line">
        <NameSetting
          player={player}
          onSave={(name) => {
            setPlayer(name);
            addPlayer(name);
          }}
        />

        {debug ? 
          <button 
            className="button-reset-api"
            onClick={async () => {
              await axios.put(apiURL + '/reset-api', {});
            }}
          >
            Reset API
          </button>
        :null}
        
        
        
        {debug ? 
          <div>
            {roundState.roundState} {gameState.gameState}
          </div>
        :null}
        
        {(gameState.mode === 'zweier') && (roundState.stackInfo !== null) ? 
          <p>{roundState.stackInfo.lastCardStack}  Stack size: {roundState.stackInfo.stackSize}</p>
        :null
        }
        
        
        <Score score={gameState.score}/>
      </div>

      <hr/>
      <div className="table-container">
        <Table 
          player={player}
          mode={gameState.mode}
          table={roundState}
          score={gameState.score}
          onReorder={(cards) => rearrangeCards(cards)}
          onPlay={(card) => playCard(card)}
          onSort={() => sortCards()}
          onClickStichButton={() => processStich()}
          onDefineTrump={(trump) => defineTrump(trump)}
          onNextRound={() => nextRound()}
          onAddBonus={(pointsPerTeam) => {addBonus(pointsPerTeam)}}
        />
      </div>
    </div>
  );
}

function NameSetting(props) {
  const [playerValue, setPlayerValue] = useState("");

  function handleChange(event) {
    setPlayerValue(event.target.value);
  }

  const handleSubmit = (event) => {
      event.preventDefault();
      props.onSave(playerValue);
  }

  return (
    <div>
      {
        (props.player === "") ?
        <form onSubmit={handleSubmit} className="form-inline">
          <label>
            <p>
              Player name: <input value={playerValue} onChange={handleChange}/>
            </p>
          </label>
          <button className="inline-button" type="submit">Save</button>
        </form>
        :
        <p className="welcome-message">Welcome {props.player}!</p>
      }
    </div>
  )
}

function Score(props) {
  var score = [];
  for (const [key, value] of Object.entries(props.score)) {
    score.push(<p style={{'padding': '0', 'margin': 0}}><b>{key}</b>: {value}</p>)
  }
  return (
    <div className="game-score">{score}</div>
  )
}



function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}


export default App;
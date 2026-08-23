import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Table from '../Table.js';
import apiClient from '../api/client';
import { useAuth } from '../auth/AuthContext';
import useInterval from '../useInterval';

function GamePlay() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { gameId } = useParams();

  const [gameState, setGameState] = useState({
    'status': 'loading',
    'score': {},
    'mode': null,
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

  const isActive = gameState.status === 'active';

  useInterval(() => {
    getGameState();
  }, 2000)

  useInterval(() => {
    if (isActive) {
      getRoundState();
    }
  }, 300)

  const playCard = async (card) => {
    let request = {
      'playedCard': card
    }

    try {
      const response = await apiClient.put(`/games/${gameId}/play-card`, request);
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

  const defineTrump = async (trump) => {
    let request = {
      'trump': trump
    }

    try {
      await apiClient.put(`/games/${gameId}/define-trump`, request);
    } catch (err) {
      alert(err.response.data.message);
    }
  }

  const addBonus = async (pointsPerTeam) => {
    let request = {
      'pointsPerTeam': pointsPerTeam
    }

    try {
      var response = await apiClient.put(`/games/${gameId}/add-bonus-to-score`, request);

      setGameState({
        'status': response.data.status,
        'score': response.data.score,
        'mode': response.data.mode
      });

    } catch (err) {
      alert(err.response);
    }
  }

  const rearrangeCards = async (handCards) => {
    let request = {
      'handCards': handCards
    }
    try {
      const response = await apiClient.put(`/games/${gameId}/rearrange-cards`, request);
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
    try {
      const response = await apiClient.get(`/games/${gameId}/sort-cards`);
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
      await apiClient.get(`/games/${gameId}/process-stich`);

    } catch (err) {
      alert(err.response);
    }
  }

  const nextRound = async () => {
    try {
      await apiClient.get(`/games/${gameId}/start-next-round`);

    } catch (err) {
      alert(err.response);
    }
  }

  const getRoundState = async () => {
    const response = await apiClient.get(`/games/${gameId}/round-state`);

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
    try {
      const response = await apiClient.get(`/games/${gameId}`);
      setGameState({
        'status': response.data.status,
        'score': response.data.score,
        'mode': response.data.mode
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        navigate('/');
      }
    }
  }

  const giveUp = async () => {
    if (!window.confirm('Spiel wirklich aufgeben?')) {
      return;
    }
    try {
      await apiClient.post(`/games/${gameId}/abandon`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Aufgeben fehlgeschlagen');
    }
  }

  return (
    <div className="App">
      <div className="header-line">
        <p className="welcome-message">
          Willkommen {auth.username}!{' '}
          <button className="inline-button" onClick={() => navigate('/')}>Zur Übersicht</button>{' '}
          {isActive ? (
            <button className="inline-button" onClick={giveUp}>Aufgeben</button>
          ) : null}{' '}
          <button className="inline-button" onClick={auth.logout}>Abmelden</button>
        </p>

        {(gameState.mode === 'zweier') && (roundState.stackInfo !== null) ?
          <p>{roundState.stackInfo.lastCardStack}  Stack size: {roundState.stackInfo.stackSize}</p>
        :null
        }

        <Score score={gameState.score}/>
      </div>

      <hr/>
      {isActive ? (
        <div className="table-container">
          <Table
            player={auth.username}
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
      ) : (
        <p>{gameState.status === 'loading' ? 'Lade Spiel...' : `Dieses Spiel ist nicht (mehr) aktiv (${gameState.status}).`}</p>
      )}
    </div>
  );
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

export default GamePlay;

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Table from '../Table.js';
import apiClient from '../api/client';
import { useAuth } from '../auth/AuthContext';
import useInterval from '../useInterval';

function GamePlay() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { gameId } = useParams();

  const emptyGameState = {
    'status': 'loading',
    'score': {},
    'mode': null,
    'result': null,
    'rematchGameId': null,
    'rematchAcceptedBy': [],
    'participants': [],
  }
  const [gameState, setGameState] = useState(emptyGameState)
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

  // a "Revanche" navigates from one game to the next within this view
  useEffect(() => {
    setGameState(emptyGameState);
    getGameState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

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
        'mode': response.data.mode,
        'result': response.data.result,
        'rematchGameId': response.data.rematchGameId,
        'rematchAcceptedBy': response.data.rematchAcceptedBy,
        'participants': response.data.participants,
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        navigate('/');
      }
    }
  }

  const rematch = async () => {
    try {
      const response = await apiClient.post(`/games/${gameId}/rematch`);
      navigate(`/games/${response.data.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Revanche fehlgeschlagen');
    }
  }

  const skipRound = async () => {
    if (!window.confirm('Runde überspringen? Die Karten werden neu verteilt, es werden keine Punkte gezählt.')) {
      return;
    }
    try {
      await apiClient.put(`/games/${gameId}/skip-round`);
    } catch (err) {
      alert(err.response?.data?.message || 'Runde überspringen fehlgeschlagen');
    }
  }

  const congratulate = async () => {
    if (!window.confirm('Dem anderen Team gratulieren? Dein Team gilt damit als Verlierer und das Spiel wird beendet.')) {
      return;
    }
    try {
      await apiClient.post(`/games/${gameId}/congratulate`);
      // stay here: the game view now shows the result and the Revanche button
      getGameState();
    } catch (err) {
      alert(err.response?.data?.message || 'Gratulieren fehlgeschlagen');
    }
  }

  return (
    <div className="App">
      <div className="header-line">
        <p className="welcome-message">
          Willkommen {auth.username}!{' '}
          <button className="inline-button" onClick={() => navigate('/')}>Zur Übersicht</button>{' '}
          {isActive ? (
            <>
              <button className="inline-button" onClick={congratulate}>Gratulieren</button>{' '}
              {roundState.roundState !== 'round_finished' ? (
                <button className="inline-button" onClick={skipRound}>Runde überspringen</button>
              ) : null}
            </>
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
        <GameNotActive gameState={gameState} onRematch={rematch}/>
      )}
    </div>
  );
}

function GameNotActive({ gameState, onRematch }) {
  if (gameState.status === 'loading') {
    return <p>Lade Spiel...</p>;
  }

  if (gameState.status === 'lobby') {
    const waitingFor = gameState.participants
      .filter((p) => p.status !== 'accepted')
      .map((p) => p.username);
    return (
      <p>
        Warte auf Mitspieler:innen
        {waitingFor.length > 0 ? `: ${waitingFor.join(', ')}` : ''}...
      </p>
    );
  }

  if (gameState.status === 'finished' && gameState.result) {
    const requestedBy = gameState.rematchAcceptedBy || [];
    return (
      <div>
        <p><b>{gameState.result === 'won' ? 'Gewonnen!' : 'Verloren.'}</b></p>
        {requestedBy.length > 0 ? (
          <p>Revanche angefragt von {requestedBy.join(', ')}</p>
        ) : null}
        <button className="inline-button" onClick={onRematch}>
          {requestedBy.length > 0 ? 'Revanche annehmen' : 'Revanche'}
        </button>
      </div>
    );
  }

  return <p>Dieses Spiel ist nicht (mehr) aktiv ({gameState.status}).</p>;
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

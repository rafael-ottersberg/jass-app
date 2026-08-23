import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import apiClient from '../api/client';
import { useAuth } from '../auth/AuthContext';
import useInterval from '../useInterval';

const MODE_LABEL = {
  default: 'Schieber',
  sidi: 'Sidi Barrani',
  zweier: 'Zweier',
};

const STATUS_LABEL = {
  lobby: 'Warten auf Zusagen',
  active: 'Läuft',
  finished: 'Beendet',
  cancelled: 'Abgesagt',
  abandoned: 'Aufgegeben',
};

const PARTICIPANT_STATUS_LABEL = {
  invited: 'Eingeladen',
  accepted: 'Zugesagt',
  declined: 'Abgesagt',
};

export default function GameList() {
  const auth = useAuth();
  const [games, setGames] = useState([]);
  const [inviteLink, setInviteLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const fetchGames = useCallback(async () => {
    try {
      const response = await apiClient.get('/games');
      setGames(response.data);
    } catch (err) {
      // interceptor handles 401; ignore other transient errors on the polling loop
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useInterval(fetchGames, 3000);

  const respond = async (gameId, accept) => {
    setError(null);
    try {
      await apiClient.post(`/games/${gameId}/respond`, { accept });
      fetchGames();
    } catch (err) {
      setError(err.response?.data?.message || 'Aktion fehlgeschlagen');
    }
  };

  const cancelGame = async (gameId) => {
    setError(null);
    try {
      await apiClient.post(`/games/${gameId}/cancel`);
      fetchGames();
    } catch (err) {
      setError(err.response?.data?.message || 'Aktion fehlgeschlagen');
    }
  };

  const deleteGame = async (gameId) => {
    setError(null);
    try {
      await apiClient.delete(`/games/${gameId}`);
      fetchGames();
    } catch (err) {
      setError(err.response?.data?.message || 'Aktion fehlgeschlagen');
    }
  };

  const abandonGame = async (gameId) => {
    setError(null);
    try {
      await apiClient.post(`/games/${gameId}/abandon`);
      fetchGames();
    } catch (err) {
      setError(err.response?.data?.message || 'Aktion fehlgeschlagen');
    }
  };

  const generateInviteCode = async () => {
    setError(null);
    setCopied(false);
    try {
      const response = await apiClient.post('/invite-codes');
      setInviteLink(`${window.location.origin}/register?code=${encodeURIComponent(response.data.code)}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Einladungscode konnte nicht erstellt werden');
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch (err) {
      // clipboard access can be denied by the browser; the link is still shown to copy manually
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography component="h1" variant="h5">
            Willkommen {auth.username}!
          </Typography>
          <Button onClick={auth.logout}>Abmelden</Button>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Button component={Link} to="/games/new" variant="contained">
            Neues Spiel
          </Button>
          <Button onClick={generateInviteCode} variant="outlined">
            Freund:in einladen
          </Button>
        </Stack>

        {inviteLink ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2">
              Einladungslink (mit einer Person teilen, die sich registrieren möchte):
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                <b>{inviteLink}</b>
              </Typography>
              <Button size="small" onClick={copyInviteLink}>
                {copied ? 'Kopiert!' : 'Kopieren'}
              </Button>
            </Stack>
          </Box>
        ) : null}

        {error ? (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : null}

        {games.length === 0 ? (
          <Typography variant="body2">Noch keine Spiele. Starte ein neues Spiel oben.</Typography>
        ) : null}

        <Stack spacing={2}>
          {games.map((game) => {
            const mine = game.participants.find((p) => p.username === auth.username);
            return (
              <Card key={game.id} variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6">{MODE_LABEL[game.mode] || game.mode}</Typography>
                    <Chip size="small" label={STATUS_LABEL[game.status] || game.status} />
                  </Stack>
                  {game.participants.map((p) => (
                    <Typography key={p.username} variant="body2">
                      {p.team}: {p.username} ({PARTICIPANT_STATUS_LABEL[p.status] || p.status})
                    </Typography>
                  ))}
                </CardContent>
                <CardActions>
                  {game.status === 'lobby' && mine?.status === 'invited' ? (
                    <>
                      <Button size="small" onClick={() => respond(game.id, true)}>Annehmen</Button>
                      <Button size="small" onClick={() => respond(game.id, false)}>Ablehnen</Button>
                    </>
                  ) : null}
                  {game.status === 'lobby' && game.isCreator ? (
                    <Button size="small" color="error" onClick={() => cancelGame(game.id)}>Absagen</Button>
                  ) : null}
                  {game.status === 'active' ? (
                    <Button size="small" component={Link} to={`/games/${game.id}`}>Öffnen</Button>
                  ) : null}
                  {game.status === 'active' && mine ? (
                    <Button size="small" color="error" onClick={() => abandonGame(game.id)}>Aufgeben</Button>
                  ) : null}
                  {game.status !== 'active' && game.isCreator ? (
                    <Button size="small" color="error" onClick={() => deleteGame(game.id)}>Löschen</Button>
                  ) : null}
                </CardActions>
              </Card>
            );
          })}
        </Stack>
      </Box>
    </Container>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import apiClient from '../api/client';

const MODES = [
  { value: 'default', label: 'Schieber (4 Spieler:innen)', teamSize: 2 },
  { value: 'sidi', label: 'Sidi Barrani (4 Spieler:innen)', teamSize: 2 },
  { value: 'zweier', label: 'Zweier (2 Spieler:innen)', teamSize: 1 },
];

export default function StartGame() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [mode, setMode] = useState('default');
  const [teamNameA, setTeamNameA] = useState('Team A');
  const [teamNameB, setTeamNameB] = useState('Team B');
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const teamSize = MODES.find((m) => m.value === mode).teamSize;

  useEffect(() => {
    apiClient.get('/users').then((response) => {
      setUsers(response.data.map((u) => u.username));
    });
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    const newTeamSize = MODES.find((m) => m.value === newMode).teamSize;
    setTeamA((current) => current.slice(0, newTeamSize));
    setTeamB((current) => current.slice(0, newTeamSize));
  };

  const overlapping = teamA.filter((name) => teamB.includes(name));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const nameA = teamNameA.trim();
    const nameB = teamNameB.trim();

    if (!nameA || !nameB) {
      setError('Beide Teams brauchen einen Namen');
      return;
    }
    if (nameA === nameB) {
      setError('Die Teamnamen müssen sich unterscheiden');
      return;
    }
    if (teamA.length !== teamSize || teamB.length !== teamSize) {
      setError(`Jedes Team braucht genau ${teamSize} Person${teamSize > 1 ? 'en' : ''} für diesen Modus`);
      return;
    }
    if (overlapping.length > 0) {
      setError('Eine Person kann nicht in beiden Teams sein');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/games', { mode, teams: { [nameA]: teamA, [nameB]: teamB } });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Spiel konnte nicht gestartet werden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Neues Spiel / Freunde einladen
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Modus</InputLabel>
            <Select value={mode} label="Modus" onChange={(e) => handleModeChange(e.target.value)}>
              {MODES.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            fullWidth
            label="Name Team A"
            value={teamNameA}
            onChange={(e) => setTeamNameA(e.target.value)}
            sx={{ mb: 1 }}
          />
          <PlayerPicker label="Team A" users={users} value={teamA} onChange={setTeamA} maxCount={teamSize} />

          <TextField
            size="small"
            fullWidth
            label="Name Team B"
            value={teamNameB}
            onChange={(e) => setTeamNameB(e.target.value)}
            sx={{ mb: 1 }}
          />
          <PlayerPicker label="Team B" users={users} value={teamB} onChange={setTeamB} maxCount={teamSize} />

          <Button disabled={loading} type="submit" fullWidth variant="contained" sx={{ mt: 1, mb: 2 }}>
            Einladen
          </Button>
          {error ? (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Container>
  );
}

function PlayerPicker({ label, users, value, onChange, maxCount }) {
  const atMax = value.length >= maxCount;

  return (
    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>{label} ({maxCount})</InputLabel>
      <Select
        multiple
        value={value}
        label={`${label} (${maxCount})`}
        onChange={(e) => {
          const next = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
          onChange(next.slice(0, maxCount));
        }}
        renderValue={(selected) => selected.join(', ')}
      >
        {users.map((username) => {
          const selected = value.includes(username);
          return (
            <MenuItem key={username} value={username} disabled={!selected && atMax}>
              <Checkbox checked={selected} />
              <ListItemText primary={username} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

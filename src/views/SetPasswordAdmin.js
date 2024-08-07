import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import axios from 'axios';

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {'Copyright © '}
      <Link color="inherit" href="https://camp4five.ch/">
        camp4five.ch
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function RequestPassword() {
  const [passwordSet, setPasswordSet] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  var localToken = localStorage.getItem('token');

  const handleSetPassword = (data) => {
    setError(null);
    setLoading(true);
    axios
      .get(`/api/get-user/${String(data.id)}`, {
        auth: { username: localToken, password: '' },
      })
      .then((response) => {
        var confirmed = window.confirm(
          `Passwort setzten für ${response.data.vorname} ${response.data.nachname}.`
        );
        if (confirmed) {
          axios
            .put(
              '/api/set-password-admin',
              { ...data },
              { auth: { username: localToken, password: '' } }
            )
            .then((response) => {
              setLoading(false);
              setPasswordSet(true);
              setError(null);
            })
            .catch((error) => {
              console.log(error);
              setLoading(false);
              setError(error.response.data.message);
            });
        }
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // eslint-disable-next-line no-console
    handleSetPassword({
      id: Number(data.get('id')),
      password: data.get('password'),
      passwordRepeat: data.get('repeat-password'),
    });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Neues Passwort festlegen
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="id"
            label="ID"
            type="number"
            id="id"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Passwort"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="repeat-password"
            label="Passwort wiederholen"
            type="password"
            id="repeat-password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || passwordSet}
          >
            Passwort speichern
          </Button>
          {error && (
            <>
              <small style={{ color: 'red' }}>{error}</small>
              <br />
            </>
          )}
          <br />
        </Box>
        {passwordSet && (
          <Typography>Das neue Passwort wurde gespeichert.</Typography>
        )}
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}

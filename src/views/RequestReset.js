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

export default function RequestReset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestSent, setRequestSent] = useState(false);

  const handleRequestPassword = (emailData) => {
    setError(null);
    setLoading(true);

    axios
      .put('/api/request-reset-mail', emailData)
      .then((response) => {
        setLoading(false);
        setRequestSent(true);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        setError(error.response.data.message);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // eslint-disable-next-line no-console
    handleRequestPassword({
      email: data.get('email'),
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
          Passwort neu setzten
        </Typography>

        <Typography variant="h7" style={{ textAlign: 'center' }}>
          Gib deine E-mail Adresse an damit wir dir einen Link senden können,
          damit du dein Passwort neu setzten kannst.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-mail Adresse"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || requestSent}
          >
            E-mail erhalten
          </Button>
          {error && (
            <>
              <small style={{ color: 'red' }}>{error}</small>
              <br />
            </>
          )}
          <br />
        </Box>
        {loading && (
          <Typography variant="h7" style={{ textAlign: 'center' }}>
            Warten auf Antwort...
          </Typography>
        )}
        {requestSent && (
          <Typography variant="h7" style={{ textAlign: 'center' }}>
            Wenn du dich mit der angegebenen E-mail Adresse angemeldet hast,
            wirst du von uns eine E-mail erhalten (Checke auch deinen
            Spam-Ordner).
          </Typography>
        )}
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}

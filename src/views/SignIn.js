import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { AuthContext } from '../App_template';
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

export default function SignIn() {
  const { dispatch } = React.useContext(AuthContext);
  const { state: authState } = React.useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = (credentials) => {
    setError(null);
    setLoading(true);

    axios
      .get('/api/login', { auth: credentials })
      .then((response) => {
        localStorage.setItem('token', response.data.token);
        dispatch({
          type: 'LOGIN',
          payload: response.data,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        setError('Login fehlgeschlagen');
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    handleLogin({
      username: data.get('email'),
      password: data.get('passwort'),
    });
  };

  if (!authState.isAuthenticated) {
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
            Melde dich an
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="passwort"
              label="Passwort"
              type="password"
              id="passwort"
              autoComplete="current-passwort"
            />
            <Button
              disabled={loading}
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Anmelden
            </Button>
            {error && (
              <>
                <small style={{ color: 'red' }}>{error}</small>
                <br />
              </>
            )}
            <br />
            <Grid container>
              <Grid item xs>
                <Link href="/request-password-reset" variant="body2">
                  Passwort vergessen?
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    );
  }
  return <Navigate to="/"></Navigate>;
}

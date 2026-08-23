import React, { useState } from 'react';
import { Navigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { FormInputText } from './Signup/formComponents/FormInputText';
import { FormInputCheckPw } from './Signup/formComponents/FormInputCheckPw';
import { useAuth } from '../auth/AuthContext';

export default function Register() {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const { control, handleSubmit, getValues } = useForm({
    defaultValues: {
      username: '',
      inviteCode: searchParams.get('code') || '',
      password: '',
      repeatPassword: '',
    },
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (auth.isAuthenticated) {
    return <Navigate to="/" />;
  }

  const onSubmit = async (data) => {
    setError(null);

    if (data.password !== data.repeatPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);
    try {
      await auth.register(data.username, data.password, data.inviteCode);
    } catch (err) {
      setError(err.response?.data?.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Registrieren
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 3, width: '100%' }}>
          <Box sx={{ mb: 2 }}>
            <FormInputText
              name="username"
              control={control}
              label="Spielername"
              required="Bitte gib einen Namen ein"
              minLength={{ value: 2, message: 'Mindestens 2 Zeichen' }}
              maxLength={{ value: 64, message: 'Höchstens 64 Zeichen' }}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <FormInputText
              name="inviteCode"
              control={control}
              label="Einladungscode"
              required="Du brauchst einen Einladungscode von einer bereits registrierten Person"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <FormInputCheckPw
              name="password"
              control={control}
              label="Passwort"
              required="Bitte gib ein Passwort ein"
              minLength={{ value: 8, message: 'Mindestens 8 Zeichen' }}
              inputProps={{ type: 'password' }}
              getValues={getValues}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <FormInputCheckPw
              name="repeatPassword"
              control={control}
              label="Passwort wiederholen"
              required="Bitte wiederhole dein Passwort"
              inputProps={{ type: 'password' }}
              getValues={getValues}
            />
          </Box>
          <Button disabled={loading} type="submit" fullWidth variant="contained" sx={{ mt: 1, mb: 2 }}>
            Registrieren
          </Button>
          {error ? (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          ) : null}
          <Link component={RouterLink} to="/login" variant="body2">
            Schon ein Konto? Anmelden
          </Link>
        </Box>
      </Box>
    </Container>
  );
}

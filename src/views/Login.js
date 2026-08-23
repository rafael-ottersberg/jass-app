import React, { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { FormInputText } from './Signup/formComponents/FormInputText';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const auth = useAuth();
  const { control, handleSubmit } = useForm({ defaultValues: { username: '', password: '' } });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (auth.isAuthenticated) {
    return <Navigate to="/" />;
  }

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);
    try {
      await auth.login(data.username, data.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Anmelden
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 3, width: '100%' }}>
          <Box sx={{ mb: 2 }}>
            <FormInputText name="username" control={control} label="Spielername" required="Bitte gib deinen Namen ein" />
          </Box>
          <Box sx={{ mb: 2 }}>
            <FormInputText
              name="password"
              control={control}
              label="Passwort"
              required="Bitte gib dein Passwort ein"
              inputProps={{ type: 'password' }}
            />
          </Box>
          <Button disabled={loading} type="submit" fullWidth variant="contained" sx={{ mt: 1, mb: 2 }}>
            Anmelden
          </Button>
          {error ? (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          ) : null}
          <Link component={RouterLink} to="/register" variant="body2">
            Noch kein Konto? Registrieren
          </Link>
        </Box>
      </Box>
    </Container>
  );
}

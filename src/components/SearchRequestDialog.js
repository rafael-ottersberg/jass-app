import { useCallback, useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, Snackbar } from '@mui/material';
import axios from 'axios';
import { useMatch } from 'react-router-dom';

export default function SearchRequestDialog() {
  const [searchRequest, setSearchRequest] = useState();
  const [message, setMessage] = useState('');

  const isExactMatch = !!useMatch({ path: '/load-search-request', end: true });

  const loadNextSearchRequest = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('/api/search-request/next-request', {
          auth: { username: token, password: '' },
        })
        .then((response) => {
          if (response.data?.id) {
            setSearchRequest(response.data);
          }
        })
        .catch((error) =>
          console.error('Failed to load next search request', error)
        );
    }
  }, [setSearchRequest]);

  useEffect(() => {
    const timeoutId = setTimeout(loadNextSearchRequest, 2000);
    const intervalId = setInterval(loadNextSearchRequest, 10000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [loadNextSearchRequest]);
  useEffect(() => {
    if (isExactMatch) {
      loadNextSearchRequest();
    }
  }, [isExactMatch, loadNextSearchRequest]);

  const setAnswer = (accepted) => {
    const token = localStorage.getItem('token');
    if (token) {
      const rejectMessage = 'Vielleicht beim nächsten Mal 😉';
      axios
        .post(
          '/api/search-request/answer',
          { id: searchRequest?.id, accepted },
          {
            auth: { username: token, password: '' },
          }
        )
        .then(() => {
          setSearchRequest(undefined);
          setMessage(accepted ? 'Wir freuen uns auf dich!' : rejectMessage);
        })
        .catch((error) => {
          setSearchRequest(undefined);
          if (error.toJSON().status !== 404) {
            setMessage(
              'Es gab einen Fehler beim Speichern deiner Antwort. Bitte melde dich beim Infopoint.'
            );
          }
          setMessage(
            accepted
              ? 'Deine Antwort konnte nicht gespeichert werden, da die Anfrage bereits abgelaufen war. Melde dich beim Infopoint, falls du trotzdem dabei sein möchtest.'
              : rejectMessage
          );
        });
    } else {
      setSearchRequest(undefined);
      setMessage(
        'Du bist nicht (mehr) angemeldet. Bitte melde dich zuerst an, um deine Antwort zu erfassen.'
      );
    }
  };

  return (
    <>
      <Dialog open={!!searchRequest}>
        <DialogTitle>{searchRequest?.teaser}</DialogTitle>
        <DialogContent>
          <DialogContentText>{searchRequest?.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnswer(false)}>Ablehnen</Button>
          <Button onClick={() => setAnswer(true)} autoFocus variant="contained">
            Akzeptieren
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!message}
        autoHideDuration={5000}
        onClose={() => setMessage('')}
        message={message}
      />
    </>
  );
}

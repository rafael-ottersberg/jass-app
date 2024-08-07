import React, { useEffect, useState } from 'react';
import HeaderSubpage from '../components/HeaderSubpage';
import { Button, Container, Box, Typography, TextField } from '@mui/material';
import axios from 'axios';

import SignIn from './SignIn';
import { AuthContext } from '../App_template';

export default function QuestionPanel() {
  const [questions, setQuestions] = useState([]);

  const { state: authState, dispatch: authDispatch } =
    React.useContext(AuthContext);

  const loadQuestions = async () => {
    var localToken = localStorage.getItem('token');
    if (localToken !== null) {
      axios
        .get('api/get-question-list?time=' + Date.now(), {
          auth: { username: localToken, password: '' },
        })
        .then((response) => {
          console.log(response);
          setQuestions(response.data.questions);
        })
        .catch(() => {
          authDispatch({ type: 'LOGOUT' });
        });
    }
  };

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editQuestion = (id, text) => {
    var localToken = localStorage.getItem('token');
    if (localToken !== null) {
      axios
        .put(
          `api/question/${id}`,
          { question: text },
          {
            auth: { username: localToken, password: '' },
          }
        )
        .then((response) => {
          loadQuestions();
        })
        .catch((error) =>
          alert(
            error.response.data?.message ??
              error.message ??
              'Bearbeiten fehlgeschlagen'
          )
        );
    }
  };
  const deleteQuestion = (id) => {
    if (window.confirm('Frage löschen')) {
      var localToken = localStorage.getItem('token');
      if (localToken !== null) {
        axios
          .delete(`api/question/${id}`, {
            auth: { username: localToken, password: '' },
          })
          .then((response) => {
            loadQuestions();
          })
          .catch((error) =>
            alert(
              error.response.data?.message ??
                error.message ??
                'Löschen fehlgeschlagen'
            )
          );
      }
    }
  };

  const Question = (props) => {
    const [question, setQuestion] = useState(props.text);
    return (
      <Box
        sx={{
          width: '100%',
          border: 1,
          mt: 1,
          p: 1,
          borderRadius: 2,
          wordWrap: 'break-word',
        }}
      >
        <TextField
          label="Frage:"
          variant="outlined"
          fullWidth
          sx={{ my: 1 }}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Box display="flex">
          <Typography sx={{ fontStyle: 'italic', mt: 'auto' }}>
            {props.name}
          </Typography>
          <Button
            onClick={() => {
              editQuestion(props.id, question);
            }}
            variant="outlined"
            size="small"
            sx={{ ml: 'auto', mr: 1 }}
          >
            Bearbeiten
          </Button>
          <Button
            onClick={() => {
              deleteQuestion(props.id);
            }}
            variant="outlined"
            size="small"
          >
            Löschen
          </Button>
        </Box>
      </Box>
    );
  };

  if (authState.isAuthenticated) {
    return (
      <Box
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <HeaderSubpage color="primary" />
        <Box
          sx={{
            flex: '1 1 auto',
            overflow: 'auto',
          }}
        >
          <Container maxWidth={'md'} sx={{ padding: 2 }}>
            <Typography variant="h5">Fragen bearbeiten:</Typography>
            {questions.map((question) => (
              <Question
                key={`${question.id}`}
                text={question.text}
                votes={question.votes}
                id={question.id}
                disableButton={question.disable}
                name={question.name}
              />
            ))}
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <HeaderSubpage color="primary" />
      <Box
        sx={{
          flex: '1 1 auto',
          overflow: 'auto',
        }}
      >
        <Container maxWidth={'md'} sx={{ padding: 2 }}>
          <SignIn />
        </Container>
      </Box>
    </Box>
  );
}

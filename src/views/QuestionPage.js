import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Fab from '@mui/material/Fab';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import AddIcon from '@mui/icons-material/Add';

import SignIn from './SignIn';

import axios from 'axios';

import { AuthContext } from '../App_template';
import program from '../assets/program.json';

export default function QuestionPage() {
  const [questions, setQuestions] = useState([]);
  const [askQuestionDialogOpen, setAskQuestionDialogOpen] = useState(false);

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
          let questions = filterQuestions(
            response.data.questions,
            findLastPlenum()
          );
          setQuestions(questions);
        })
        .catch(() => {
          authDispatch({ type: 'LOGOUT' });
        });
    }
  };

  const filterQuestions = (questions, lastPlenum) => {
    var filteredQuestions;
    if (lastPlenum) {
      filteredQuestions = questions.filter(
        (question) => new Date(question.time * 1000) > lastPlenum.date
      );
    } else {
      filteredQuestions = questions;
    }
    return filteredQuestions;
  };

  const findLastPlenum = () => {
    let now = new Date();
    var lastPlenum;
    for (let i = 0; i < program.program.length; i++) {
      let programPoint = program.program[i];
      programPoint.date = new Date(programPoint.time);

      if (programPoint.name.includes('Plenum') && programPoint.date < now) {
        lastPlenum = programPoint;
      }
    }
    return lastPlenum;
  };

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upvoteQuestion = (id) => {
    var localToken = localStorage.getItem('token');
    if (localToken !== null) {
      axios.put(
        'api/upvote-question',
        { questionId: id },
        {
          auth: { username: localToken, password: '' },
        }
      );
    }
  };

  const Question = (props) => {
    const [disabled, setDisabled] = useState(props.disableButton);
    const [votes, setVotes] = useState(props.votes);
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
        <Typography>{props.text}</Typography>
        <Box display="flex">
          <Typography sx={{ fontStyle: 'italic', mt: 'auto' }}>
            {props.name}
          </Typography>

          <Button
            onClick={() => {
              upvoteQuestion(props.id);
              setDisabled(true);
              setVotes(votes + 1);
            }}
            variant="outlined"
            size="small"
            disabled={disabled}
            sx={{ ml: 'auto' }}
          >
            <ThumbUpOutlinedIcon sx={{ mr: 1 }} />
            {votes}
          </Button>
        </Box>
      </Box>
    );
  };

  if (authState.isAuthenticated) {
    return (
      <Box>
        <AskQuestionDialog
          askQuestionDialogOpen={askQuestionDialogOpen}
          setAskQuestionDialogOpen={(open) => {
            setAskQuestionDialogOpen(open);
          }}
          onUpdate={() => {
            loadQuestions();
          }}
        />
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => {
            setAskQuestionDialogOpen(true);
          }}
          size="medium"
          sx={{
            position: 'fixed',
            bottom: { xs: 72, md: 30 },
            right: { xs: 16, md: 30 },
            zIndex: 900,
          }}
        >
          <AddIcon />
        </Fab>
        <Typography variant="h5">Fragen zum letzten Input:</Typography>
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
      </Box>
    );
  }

  return <SignIn></SignIn>;
}

const useFormInput = () => {
  const [value, setValue] = useState();

  const handleChange = (e) => {
    e.preventDefault();
    setValue(e.target.value);
  };
  return [
    {
      value,
      onChange: handleChange,
    },
    setValue,
  ];
};

function AskQuestionDialog(props) {
  const handleClose = () => {
    props.setAskQuestionDialogOpen(false);
  };

  const [question, setInputValue] = useFormInput();
  const [checked, setChecked] = React.useState(false);
  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const [status, setStatus] = useState('');

  function handleQuestionPost(ev) {
    ev.preventDefault();
    var localToken = localStorage.getItem('token');
    if (localToken !== null) {
      let request = {
        question: question.value,
        showName: checked,
      };
      axios
        .post(`api/question`, request, {
          auth: { username: localToken, password: '' },
        })
        .then((response) => {
          setInputValue('');
          handleClose();
          props.onUpdate();
        })
        .catch((err) => {
          setStatus(err.response.data.message);
        });
    }
  }

  return (
    <Dialog open={props.askQuestionDialogOpen} onClose={handleClose}>
      <DialogTitle>Stelle eine Frage</DialogTitle>
      <DialogContent>
        <form onSubmit={(ev) => handleQuestionPost(ev)}>
          <Input
            placeholder="Deine Frage zum letzten Input:"
            fullWidth
            multiline
            inputProps={{ ...question }}
          />
          <Box display={'flex'} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleQuestionPost}
              sx={{ mr: 2 }}
            >
              Frage posten
            </Button>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={checked} onChange={handleChange} />}
                label="Vorname anzeigen"
              />
            </FormGroup>
          </Box>
          <Typography sx={{ mt: 1 }}>{status}</Typography>
        </form>
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
}

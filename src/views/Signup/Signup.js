import React from 'react';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PersonForm from './PersonForm';
import DetailsForm from './DetailsForm';
import Review from './Review';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const classes = {
  paper: {
    marginTop: 1,
    marginBottom: 3,
    padding: {
      xs: 1,
      md: 3,
    },
  },
  stepper: {
    py: 2,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: 3,
    marginLeft: 1,
  },
  buttonContainer: {
    ml: 'auto',
    mr: 5,
  },
};

const defaultValuesPerson = {
  vorname: '',
  nachname: '',
  geburtstag: new Date(),
  password: '',
  repeatPassword: '',
  adresse: '',
  plz: '',
  ort: '',
  telefon: '',
  email: '',
};

const defaultValuesDetails = {
  angebot: '',
  einsatzort: '',
  bezirk: '',
  andererBezirk: '',
  ernaehrung: [],
  allergien: [],
  weitereAllergien: '',
  uebernachtung: [],
  bemerkungen: '',
};

const steps = ['Person', 'Details', 'Kontrolle'];

export default function Signup() {
  const [status, setStatus] = React.useState(null);
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };
  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setStatus(null);
  };

  const [dataPerson, setDataPerson] = React.useState();
  const [dataDetails, setDataDetails] = React.useState();

  const methodsPerson = useForm({ defaultValues: defaultValuesPerson });
  const methodsDetails = useForm({ defaultValues: defaultValuesDetails });

  const onSubmitPerson = (data) => {
    setDataPerson(data);
    handleNext();
  };
  const onSubmitDetails = (data) => {
    setDataDetails(data);
    handleNext();
  };

  const submitForm = () => {
    postData();
  };

  function postData() {
    setStatus('senden');

    let request = { ...dataPerson, ...dataDetails };

    var dd = String(dataPerson.geburtstag.getDate()).padStart(2, '0');
    var mm = String(dataPerson.geburtstag.getMonth() + 1).padStart(2, '0');
    var yyyy = dataPerson.geburtstag.getFullYear();

    var geburtstagString = dd + '.' + mm + '.' + yyyy;

    request.geburtstagString = geburtstagString;

    axios
      .post(`api/users`, request)
      .then((response) => {
        console.log(response);
        setStatus('');
        handleNext();
      })
      .catch((err) => {
        let error;
        if (err.response.data.message === undefined) {
          console.log(err);
          error = JSON.stringify(err.message);
        } else {
          error = err.response.data.message;
        }
        setStatus('Error: ' + error);
      });
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return <PersonForm methods={methodsPerson} />;
      case 1:
        return <DetailsForm methods={methodsDetails} />;
      case 2:
        return <Review dataPerson={dataPerson} dataDetails={dataDetails} />;
      default:
        throw new Error('Unknown step');
    }
  }

  function getNextAction(step) {
    switch (step) {
      case 0:
        return methodsPerson.handleSubmit(onSubmitPerson);
      case 1:
        return methodsDetails.handleSubmit(onSubmitDetails);
      case 2:
        return submitForm;
      default:
        throw new Error('Unknown step');
    }
  }

  return (
    <Paper sx={classes.paper}>
      <Typography component="h1" variant="h4" align="center">
        Anmeldung
      </Typography>
      <Stepper activeStep={activeStep} sx={classes.stepper}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <React.Fragment>
        {activeStep === steps.length ? (
          <React.Fragment>
            <Typography variant="h5" gutterBottom>
              Schön bist du dabei!
            </Typography>
            <Typography variant="subtitle1">
              Vielen Dank für deine Anmeldung. Wir werden dir per E-Mail eine
              Anmeldebestätigung schicken. Schaue auch in den Spam-Ordner.
            </Typography>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {getStepContent(activeStep)}
            <div sx={classes.buttonContainer}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={classes.button}>
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={getNextAction(activeStep)}
                sx={classes.button}
              >
                {activeStep === steps.length - 1
                  ? 'Anmeldung abschicken'
                  : 'Next'}
              </Button>
              {status != null ? (
                <Typography variant="h6" color="error" sx={{ m: 1, ml: 4 }}>
                  {status}
                </Typography>
              ) : (
                <React.Fragment />
              )}
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    </Paper>
  );
}

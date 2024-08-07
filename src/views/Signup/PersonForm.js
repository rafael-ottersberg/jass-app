import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { FormInputText } from './formComponents/FormInputText';
import { FormInputCheckPw } from './formComponents/FormInputCheckPw';
import { FormInputDate } from './formComponents/FormInputDate';

export default function PersonForm(props) {
  const { control, getValues } = props.methods;

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Person
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormInputText
            name="vorname"
            label="Vorname"
            control={control}
            maxLength={64}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormInputText
            name="nachname"
            label="Nachname"
            control={control}
            maxLength={64}
            required
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormInputDate
            name="geburtstag"
            label="Geburtstag"
            control={control}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormInputText
            name="password"
            label="Passwort (mind. 8)"
            control={control}
            inputProps={{ type: 'password' }}
            minLength={8}
            maxLength={64}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormInputCheckPw
            name="repeatPassword"
            label="Passwort wiederholen"
            control={control}
            inputProps={{ type: 'password' }}
            minLength={8}
            maxLength={64}
            getValues={getValues}
            required
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Adresse
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormInputText
            name="adresse"
            label="Adresse"
            control={control}
            maxLength={64}
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormInputText
            name="plz"
            label="Postleitzahl"
            control={control}
            maxLength={64}
            required
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <FormInputText
            name="ort"
            label="Ort"
            control={control}
            maxLength={64}
            required
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Kontakt
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <FormInputText
            name="telefon"
            label="Telefon"
            maxLength={64}
            control={control}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <FormInputText
            name="email"
            label="E-Mail"
            control={control}
            maxLength={64}
            inputProps={{ type: 'email' }}
            required
            pattern={
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            }
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

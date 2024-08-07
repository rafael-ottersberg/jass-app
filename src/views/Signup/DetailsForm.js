import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { FormInputButtons } from './formComponents/FormInputButtons';
import { FormInputMultiCheckbox } from './formComponents/FormInputMultiCheckbox';
import { FormInputDropdown } from './formComponents/FormInputDropdown';
import { FormInputAllergies } from './formComponents/FormInputAllergies';
import { FormInputText } from './formComponents/FormInputText';
import { bezirksListe } from './formComponents/Bezirksliste';


const uebernachtungFive = [
  {
    label: 'Ich bringe mein eigenes Zelt/Van/Wohnwagen zum Schlafen mit ',
    value: 'zelt',
  },
  {
    label: 'Ich schlafe in meinem Van/Wohnwagen',
    value: 'camper',
  },
  {
    label: 'Ich habe einen Schlafplatz bei Kollegen:innen im Zelt',
    value: 'zelt-schlafplatz',
  },
  {
    label:
      'Ich brauche noch einen Schlafplatz, bitte organisiert ihr das für mich',
    value: 'organisiert',
  },
];

const uebernachtungHelfer = [
  {
    label: 'Ich bringe mein eigenes Zelt mit',
    value: 'zelt',
  },
  {
    label: 'Ich schlafe in meinem Van/Wohnwagen',
    value: 'camper',
  },
  {
    label: 'Ich habe einen Schlafplatz bei Kollegen:innen im Zelt',
    value: 'zelt-schlafplatz',
  },
  {
    label:
      'Ich brauche noch einen Schlafplatz, bitte organisiert ihr das für mich',
    value: 'organisiert',
  },
  {
    label:
      'Ich möchte gerne gegen einen Aufpreis von 33.- pro Nacht ins Gästehaus zur Übernachtung',
    value: 'gaestehaus',
  },
];

const ernaehrung = [
  {
    label: 'vegan',
    value: 'vegan',
  },
  {
    label: 'vegetarisch',
    value: 'vegetarisch',
  },
];

export default function CampForm(props) {
  const { control, setValue, getValues } = props.methods;

  const [additional, setAdditional] = useState(
    getValues('allergien').includes('weitere:')
  );
  const [camp, setCamp] = useState(getValues('angebot'));

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <FormInputButtons
            name="angebot"
            label="Angebot"
            control={control}
            setCamp={setCamp}
            setValue={setValue}
            required
            options={['Option 1', 'Option 2', 'Option 3']}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInputDropdown
            name="bezirk"
            label="Bezirk"
            control={control}
            getValues={getValues}
            options={bezirksListe}
            required
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Essen
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormInputMultiCheckbox
            setValue={setValue}
            name={'ernaehrung'}
            control={control}
            label={'Ernährung'}
            options={ernaehrung}
            maxChecked={1}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormInputAllergies
            name={'allergien'}
            control={control}
            label={'Allergien/Unverträglichkeiten'}
            setValue={setValue}
            setAdditional={setAdditional}
          />
        </Grid>
        {additional ? (
          <Grid item xs={12} md={4}>
            <FormInputText
              name="weitereAllergien"
              label="Weitere Allergien/Unverträglichkeiten:"
              control={control}
              required={additional}
            />
          </Grid>
        ) : (
          <React.Fragment />
        )}
      </Grid>
      {camp === 'Camp five' || camp === 'Helfercamp' ? (
        <React.Fragment>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Schlafen
          </Typography>
          <Grid container spacing={3}>
            {camp === 'Camp five' ? (
              <Grid item xs={12}>
                <FormInputMultiCheckbox
                  name="uebernachtung"
                  label="Übernachtung"
                  control={control}
                  setValue={setValue}
                  options={uebernachtungFive}
                  maxChecked={1}
                  required
                  vertical
                />
              </Grid>
            ) : (
              <React.Fragment />
            )}
            {camp === 'Helfercamp' ? (
              <Grid item xs={12}>
                <Typography sx={{ p: 1 }}>
                  Den Begleitpersonen empfehlen wir eine Übernachtung in der
                  Schlafhalle, um in der Nähe der Teilnehmenden zu sein. Dann
                  müsst ihr hier nichts auswählen. Alle anderen Helfenden wählen
                  aus der Liste eine Schlafmöglichkeit.{' '}
                </Typography>
                <FormInputMultiCheckbox
                  name="uebernachtung"
                  label="Übernachtung"
                  control={control}
                  setValue={setValue}
                  options={uebernachtungHelfer}
                  maxChecked={1}
                  required
                  vertical
                />
              </Grid>
            ) : (
              <React.Fragment />
            )}
          </Grid>
        </React.Fragment>
      ) : (
        <React.Fragment />
      )}
      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Weiteres
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <FormInputText
            name="bemerkungen"
            label="Bemerkungen:"
            control={control}
            multiline
            maxRows={4}
            maxLength={512}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

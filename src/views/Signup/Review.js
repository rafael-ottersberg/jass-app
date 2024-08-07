import React from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';

export default function Review(props) {
  const dataPerson = props.dataPerson;
  const dataDetails = props.dataDetails;
  console.log(dataPerson);

  var dd = String(dataPerson.geburtstag.getDate()).padStart(2, '0');
  var mm = String(dataPerson.geburtstag.getMonth() + 1).padStart(2, '0');
  var yyyy = dataPerson.geburtstag.getFullYear();

  var geburtstagString = dd + '.' + mm + '.' + yyyy;

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Zusammenfassung Anmeldung
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5">Adresse</Typography>
              <Typography>
                {dataPerson.vorname} {dataPerson.nachname}
                <br></br>
                {dataPerson.adresse}
                <br></br>
                {dataPerson.plz} {dataPerson.ort}
              </Typography>
              <br></br>
              <Typography variant="h5">Geburtstag</Typography>
              <Typography>{geburtstagString}</Typography>
              <br></br>
              <Typography variant="h5">Kontakt</Typography>
              <Typography>
                Email: {dataPerson.email}
                <br></br>
                Telefon: {dataPerson.telefon}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5">Essen</Typography>
              <Typography>
                Vegetarisch:{' '}
                {dataDetails.ernaehrung.includes('vegetarisch') ? (
                  <b>Ja</b>
                ) : (
                  <React.Fragment>Nein</React.Fragment>
                )}
                <br></br>
                Vegan:{' '}
                {dataDetails.ernaehrung.includes('vegan') ? (
                  <b>Ja</b>
                ) : (
                  <React.Fragment>Nein</React.Fragment>
                )}
                <br></br>
                Allergien/Unverträglichkeiten:
                {dataDetails.allergien.includes('Laktose') ? (
                  <React.Fragment>
                    <br />
                    <b>Laktose</b>
                  </React.Fragment>
                ) : (
                  <React.Fragment />
                )}
                {dataDetails.allergien.includes('Gluten') ? (
                  <React.Fragment>
                    <br />
                    <b>Gluten</b>
                  </React.Fragment>
                ) : (
                  <React.Fragment />
                )}
                {dataDetails.allergien.includes('weitere:') ? (
                  <React.Fragment>
                    <br />
                    <b>{dataDetails.weitereAllergien}</b>
                  </React.Fragment>
                ) : (
                  <React.Fragment />
                )}
                {dataDetails.allergien.length === 0 ? (
                  <React.Fragment>
                    <b> keine</b>
                  </React.Fragment>
                ) : (
                  <React.Fragment />
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {dataDetails.bemerkungen !== '' ? (
          <Grid item xs={12} md={12}>
            <Card>
              <CardContent>
                <Typography variant="h5">Bemerkung</Typography>
                <Typography>{dataDetails.bemerkungen}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <React.Fragment />
        )}

        <Grid item xs={12} md={12}>
          <Card>
            <CardContent>
              <Typography>
                <b>Disclaimer:</b> «Mit dieser Anmeldung erkläre ich mich
                einverstanden, dass allfälliges Bild- und Videomaterial von mir
                zu Werbezwecken weiterverwendet werden darf.»{' '}
                <i>
                  (Falls dies für dich ein Problem darstellt und dazu führen
                  würde, dass du nicht ins Camp kommen möchtest, dann melde dich
                  unter camp4five@methodisten.ch bei uns.)
                </i>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

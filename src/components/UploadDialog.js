import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { AuthContext } from '../App_template';

const uploadConditionKey = 'USER_AGREED_TO_UPLOAD_CONDITION';

export default function UploadDialog() {
  const { dispatch, state } = React.useContext(AuthContext);

  const handleClose = () =>
    dispatch({ type: 'UPLOAD_CONDITIONS_DIALOG', payload: false });

  function markUserAgreedToUploadCondidtions() {
    localStorage.setItem(uploadConditionKey, 'true');
  }

  const handleDisagree = () => {
    handleClose();
  };

  const handleAgree = () => {
    markUserAgreedToUploadCondidtions();
    handleClose();
  };

  return (
    <Dialog open={state.isUploadConditionDialogVisible} onClose={handleClose}>
      <DialogTitle>Upload Bedingungen</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Mit dem Upload erklärst du dich einverstanden, dass deine Fotos vom
          EMK Young Schweiz zu Werbezwecken weiterverwendet werden dürfen.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDisagree}>Ablehnen</Button>
        <Button onClick={handleAgree} autoFocus variant="contained">
          Akzeptieren
        </Button>
      </DialogActions>
    </Dialog>
  );
}

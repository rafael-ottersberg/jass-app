import React from 'react';
import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export const FormInputCheckPw = ({
  name,
  control,
  label,
  required,
  pattern,
  minLength,
  inputProps,
  getValues,
}) => {
  var pwEqual = true;
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required, pattern: pattern, minLength: minLength }}
      render={({
        field: { onChange, value },
        fieldState: { error },
        formState,
      }) => (
        <React.Fragment>
          <TextField
            helperText={error ? error.message : null}
            size="small"
            error={!!error}
            onChange={(e, value) => {
              onChange(e, value);
              pwEqual = getValues('password') === getValues('repeatPassword');
            }}
            value={value}
            fullWidth
            label={label}
            variant="outlined"
            required={required}
            inputProps={inputProps}
          />
          {!pwEqual ? (
            <Typography color="error" sx={{ ml: 1 }}>
              Passwörter stimmen nicht überein
            </Typography>
          ) : (
            <React.Fragment />
          )}
        </React.Fragment>
      )}
    />
  );
};

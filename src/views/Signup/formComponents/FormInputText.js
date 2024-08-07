import React from 'react';
import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';

export const FormInputText = ({
  name,
  control,
  label,
  required,
  pattern,
  minLength,
  maxLength,
  multiline,
  maxRows,
  inputProps,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required,
        pattern: pattern,
        minLength: minLength,
        maxLength: maxLength,
      }}
      render={({
        field: { onChange, value },
        fieldState: { error },
        formState,
      }) => (
        <TextField
          helperText={error ? error.message : null}
          size="small"
          error={!!error}
          onChange={onChange}
          value={value}
          fullWidth
          label={label}
          variant="outlined"
          required={required}
          inputProps={inputProps}
          multiline={multiline}
          maxRows={maxRows}
        />
      )}
    />
  );
};

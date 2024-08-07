import React from 'react';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form';

export const FormInputRadio = ({ name, control, label, options, required }) => {
  const generateRadioOptions = () => {
    return options.map((singleOption) => (
      <FormControlLabel
        key={singleOption.value}
        value={singleOption.value}
        label={singleOption.label}
        control={<Radio />}
      />
    ));
  };

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">{label}</FormLabel>
      <Controller
        name={name}
        control={control}
        rules={{ required: required }}
        render={({
          field: { onChange, value },
          fieldState: { error },
          formState,
        }) => (
          <React.Fragment>
            <RadioGroup value={value} onChange={onChange}>
              {generateRadioOptions()}
            </RadioGroup>
            {!!error ? (
              <Typography color="error" sx={{ ml: 1 }}>
                Bitte wähle eine Option
              </Typography>
            ) : (
              <React.Fragment />
            )}
          </React.Fragment>
        )}
      />
    </FormControl>
  );
};

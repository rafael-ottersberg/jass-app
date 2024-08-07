import React from 'react';
import {
  FormControl,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form';

export const FormInputButtons = ({
  name,
  control,
  label,
  setCamp,
  setValue,
  required,
  options,
}) => {
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
        }) => {
          return (
            <React.Fragment>
              <ToggleButtonGroup
                sx={{ borderColor: 'red' }}
                color="primary"
                exclusive
                value={value}
                onChange={(event, value) => {
                  setValue(name, value);
                  setCamp(value);
                }}
              >
                {options.map((singleOption) => (
                  <ToggleButton
                    key={singleOption}
                    value={singleOption}
                    sx={{
                      fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: { xs: '1em', sm: '1.5em' },
                      fontFamily: 'Abel',
                    }}
                  >
                    {singleOption}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              {!!error ? (
                <Typography color="error" sx={{ ml: 1 }}>
                  Bitte wähle ein Camp
                </Typography>
              ) : (
                <React.Fragment />
              )}
            </React.Fragment>
          );
        }}
      />
    </FormControl>
  );
};

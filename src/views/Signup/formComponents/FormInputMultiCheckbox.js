import React from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Typography,
} from '@mui/material';

import { useController } from 'react-hook-form';

export const FormInputMultiCheckbox = ({
  name,
  control,
  label,
  setValue,
  options,
  maxChecked,
  vertical,
  required,
}) => {
  const {
    field: { value },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  var selectedItems = value;
  const handleSelect = (value, name) => {
    const isPresent = selectedItems.indexOf(value);
    if (isPresent !== -1) {
      var remaining = selectedItems.filter((item) => item !== value);
      setValue(name, remaining);
    } else {
      var items = [...selectedItems, value];
      setValue(name, items);
    }
  };

  return (
    <FormControl size={'small'} variant={'outlined'}>
      <FormLabel component="legend">{label}</FormLabel>
      <React.Fragment>
        {options.map((option) => {
          let disabled = false;
          if (maxChecked !== undefined) {
            if (
              selectedItems.length > maxChecked - 1 &&
              !selectedItems.includes(option.value)
            ) {
              disabled = true;
            }
          }

          var style = {};
          if (vertical) {
            style = { display: 'flex' };
          }
          return (
            <FormControlLabel
              sx={style}
              control={
                <Checkbox
                  disabled={disabled}
                  checked={selectedItems.includes(option.value)}
                  onChange={() => handleSelect(option.value, name)}
                />
              }
              label={option.label}
              key={option.value}
            />
          );
        })}
        {!!error ? (
          <Typography color="error" sx={{ ml: 1 }}>
            Bitte wähle eine Option
          </Typography>
        ) : (
          <React.Fragment />
        )}
      </React.Fragment>
    </FormControl>
  );
};

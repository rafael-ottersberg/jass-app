import React from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
} from '@mui/material';

import { useController } from 'react-hook-form';

const options = ['Laktose', 'Gluten', 'weitere:'];

export const FormInputAllergies = ({
  name,
  control,
  label,
  setValue,
  setAdditional,
}) => {
  const {
    field: { value },
  } = useController({
    name,
    control,
  });

  var selectedItems = value;
  if (selectedItems.includes(options[2])) {
    setAdditional(true);
  }

  const handleSelect = (value, name) => {
    const isPresent = selectedItems.indexOf(value);
    if (isPresent !== -1) {
      var remaining = selectedItems.filter((item) => item !== value);
      setValue(name, remaining);
      if (value === options[2]) {
        setAdditional(false);
      }
    } else {
      var items = [...selectedItems, value];
      setValue(name, items);
      if (value === options[2]) {
        setAdditional(true);
      }
    }
  };

  return (
    <FormControl size={'small'} variant={'outlined'}>
      <FormLabel component="legend">{label}</FormLabel>

      <div>
        {options.map((option) => {
          return (
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedItems.includes(option)}
                  onChange={() => handleSelect(option, name)}
                />
              }
              label={option}
              key={option}
            />
          );
        })}
      </div>
    </FormControl>
  );
};

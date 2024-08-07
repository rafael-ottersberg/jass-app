import React from 'react';
import { FormControl, MenuItem, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

export const FormInputDropdown = ({
  name,
  control,
  label,
  options,
  required,
}) => {
  const generateSingleOptions = () => {
    return options.map((option) => {
      return (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      );
    });
  };

  return (
    <FormControl fullWidth size={'medium'}>
      <Controller
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            label={label}
            error={!!error}
            onChange={onChange}
            value={value}
            select
          >
            {generateSingleOptions()}
          </TextField>
        )}
        control={control}
        name={name}
        rules={{ required: required }}
      />
    </FormControl>
  );
};

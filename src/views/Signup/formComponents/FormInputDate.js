import React from 'react';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import deLocale from 'date-fns/locale/de';
import DatePicker from '@mui/lab/DatePicker';
import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';

export const FormInputDate = ({ name, control, label }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={deLocale}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState, formState }) => (
          <DatePicker
            mask="__.__.____"
            label={label}
            value={field.value}
            onChange={(newValue) => {
              field.onChange(newValue);
            }}
            renderInput={(params) => <TextField size="small" {...params} />}
          />
        )}
      />
    </LocalizationProvider>
  );
};

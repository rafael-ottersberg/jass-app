import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#bf1f43',
    },
    secondary: {
      main: '#0ab593',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#bf1f43',
    },
    info: {
      main: '#21376b',
    },
  },
  typography: {
    fontFamily: 'Abel',
  },
});

export default theme;

import React, { useEffect, useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Paper,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

const bottomLinks = [
  {
    name: 'Infos',
    icon: InfoIcon,
    value: 0,
  },
  {
    name: 'Home',
    icon: HomeIcon,
    value: 1,
  },
  {
    name: 'Fragen',
    icon: QuestionMarkIcon,
    value: 3,
  },
];

const BottomNav = (props) => {
  const setPage = props.setPage;
  var initialValue = Number(
    Object.keys(bottomLinks).find((key) => bottomLinks[key].name === props.page)
  );

  const [value, setValue] = useState();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'flex', md: 'none' },
        zIndex: 900,
      }}
      elevation={3}
    >
      <Box
        sx={{
          mx: 'auto',
        }}
      >
        <BottomNavigation
          position="sticky"
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          {bottomLinks.map((link) => (
            <BottomNavigationAction
              key={link.name}
              label={link.name}
              icon={<link.icon />}
              onClick={() => setPage(link.name)}
            />
          ))}
        </BottomNavigation>
      </Box>
    </Paper>
  );
};

export default BottomNav;

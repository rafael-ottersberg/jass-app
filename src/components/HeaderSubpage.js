import React from 'react';
import { useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import { styled } from '@mui/system';
import { Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useScrollTrigger from '@mui/material/useScrollTrigger';

import logo from '../assets/img/invited_font.png';
import UserMenu from '../components/UserMenu';

function ElevationScroll(props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

const LogoImg = styled('img', {
  name: 'LogoImg',
})`
  height: 2em;
`;

const HeaderSubpage = (props) => {
  const { ...rest } = props;

  const navigate = useNavigate();

  return (
    <ElevationScroll {...rest}>
      <AppBar position="static" {...rest}>
        <Container maxWidth="md">
          <Toolbar disableGutters>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Link href="/home">
                <LogoImg sx={{ ml: 1, mr: 10 }} src={logo} alt="Logo" />
              </Link>
            </Box>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <ArrowBackIcon sx={{ color: 'white' }} />
            </IconButton>

            <Box sx={{ mr: 1, ml: 'auto' }}>
              <UserMenu />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
};

export default HeaderSubpage;

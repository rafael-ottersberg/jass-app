import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { styled } from '@mui/system';

import { Link } from '@mui/material';

import useScrollTrigger from '@mui/material/useScrollTrigger';
import logo from '../assets/img/invited_font.png';
import UserMenu from '../components/UserMenu';

const LogoImg = styled('img', {
  name: 'LogoImg',
})`
  height: 2em;
`;

const Header = (props) => {
  const { setPage, scrollTarget, ...rest } = props;
  const pages = ['Home', 'Infos', 'Fragen'];

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: scrollTarget,
  });

  return (
    <AppBar position="static" {...rest} elevation={trigger ? 4 : 0}>
      <Container maxWidth="md">
        <Toolbar disableGutters>
          <Link href="/home">
            <LogoImg sx={{ ml: 1, mr: 10 }} src={logo} alt="Logo" />
          </Link>

          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => {
                  setPage(page);
                }}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ mr: 1, ml: 'auto' }}>
            <UserMenu />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;

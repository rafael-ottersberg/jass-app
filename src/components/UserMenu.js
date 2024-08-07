import React from 'react';
import { useNavigate } from 'react-router-dom';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

import { AuthContext } from '../App_template';

const UserMenu = () => {
  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const { state: authState, dispatch: authDispatch } =
    React.useContext(AuthContext);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignIn = () => {
    navigate('/signin');
  };
  const handleSignOut = () => {
    localStorage.removeItem('token');
    authDispatch({
      type: 'LOGOUT',
    });
  };

  return (
    <Box>
      <Tooltip title="Benutzer-Account">
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
          <AccountCircleIcon sx={{ color: 'white' }} />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        {!authState.isAuthenticated ? (
          <MenuItem key="signin" onClick={handleSignIn}>
            <Typography textAlign="center">Anmelden</Typography>
          </MenuItem>
        ) : (
          <MenuItem key="hello" onClick={handleCloseUserMenu}>
            <Typography textAlign="center">
              Hallo {authState.vorname}
            </Typography>
          </MenuItem>
        )}
        {authState.isAuthenticated && (
          <MenuItem key="signout" onClick={handleSignOut}>
            <Typography textAlign="center">Abmelden</Typography>
          </MenuItem>
        )}
        {authState.userDBAccess && [
          <MenuItem key="user-list" onClick={() => navigate('/user-list')}>
            <Typography textAlign="center">User List</Typography>
          </MenuItem>,
          <MenuItem
            key="question-panel"
            onClick={() => navigate('/question-panel')}
          >
            <Typography textAlign="center">Fragen bearbeiten</Typography>
          </MenuItem>,
        ]}
      </Menu>
    </Box>
  );
};

export default UserMenu;

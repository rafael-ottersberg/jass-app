import React, { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import axios from 'axios';
import { ThemeProvider } from '@mui/material';
import theme from './theme';

import LoadingPage from './views/LoadingPage';

import VersionChecker from './components/VersionChecker';
import UploadDialog from './components/UploadDialog';

const LandingPage = lazy(() => import('./views/LandingPage'));
const SignIn = lazy(() => import('./views/SignIn'));
const RequestReset = lazy(() => import('./views/RequestReset'));
const SetPassword = lazy(() => import('./views/SetPassword'));
const SetPasswordAdmin = lazy(() => import('./views/SetPasswordAdmin'));
const UserList = lazy(() => import('./views/UserList'));
const QuestionPanel = lazy(() => import('./views/QuestionPanel'));
const SignUpPage = lazy(() => import('./views/SignUpPage'));


export const AuthContext = React.createContext();
const initialState = {
  isAuthenticated: false,
  vorname: null,
  email: null,
  token: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        vorname: action.payload.vorname,
        email: action.payload.email,
        token: action.payload.token,
        angebot: action.payload.angebot,
        userDBAccess: action.payload.userDBAccess,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        vorname: null,
        email: null,
        angebot: null,
        userDBAccess: false,
      };
    case 'UPLOAD_CONDITIONS_DIALOG':
      return {
        ...state,
        isUploadConditionDialogVisible: action.payload,
      };
    default:
      return state;
  }
};

export default function App() {
  //var hist = createBrowserHistory();

  const [state, dispatch] = React.useReducer(reducer, initialState);

  const checkToken = async () => {
    var localToken = localStorage.getItem('token');

    if (localToken !== null) {
      await axios
        .get('/api/login', { auth: { username: localToken, password: '' } })
        .then((response) => {
          localStorage.setItem('token', response.data.token);
          dispatch({
            type: 'LOGIN',
            payload: response.data,
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
          dispatch({
            type: 'LOGOUT',
          });
        });
    } else {
      localStorage.removeItem('token');
      dispatch({
        type: 'LOGOUT',
      });
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      <ThemeProvider theme={theme}>
        <UploadDialog />
        <VersionChecker />
        <Router>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route path="/loading" element={<LoadingPage />} />
              <Route path="/home" element={<Navigate to="/" />} />
              <Route path="/signin" element={<SignIn />} />
              <Route
                path="/request-password-reset"
                element={<RequestReset />}
              />
              <Route path="/set-password" element={<SetPassword />} />
              <Route
                path="/set-password-admin"
                element={<SetPasswordAdmin />}
              />
              <Route path="/user-list" element={<UserList />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/question-panel" element={<QuestionPanel />} />
              <Route path="/" element={<LandingPage />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

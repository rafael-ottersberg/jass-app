import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Login from './views/Login';
import Register from './views/Register';
import GameList from './views/GameList';
import GamePlay from './views/GamePlay';
import StartGame from './views/StartGame';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RequireAuth><GameList /></RequireAuth>} />
          <Route path="/games/new" element={<RequireAuth><StartGame /></RequireAuth>} />
          <Route path="/games/:gameId" element={<RequireAuth><GamePlay /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function RequireAuth({ children }) {
  const auth = useAuth();
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
}

export default App;

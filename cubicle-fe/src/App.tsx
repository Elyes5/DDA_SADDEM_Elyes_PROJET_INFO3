import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import { checkAuth } from './state/slices/authSlice';
import { ProtectedRoute, PublicRoute } from './guards/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainFeed from './pages/MainFeed';
import './App.css'
function App() {
  const dispatch = useAppDispatch();
  // We use the 'loading' state from Redux which is 'true' by default in initialState
  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Attempt to recover the session from HttpOnly cookies on first mount
    void dispatch(checkAuth());
  }, [dispatch]);

  // While checking the cookie, we show a loader to prevent premature redirects
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        height: '100vh', 
        width: '100vw', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
      }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ZONE --- */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* --- PROTECTED ZONE --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<MainFeed />} />
          {/* Catch authenticated root and send to home */}
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>

        {/* --- GLOBAL CATCH --- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
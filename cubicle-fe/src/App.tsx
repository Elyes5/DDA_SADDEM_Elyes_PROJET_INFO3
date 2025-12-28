import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch } from './hooks/hooks';
import { checkAuth } from './state/slices/authSlice';
import { ProtectedRoute, PublicRoute } from './guards/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainFeed from './pages/MainFeed';
import './App.css';
import { useAppSelector } from './hooks/hooks';
import { Box, CircularProgress } from '@mui/material';
// App.tsx
function App() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    void dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      {loading ? (
        <Box sx={{ 
          display: 'flex', height: '100vh', width: '100vw', 
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          position: 'fixed', top: 0, left: 0, zIndex: 9999
        }}>
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      ) : (
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<MainFeed />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
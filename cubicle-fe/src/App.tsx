import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch } from './hooks/hooks';
import { checkAuth } from './state/slices/authSlice';
import { ProtectedRoute, PublicRoute } from './guards/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainFeed from './pages/MainFeed';
import './App.css';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Récupération de la session en arrière-plan
    void dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* --- ZONE PUBLIQUE --- */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* --- ZONE PROTÉGÉE --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<MainFeed />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>

        {/* --- REDIRECTION GLOBALE --- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
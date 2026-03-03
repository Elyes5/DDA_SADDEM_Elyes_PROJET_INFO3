import { useEffect, useState } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import {
  useAppDispatch,
  useAppSelector,
} from './hooks/hooks'
import { checkAuth } from './state/slices/authSlice'
import {
  ProtectedRoute,
  PublicRoute,
} from './guards/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MainFeed from './pages/MainFeed'
import './App.css'
import {
  Box,
  CircularProgress,
  ThemeProvider,
} from '@mui/material'
import Profile from './pages/Profile'
import { theme } from './theme/theme'
import { useNotifications } from './hooks/useNotifications'

function App() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useNotifications()

  useEffect(() => {
    void dispatch(checkAuth()).finally(() => {
      setIsInitialLoad(false)
    })
  }, [dispatch])

  return (
    <ThemeProvider theme={theme}>
      <Router>
        {isInitialLoad ? (
          <Box
            sx={{
              display: 'flex',
              height: '100vh',
              width: '100vw',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 9999,
            }}
          >
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

              <Route
                path="/profile/:id"
                element={<Profile />}
              />

              <Route
                path="/profile"
                element={
                  user ? (
                    <Navigate
                      to={`/profile/${user.id}`}
                      replace
                    />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              <Route
                path="/"
                element={<Navigate to="/home" replace />}
              />
            </Route>

            <Route
              path="*"
              element={<Navigate to="/login" replace />}
            />
          </Routes>
        )}
      </Router>
    </ThemeProvider>
  )
}

export default App
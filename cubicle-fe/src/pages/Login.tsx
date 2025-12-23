import React, { useState } from 'react';
import type { ChangeEvent, FormEvent, SVGProps } from 'react';
import {Link as RouterLink} from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  useTheme,
  InputLabel,
  Link,
  Stack
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/hooks.ts';
import { loginUser } from '../state/slices/authSlice.ts';

const CubicleLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.9 12.24 21.95 12.07 21.95C11.9 21.95 11.73 21.9 11.57 21.82L3.67 17.38C3.35 17.21 3.14 16.88 3.14 16.5V7.5C3.14 7.12 3.35 6.79 3.67 6.62L11.57 2.18C11.89 2 12.25 2 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5ZM12 4.15L6.04 7.5L12 10.85L17.96 7.5L12 4.15Z" />
  </svg>
);

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: '', token: '' });
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const theme = useTheme();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void dispatch(loginUser(credentials));
  };

  const modernInputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '50px',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      '& fieldset': { border: '1px solid rgba(0, 0, 0, 0.1)' },
      '&:hover fieldset': { borderColor: theme.palette.primary.main },
      '&.Mui-focused fieldset': { borderWidth: '2px' },
    },
    '& .MuiInputBase-input': { px: 3 },
  };

  const labelStyle = {
    ml: 2,
    mb: 1,
    fontWeight: 600,
    fontSize: '0.85rem',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)`,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
          }}
        >
          <Avatar sx={{ m: '0 auto', bgcolor: 'primary.main', width: 64, height: 64, p: 1.5, mb: 2 }}>
            <CubicleLogo width="100%" height="100%" />
          </Avatar>

          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e3a8a', mb: 0.5 }}>
            Cubicle
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>
            Heureux de vous revoir !
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 4 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <Box sx={{ textAlign: 'left' }}>
                <InputLabel sx={labelStyle}>Adresse Email</InputLabel>
                <TextField
                  fullWidth
                  name="email"
                  placeholder="nom@exemple.com"
                  value={credentials.email}
                  onChange={handleChange}
                  sx={modernInputStyle}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.8,
                  mt: 1,
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)',
                  boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.5)',
                  '&:hover': { 
                    background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
                    boxShadow: '0 15px 25px -5px rgba(59, 130, 246, 0.6)' 
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
              </Button>
            </Stack>

            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Pas encore de compte ?{' '}
                <Link
                  to="/signup"
                  underline="hover"
                  component={RouterLink}
                  sx={{
                    color: '#1e40af',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    '&:hover': { color: '#3b82f6' }
                  }}
                >
                  S'inscrire
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
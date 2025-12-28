import React, { useState, useEffect } from 'react';
import type { FormEvent, SVGProps } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Stack,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppDispatch, useAppSelector } from '../hooks/hooks.ts';
// Import async thunks from the auth slice
import { sendAuthEmail, verifyPasscode, logoutUser, resetError } from '../state/slices/authSlice.ts';

const CubicleLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.9 12.24 21.95 12.07 21.95C11.9 21.95 11.73 21.9 11.57 21.82L3.67 17.38C3.35 17.21 3.14 16.88 3.14 16.5V7.5C3.14 7.12 3.35 6.79 3.67 6.62L11.57 2.18C11.89 2 12.25 2 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5ZM12 4.15L6.04 7.5L12 10.85L17.96 7.5L12 4.15Z" />
  </svg>
);

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Access auth state from Redux store
  const { loading, error, emailSent, currentEmail, user } = useAppSelector((state) => state.auth);

  // Redirect to dashboard if user session is detected
  useEffect(() => {
    if (user) {
      void navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailSent) {
      // Step 1: Request an OTP for the given email
      void dispatch(sendAuthEmail(email));
    } else {
      if (currentEmail) {
        // Step 2: Verify the OTP code sent to the user
        void dispatch(verifyPasscode({ email: currentEmail, code: passcode }));
      }
    }
  };

  const handleBack = () => {
    // Call server-side logout to clear cookies and reset local state
    void dispatch(logoutUser());
    setPasscode('');
    dispatch(resetError());
  };

  // Custom styles for a modern glassmorphism feel
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
            position: 'relative'
          }}
        >
          {/* Back button visible only during OTP verification phase */}
          {emailSent && (
            <IconButton 
              onClick={handleBack}
              sx={{ position: 'absolute', left: 20, top: 20 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          <Avatar sx={{ m: '0 auto', bgcolor: 'primary.main', width: 64, height: 64, p: 1.5, mb: 2 }}>
            <CubicleLogo width="100%" height="100%" />
          </Avatar>

          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e3a8a', mb: 0.5 }}>
            Cubicle
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>
            {!emailSent 
              ? "Heureux de vous revoir !" 
              : `Code envoyé à ${currentEmail}`}
          </Typography>

          {/* Display API error messages */}
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 4 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <Box sx={{ textAlign: 'left' }}>
                <InputLabel sx={labelStyle}>
                  {!emailSent ? "Adresse Email" : "Code de vérification"}
                </InputLabel>
                
                {!emailSent ? (
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={modernInputStyle}
                  />
                ) : (
                  <TextField
                    fullWidth
                    name="passcode"
                    type="text"
                    autoFocus
                    placeholder="123456"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    sx={modernInputStyle}
                    inputProps={{ maxLength: 6 }} // Limit input to 6 digits for OTP
                  />
                )}
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
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  !emailSent ? 'Continuer' : 'Vérifier le code'
                )}
              </Button>
            </Stack>

            {/* Signup redirection link */}
            {!emailSent && (
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
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
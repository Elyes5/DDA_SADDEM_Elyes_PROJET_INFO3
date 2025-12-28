import React, { useState, useRef } from 'react';
import type { ChangeEvent, FormEvent, SVGProps } from 'react';
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
  Stack,
  Link,
  Grid
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { registerUser } from '../state/slices/authSlice';

const CubicleLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="white" {...props}>
    <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.9 12.24 21.95 12.07 21.95C11.9 21.95 11.73 21.9 11.57 21.82L3.67 17.38C3.35 17.21 3.14 16.88 3.14 16.5V7.5C3.14 7.12 3.35 6.79 3.67 6.62L11.57 2.18C11.89 2 12.25 2 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5ZM12 4.15L6.04 7.5L12 10.85L17.96 7.5L12 4.15Z" />
  </svg>
);

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    bio: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);
  const theme = useTheme();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    data.append('phone_number', formData.phone_number);
    data.append('bio', formData.bio);
    
    if (avatarFile) {
      data.append('avatar', avatarFile);
    }

    const resultAction = await dispatch(registerUser(data));
    
    if (registerUser.fulfilled.match(resultAction)) {
      void navigate('/login');
    }
  };

  const modernInputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '50px',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      '& fieldset': { border: '1px solid rgba(0, 0, 0, 0.1)' },
      '&:hover fieldset': { borderColor: theme.palette.primary.main },
      '&.Mui-focused fieldset': { borderWidth: '2px' },
    },
    '& .MuiInputBase-input': { px: 3, py: 1.5 },
  };

  const labelStyle = {
    ml: 2, mb: 0.5, fontWeight: 600, fontSize: '0.8rem',
    color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px'
  };

  return (
    <Box sx={{
      minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: `linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)`, py: 6
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{
          p: { xs: 3, sm: 5 }, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', textAlign: 'center'
        }}>
          
          <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
            <Avatar 
              src={previewUrl || ''} 
              sx={{ width: 90, height: 90, bgcolor: 'primary.main', border: '3px solid white', boxShadow: theme.shadows[3] }}
            >
              {!previewUrl && <CubicleLogo width="60%" height="60%" />}
            </Avatar>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 'bold' }}
            >
              Choisir une photo
            </Button>
            <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e3a8a', mb: 0.5 }}>Cubicle</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            Créez votre profil utilisateur
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 4 }}>{error}</Alert>}

          <Box component="form" onSubmit={(e: FormEvent<HTMLFormElement>) => {void handleSubmit(e);}} noValidate>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ textAlign: 'left' }}>
                    <InputLabel sx={labelStyle}>Prénom *</InputLabel>
                    <TextField fullWidth name="first_name" placeholder="Jean" value={formData.first_name} onChange={handleChange} sx={modernInputStyle} required />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ textAlign: 'left' }}>
                    <InputLabel sx={labelStyle}>Nom *</InputLabel>
                    <TextField fullWidth name="last_name" placeholder="Dupont" value={formData.last_name} onChange={handleChange} sx={modernInputStyle} required />
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ textAlign: 'left' }}>
                    <InputLabel sx={labelStyle}>Nom d'utilisateur *</InputLabel>
                    <TextField fullWidth name="username" placeholder="jdupont" value={formData.username} onChange={handleChange} sx={modernInputStyle} required />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ textAlign: 'left' }}>
                    <InputLabel sx={labelStyle}>Email *</InputLabel>
                    <TextField fullWidth name="email" type="email" placeholder="jean@mail.com" value={formData.email} onChange={handleChange} sx={modernInputStyle} required />
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ textAlign: 'left' }}>
                <InputLabel sx={labelStyle}>Téléphone</InputLabel>
                <TextField fullWidth name="phone_number" placeholder="+33 6..." value={formData.phone_number} onChange={handleChange} sx={modernInputStyle} />
              </Box>

              <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{
                py: 1.8, mt: 2, borderRadius: '50px', textTransform: 'none', fontSize: '1rem', fontWeight: 'bold',
                background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.5)',
                '&:hover': { background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)' }
              }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "S'inscrire sur Cubicle"}
              </Button>
            </Stack>

            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Déjà membre ?{' '}
                <Link component={RouterLink} to="/login" underline="hover" sx={{ color: '#1e40af', fontWeight: 'bold' }}>
                  Se connecter
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup;
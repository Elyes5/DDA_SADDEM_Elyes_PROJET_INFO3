import React, { type SVGProps } from 'react';
import { AppBar, Toolbar, Typography, Avatar, Box } from '@mui/material';
import type { User } from '../models/User';

interface NavbarProps {
  user: User;
}

const CubicleLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.9 12.24 21.95 12.07 21.95C11.9 21.95 11.73 21.9 11.57 21.82L3.67 17.38C3.35 17.21 3.14 16.88 3.14 16.5V7.5C3.14 7.12 3.35 6.79 3.67 6.62L11.57 2.18C11.89 2 12.25 2 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5ZM12 4.15L6.04 7.5L12 10.85L17.96 7.5L12 4.15Z" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({ user }) => (
  <AppBar 
    position="fixed" 
    elevation={0} 
    sx={{ 
      zIndex: (theme) => theme.zIndex.drawer + 1,
      bgcolor: 'white', 
      borderBottom: '1px solid #E0E0E0',
      color: 'text.primary'
    }}
  >
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      {/* GAUCHE : Logo et Nom */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ 
          bgcolor: 'primary.main', 
          p: 0.5, 
          borderRadius: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <CubicleLogo />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
          Cubicle
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
          {user.first_name} {user.last_name}
        </Typography>
        <Avatar 
          src={user.avatar_url} 
          alt={user.username} 
          sx={{ width: 35, height: 35, border: '1px solid #E0E0E0' }} 
        />
      </Box>
    </Toolbar>
  </AppBar>
);
import React from 'react';
import {Box, Typography } from '@mui/material';
import { 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Paper 
} from '@mui/material';

const TOP_CONTRIBUTORS = [
  { id: 1, name: 'AlexDev', snippets: 24, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'SarahCode', snippets: 18, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'ByteMaster', snippets: 15, avatar: 'https://i.pravatar.cc/150?u=3' },
];

export const InfoPanel : React.FC = () => (
  <Box sx={{ 
    width: 320, 
    p: 3, 
    display: { xs: 'none', lg: 'block' }, 
    position: 'sticky', 
    top: 0, 
    height: '100vh',
    borderLeft: '1px solid #E0E0E0',
    bgcolor: '#F8F9FA'
  }}>
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 3, mb: 4 }}>
      <Typography variant="h6" fontWeight="bold">Trending 🔥</Typography>
      <Typography variant="body2" sx={{ opacity: 0.9 }}>
        Le tag <b>#TypeScript</b> a progressé de 20% cette semaine.
      </Typography>
    </Paper>

    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
      Top Contributors
    </Typography>

    <List sx={{ mb: 3 }}>
      {TOP_CONTRIBUTORS.map((user) => (
        <ListItem 
          key={user.id} 
          disableGutters 
          secondaryAction={
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {user.snippets} pts
            </Typography>
          }
        >
          <ListItemAvatar>
            <Avatar src={user.avatar} sx={{ width: 38, height: 38, border: '2px solid white', boxShadow: 1 }} />
          </ListItemAvatar>
          <ListItemText 
            primary={user.name} 
            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
            secondary="Top Reviewer"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </ListItem>
      ))}
    </List>

    <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid #E0E0E0' }}>
      <Typography variant="caption" color="text.secondary" display="block">
        © 2025 Cubicle
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Privacy</Typography>
        <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Terms</Typography>
      </Box>
    </Box>
  </Box>
);
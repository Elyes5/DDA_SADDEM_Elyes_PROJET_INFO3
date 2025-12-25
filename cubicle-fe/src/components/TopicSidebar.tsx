import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import type { Topic } from '../models/Topic';

interface SidebarProps {
  topics: Topic[];
  selectedTopic: string;
  onSelectTopic: (name: string) => void;
}

export const TopicSidebar: React.FC<SidebarProps> = ({ topics, selectedTopic, onSelectTopic }) => (
        <Box sx={{ 
        width: 280, 
        p: 3, 
        borderRight: '1px solid #E0E0E0', 
        height: 'calc(100vh - 64px)',
        position: 'sticky', 
        top: '64px',
        bgcolor: 'white',
        overflowY: 'auto'
        }}>
    <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2, display: 'block' }}>
      Categories
    </Typography>
    <List>
      <ListItem disablePadding>
        <ListItemButton 
          selected={selectedTopic === 'All'} 
          onClick={() => onSelectTopic('All')} 
          sx={{ 
            borderRadius: 2,
          }}
        >
          <ListItemIcon><GridViewIcon fontSize="small" sx={{ color: selectedTopic === 'All' ? 'primary.main' : 'inherit' }} /></ListItemIcon>
          <ListItemText primary="All Streams" />
        </ListItemButton>
      </ListItem>
      <Divider sx={{ my: 2 }} />
      {topics.map((topic) => (
        <ListItem key={topic.topic_id} disablePadding>
          <ListItemButton 
            selected={selectedTopic === topic.name} 
            onClick={() => onSelectTopic(topic.name)} 
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: topic.color, mr: 2 }} />
            <ListItemText primary={topic.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </Box>
);
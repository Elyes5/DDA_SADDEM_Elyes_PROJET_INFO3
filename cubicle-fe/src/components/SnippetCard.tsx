import React from 'react';
import { Card, CardHeader, CardContent, CardActions, Avatar, Typography, IconButton, Chip, Box } from '@mui/material';
import { FavoriteBorder, Visibility, ChatBubbleOutline, Share } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Snippet } from '../models/Snippet'

export const SnippetCard: React.FC<{ snippet: Snippet }> = ({ snippet }) => (
  <Card sx={{ mb: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #EEE' }}>
    <CardHeader
      avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}>{snippet.author.username[0]}</Avatar>}
      title={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{snippet.author.username}</Typography>}
      subheader={snippet.creation_date}
      action={<Chip label={snippet.language} size="small" variant="outlined" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }} />}
    />
    <CardContent sx={{ pt: 0 }}>
      <Typography variant="h6" gutterBottom>{snippet.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{snippet.description}</Typography>
      <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <SyntaxHighlighter 
        language={snippet.language ? snippet.language.toLowerCase() : 'javascript'} 
        style={vscDarkPlus} 
        customStyle={{ padding: '20px', margin: 0 }}
        children={String(snippet.code_content)}
        />
      </Box>
    </CardContent>
    <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton size="small"><FavoriteBorder fontSize="small" /><Typography variant="caption" sx={{ ml: 0.5 }}>{snippet.like_count}</Typography></IconButton>
        <IconButton size="small"><Visibility fontSize="small" /><Typography variant="caption" sx={{ ml: 0.5 }}>{snippet.view_count}</Typography></IconButton>
        <IconButton size="small"><ChatBubbleOutline fontSize="small" /><Typography variant="caption" sx={{ ml: 0.5 }}>Review</Typography></IconButton>
      </Box>
      <IconButton size="small"><Share fontSize="small" /></IconButton>
    </CardActions>
  </Card>
);

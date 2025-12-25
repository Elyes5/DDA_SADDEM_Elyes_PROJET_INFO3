import React, { useState } from 'react';
import { Container, Box, Typography, ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../theme/theme';
import { TopicSidebar } from '../components/TopicSidebar';
import { SnippetCard } from '../components/SnippetCard';
import type { Topic } from '../models/Topic';
import type { Snippet } from '../models/Snippet';
import type { User } from '../models/User';
import { InfoPanel } from '../components/InfoPanel';
const MOCK_USER: User = {
        user_id: 1,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        email : 'test@test.com',
        avatar_url: 'https://example.com/avatar.png',
        phone_number: '+123456789',
        followers: [],
      };

const MOCK_SNIPPETS: Snippet[] = [
  {
    snippet_id: 101,
    title: "React UseState Hook",
    description: "Exemple de base pour gérer un état local dans un composant.",
    code_content: "const [count, setCount] = useState(0);",
    language: "javascript",
    author: MOCK_USER,
    creation_date: "Dec 20, 2025",
    updated_at: "Dec 21, 2025",
    is_public: true,
    view_count: 500,
    like_count: 25,
    likes: [],
    reviews: [{ review_id: 1, reviewer: MOCK_USER, rating: 5, created_at: "Dec 22, 2025" }]
  },
  {
    snippet_id: 102,
    title: "TypeScript Interface",
    description: "Définition d'une interface pour un utilisateur API.",
    code_content: "interface User { id: number; name: string; }",
    language: "typescript",
    author: MOCK_USER,
    creation_date: "Dec 22, 2025",
    updated_at: "Dec 22, 2025",
    is_public: true,
    view_count: 850,
    like_count: 60,
    likes: [MOCK_USER],
    reviews: []
  },
  {
    snippet_id: 103,
    title: "SQL Inner Join",
    description: "Jointure classique entre les tables Users et Orders.",
    code_content: "SELECT * FROM Users JOIN Orders ON Users.id = Orders.user_id;",
    language: "sql",
    author: MOCK_USER,
    creation_date: "Dec 23, 2025",
    updated_at: "Dec 23, 2025",
    is_public: true,
    view_count: 320,
    like_count: 12,
    likes: [],
    reviews: []
  }
];

const MOCK_TOPICS: Topic[] = [
  { 
    topic_id: 1, 
    name: 'React', 
    color: '#61DAFB', 
    popularity_score: 50, 
    snippets: [MOCK_SNIPPETS[0]] 
  },
  { 
    topic_id: 2, 
    name: 'TypeScript', 
    color: '#3178C6', 
    popularity_score: 80, 
    snippets: [MOCK_SNIPPETS[1]] 
  },
  { 
    topic_id: 3, 
    name: 'SQL', 
    color: '#00758F', 
    popularity_score: 40, 
    snippets: [MOCK_SNIPPETS[2]] 
  },
];

import { Navbar } from '../components/Navbar';

export default function MainFeed() {
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  const filteredSnippets = selectedTopic === 'All' 
    ? MOCK_SNIPPETS 
    : MOCK_SNIPPETS.filter(s => s.language?.toLowerCase() === selectedTopic.toLowerCase());

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Navbar user={MOCK_USER} />

      <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', mt: '64px' }}>
        
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
           <TopicSidebar 
             topics={MOCK_TOPICS} 
             selectedTopic={selectedTopic} 
             onSelectTopic={setSelectedTopic} 
           />
        </Box>

        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Community <span style={{ color: theme.palette.primary.main }}>Feed</span>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {filteredSnippets.map(snip => (
                <SnippetCard key={snip.snippet_id} snippet={snip} />
              ))}
            </Box>
          </Container>
        </Box>

        <InfoPanel />

      </Box>
    </ThemeProvider>
  );
}
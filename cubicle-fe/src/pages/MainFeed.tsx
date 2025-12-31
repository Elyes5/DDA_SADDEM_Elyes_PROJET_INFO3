import React, { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  ThemeProvider,
  CssBaseline,
  CircularProgress,
} from '@mui/material'
import { theme } from '../theme/theme'
import { TopicSidebar } from '../components/TopicSidebar'
import { SnippetCard } from '../components/SnippetCard'
import { InfoPanel } from '../components/InfoPanel'
import { Navbar } from '../components/Navbar'
import {
  useAppSelector,
  useAppDispatch,
} from '../hooks/hooks'
import { fetchSnippets } from '../state/slices/snippetSlice'
import { fetchTopics } from '../state/slices/topicSlice'

const MainFeed: React.FC = () => {
  const dispatch = useAppDispatch()

  const [selectedTopic, setSelectedTopic] =
    useState<string>('All')

  const { user } = useAppSelector((state) => state.auth)
  const { snippets, loading: snippetsLoading } =
    useAppSelector((state) => state.snippets)
  const { topics, loading: topicsLoading } = useAppSelector(
    (state) => state.topics,
  )

  useEffect(() => {
    void dispatch(fetchSnippets())
    void dispatch(fetchTopics())
  }, [dispatch])

  const filteredSnippets =
    selectedTopic === 'All'
      ? snippets
      : snippets.filter(
          (s) =>
            s.language?.toLowerCase() ===
            selectedTopic.toLowerCase(),
        )

  if (snippetsLoading || topicsLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Navbar user={user} />

      <Box
        sx={{
          display: 'flex',
          bgcolor: 'background.default',
          minHeight: '100vh',
          mt: '64px',
        }}
      >
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <TopicSidebar
            topics={topics}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
          />
        </Box>

        <Box
          component="main"
          sx={{ flexGrow: 1, overflow: 'auto' }}
        >
          <Container
            maxWidth="md"
            sx={{ py: { xs: 3, md: 6 } }}
          >
            <Box
              sx={{
                mb: 4,
                justifyContent: 'center',
                display: 'flex',
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 800 }}
              >
                Community{' '}
                <span
                  style={{
                    color: theme.palette.primary.main,
                  }}
                >
                  Feed
                </span>
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              {filteredSnippets.length > 0 ? (
                filteredSnippets.map((snip) => (
                  <SnippetCard
                    key={snip.snippet_id}
                    snippet={snip}
                  />
                ))
              ) : (
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: 'center',
                    mt: 4,
                    color: 'text.secondary',
                  }}
                >
                  No snippets available for this topic.
                </Typography>
              )}
            </Box>
          </Container>
        </Box>

        <InfoPanel />
      </Box>
    </ThemeProvider>
  )
}

export default MainFeed

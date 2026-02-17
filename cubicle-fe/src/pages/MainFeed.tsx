import React, { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  ThemeProvider,
  CssBaseline,
  CircularProgress,
  Button,
  Paper,
  Stack,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PostAddIcon from '@mui/icons-material/PostAdd'
import FolderPlusIcon from '@mui/icons-material/CreateNewFolder'
import { theme } from '../theme/theme'
import { TopicSidebar } from '../components/TopicSidebar'
import { SnippetCard } from '../components/SnippetCard'
import { InfoPanel } from '../components/InfoPanel'
import { Navbar } from '../components/Navbar'
import { CreateSnippetModal } from '../components/CreateSnippetModal'
import { CreateTopicModal } from '../components/CreateTopicModal'
import { useAppSelector } from '../hooks/hooks'

const MainFeed: React.FC = () => {
  const [selectedTopic, setSelectedTopic] =
    useState<string>('All')
  const [isSnippetModalOpen, setIsSnippetModalOpen] =
    useState(false)
  const [isTopicModalOpen, setIsTopicModalOpen] =
    useState(false)

  const { user } = useAppSelector((state) => state.auth)
  const { snippets, loading: snippetsLoading } =
    useAppSelector((state) => state.snippets)
  const { topics, loading: topicsLoading } = useAppSelector(
    (state) => state.topics,
  )
  const filteredSnippets =
    selectedTopic === 'All'
      ? snippets
      : snippets.filter(
          (s) =>
            s.topic.name.toLowerCase() ===
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
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: '280px',
            flexShrink: 0,
          }}
        >
          <TopicSidebar
            topics={topics}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
          />
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              py: { xs: 3, md: 6 },
              px: { xs: 2, md: 4 },
              width: '100%',
            }}
          >
            {/* FIXED: Use a 3-column grid so the title stays truly centered
                and the buttons sit in their own column on the right */}
            <Box
              sx={{
                mb: 6,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: '1fr auto 1fr',
                },
                alignItems: 'center',
                gap: 2,
              }}
            >
              {/* Empty left spacer — only visible on lg+ to balance the buttons */}
              <Box sx={{ display: { xs: 'none', lg: 'block' } }} />

              {/* Title — always centered */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                Community{' '}
                <span style={{ color: theme.palette.primary.main }}>
                  Feed
                </span>
              </Typography>

              {/* Buttons — sit in the right column on lg, below title on mobile */}
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  justifyContent: { xs: 'center', lg: 'flex-end' },
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<FolderPlusIcon />}
                  onClick={() => setIsTopicModalOpen(true)}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  New Topic
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsSnippetModalOpen(true)}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                  }}
                >
                  Create Snippet
                </Button>
              </Stack>
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
                    key={snip.id}
                    snippet={snip}
                  />
                ))
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    py: 10,
                    px: 4,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 4,
                    bgcolor: 'transparent',
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'action.hover',
                      p: 2,
                      borderRadius: '50%',
                      mb: 2,
                    }}
                  >
                    <PostAddIcon
                      sx={{
                        fontSize: 48,
                        color: 'text.secondary',
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                  >
                    Aucun snippet trouvé
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, maxWidth: 300 }}
                  >
                    Il n'y a pas encore de contenu partagé
                    pour le thème "{selectedTopic}".
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setIsSnippetModalOpen(true)}
                  >
                    Partager un code
                  </Button>
                </Paper>
              )}
            </Box>
          </Container>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', lg: 'block' },
            width: '350px',
            flexShrink: 0,
          }}
        >
          <InfoPanel />
        </Box>
      </Box>

      <CreateSnippetModal
        open={isSnippetModalOpen}
        onClose={() => setIsSnippetModalOpen(false)}
      />
      <CreateTopicModal
        open={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
      />
    </ThemeProvider>
  )
}

export default MainFeed
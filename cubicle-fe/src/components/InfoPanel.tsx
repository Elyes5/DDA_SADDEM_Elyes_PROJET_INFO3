import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  CircularProgress,
  ListItemButton,
  Divider,
  Stack,
} from '@mui/material'
import {
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material'
import { useAppSelector } from '../hooks/hooks'

export const InfoPanel: React.FC = () => {
  const navigate = useNavigate()

  const { followers, loading: userLoading } =
    useAppSelector((state) => state.users)
  const { snippets } = useAppSelector(
    (state) => state.snippets,
  )

  const languageStats = snippets.reduce(
    (acc: Record<string, number>, curr) => {
      const lang = curr.language || 'Autre'
      acc[lang] = (acc[lang] || 0) + 1
      return acc
    },
    {},
  )

  const popularLanguage =
    Object.entries(languageStats).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0] || '...'

  const topSnippet = [...snippets].sort(
    (a, b) => (b.like_count || 0) - (a.like_count || 0),
  )[0]

  return (
    <Box
      sx={{
        width: 320,
        p: 3,
        display: { xs: 'none', lg: 'block' },
        position: 'sticky',
        top: 0,
        height: '100vh',
        borderLeft: '1px solid #E0E0E0',
        bgcolor: '#F8F9FA',
        overflowY: 'auto',
      }}
    >
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{
          mb: 2,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Live Pulse
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          background:
            'linear-gradient(135deg, #3B49DF 0%, #663399 100%)',
          color: 'white',
          borderRadius: 1,
          mb: 4,
          boxShadow: '0 4px 15px rgba(59, 73, 223, 0.3)',
        }}
      >
        <Stack spacing={2}>
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              mb={0.5}
            >
              <TrendingUp fontSize="small" />
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{
                  textTransform: 'uppercase',
                  opacity: 0.8,
                }}
              >
                Langage du moment
              </Typography>
            </Stack>
            <Typography variant="h5" fontWeight="900">
              {popularLanguage}
            </Typography>
          </Box>

          <Divider
            sx={{ borderColor: 'rgba(255,255,255,0.1)' }}
          />

          {topSnippet && (
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                mb={0.5}
              >
                <EmojiEvents
                  fontSize="small"
                  sx={{ color: '#FFD700' }}
                />
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{
                    textTransform: 'uppercase',
                    opacity: 0.8,
                  }}
                >
                  Snippet à la une
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                fontWeight="bold"
                noWrap
              >
                "{topSnippet.title}"
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.7 }}
              >
                par {topSnippet.author.username} •{' '}
                {topSnippet.like_count} likes
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{
          mb: 2,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Mes Abonnés ({followers.length})
      </Typography>

      <List sx={{ mb: 3 }}>
        {userLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 2,
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : followers.length > 0 ? (
          followers.map((follower) => (
            <ListItem
              key={follower.id}
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                onClick={() =>
                  void navigate(`/profile/${follower.id}`)
                }
                sx={{
                  borderRadius: 3,
                  px: 1.5,
                  '&:hover': { bgcolor: 'white' },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={follower.avatar_url ?? undefined}
                    sx={{
                      width: 40,
                      height: 40,
                      border: '2px solid #fff',
                      boxShadow:
                        '0 2px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    {follower.username[0].toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={follower.username}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 700,
                  }}
                  secondary="Voir le profil"
                  secondaryTypographyProps={{
                    variant: 'caption',
                    sx: {
                      color: 'primary.main',
                      fontWeight: 600,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: 'italic', pl: 1 }}
          >
            Aucun abonné pour le moment.
          </Typography>
        )}
      </List>

      <Box sx={{ mt: 'auto', pt: 4, opacity: 0.6 }}>
        <Typography
          variant="caption"
          display="block"
          fontWeight="bold"
        >
          © 2026 Cubicle
        </Typography>
      </Box>
    </Box>
  )
}

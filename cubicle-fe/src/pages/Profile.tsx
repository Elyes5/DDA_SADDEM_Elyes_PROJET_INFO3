import React, { useState, useRef } from 'react'
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Paper,
  Divider,
  Button,
  Stack,
  Container,
  Card,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Badge as MuiBadge,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import {
  Edit as EditIcon,
  Terminal as TerminalIcon,
  AddCircleOutline as AddIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Code as CodeIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material'

import { Navbar } from '../components/Navbar'
import CodeEditor from '../components/CodeEditor'
import type { User } from '../models/User'

const LANGUAGES = [
  'Javascript',
  'Python',
  'Typescript',
  'React JSX',
  'SQL',
  'CSS',
]

const getLanguageColor = (language: string) => {
  const colors: { [key: string]: string } = {
    python: '#3572A5',
    javascript: '#F7DF1E',
    typescript: '#3178C6',
    html: '#E34C26',
    css: '#563D7C',
    react: '#61DAFB',
    default: '#6e7681',
  }
  return colors[language.toLowerCase()] || colors.default
}

const Profile: React.FC<{ user: User }> = ({ user }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSnippetOpen, setIsSnippetOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileFormData, setProfileFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    bio: user.bio || '',
    avatar_url: user.avatar_url || '',
  })

  const [snippetFormData, setSnippetFormData] = useState({
    title: '',
    language: 'Javascript',
    description: '',
    code_content: '',
    is_public: true,
  })

  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () =>
        setProfileFormData({
          ...profileFormData,
          avatar_url: reader.result as string,
        })
      reader.readAsDataURL(file)
    }
  }

  const handleSaveSnippet = () => {
    console.log(
      'Envoi du nouveau snippet au backend :',
      snippetFormData,
    )
    setIsSnippetOpen(false)
    setSnippetFormData({
      title: '',
      language: 'Javascript',
      description: '',
      code_content: '',
      is_public: true,
    })
  }

  const snippetCount = user.snippets?.length || 0
  const totalLikes =
    user.snippets?.reduce(
      (acc, curr) => acc + (curr.like_count ?? 0),
      0,
    ) || 0

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#F4F6F8',
        pb: 6,
      }}
    >
      <Navbar user={user} />

      <Container maxWidth="lg" sx={{ pt: 12 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 5,
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '120px',
                  background:
                    'linear-gradient(to right, #3B49DF, #64b5f6)',
                  opacity: 0.1,
                  zIndex: 0,
                }}
              />
              <Stack
                alignItems="center"
                spacing={2}
                sx={{ position: 'relative', zIndex: 1 }}
              >
                <Avatar
                  src={user.avatar_url ?? undefined}
                  sx={{
                    width: 160,
                    height: 160,
                    border: '6px solid white',
                    boxShadow:
                      '0 8px 24px rgba(0,0,0,0.12)',
                    mb: 2,
                  }}
                />
                <Typography variant="h4" fontWeight="800">
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                >
                  @{user.username}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={() => setIsProfileOpen(true)}
                  sx={{
                    borderRadius: 3,
                    fontWeight: 'bold',
                  }}
                >
                  Modifier le profil
                </Button>
                <Divider sx={{ width: '100%', my: 2 }} />
                <Box
                  sx={{ width: '100%', textAlign: 'left' }}
                >
                  <Typography
                    variant="overline"
                    fontWeight="700"
                  >
                    À propos
                  </Typography>
                  <Typography variant="body2">
                    {user.bio || 'Aucune bio.'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 3, borderRadius: 4 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                    >
                      <Avatar
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          width: 56,
                          height: 56,
                        }}
                      >
                        <CodeIcon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h4"
                          fontWeight="800"
                        >
                          {snippetCount}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight="bold"
                        >
                          Snippets créés
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 3, borderRadius: 4 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                    >
                      <Avatar
                        sx={{
                          bgcolor: '#ffcdd2',
                          color: '#d32f2f',
                          width: 56,
                          height: 56,
                        }}
                      >
                        <FavoriteIcon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h4"
                          fontWeight="800"
                        >
                          {totalLikes}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight="bold"
                        >
                          Likes obtenus
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h5" fontWeight="800">
                    Mes Snippets
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setIsSnippetOpen(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Nouveau Snippet
                  </Button>
                </Stack>

                {snippetCount > 0 ? (
                  <Grid container spacing={3}>
                    {user.snippets?.map((s) => (
                      <Grid
                        size={{ xs: 12 }}
                        key={s.snippet_id}
                      >
                        <Card
                          elevation={2}
                          sx={{ borderRadius: 4 }}
                        >
                          <CardActionArea sx={{ p: 3 }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="primary"
                              >
                                {s.title}
                              </Typography>
                              <Chip
                                label={s.language}
                                size="small"
                                sx={{
                                  bgcolor: `${getLanguageColor(s.language ?? 'default')}20`,
                                  color: getLanguageColor(
                                    s.language ?? 'default',
                                  ),
                                  fontWeight: 'bold',
                                }}
                              />
                            </Stack>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              {s.description}
                            </Typography>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      borderRadius: 4,
                      border: '2px dashed #cdd7e0',
                    }}
                  >
                    <AddIcon
                      sx={{
                        fontSize: 60,
                        color: '#cdd7e0',
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6">
                      Aucun snippet pour le moment
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => setIsSnippetOpen(true)}
                    >
                      Créer mon premier code
                    </Button>
                  </Paper>
                )}
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Dialog
        open={isSnippetOpen}
        onClose={() => setIsSnippetOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <TerminalIcon color="primary" /> Nouveau Snippet
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 8 }}>
                <TextField
                  label="Titre"
                  fullWidth
                  required
                  value={snippetFormData.title}
                  onChange={(e) =>
                    setSnippetFormData({
                      ...snippetFormData,
                      title: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  select
                  label="Langage"
                  fullWidth
                  value={snippetFormData.language}
                  onChange={(e) =>
                    setSnippetFormData({
                      ...snippetFormData,
                      language: e.target.value,
                    })
                  }
                >
                  {LANGUAGES.map((l) => (
                    <MenuItem key={l} value={l}>
                      {l}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <TextField
              label="Description courte"
              fullWidth
              multiline
              rows={2}
              value={snippetFormData.description}
              onChange={(e) =>
                setSnippetFormData({
                  ...snippetFormData,
                  description: e.target.value,
                })
              }
            />
            <Typography
              variant="caption"
              fontWeight="bold"
              color="text.secondary"
              sx={{ mb: -2 }}
            >
              CONTENU DU CODE
            </Typography>
            <CodeEditor
              value={snippetFormData.code_content}
              language={snippetFormData.language}
              onChange={(code) =>
                setSnippetFormData({
                  ...snippetFormData,
                  code_content: code,
                })
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={snippetFormData.is_public}
                  onChange={(e) =>
                    setSnippetFormData({
                      ...snippetFormData,
                      is_public: e.target.checked,
                    })
                  }
                />
              }
              label="Rendre ce snippet public"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setIsSnippetOpen(false)}
            color="inherit"
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSnippet}
            disabled={
              !snippetFormData.title ||
              !snippetFormData.code_content
            }
          >
            Publier le snippet
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Modifier le profil
        </DialogTitle>
        <DialogContent dividers>
          <Stack
            spacing={3}
            sx={{ mt: 2, alignItems: 'center' }}
          >
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
            <MuiBadge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={
                <IconButton
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    width: 32,
                    height: 32,
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 18 }} />
                </IconButton>
              }
            >
              <Avatar
                src={profileFormData.avatar_url}
                sx={{ width: 100, height: 100 }}
              />
            </MuiBadge>
            <TextField
              label="Prénom"
              fullWidth
              value={profileFormData.first_name}
              onChange={(e) =>
                setProfileFormData({
                  ...profileFormData,
                  first_name: e.target.value,
                })
              }
            />
            <TextField
              label="Nom"
              fullWidth
              value={profileFormData.last_name}
              onChange={(e) =>
                setProfileFormData({
                  ...profileFormData,
                  last_name: e.target.value,
                })
              }
            />
            <TextField
              label="Biographie"
              fullWidth
              multiline
              rows={3}
              value={profileFormData.bio}
              onChange={(e) =>
                setProfileFormData({
                  ...profileFormData,
                  bio: e.target.value,
                })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setIsProfileOpen(false)}
            color="inherit"
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={() => setIsProfileOpen(false)}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Profile

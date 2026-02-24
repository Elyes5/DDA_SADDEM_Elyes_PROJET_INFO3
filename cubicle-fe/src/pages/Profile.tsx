import React, { useState, useEffect, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
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
  Tab,
  Tabs,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import {
  Edit as EditIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Code as CodeIcon,
  CodeOff as CodeOffIcon,
  Add as AddIcon,
} from '@mui/icons-material'

import { Navbar } from '../components/Navbar'
import { SnippetCard } from '../components/SnippetCard'
import { EditProfileModal } from '../components/EditProfileModal'
import { CreateSnippetModal } from '../components/CreateSnippetModal'
import { useAppSelector, useAppDispatch } from '../hooks/hooks'
import {
  fetchUserProfile,
  followUser,
  unfollowUser,
} from '../state/slices/userSlice'
import { ProfilePageSkeleton } from '../components/ProfilePageSkeleton.tsx'
interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

const EmptyStateCard: React.FC<EmptyStateProps> = ({
                                                     icon,
                                                     title,
                                                     description,
                                                     action,
                                                   }) => (
  <Grid size={{ xs: 12 }}>
    <Card
      variant="outlined"
      sx={{
        p: 6,
        textAlign: 'center',
        borderRadius: 4,
        borderStyle: 'dashed',
        bgcolor: 'transparent',
      }}
    >
      <Box
        sx={{
          color: 'text.secondary',
          mb: 2,
          '& svg': { fontSize: 60, opacity: 0.5 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" fontWeight="800" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      {action}
    </Card>
  </Grid>
)



export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()

  const authUser = useAppSelector((state) => state.auth.user)
  const profile = useAppSelector((state) => state.users.currentUserProfile)
  const loading = useAppSelector((state) => state.users.loading)

  const [activeTab, setActiveTab] = useState(0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    if (id) {
      void dispatch(fetchUserProfile(Number(id)))
    }
  }, [id, dispatch])

  const isMyProfile = authUser?.id === Number(id)
  const isFollowing = authUser?.following_ids?.includes(Number(id)) ?? false

  const isProfileMatchingUrl = profile?.id === Number(id)

  const handleFollowToggle = (): void => {
    if (!id) return
    if (isFollowing) {
      void dispatch(unfollowUser(Number(id)))
    } else {
      void dispatch(followUser(Number(id)))
    }
  }

  if (loading && !isProfileMatchingUrl) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#F8FAFC', pb: 6 }}>
        <Navbar user={authUser} />
        <ProfilePageSkeleton />
      </Box>
    )
  }

  if (!loading && !isProfileMatchingUrl) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <Navbar user={authUser} />
        <Typography sx={{ p: 10, textAlign: 'center', mt: 10 }}>
          Utilisateur introuvable
        </Typography>
      </Box>
    )
  }

  const totalLikes: number =
    profile?.snippets?.reduce(
      (acc: number, curr) => acc + (curr.like_count ?? 0),
      0,
    ) || 0

  return (
    <Box sx={{ minHeight: '100vh', background: '#F8FAFC', pb: 6 }}>
      <Navbar user={authUser ?? profile} />

      <Container maxWidth="lg" sx={{ pt: 12 }}>
        <Grid container spacing={4}>
          {/* ---- LEFT COLUMN ---- */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                borderRadius: 4,
                textAlign: 'center',
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <Avatar
                src={profile?.avatar_url ?? undefined}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  border: '3px solid #3B49DF',
                  boxShadow: '0 8px 20px rgba(59, 73, 223, 0.2)',
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {profile?.username ? profile.username[0].toUpperCase() : '?'}
              </Avatar>

              <Typography variant="h5" fontWeight="800">
                {profile?.first_name} {profile?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                @{profile?.username}
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ mb: 4, py: 2, bgcolor: '#F8FAFC', borderRadius: 3 }}
              >
                <Box textAlign="center">
                  <Typography variant="subtitle1" fontWeight="800">
                    {profile?.followers_count || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    Abonnés
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box textAlign="center">
                  <Typography variant="subtitle1" fontWeight="800">
                    {profile?.following_count || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    Suivis
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box textAlign="center">
                  <Typography variant="subtitle1" fontWeight="800">
                    {totalLikes}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    Likes
                  </Typography>
                </Box>
              </Stack>

              {isMyProfile ? (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditModalOpen(true)}
                  sx={{ borderRadius: 3, fontWeight: 'bold', py: 1 }}
                >
                  Modifier Profil
                </Button>
              ) : (
                <Button
                  variant={isFollowing ? 'outlined' : 'contained'}
                  fullWidth
                  onClick={handleFollowToggle}
                  disabled={loading}
                  startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                  sx={{ borderRadius: 3, fontWeight: 'bold', py: 1 }}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}

              <Divider sx={{ my: 4 }} />
              <Box textAlign="left">
                <Typography
                  variant="caption"
                  fontWeight="800"
                  color="primary"
                  sx={{ display: 'block', mb: 1, letterSpacing: 1 }}
                >
                  BIOGRAPHIE
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.primary' }}>
                  {profile?.bio || 'Aucune biographie renseignée pour le moment.'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* ---- RIGHT COLUMN ---- */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{ mb: 3, borderRadius: 4, bgcolor: 'white', border: '1px solid #E2E8F0' }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, v: number) => setActiveTab(v)}
                centered
                variant="fullWidth"
                sx={{ '& .MuiTab-root': { minHeight: 64, fontWeight: 'bold' } }}
              >
                <Tab
                  icon={<CodeIcon />}
                  iconPosition="start"
                  label={`Snippets (${profile?.snippets?.length || 0})`}
                />
                <Tab
                  icon={<FavoriteIcon />}
                  iconPosition="start"
                  label={`Favoris (${profile?.liked_snippets?.length || 0})`}
                />
              </Tabs>
            </Paper>

            {/* TAB 0 : SNIPPETS */}
            {activeTab === 0 && (
              <Stack spacing={3}>
                {profile?.snippets && profile.snippets.length > 0 ? (
                  profile.snippets.map((s) => <SnippetCard key={s.id} snippet={s} />)
                ) : (
                  <EmptyStateCard
                    icon={<CodeOffIcon />}
                    title="Aucun snippet publié"
                    description={
                      isMyProfile
                        ? "Vous n'avez pas encore partagé de code. Créez votre premier snippet !"
                        : "Cet utilisateur n'a pas encore publié de snippet."
                    }
                    action={
                      isMyProfile && (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setIsCreateModalOpen(true)}
                          sx={{ borderRadius: 2, fontWeight: 'bold' }}
                        >
                          Créer mon premier snippet
                        </Button>
                      )
                    }
                  />
                )}
              </Stack>
            )}

            {/* TAB 1 : FAVORIS */}
            {activeTab === 1 && (
              <Grid container spacing={2}>
                {profile?.liked_snippets && profile.liked_snippets.length > 0 ? (
                  profile.liked_snippets.map((ls) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={ls.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Chip
                            label={ls.language}
                            size="small"
                            sx={{ fontWeight: 'bold', borderRadius: 2 }}
                          />
                          <FavoriteIcon color="error" fontSize="small" />
                        </Stack>
                        <Typography variant="subtitle1" fontWeight="800" noWrap>
                          {ls.title}
                        </Typography>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <EmptyStateCard
                    icon={<FavoriteBorderIcon />}
                    title="Aucun favori"
                    description={
                      isMyProfile
                        ? 'Les snippets que vous aimez apparaîtront ici.'
                        : "Cet utilisateur n'a pas encore ajouté de favoris."
                    }
                  />
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* --- MODALS --- */}
      {profile && (
        <EditProfileModal
          key={isEditModalOpen ? `edit-${profile.id}` : 'closed'}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={profile}
        />
      )}

      <CreateSnippetModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </Box>
  )
}

export default Profile
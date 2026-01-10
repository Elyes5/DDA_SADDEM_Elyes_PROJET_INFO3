import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Box,
  Divider,
  Button,
  Collapse,
  TextField,
  InputAdornment,
  Rating,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  ContentCopy,
  PersonAddOutlined,
  PersonRemoveOutlined,
  Send,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WarningAmberRounded,
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

import type { Snippet } from '../models/Snippet'
import {
  useAppSelector,
  useAppDispatch,
} from '../hooks/hooks'
import {
  toggleLikeSnippet,
  deleteSnippet,
} from '../state/slices/snippetSlice'
import { addOrUpdateReview } from '../state/slices/reviewSlice'
import {
  followUser,
  unfollowUser,
} from '../state/slices/userSlice'
import { EditSnippetModal } from '../components/EditSnippetModal'

interface SnippetCardProps {
  snippet: Snippet
}

export const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
}) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { user } = useAppSelector((state) => state.auth)

  const [expanded, setExpanded] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false)

  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState<number | null>(5)

  const isLiked = snippet.likes?.some(
    (u) => u.id === user?.id,
  )
  const isOwner = user?.id === snippet.author.id
  const isFollowing =
    user?.following_ids?.includes(snippet.author.id) ??
    false

  const goToProfile = (userId: number) => {
    void navigate(`/profile/${userId}`)
  }

  const handleCopyCode = (): void => {
    if (snippet.code_content) {
      void navigator.clipboard.writeText(
        snippet.code_content,
      )
    }
  }

  const handleLike = (): void => {
    if (!user) return
    void dispatch(
      toggleLikeSnippet({
        id: snippet.id,
        isLike: !isLiked,
      }),
    )
  }

  const handleConfirmDelete = (): void => {
    void dispatch(deleteSnippet(snippet.id))
    setIsDeleteModalOpen(false)
  }

  const handleFollow = (): void => {
    if (!user || isOwner) return
    if (isFollowing) {
      void dispatch(unfollowUser(snippet.author.id))
    } else {
      void dispatch(followUser(snippet.author.id))
    }
  }

  const handleSubmitReview = (): void => {
    if (!reviewText.trim() || !user || isOwner) return
    void dispatch(
      addOrUpdateReview({
        snippetId: snippet.id,
        rating: rating ?? 5,
        comment: reviewText,
      }),
    )
    setReviewText('')
    setRating(5)
  }

  const formattedDate = new Date(
    snippet.creation_date,
  ).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <>
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          transition: 'border-color 0.2s ease',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          '&:hover': { borderColor: 'primary.main' },
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              src={snippet.author.avatar_url ?? undefined}
              sx={{
                bgcolor: 'primary.main',
                cursor: 'pointer',
              }}
              onClick={() => goToProfile(snippet.author.id)}
            >
              {snippet.author.username[0].toUpperCase()}
            </Avatar>
          }
          title={
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Typography
                variant="subtitle1"
                fontWeight={800}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' },
                }}
                onClick={() =>
                  goToProfile(snippet.author.id)
                }
              >
                {snippet.author.username}
              </Typography>
              {!isOwner && user && (
                <Button
                  size="small"
                  onClick={handleFollow}
                  variant={
                    isFollowing ? 'outlined' : 'text'
                  }
                  color={
                    isFollowing ? 'inherit' : 'primary'
                  }
                  startIcon={
                    isFollowing ? (
                      <PersonRemoveOutlined />
                    ) : (
                      <PersonAddOutlined />
                    )
                  }
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                  }}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </Stack>
          }
          subheader={formattedDate}
          action={
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              mt={1}
              mr={1}
            >
              {isOwner && (
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Modifier">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setIsEditModalOpen(true)
                      }
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setIsDeleteModalOpen(true)
                      }
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ mx: 0.5 }}
                  />
                </Stack>
              )}

              {snippet.topic && (
                <Chip
                  label={snippet.topic.name}
                  size="small"
                  color="primary"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.65rem',
                  }}
                />
              )}
              <Chip
                label={snippet.language ?? 'Text'}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.65rem',
                }}
              />
            </Stack>
          }
        />

        <CardContent sx={{ pt: 0 }}>
          <Typography variant="h6" fontWeight={800} mb={1}>
            {snippet.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            mb={2}
          >
            {snippet.description}
          </Typography>

          <Box
            sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <IconButton
              size="small"
              onClick={handleCopyCode}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                zIndex: 2,
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              <ContentCopy fontSize="inherit" />
            </IconButton>
            <SyntaxHighlighter
              language={
                snippet.language?.toLowerCase() ??
                'javascript'
              }
              style={vscDarkPlus}
              customStyle={{
                padding: '20px',
                margin: 0,
                fontSize: '0.8rem',
                backgroundColor: '#1e1e1e',
              }}
            >
              {String(snippet.code_content ?? '')}
            </SyntaxHighlighter>
          </Box>
        </CardContent>

        <CardActions
          sx={{
            px: 2,
            py: 1,
            justifyContent: 'space-between',
            bgcolor: 'grey.50',
          }}
        >
          <Stack direction="row" spacing={2}>
            <Box display="flex" alignItems="center">
              <IconButton
                size="small"
                onClick={handleLike}
                color={isLiked ? 'error' : 'default'}
              >
                {isLiked ? (
                  <Favorite fontSize="small" />
                ) : (
                  <FavoriteBorder fontSize="small" />
                )}
              </IconButton>
              <Typography
                variant="caption"
                fontWeight={700}
              >
                {snippet.like_count}
              </Typography>
            </Box>

            <Button
              size="small"
              startIcon={<ChatBubbleOutline />}
              onClick={() => setExpanded(!expanded)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                color: expanded
                  ? 'primary.main'
                  : 'text.secondary',
              }}
            >
              Reviews ({snippet.reviews?.length ?? 0})
            </Button>
          </Stack>
        </CardActions>

        <Collapse
          in={expanded}
          timeout="auto"
          unmountOnExit
        >
          <Divider />
          <Box p={2}>
            {!isOwner && user ? (
              <>
                <Typography
                  variant="subtitle2"
                  fontWeight={800}
                  mb={1}
                >
                  Laisser une review
                </Typography>
                <Stack spacing={2} mb={3}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Typography variant="caption">
                      Note :
                    </Typography>
                    <Rating
                      value={rating}
                      onChange={(_, v) => setRating(v)}
                      size="small"
                    />
                  </Box>
                  <TextField
                    fullWidth
                    placeholder="Votre avis sur ce code..."
                    multiline
                    rows={2}
                    value={reviewText}
                    onChange={(e) =>
                      setReviewText(e.target.value)
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleSubmitReview}
                            disabled={!reviewText.trim()}
                            color="primary"
                          >
                            <Send fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </>
            ) : isOwner ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mb: 2,
                  fontStyle: 'italic',
                }}
              >
                Vous ne pouvez pas évaluer votre propre
                snippet.
              </Typography>
            ) : null}

            <Stack spacing={2}>
              {snippet.reviews &&
              snippet.reviews.length > 0 ? (
                snippet.reviews.map((rev) => (
                  <Box
                    key={rev.id}
                    sx={{ display: 'flex', gap: 2 }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                      onClick={() =>
                        goToProfile(rev.reviewer.id)
                      }
                    >
                      {rev.reviewer.username[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          onClick={() =>
                            goToProfile(rev.reviewer.id)
                          }
                        >
                          {rev.reviewer.username}
                        </Typography>
                        <Rating
                          value={rev.rating}
                          readOnly
                          size="small"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: '0.8rem', mt: 0.5 }}
                      >
                        {rev.comment}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Aucune review pour le moment.
                </Typography>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Card>

      {isOwner && isEditModalOpen && (
        <EditSnippetModal
          key={`edit-${snippet.id}`}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          snippet={snippet}
        />
      )}

      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 800,
          }}
        >
          <WarningAmberRounded color="error" /> Confirmer la
          suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le snippet{' '}
            <strong>"{snippet.title}"</strong> ? Cette
            action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setIsDeleteModalOpen(false)}
            color="inherit"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Rating,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  ContentCopy,
  Send,
  EditOutlined as EditIcon,
  DeleteOutline as DeleteIcon,
  WarningAmberRounded,
  Check,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

import type { Snippet } from '../models/Snippet'
import { useAppSelector, useAppDispatch } from '../hooks/hooks'
import { syncLikeSnippet, optimisticToggleLike, deleteSnippet } from '../state/slices/snippetSlice'
import { addOrUpdateReview } from '../state/slices/reviewSlice'
import { followUser, unfollowUser } from '../state/slices/userSlice'
import { EditSnippetModal } from './EditSnippetModal.tsx'
import { getLangColor } from '../constants/languages'

interface SnippetCardProps {
  snippet: Snippet
}



export const SnippetCard: React.FC<SnippetCardProps> = ({ snippet }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  const [expanded, setExpanded] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState<number | null>(5)
  const [copied, setCopied] = useState(false)

  // Ref pour le debounce des likes et pour forcer la synchronisation avec le burst local
  const likeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const syncBurstRef = useRef<{ isLiked: boolean; originalIsLiked?: boolean } | null>(null)

  const isLiked = snippet.likes?.some((u) => u.id === user?.id)
  const isOwner = user?.id === snippet.author.id
  const isFollowing = user?.following_ids?.includes(snippet.author.id) ?? false
  const langColor = getLangColor(snippet.language)

  const goToProfile = (userId: number) => void navigate(`/profile/${userId}`)

  const handleCopyCode = () => {
    if (snippet.code_content) {
      void navigator.clipboard.writeText(snippet.code_content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLike = () => {
    if (!user) return

    // Evaluate the new state based on local burst intent, fallback to Redux state
    // We must use the current snapshot of syncBurstRef because React closures might have old `isLiked` values
    // if the user clicks multiple times before the component fully re-renders.
    const currentIsLiked = syncBurstRef.current !== null ? syncBurstRef.current.isLiked : Boolean(isLiked)
    const newIsLiked = !currentIsLiked

    // Record the original server state BEFORE applying the very first click in the burst
    if (syncBurstRef.current === null || syncBurstRef.current.originalIsLiked === undefined) {
      syncBurstRef.current = {
        isLiked: newIsLiked,
        originalIsLiked: Boolean(isLiked)
      };
    } else {
      // Just update the current intent
      syncBurstRef.current.isLiked = newIsLiked;
    }
    // Instant optimistic update
    dispatch(optimisticToggleLike({ id: snippet.id, isLike: newIsLiked, currentUser: user }))

    // Debounce the actual API call
    if (likeTimeoutRef.current) {
      clearTimeout(likeTimeoutRef.current)
    }

    likeTimeoutRef.current = setTimeout(() => {
      // Check if the final state after the burst is different from the original state
      const shouldSync = syncBurstRef.current?.isLiked !== syncBurstRef.current?.originalIsLiked;

      // Sync complete, clear burst context
      syncBurstRef.current = null

      if (shouldSync) {
        void dispatch(syncLikeSnippet({ id: snippet.id, isLike: newIsLiked, currentUser: user }))
      }
    }, 800)
  }

  const handleConfirmDelete = () => {
    void dispatch(deleteSnippet(snippet.id))
    setIsDeleteModalOpen(false)
  }

  const handleFollow = () => {
    if (!user || isOwner) return

    if (isFollowing) {
      void dispatch(unfollowUser(snippet.author.id))
    } else {
      void dispatch(followUser(snippet.author.id))
    }
  }

  const handleSubmitReview = () => {
    if (!reviewText.trim() || !user || isOwner) return
    void dispatch(addOrUpdateReview({ snippetId: snippet.id, rating: rating ?? 5, comment: reviewText }))
    setReviewText('')
    setRating(5)
  }

  const formattedDate = new Date(snippet.creation_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <Box
        sx={{
          bgcolor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          mb: 2,
          overflow: 'hidden',
        }}
      >
        {/* ── HEADER ── */}
        <Box sx={{ p: '16px 20px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={snippet.author.avatar_url ?? undefined}
              onClick={() => goToProfile(snippet.author.id)}
              sx={{
                width: 46,
                height: 46,
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
                bgcolor: langColor + '22',
                color: langColor,
                border: `2px solid ${langColor}44`,
              }}
            >
              {snippet.author.username[0].toUpperCase()}
            </Avatar>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  fontWeight={700}
                  fontSize="0.95rem"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, color: '#1a1a1a' }}
                  onClick={() => goToProfile(snippet.author.id)}
                >
                  {snippet.author.username}
                </Typography>

                {!isOwner && user && (
                  <>
                    <Typography sx={{ color: '#bbb', fontSize: '0.9rem' }}>•</Typography>
                    <Typography
                      onClick={handleFollow}
                      sx={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: isFollowing ? '#777' : '#0a66c2',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {isFollowing ? 'Suivi ✓' : '+ Suivre'}
                    </Typography>
                  </>
                )}
              </Stack>

              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                {snippet.topic && (
                  <>
                    <Typography fontSize="0.78rem" color="text.secondary">{snippet.topic.name}</Typography>
                    <Typography fontSize="0.78rem" color="text.secondary">·</Typography>
                  </>
                )}
                <Typography fontSize="0.78rem" color="text.secondary">{formattedDate}</Typography>
                <Typography fontSize="0.78rem" color="text.secondary">·</Typography>
                <Stack direction="row" spacing={0.4} alignItems="center">
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: langColor }} />
                  <Typography fontSize="0.78rem" sx={{ color: '#555', fontWeight: 500 }}>
                    {snippet.language ?? 'Plaintext'}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>

          {isOwner && (
            <Stack direction="row" spacing={0.25} mt={0.25}>
              <Tooltip title="Modifier">
                <IconButton size="small" onClick={() => setIsEditModalOpen(true)} sx={{ color: '#888', '&:hover': { color: '#0a66c2', bgcolor: '#e8f0fc' } }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Supprimer">
                <IconButton size="small" onClick={() => setIsDeleteModalOpen(true)} sx={{ color: '#888', '&:hover': { color: '#d32f2f', bgcolor: '#fdecea' } }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Box>

        {/* ── BODY ── */}
        <Box sx={{ px: '20px', pb: '16px' }}>
          <Typography fontWeight={800} fontSize="1.1rem" color="#1a1a1a" mb={0.75} lineHeight={1.3}>
            {snippet.title}
          </Typography>

          <Typography fontSize="0.9rem" color="#444" lineHeight={1.65} mb={2} sx={{ whiteSpace: 'pre-line' }}>
            {snippet.description}
          </Typography>

          {/* Images */}
          {snippet.images && snippet.images.length > 0 && (
            <Box mb={2}>
              {snippet.images.length === 1 ? (
                <Box sx={{ borderRadius: '4px', overflow: 'hidden', border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'center', bgcolor: '#fafafa' }}>
                  <img src={snippet.images[0].url} alt="Attachment" style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', display: 'block' }} />
                </Box>
              ) : (
                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e0e0e0', borderRadius: 4 } }}>
                  {snippet.images.map((img) => (
                    <Box key={img.id} sx={{ minWidth: 200, height: 150, borderRadius: '4px', overflow: 'hidden', flexShrink: 0, border: '1px solid #e8e8e8', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={img.url} alt={`Attachment ${img.id}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {/* Code block */}
          <Box sx={{ borderRadius: '4px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
              <Stack direction="row" spacing={0.6} mr={1.5}>
                {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
                  <Box key={i} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
                ))}
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: langColor }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#888', fontFamily: 'monospace' }}>
                  {snippet.language?.toLowerCase() ?? 'plaintext'}
                </Typography>
              </Stack>
              <Box flex={1} />
              <Tooltip title={copied ? 'Copié !' : 'Copier'}>
                <IconButton size="small" onClick={handleCopyCode} sx={{ color: copied ? '#2e7d32' : '#999', '&:hover': { bgcolor: '#ebebeb' } }}>
                  {copied ? <Check sx={{ fontSize: '0.9rem' }} /> : <ContentCopy sx={{ fontSize: '0.9rem' }} />}
                </IconButton>
              </Tooltip>
            </Box>

            <SyntaxHighlighter
              language={snippet.language?.toLowerCase() ?? 'javascript'}
              style={oneLight}
              customStyle={{ padding: '16px 20px', margin: 0, fontSize: '0.82rem', lineHeight: '1.6', backgroundColor: '#fafafa' }}
              showLineNumbers
              lineNumberStyle={{ color: '#ccc', userSelect: 'none', paddingRight: '12px', minWidth: '2.2em' }}
            >
              {String(snippet.code_content ?? '')}
            </SyntaxHighlighter>
          </Box>
        </Box>

        {/* ── STATS ROW ── */}
        {((snippet.like_count ?? 0) > 0 || (snippet.reviews?.length ?? 0) > 0) && (
          <Box sx={{ px: '20px', pb: '6px', display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {(snippet.like_count ?? 0) > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#e0245e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Favorite sx={{ fontSize: '0.55rem', color: '#fff' }} />
                </Box>
                <Typography fontSize="0.8rem" color="text.secondary">{snippet.like_count}</Typography>
              </Stack>
            )}
            {(snippet.like_count ?? 0) > 0 && (snippet.reviews?.length ?? 0) > 0 && (
              <Typography fontSize="0.8rem" color="text.secondary">·</Typography>
            )}
            {(snippet.reviews?.length ?? 0) > 0 && (
              <Typography
                fontSize="0.8rem"
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => setExpanded(!expanded)}
              >
                {snippet.reviews?.length} avis
              </Typography>
            )}
          </Box>
        )}

        {/* ── DIVIDER ── */}
        <Box sx={{ mx: '20px', borderTop: '1px solid #e8e8e8' }} />

        {/* ── ACTION BUTTONS ── */}
        <Box sx={{ px: 1, py: 0.5, display: 'flex' }}>
          <Button
            onClick={handleLike}
            startIcon={isLiked ? <Favorite sx={{ color: '#e0245e' }} /> : <FavoriteBorder />}
            sx={{
              flex: 1,
              color: isLiked ? '#e0245e' : '#666',
              fontWeight: 600,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderRadius: '6px',
              py: 0.75,
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            {isLiked ? 'Aimé' : "J'aime"}
          </Button>

          <Button
            onClick={() => setExpanded(!expanded)}
            startIcon={<ChatBubbleOutline />}
            endIcon={expanded ? <ExpandLess sx={{ fontSize: '1rem' }} /> : <ExpandMore sx={{ fontSize: '1rem' }} />}
            sx={{
              flex: 1,
              color: '#666',
              fontWeight: 600,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderRadius: '6px',
              py: 0.75,
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            Avis
          </Button>
        </Box>

        {/* ── REVIEWS SECTION ── */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ bgcolor: '#fafafa', borderTop: '1px solid #e8e8e8', px: '20px', pt: 2, pb: 2.5 }}>

            {!isOwner && user && (
              <Stack direction="row" spacing={1.5} mb={2.5} alignItems="flex-start">
                <Avatar
                  src={user.avatar_url ?? undefined}
                  sx={{ width: 38, height: 38, fontSize: '0.9rem', fontWeight: 700, bgcolor: '#e3f2fd', color: '#1565c0', flexShrink: 0 }}
                >
                  {user.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box flex={1}>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography fontSize="0.78rem" color="text.secondary">Note :</Typography>
                    <Rating
                      value={rating}
                      onChange={(_, v) => setRating(v)}
                      size="small"
                      sx={{ '& .MuiRating-iconFilled': { color: '#f4a821' } }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    placeholder="Partagez votre avis sur ce snippet..."
                    multiline
                    minRows={2}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        bgcolor: '#fff',
                        fontSize: '0.875rem',
                        '& fieldset': { borderColor: '#e0e0e0' },
                        '&:hover fieldset': { borderColor: '#bdbdbd' },
                        '&.Mui-focused fieldset': { borderColor: '#0a66c2' },
                      },
                    }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end" sx={{ alignSelf: 'flex-end', mb: 0.5 }}>
                            <IconButton
                              onClick={handleSubmitReview}
                              disabled={!reviewText.trim()}
                              sx={{ color: reviewText.trim() ? '#0a66c2' : '#ccc', '&:hover': { bgcolor: '#e8f0fc' } }}
                            >
                              <Send fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    }}
                  />
                </Box>
              </Stack>
            )}

            {isOwner && (
              <Typography fontSize="0.8rem" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                Vous ne pouvez pas évaluer votre propre snippet.
              </Typography>
            )}

            <Stack spacing={1.5}>
              {snippet.reviews && snippet.reviews.length > 0 ? (
                snippet.reviews.map((rev) => (
                  <Stack key={rev.id} direction="row" spacing={1.25} alignItems="flex-start">
                    <Avatar
                      onClick={() => goToProfile(rev.reviewer.id)}
                      sx={{ width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', bgcolor: '#f0f0f0', color: '#555', flexShrink: 0 }}
                    >
                      {rev.reviewer.username[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, bgcolor: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', px: 1.75, py: 1.25 }}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={0.4}>
                        <Typography
                          fontSize="0.82rem"
                          fontWeight={700}
                          color="#1a1a1a"
                          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          onClick={() => goToProfile(rev.reviewer.id)}
                        >
                          {rev.reviewer.username}
                        </Typography>
                        <Rating value={rev.rating} readOnly size="small" sx={{ fontSize: '0.72rem', '& .MuiRating-iconFilled': { color: '#f4a821' } }} />
                      </Stack>
                      <Typography fontSize="0.85rem" color="#444" lineHeight={1.55}>
                        {rev.comment}
                      </Typography>
                    </Box>
                  </Stack>
                ))
              ) : (
                <Typography fontSize="0.85rem" color="text.secondary" textAlign="center" py={1.5}>
                  {isOwner ? 'Aucun avis pour le moment.' : 'Aucun avis pour le moment. Soyez le premier !'}
                </Typography>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Box>

      {/* ── MODALS ── */}
      {isOwner && isEditModalOpen && (
        <EditSnippetModal key={`edit-${snippet.id}`} open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} snippet={snippet} />
      )}

      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        slotProps={{
          paper: { sx: { borderRadius: '12px', p: 0.5, maxWidth: 420 } }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontWeight: 700, fontSize: '1.05rem', color: '#1a1a1a' }}>
          <WarningAmberRounded sx={{ color: '#f44336' }} fontSize="small" />
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.65 }}>
            Êtes-vous sûr de vouloir supprimer <strong>"{snippet.title}"</strong> ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button onClick={() => setIsDeleteModalOpen(false)} sx={{ fontWeight: 600, color: '#555', textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#f5f5f5' } }}>
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disableElevation sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '8px' }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
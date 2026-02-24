import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Backdrop,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import {
  useAppDispatch,
  useAppSelector,
} from '../hooks/hooks'
import {
  updateSnippet,
  clearSnippetError,
} from '../state/slices/snippetSlice'
import CodeEditor from './CodeEditor'
import type { Snippet } from '../models/Snippet'
import type { SnippetImage } from '../models/SnippetImage'

interface ImageItem {
  file: File
  previewUrl: string
}

interface EditSnippetModalProps {
  open: boolean
  onClose: () => void
  snippet: Snippet
}

export const EditSnippetModal: React.FC<
  EditSnippetModalProps
> = ({ open, onClose, snippet }) => {
  const dispatch = useAppDispatch()

  const { topics } = useAppSelector((state) => state.topics)
  const { loading, error } = useAppSelector(
    (state) => state.snippets,
  )

  const [formData, setFormData] = useState({
    title: snippet.title || '',
    description: snippet.description || '',
    code_content: snippet.code_content || '',
    language: snippet.language || 'Javascript',
    topic_id: snippet.topic?.id?.toString() || '',
    is_public: snippet.is_public ?? true,
  })

  const [existingImages, setExistingImages] = useState<SnippetImage[]>(snippet.images || [])
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([])
  const [newImages, setNewImages] = useState<ImageItem[]>([])

  const [prevSnippetId, setPrevSnippetId] = useState(snippet.id)

  if (snippet.id !== prevSnippetId) {
    setPrevSnippetId(snippet.id)
    setFormData({
      title: snippet.title || '',
      description: snippet.description || '',
      code_content: snippet.code_content || '',
      language: snippet.language || 'Javascript',
      topic_id: snippet.topic?.id?.toString() || '',
      is_public: snippet.is_public ?? true,
    })
    setExistingImages(snippet.images || [])
    setDeletedImageIds([])
    newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    setNewImages([])
  }

  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    }
  }, [newImages])

  const handleCloseModal = () => {
    newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl))

    setNewImages([])
    setDeletedImageIds([])
    setExistingImages(snippet.images || [])
    setFormData({
      title: snippet.title || '',
      description: snippet.description || '',
      code_content: snippet.code_content || '',
      language: snippet.language || 'Javascript',
      topic_id: snippet.topic?.id?.toString() || '',
      is_public: snippet.is_public ?? true,
    })

    dispatch(clearSnippetError())
    onClose()
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCodeChange = (code: string) => {
    setFormData((prev) => ({ ...prev, code_content: code }))
  }

  const handleToggle = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      is_public: e.target.checked,
    }))
  }

  const handleRemoveExistingImage = (imageId: number) => {
    setDeletedImageIds((prev) => [...prev, imageId])
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }))

      setNewImages((prev) => [...prev, ...selectedFiles])
      e.target.value = ''
    }
  }

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].previewUrl)
      updated.splice(index, 1)
      return updated
    })
  }

  const handleSubmit = async () => {
    const topicIdNum = Number(formData.topic_id)

    if (
      !formData.title ||
      !formData.description ||
      isNaN(topicIdNum) ||
      !formData.code_content
    )
      return

    const payloadData = new FormData()
    payloadData.append('title', formData.title)
    payloadData.append('description', formData.description)
    payloadData.append('code_content', formData.code_content)
    payloadData.append('language', formData.language)
    payloadData.append('is_public', formData.is_public.toString())
    payloadData.append('topic_id', topicIdNum.toString())

    if (deletedImageIds.length > 0) {
      payloadData.append('deleted_image_ids', deletedImageIds.join(','))
    }

    newImages.forEach((img) => {
      payloadData.append('images', img.file)
    })

    const result = await dispatch(
      updateSnippet({
        id: snippet.id,
        snippetData: payloadData,
      }),
    )

    if (updateSnippet.fulfilled.match(result)) {
      handleCloseModal()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleCloseModal}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            position: 'relative',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Backdrop
        open={loading}
        sx={{
          position: 'absolute',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="body2" fontWeight={600} color="primary">
          Mise à jour en cours...
        </Typography>
      </Backdrop>

      <DialogTitle
        sx={{
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Modifier le Snippet
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert
              severity="error"
              variant="filled"
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          <TextField
            name="title"
            label="Titre"
            fullWidth
            value={formData.title}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              select
              name="topic_id"
              label="Thème"
              fullWidth
              value={formData.topic_id}
              onChange={handleChange}
              required
              disabled={loading}
            >
              {topics.map((topic) => (
                <MenuItem
                  key={topic.id}
                  value={topic.id.toString()}
                >
                  {topic.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              name="language"
              label="Langage"
              fullWidth
              value={formData.language}
              onChange={handleChange}
              disabled={loading}
            >
              {[
                'Javascript',
                'Python',
                'Typescript',
                'React JSX',
                'SQL',
                'Java',
                'CSS',
              ].map((lang) => (
                <MenuItem key={lang} value={lang}>
                  {lang}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mb: 1,
                display: 'block',
                fontWeight: 600,
              }}
            >
              IMAGES
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Ajouter des images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>

            {(existingImages.length > 0 || newImages.length > 0) && (
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {existingImages.map((img) => (
                  <Box
                    key={`existing-${img.id}`}
                    sx={{
                      position: 'relative',
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <img
                      src={img.url}
                      alt="Existing"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveExistingImage(img.id)}
                      disabled={loading}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        padding: '4px',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}

                {newImages.map((img, index) => (
                  <Box
                    key={img.previewUrl}
                    sx={{
                      position: 'relative',
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '2px dashed',
                      borderColor: 'primary.main',
                    }}
                  >
                    <img
                      src={img.previewUrl}
                      alt={`New preview ${index}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveNewImage(index)}
                      disabled={loading}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        padding: '4px',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mb: 1,
                display: 'block',
                fontWeight: 600,
              }}
            >
              CONTENU DU CODE
            </Typography>
            <CodeEditor
              value={formData.code_content}
              language={formData.language}
              onChange={handleCodeChange}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_public}
                onChange={handleToggle}
                color="primary"
                disabled={loading}
              />
            }
            label="Rendre ce snippet public"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleCloseModal}
          color="inherit"
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          onClick={() => {
            void handleSubmit()
          }}
          variant="contained"
          disabled={
            loading ||
            !formData.title ||
            !formData.description ||
            !formData.topic_id ||
            !formData.code_content
          }
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  )
}
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
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import {
  useAppDispatch,
  useAppSelector,
} from '../hooks/hooks'
import {
  createSnippet,
  clearSnippetError,
} from '../state/slices/snippetSlice'
import CodeEditor from './CodeEditor'
import { type CreateSnippetRequest } from '../interfaces/SnippetContrat'

// Nouvelle interface pour lier le fichier physique à son URL d'aperçu
interface ImageItem {
  file: File
  previewUrl: string
}

interface CreateSnippetModalProps {
  open: boolean
  onClose: () => void
}

export const CreateSnippetModal: React.FC<
  CreateSnippetModalProps
> = ({ open, onClose }) => {
  const dispatch = useAppDispatch()

  const { topics } = useAppSelector((state) => state.topics)
  const { loading, error } = useAppSelector(
    (state) => state.snippets,
  )

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code_content: '',
    language: 'Javascript',
    topic_id: '',
    is_public: true,
  })

  // Un seul state pour gérer les fichiers et leurs aperçus
  const [images, setImages] = useState<ImageItem[]>([])

  useEffect(() => {
    if (!open) {
      dispatch(clearSnippetError())
    }
  }, [open, dispatch])

  const handleCloseModal = () => {
    // Nettoyer les URLs pour éviter les fuites de mémoire
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl))

    setFormData({
      title: '',
      description: '',
      code_content: '',
      language: 'Javascript',
      topic_id: '',
      is_public: true,
    })
    setImages([])
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file), // Création de l'URL directement ici
      }))

      setImages((prev) => [...prev, ...selectedFiles])

      // Réinitialiser la valeur de l'input pour permettre de resélectionner le même fichier si besoin
      e.target.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      // Libérer la mémoire de l'image supprimée
      URL.revokeObjectURL(newImages[index].previewUrl)
      newImages.splice(index, 1)
      return newImages
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

    // Construction directe du FormData ici pour éviter que Redux ne supprime les objets File
    const payloadData = new FormData()
    payloadData.append('title', formData.title)
    payloadData.append('description', formData.description)
    payloadData.append('code_content', formData.code_content)
    payloadData.append('language', formData.language)
    payloadData.append('is_public', formData.is_public.toString())
    payloadData.append('topic_id', topicIdNum.toString())

    images.forEach((img) => {
      // img.file contient l'objet File réel
      payloadData.append('images', img.file)
    })

    // On cast vers unknown puis vers CreateSnippetRequest pour satisfaire TypeScript et éviter l'erreur ESLint "any"
    const result = await dispatch(
      createSnippet(payloadData as unknown as CreateSnippetRequest)
    )

    if (createSnippet.fulfilled.match(result)) {
      handleCloseModal()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleCloseModal}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Créer un nouveau Snippet
        {loading && <CircularProgress size={24} />}
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
            helperText="Expliquez brièvement ce que fait ce code"
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
              <MenuItem value="Javascript">Javascript</MenuItem>
              <MenuItem value="Python">Python</MenuItem>
              <MenuItem value="Typescript">Typescript</MenuItem>
              <MenuItem value="React JSX">React JSX</MenuItem>
              <MenuItem value="SQL">SQL</MenuItem>
              <MenuItem value="Java">Java</MenuItem>
              <MenuItem value="CSS">CSS</MenuItem>
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
              IMAGES (OPTIONNEL)
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

            {/* Section des aperçus d'images */}
            {images.length > 0 && (
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {images.map((img, index) => (
                  <Box
                    key={img.previewUrl}
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
                      src={img.previewUrl}
                      alt={`Preview ${index}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(index)}
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
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : null
          }
        >
          {loading ? 'Publication...' : 'Publier'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
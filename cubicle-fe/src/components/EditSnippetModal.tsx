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
} from '@mui/material'
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

  useEffect(() => {
    if (!open) dispatch(clearSnippetError())
  }, [open, dispatch])

  useEffect(() => {
    if (!open) {
      dispatch(clearSnippetError())
    }
  }, [open, dispatch])

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

  const handleSubmit = async () => {
    const topicIdNum = Number(formData.topic_id)

    if (
      !formData.title ||
      !formData.description ||
      isNaN(topicIdNum) ||
      !formData.code_content
    )
      return

    const result = await dispatch(
      updateSnippet({
        id: snippet.id,
        snippetData: {
          title: formData.title,
          description: formData.description,
          code_content: formData.code_content,
          language: formData.language,
          is_public: formData.is_public,
          topic: snippet.topic,
        },
      }),
    )

    if (updateSnippet.fulfilled.match(result)) {
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
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
        Modifier le Snippet
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
          onClick={onClose}
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
          {loading
            ? 'Enregistrement...'
            : 'Enregistrer les modifications'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

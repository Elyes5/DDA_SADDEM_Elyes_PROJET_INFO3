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
  Alert
} from '@mui/material'
import { useAppDispatch, useAppSelector } from '../hooks/hooks'
import { createSnippet, clearSnippetError } from '../state/slices/snippetSlice'
import CodeEditor from './CodeEditor'
import { type CreateSnippetRequest } from '../interfaces/SnippetContrat'

interface CreateSnippetModalProps {
  open: boolean
  onClose: () => void
}

export const CreateSnippetModal: React.FC<CreateSnippetModalProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch()
  
  const { topics } = useAppSelector((state) => state.topics)
  const { loading, error } = useAppSelector((state) => state.snippets)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code_content: '',
    language: 'Javascript',
    topic_id: '',
    is_public: true
  })

  useEffect(() => {
    if (!open) {
      dispatch(clearSnippetError())
    }
  }, [open, dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCodeChange = (code: string) => {
    setFormData((prev) => ({ ...prev, code_content: code }))
  }

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, is_public: e.target.checked }))
  }

  const handleSubmit = async () => {
    const topicIdNum = Number(formData.topic_id)
    
    if (!formData.title || !formData.description || isNaN(topicIdNum) || !formData.code_content) return

    const payload: CreateSnippetRequest = {
      title: formData.title,
      description: formData.description,
      code_content: formData.code_content,
      language: formData.language,
      is_public: formData.is_public,
      topic_id: topicIdNum
    }

    const result = await dispatch(createSnippet(payload))

    if (createSnippet.fulfilled.match(result)) {
      setFormData({ 
        title: '', 
        description: '', 
        code_content: '', 
        language: 'Javascript', 
        topic_id: '', 
        is_public: true 
      })
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Créer un nouveau Snippet
        {loading && <CircularProgress size={24} />}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          
          {error && (
            <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
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
                <MenuItem key={topic.id} value={topic.id.toString()}>
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
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
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
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Annuler
        </Button>
        <Button 
          onClick={() => { void handleSubmit() }} 
          variant="contained" 
          disabled={loading || !formData.title || !formData.description || !formData.topic_id || !formData.code_content}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Publication...' : 'Publier'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
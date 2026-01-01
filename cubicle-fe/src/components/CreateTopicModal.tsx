import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material'
import { useAppDispatch } from '../hooks/hooks'
import { createTopic } from '../state/slices/topicSlice'

interface CreateTopicModalProps {
  open: boolean
  onClose: () => void
}

export const CreateTopicModal: React.FC<CreateTopicModalProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) return

    const result = await dispatch(createTopic({ name, description }))

    if (createTopic.fulfilled.match(result)) {
      setName('')
      setDescription('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>Nouveau Thème</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Nom du thème"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="ex: Machine Learning"
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="De quoi traite ce thème ?"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Annuler</Button>
        <Button 
          onClick={() => { void handleSubmit() }} 
          variant="contained" 
          disabled={!name.trim()}
        >
          Créer
        </Button>
      </DialogActions>
    </Dialog>
  )
}
import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Backdrop,
  CircularProgress,
  Typography,
} from '@mui/material'
import { useAppDispatch, useAppSelector } from '../hooks/hooks'
import { createTopic } from '../state/slices/topicSlice'

interface CreateTopicModalProps {
  open: boolean
  onClose: () => void
}

export const CreateTopicModal: React.FC<
  CreateTopicModalProps
> = ({ open, onClose }) => {
  const dispatch = useAppDispatch()
  
  const loading = useAppSelector((state) => state.topics?.loading)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleCloseModal = () => {
    setName('')
    setDescription('')
    onClose()
  }

  const handleSubmit = async () => {
    if (!name.trim()) return

    const result = await dispatch(
      createTopic({ name, description }),
    )

    if (createTopic.fulfilled.match(result)) {
      handleCloseModal()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleCloseModal}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
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
          Création en cours...
        </Typography>
      </Backdrop>

      <DialogTitle sx={{ fontWeight: 700 }}>
        Nouveau Thème
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Nom du thème"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            placeholder="ex: Machine Learning"
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            placeholder="De quoi traite ce thème ?"
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
          disabled={!name.trim() || loading}
          sx={{ fontWeight: 'bold', minWidth: 100 }}
        >
          Créer
        </Button>
      </DialogActions>
    </Dialog>
  )
}
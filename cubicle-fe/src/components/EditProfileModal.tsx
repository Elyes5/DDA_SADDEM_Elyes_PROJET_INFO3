import React, { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  Backdrop,
  Typography,
} from '@mui/material'
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material'
import {
  useAppDispatch,
  useAppSelector,
} from '../hooks/hooks'
import { updateProfile } from '../state/slices/userSlice'
import type { User } from '../models/User'

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
  user: User
}

export const EditProfileModal: React.FC<
  EditProfileModalProps
> = ({ open, onClose, user }) => {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loading = useAppSelector(
    (state) => state.users.loading,
  )

  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    bio: user.bio || '',
    avatarFile: null as File | null,
    avatarPreview: user.avatar_url || '',
  })

  const [prevUserId, setPrevUserId] = useState(user.id)

  if (user.id !== prevUserId) {
    setPrevUserId(user.id)
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      bio: user.bio || '',
      avatarFile: null,
      avatarPreview: user.avatar_url || '',
    })
  }

  useEffect(() => {
    return () => {
      if (formData.avatarFile) {
        URL.revokeObjectURL(formData.avatarPreview)
      }
    }
  }, [formData.avatarFile, formData.avatarPreview])

  const handleCloseModal = () => {
    if (formData.avatarFile) {
      URL.revokeObjectURL(formData.avatarPreview)
    }
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      bio: user.bio || '',
      avatarFile: null,
      avatarPreview: user.avatar_url || '',
    })
    onClose()
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (formData.avatarFile) {
        URL.revokeObjectURL(formData.avatarPreview)
      }
      setFormData((prev) => ({
        ...prev,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file),
      }))
      e.target.value = ''
    }
  }

  const handleSave = (): void => {
    const data = new FormData()
    data.append('first_name', formData.first_name)
    data.append('last_name', formData.last_name)
    data.append('bio', formData.bio)

    if (formData.avatarFile) {
      data.append('avatar', formData.avatarFile)
    }

    void dispatch(updateProfile(data))
      .unwrap()
      .then(() => {
        handleCloseModal()
      })
      .catch((err) => {
        console.error(
          'Erreur lors de la mise à jour :',
          err,
        )
      })
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
          Mise à jour en cours...
        </Typography>
      </Backdrop>

      <DialogTitle sx={{ fontWeight: 800 }}>
        Modifier mon profil
      </DialogTitle>

      <DialogContent dividers>
        <Stack
          spacing={3}
          sx={{ mt: 1, alignItems: 'center' }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={formData.avatarPreview}
              sx={{
                width: 100,
                height: 100,
                border: '2px solid #E2E8F0',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
              }}
            >
              {user.username?.[0]?.toUpperCase()}
            </Avatar>
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              }}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Box>

          <TextField
            label="Prénom"
            fullWidth
            value={formData.first_name}
            disabled={loading}
            onChange={(e) =>
              setFormData({
                ...formData,
                first_name: e.target.value,
              })
            }
          />

          <TextField
            label="Nom"
            fullWidth
            value={formData.last_name}
            disabled={loading}
            onChange={(e) =>
              setFormData({
                ...formData,
                last_name: e.target.value,
              })
            }
          />

          <TextField
            label="Biographie"
            fullWidth
            multiline
            rows={3}
            placeholder="Parlez-nous de vous..."
            value={formData.bio}
            disabled={loading}
            onChange={(e) =>
              setFormData({
                ...formData,
                bio: e.target.value,
              })
            }
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
          variant="contained"
          onClick={handleSave}
          disabled={loading || !formData.first_name || !formData.last_name}
          sx={{ fontWeight: 'bold', minWidth: 100 }}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  )
}
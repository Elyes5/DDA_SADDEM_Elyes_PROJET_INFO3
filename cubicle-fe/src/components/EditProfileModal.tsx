import React, { useState, useRef } from 'react'
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
    first_name: user.first_name,
    last_name: user.last_name,
    bio: user.bio || '',
    avatarFile: null as File | null,
    avatarPreview: user.avatar_url || '',
  })

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData((prev) => ({
        ...prev,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file),
      }))
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
        onClose()
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
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
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
              }}
            >
              {user.username[0].toUpperCase()}
            </Avatar>
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
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
          onClick={onClose}
          color="inherit"
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={{ fontWeight: 'bold', minWidth: 100 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Enregistrer'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

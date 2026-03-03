import React, { useState, type SVGProps } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  Divider,
} from '@mui/material'
import Logout from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../hooks/hooks'
import { logoutUser } from '../state/slices/authSlice'
import type { User } from '../models/User'
import { NotificationBell } from './NotificationBell'

interface NavbarProps {
  user: User | null
}

const CubicleLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="white"
    {...props}
  >
    <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.9 12.24 21.95 12.07 21.95C11.9 21.95 11.73 21.9 11.57 21.82L3.67 17.38C3.35 17.21 3.14 16.88 3.14 16.5V7.5C3.14 7.12 3.35 6.79 3.67 6.62L11.57 2.18C11.89 2 12.25 2 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5ZM12 4.15L6.04 7.5L12 10.85L17.96 7.5L12 4.15Z" />
  </svg>
)

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleNavigateProfile = () => {
    void navigate('/profile')
    handleCloseMenu()
  }

  const handleNavigateHome = () => {
    void navigate('/home')
  }

  const handleLogout = async () => {
    handleCloseMenu()
    await dispatch(logoutUser())
    void navigate('/login')
  }

  if (!user) return null

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'white',
        borderBottom: '1px solid #E0E0E0',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box
          onClick={handleNavigateHome}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
          }}
        >
          <Box
            sx={{
              bgcolor: 'primary.main',
              p: 0.5,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <CubicleLogo />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, letterSpacing: -0.5 }}
          >
            Cubicle
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <NotificationBell />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {user.username}
          </Typography>
          <IconButton
            onClick={handleOpenMenu}
            size="small"
            aria-controls={
              open ? 'account-menu' : undefined
            }
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar
              src={user.avatar_url ?? undefined}
              alt={user.username}
              sx={{
                width: 35,
                height: 35,
                border: '1px solid #E0E0E0',
              }}
            />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleCloseMenu}
          onClick={handleCloseMenu}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter:
                'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
        >
          <MenuItem onClick={handleNavigateProfile}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => void handleLogout()}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Logout
                fontSize="small"
                sx={{ color: 'error.main' }}
              />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
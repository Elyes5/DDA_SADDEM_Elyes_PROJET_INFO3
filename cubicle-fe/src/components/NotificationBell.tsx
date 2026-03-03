import React, { useState } from 'react'
import {
    Badge,
    IconButton,
    Popover,
    Box,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Button,
    Divider,
    Tooltip,
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import { useAppDispatch, useAppSelector } from '../hooks/hooks'
import { markAllNotificationsRead } from '../state/slices/notificationSlice'

function timeAgo(isoDate: string): string {
    const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

export const NotificationBell: React.FC = () => {
    const dispatch = useAppDispatch()
    const { items, unreadCount } = useAppSelector(
        (state) => state.notifications,
    )
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const open = Boolean(anchorEl)

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleMarkRead = () => {
        void dispatch(markAllNotificationsRead())
    }

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton onClick={handleOpen} size="small" sx={{ color: 'text.primary' }}>
                    <Badge badgeContent={unreadCount} color="error" max={99}>
                        {unreadCount > 0 ? (
                            <NotificationsIcon />
                        ) : (
                            <NotificationsNoneIcon />
                        )}
                    </Badge>
                </IconButton>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            width: 360,
                            maxHeight: 460,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            mt: 1.5,
                            filter: 'drop-shadow(0px 4px 16px rgba(0,0,0,0.10))',
                        },
                    },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
                    }}
                >
                    <Typography variant="subtitle1" fontWeight={700}>
                        Notifications
                    </Typography>
                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            onClick={handleMarkRead}
                            sx={{ textTransform: 'none', fontSize: 12 }}
                        >
                            Mark all as read
                        </Button>
                    )}
                </Box>

                {/* List */}
                <Box sx={{ overflowY: 'auto', flex: 1 }}>
                    {items.length === 0 ? (
                        <Box
                            sx={{
                                py: 6,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                                color: 'text.secondary',
                            }}
                        >
                            <NotificationsNoneIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                            <Typography variant="body2">No notifications yet</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {items.map((n, idx) => (
                                <React.Fragment key={n.id}>
                                    <ListItem
                                        alignItems="flex-start"
                                        sx={{
                                            px: 2,
                                            py: 1.2,
                                            transition: 'background 0.15s',
                                            bgcolor: n.is_read ? 'transparent' : 'primary.50',
                                            '&:hover': { bgcolor: 'action.hover' },
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={n.actor?.avatar_url ?? undefined}
                                                alt={n.actor?.username}
                                                sx={{ width: 36, height: 36 }}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                                                    {n.message}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ mt: 0.25, display: 'block' }}
                                                >
                                                    {timeAgo(n.created_at)}
                                                </Typography>
                                            }
                                        />
                                        {!n.is_read && (
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: 'primary.main',
                                                    flexShrink: 0,
                                                    mt: 0.8,
                                                    ml: 1,
                                                }}
                                            />
                                        )}
                                    </ListItem>
                                    {idx < items.length - 1 && (
                                        <Divider component="li" />
                                    )}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Box>
            </Popover>
        </>
    )
}

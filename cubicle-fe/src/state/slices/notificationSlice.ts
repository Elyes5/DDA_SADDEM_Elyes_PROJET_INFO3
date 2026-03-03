import {
    createAsyncThunk,
    createSlice,
    type PayloadAction,
} from '@reduxjs/toolkit'
import type { AppNotification } from '../../models/Notification'
import { notificationService } from '../../services/NotificationService'

interface NotificationState {
    items: AppNotification[]
    unreadCount: number
    loading: boolean
}

const initialState: NotificationState = {
    items: [],
    unreadCount: 0,
    loading: false,
}

export const fetchNotifications = createAsyncThunk<
    AppNotification[],
    void,
    { rejectValue: string }
>('notifications/fetch', async (_, { rejectWithValue }) => {
    try {
        return await notificationService.getNotifications()
    } catch {
        return rejectWithValue('Failed to fetch notifications')
    }
})

export const markAllNotificationsRead = createAsyncThunk<
    void,
    void,
    { rejectValue: string }
>('notifications/markRead', async (_, { rejectWithValue }) => {
    try {
        await notificationService.markAllRead()
    } catch {
        return rejectWithValue('Failed to mark notifications as read')
    }
})

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        pushNotification(state, action: PayloadAction<AppNotification>) {
            state.items.unshift(action.payload)
            state.unreadCount += 1
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true
            })
            .addCase(
                fetchNotifications.fulfilled,
                (state, action: PayloadAction<AppNotification[]>) => {
                    state.loading = false
                    state.items = action.payload
                    state.unreadCount = action.payload.filter((n) => !n.is_read).length
                },
            )
            .addCase(fetchNotifications.rejected, (state) => {
                state.loading = false
            })
            .addCase(markAllNotificationsRead.fulfilled, (state) => {
                state.unreadCount = 0
                state.items = state.items.map((n) => ({ ...n, is_read: true }))
            })
    },
})

export const { pushNotification } = notificationSlice.actions
export default notificationSlice.reducer

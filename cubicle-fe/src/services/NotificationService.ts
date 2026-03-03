import axios from 'axios'
import type { AppNotification } from '../models/Notification'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export const notificationService = {
    async getNotifications(): Promise<AppNotification[]> {
        const res = await axios.get<AppNotification[]>(
            `${API_BASE}/api/notifications/`,
            { withCredentials: true }
        )
        return res.data
    },

    async markAllRead(): Promise<void> {
        await axios.patch(
            `${API_BASE}/api/notifications/read`,
            {},
            { withCredentials: true }
        )
    },

    getStreamUrl(): string {
        return `${API_BASE}/api/notifications/stream`
    },
}

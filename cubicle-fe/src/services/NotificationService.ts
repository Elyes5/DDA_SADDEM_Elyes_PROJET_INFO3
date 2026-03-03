import api from '../api/api'
import type { AppNotification } from '../models/Notification'

export const notificationService = {
    async getNotifications(): Promise<AppNotification[]> {
        const { data } = await api.get<AppNotification[]>('/api/notifications/')
        return data
    },

    async markAllRead(): Promise<void> {
        await api.patch('/api/notifications/read')
    },

    getStreamUrl(): string {
        return `${import.meta.env.VITE_API_URL ?? ''}/api/notifications/stream`
    },
}

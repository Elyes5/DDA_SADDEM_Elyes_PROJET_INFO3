export interface AppNotification {
    id: number
    message: string
    is_read: boolean
    created_at: string
    actor: {
        id: number
        username: string
        avatar_url: string | null
    } | null
    snippet: {
        id: number
        title: string
    } | null
}

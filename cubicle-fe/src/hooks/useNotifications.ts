import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from './hooks'
import { fetchNotifications, pushNotification } from '../state/slices/notificationSlice'
import { notificationService } from '../services/NotificationService'
import type { AppNotification } from '../models/Notification'

export function useNotifications() {
    const dispatch = useAppDispatch()
    const user = useAppSelector((state) => state.auth.user)
    const esRef = useRef<EventSource | null>(null)

    useEffect(() => {
        if (!user) {
            // Close SSE connection on logout
            esRef.current?.close()
            esRef.current = null
            return
        }

        // Hydrate existing notifications from the REST API
        void dispatch(fetchNotifications())

        // Open the SSE stream
        const es = new EventSource(notificationService.getStreamUrl(), {
            withCredentials: true,
        })
        esRef.current = es

        es.onmessage = (event: MessageEvent) => {
            try {
                const notification = JSON.parse(event.data as string) as AppNotification
                dispatch(pushNotification(notification))
            } catch (e) {
                console.error('[SSE] Failed to parse notification', e)
            }
        }

        es.onerror = () => {
            // Browser automatically reconnects on error; just log it
            console.warn('[SSE] Notification stream error — browser will retry')
        }

        return () => {
            es.close()
            esRef.current = null
        }
    }, [user, dispatch])
}

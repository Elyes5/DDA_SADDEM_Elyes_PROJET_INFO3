import { Navigate, Outlet } from 'react-router-dom'
import {
  useAppSelector,
  useAppDispatch,
} from '../hooks/hooks'
import { fetchPublicSnippets } from '../state/slices/snippetSlice'
import { fetchTopics } from '../state/slices/topicSlice'
import { useEffect } from 'react'

export const ProtectedRoute = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    void dispatch(fetchPublicSnippets())
    void dispatch(fetchTopics())
  }, [dispatch])

  const { user } = useAppSelector((state) => state.auth)

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export const PublicRoute = () => {
  const { user } = useAppSelector((state) => state.auth)

  return user ? <Navigate to="/home" replace /> : <Outlet />
}
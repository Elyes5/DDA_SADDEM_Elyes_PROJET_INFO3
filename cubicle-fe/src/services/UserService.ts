import api from '../api/api'
import type { User } from '../models/User'
import type MessageResponse from '../interfaces/MessageResponse'

export const userService = {

  getUserProfile: async (userId: number): Promise<User> => {
    const { data } = await api.get<User>(`/api/users/${userId}`)
    return data
  },


  followUser: async (userId: number): Promise<MessageResponse> => {
    const { data } = await api.post<MessageResponse>(`/api/users/${userId}/follow`)
    return data
  },

  unfollowUser: async (userId: number): Promise<MessageResponse> => {
    const { data } = await api.post<MessageResponse>(`/api/users/${userId}/unfollow`)
    return data
  },

  getFollowers: async (userId: number): Promise<User[]> => {
    const { data } = await api.get<User[]>(`/api/users/${userId}/followers`)
    return data
  },

  getFollowing: async (userId: number): Promise<User[]> => {
    const { data } = await api.get<User[]>(`/api/users/${userId}/following`)
    return data
  },
  
  updateProfile: async (formData: FormData): Promise<User> => {
  const { data } = await api.put<{ message: string; user: User }>(
    '/api/auth/edit', 
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data.user
 }
}
import api from '../api/api'
import type { User } from '../models/User'

export interface AuthResponse {
  message: string
  user?: User
}

export const authService = {
  async login(email: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      '/api/auth/login/',
      { email },
    )
    return data
  },

  async verifyCode(
    email: string,
    code: string,
  ): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      '/api/auth/verify-code/',
      { email, code },
    )
    return data
  },

  async register(
    formData: FormData,
  ): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      '/api/auth/register/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return data
  },

  async logout(): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      '/api/auth/logout/',
    )
    return data
  },

  async checkAuth(): Promise<User> {
    const { data } =
      await api.get<User>('/api/auth/me/')
    return data
  },

}

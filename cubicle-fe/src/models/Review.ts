import type { User } from './User'

export interface Review {
  id: number
  reviewer: User
  rating: number
  comment: string
  snippet_id: number
  created_at: string
}

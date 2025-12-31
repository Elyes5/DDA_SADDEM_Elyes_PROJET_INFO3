import type { User } from './User'

export interface Review {
  review_id: number
  reviewer: User
  rating: number
  created_at: string
}

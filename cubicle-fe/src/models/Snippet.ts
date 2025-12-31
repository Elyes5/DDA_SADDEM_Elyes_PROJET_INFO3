import type { Review } from './Review'
import type { User } from './User'

export interface Snippet {
  snippet_id: number
  author: User
  title: string
  description: string
  code_content?: string | null
  language?: string | null
  view_count: number
  like_count: number
  creation_date: string
  updated_at: string
  is_public: boolean
  likes: User[]
  reviews: Review[]
}

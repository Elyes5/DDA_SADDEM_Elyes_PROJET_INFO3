import type { Review } from './Review'
import type { Topic } from './Topic'
import type { User } from './User'

export interface Snippet {
  id: number
  author: User
  title: string
  description: string
  topic: Topic
  code_content?: string | null
  language?: string | null
  like_count: number
  creation_date: string
  updated_at: string
  is_public: boolean
  likes: User[]
  reviews: Review[]
}

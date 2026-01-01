import type { Snippet } from './Snippet'
export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  avatar_url: string | null
  is_verified: boolean
  phone_number?: string
  bio?: string
  join_date: string
  last_login?: string
  snippets: Snippet[]
  liked_snippets: Snippet[]
  is_following: boolean
  followers_count: number
  following_count: number
  following_ids: number[]
}

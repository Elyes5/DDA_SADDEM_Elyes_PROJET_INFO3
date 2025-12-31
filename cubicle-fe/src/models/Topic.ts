import type { Snippet } from './Snippet'

export interface Topic {
  topic_id: number
  name: string
  color: string
  popularity_score: number
  description?: string | null
  snippets: Snippet[]
}

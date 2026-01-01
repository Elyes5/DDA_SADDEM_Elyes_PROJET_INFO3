import type { Snippet } from './Snippet'

export interface Topic {
  id: number
  name: string
  popularity_score: number
  description?: string | null
  snippets: Snippet[]
}

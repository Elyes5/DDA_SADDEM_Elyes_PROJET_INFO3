import api from '../api/api'
import type { Snippet } from '../models/Snippet'

export const snippetService = {
  getAllSnippets: async (): Promise<Snippet[]> => {
    const { data } =
      await api.get<Snippet[]>('/api/snippets')
    return data
  },
}

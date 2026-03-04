import api from '../api/api'
import type { Snippet } from '../models/Snippet'

export const snippetService = {
  getPublicSnippets: async (
    page = 1,
    limit = 10,
    topic = 'All',
    signal?: AbortSignal,
    language = 'All',
    sortBy = 'newest',
  ): Promise<{ snippets: Snippet[], hasMore: boolean, total: number }> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      topic,
      sort_by: sortBy,
    })
    if (language && language.toLowerCase() !== 'all') {
      params.set('language', language)
    }
    const { data } = await api.get<{ snippets: Snippet[], hasMore: boolean, total: number }>(
      `/api/snippets/?${params.toString()}`,
      { signal }
    )
    return data
  },

  getSnippet: async (
    snippetId: number,
  ): Promise<Snippet> => {
    const { data } = await api.get<Snippet>(
      `/api/snippets/${snippetId}/`,
    )
    return data
  },

  getSnippetsByTopic: async (
    topicId: number,
  ): Promise<Snippet[]> => {
    const { data } = await api.get<Snippet[]>(
      `/api/snippets/topic/${topicId}/`,
    )
    return data
  },

  getUserSnippets: async (
    userId: number,
  ): Promise<Snippet[]> => {
    const { data } = await api.get<Snippet[]>(
      `/api/snippets/user/${userId}/`,
    )
    return data
  },

  createSnippet: async (
    snippetData: FormData,
  ): Promise<Snippet> => {
    const { data } = await api.post<Snippet>(
      '/api/snippets/',
      snippetData,
    )
    return data
  },

  updateSnippet: async (
    snippetId: number,
    snippetData: FormData,
  ): Promise<Snippet> => {
    const { data } = await api.put<Snippet>(
      `/api/snippets/${snippetId}/`,
      snippetData,
    )
    return data
  },

  deleteSnippet: async (
    snippetId: number,
  ): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>(
      `/api/snippets/${snippetId}/`,
    )
    return data
  },

  likeSnippet: async (
    snippetId: number,
    signal?: AbortSignal,
  ): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>(
      `/api/snippets/${snippetId}/like/`,
      {},
      { signal }
    )
    return data
  },

  unlikeSnippet: async (
    snippetId: number,
    signal?: AbortSignal,
  ): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>(
      `/api/snippets/${snippetId}/unlike/`,
      {},
      { signal }
    )
    return data
  },
}

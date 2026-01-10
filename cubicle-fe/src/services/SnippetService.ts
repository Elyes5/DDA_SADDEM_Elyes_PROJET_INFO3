import api from '../api/api'
import type { Snippet } from '../models/Snippet'

export const snippetService = {
  getPublicSnippets: async (): Promise<Snippet[]> => {
    const { data } = await api.get<Snippet[]>(
      '/api/snippets/',
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
    snippetData: Partial<Snippet>,
  ): Promise<Snippet> => {
    const { data } = await api.post<Snippet>(
      '/api/snippets/',
      snippetData,
    )
    return data
  },

  updateSnippet: async (
    snippetId: number,
    snippetData: Partial<Snippet>,
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
  ): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>(
      `/api/snippets/${snippetId}/like/`,
    )
    return data
  },

  unlikeSnippet: async (
    snippetId: number,
  ): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>(
      `/api/snippets/${snippetId}/unlike/`,
    )
    return data
  },
}

import api from '../api/api'
import type MessageResponse from '../interfaces/MessageResponse'
import type ReviewResponse from '../interfaces/ReviewResponse'

export const reviewService = {
  postReview: async (snippetId: number, rating: number, comment: string): Promise<ReviewResponse> => {
    const { data } = await api.post<ReviewResponse>(`/api/reviews/snippet/${snippetId}`, { 
      rating, 
      comment 
    })
    return data
  },

  deleteReview: async (snippetId: number): Promise<MessageResponse> => {
    const { data } = await api.delete<MessageResponse>(`/api/reviews/snippet/${snippetId}`)
    return data
  }
}
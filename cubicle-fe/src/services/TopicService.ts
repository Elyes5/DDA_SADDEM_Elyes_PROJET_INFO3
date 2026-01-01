import api from '../api/api'
import type { Topic } from '../models/Topic'

export const topicService = {
  getAllTopics: async (): Promise<Topic[]> => {
    const { data } = await api.get<Topic[]>('/api/topics')
    return data
  },
  
  createTopic: async (topicData: Partial<Topic>): Promise<Topic> => {
    const { data } = await api.post<Topic>('/api/topics/', topicData)
    return data
  },
}

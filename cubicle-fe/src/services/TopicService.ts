import api from '../api/api';
import type { Topic } from '../models/Topic';

export const topicService = {
  getAllTopics: async (): Promise<Topic[]> => {
    const { data } = await api.get<Topic[]>('/api/topics');
    return data;
  }
};
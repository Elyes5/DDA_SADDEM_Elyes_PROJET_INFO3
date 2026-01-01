import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { topicService } from '../../services/TopicService'
import type { Topic } from '../../models/Topic'
import axios from 'axios'
import type ApiError from '../../interfaces/ApiError'

interface TopicState {
  topics: Topic[]
  loading: boolean
  error: string | null
}

const initialState: TopicState = {
  topics: [],
  loading: false,
  error: null,
}

const handleAxiosError = (err: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError<ApiError>(err) && err.response?.data) {
    const errorData = err.response.data
    return String(errorData.error || defaultMessage)
  }
  return defaultMessage
}

// --- Thunks ---

export const fetchTopics = createAsyncThunk<Topic[], void, { rejectValue: string }>(
  'topics/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await topicService.getAllTopics()
    } catch (err) {
      return rejectWithValue(handleAxiosError(err, 'Échec de la récupération des thèmes'))
    }
  }
)

export const createTopic = createAsyncThunk<Topic, Partial<Topic>, { rejectValue: string }>(
  'topics/create',
  async (topicData, { rejectWithValue }) => {
    try {
      return await topicService.createTopic(topicData)
    } catch (err) {
      return rejectWithValue(handleAxiosError(err, 'Échec de la création du thème'))
    }
  }
)

// --- Slice ---

const topicSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    clearTopicError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Topics
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.loading = false
        state.topics = action.payload
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Une erreur est survenue lors du chargement'
      })

      // Create Topic
      .addCase(createTopic.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.loading = false
        state.topics.push(action.payload)
      })
      .addCase(createTopic.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Une erreur est survenue lors de la création'
      })
  },
})

export const { clearTopicError } = topicSlice.actions
export default topicSlice.reducer
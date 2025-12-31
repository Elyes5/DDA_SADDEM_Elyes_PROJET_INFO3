import {
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit'
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

export const fetchTopics = createAsyncThunk<
  Topic[],
  void,
  { rejectValue: string }
>('topics/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await topicService.getAllTopics()
  } catch (err) {
    if (
      axios.isAxiosError<ApiError>(err) &&
      err.response?.data
    ) {
      return rejectWithValue(err.response.data.message)
    }
    return rejectWithValue('Failed to fetch topics')
  }
})

const topicSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.loading = false
        state.topics = action.payload
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'An error occurred'
      })
  },
})

export default topicSlice.reducer

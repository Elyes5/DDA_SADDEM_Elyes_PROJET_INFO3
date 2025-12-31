import {
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit'
import { snippetService } from '../../services/SnippetService'
import type { Snippet } from '../../models/Snippet'
import axios from 'axios'
import type ApiError from '../../interfaces/ApiError'

interface SnippetState {
  snippets: Snippet[]
  loading: boolean
  error: string | null
}

const initialState: SnippetState = {
  snippets: [],
  loading: false,
  error: null,
}

export const fetchSnippets = createAsyncThunk<
  Snippet[],
  void,
  { rejectValue: string }
>('snippets/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await snippetService.getAllSnippets()
  } catch (err) {
    if (
      axios.isAxiosError<ApiError>(err) &&
      err.response?.data
    ) {
      return rejectWithValue(err.response.data.message)
    }
    return rejectWithValue('Failed to fetch snippets')
  }
})
const snippetSlice = createSlice({
  name: 'snippets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSnippets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSnippets.fulfilled, (state, action) => {
        state.loading = false
        state.snippets = action.payload
      })
      .addCase(fetchSnippets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'An error occurred'
      })
  },
})

export default snippetSlice.reducer

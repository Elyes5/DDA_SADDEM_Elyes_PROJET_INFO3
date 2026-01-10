import {
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit'
import { reviewService } from '../../services/ReviewService'
import axios from 'axios'
import type ApiError from '../../interfaces/ApiError'
import type ReviewResponse from '../../interfaces/ReviewResponse'
import type { User } from '../../models/User'

interface ReviewState {
  loading: boolean
  error: string | null
  lastActionMessage: string | null
}

const initialState: ReviewState = {
  loading: false,
  error: null,
  lastActionMessage: null,
}

const handleAxiosError = (
  err: unknown,
  defaultMessage: string,
): string => {
  if (
    axios.isAxiosError<ApiError>(err) &&
    err.response?.data
  ) {
    return String(err.response.data.error || defaultMessage)
  }
  return defaultMessage
}

// --- Thunks ---

export const addOrUpdateReview = createAsyncThunk<
  ReviewResponse,
  { snippetId: number; rating: number; comment: string },
  { rejectValue: string }
>(
  'reviews/addOrUpdate',
  async (
    { snippetId, rating, comment },
    { rejectWithValue },
  ) => {
    try {
      return await reviewService.postReview(
        snippetId,
        rating,
        comment,
      )
    } catch (err) {
      return rejectWithValue(
        handleAxiosError(
          err,
          "Échec de l'envoi de la review",
        ),
      )
    }
  },
)

export const removeReview = createAsyncThunk<
  { snippetId: number; userId: number },
  number,
  {
    rejectValue: string
    state: { auth: { user: User | null } }
  }
>(
  'reviews/delete',
  async (snippetId, { rejectWithValue, getState }) => {
    try {
      await reviewService.deleteReview(snippetId)
      const userId = getState().auth.user?.id
      if (!userId) throw new Error('Utilisateur non trouvé')

      return { snippetId, userId }
    } catch (err) {
      return rejectWithValue(
        handleAxiosError(
          err,
          'Échec de la suppression de la review',
        ),
      )
    }
  },
)

// --- Slice ---

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewStatus: (state) => {
      state.error = null
      state.lastActionMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Add / Update
      .addCase(addOrUpdateReview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        addOrUpdateReview.fulfilled,
        (state, action) => {
          state.loading = false
          state.lastActionMessage = action.payload.message
        },
      )
      .addCase(
        addOrUpdateReview.rejected,
        (state, action) => {
          state.loading = false
          state.error =
            action.payload ?? 'Une erreur est survenue'
        },
      )

      // Delete
      .addCase(removeReview.pending, (state) => {
        state.loading = true
      })
      .addCase(removeReview.fulfilled, (state) => {
        state.loading = false
        state.lastActionMessage = 'Review supprimée'
      })
      .addCase(removeReview.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ?? 'Erreur de suppression'
      })
  },
})

export const { clearReviewStatus } = reviewSlice.actions
export default reviewSlice.reducer

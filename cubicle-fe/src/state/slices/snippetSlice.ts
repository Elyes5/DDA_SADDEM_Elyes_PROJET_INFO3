import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { snippetService } from '../../services/SnippetService'
import { type CreateSnippetRequest } from '../../interfaces/SnippetContrat'
import type { Snippet } from '../../models/Snippet'
import type { User } from '../../models/User'
import axios from 'axios'
import type ApiError from '../../interfaces/ApiError'
import type ReviewResponse from '../../interfaces/ReviewResponse'
import { addOrUpdateReview, removeReview } from './reviewSlice'

interface SnippetState {
  snippets: Snippet[]
  currentSnippet: Snippet | null
  loading: boolean
  error: string | null
}

const initialState: SnippetState = {
  snippets: [],
  currentSnippet: null,
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

export const fetchPublicSnippets = createAsyncThunk<Snippet[], void, { rejectValue: string }>(
  'snippets/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await snippetService.getPublicSnippets()
    } catch (err) {
      return rejectWithValue(handleAxiosError(err, 'Échec de la récupération des snippets'))
    }
  }
)

export const fetchSnippetById = createAsyncThunk<Snippet, number, { rejectValue: string }>(
  'snippets/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await snippetService.getSnippet(id)
    } catch (err) {
      return rejectWithValue(handleAxiosError(err, 'Impossible de charger le snippet'))
    }
  }
)

export const createSnippet = createAsyncThunk<Snippet, CreateSnippetRequest, { rejectValue: string }>(
  'snippets/create',
  async (snippetData, { rejectWithValue }) => {
    try {
      return await snippetService.createSnippet(snippetData)
    } catch (err) {
      return rejectWithValue(handleAxiosError(err, 'Échec de la création du snippet'))
    }
  }
)

export const updateSnippet = createAsyncThunk<
  Snippet, 
  { id: number; snippetData: Partial<Snippet> }, 
  { rejectValue: string }
>(
  'snippets/update',
  async ({ id, snippetData }, { rejectWithValue }) => {
    try {
      return await snippetService.updateSnippet(id, snippetData)
    } catch (err) {
      return rejectWithValue(handleAxiosError(err, 'Échec de la mise à jour du snippet'))
    }
  }
)

export const deleteSnippet = createAsyncThunk<number, number, { rejectValue: string }>(
  'snippets/delete',
  async (id, { rejectWithValue }) => {
    try {
      await snippetService.deleteSnippet(id)
      return id
    } catch (err) {
      return rejectWithValue(handleAxiosError(err, 'Échec de la suppression du snippet'))
    }
  }
)

export const toggleLikeSnippet = createAsyncThunk<
  { id: number; isLike: boolean; currentUser: User | null },
  { id: number; isLike: boolean },
  { rejectValue: string; state: { auth: { user: User | null } } }
>(
  'snippets/toggleLike',
  async ({ id, isLike }, { getState, rejectWithValue }) => {
    try {
      if (isLike) {
        await snippetService.likeSnippet(id)
      } else {
        await snippetService.unlikeSnippet(id)
      }
      const currentUser = getState().auth.user
      return { id, isLike, currentUser }
    } catch (err) {
      return rejectWithValue(handleAxiosError(err, 'Échec du traitement du like/unlike'))
    }
  }
)

// --- Slice ---

const snippetSlice = createSlice({
  name: 'snippets',
  initialState,
  reducers: {
    clearSnippetError: (state) => {
      state.error = null
    },
    setCurrentSnippet: (state, action: PayloadAction<Snippet | null>) => {
      state.currentSnippet = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH ALL ---
      .addCase(fetchPublicSnippets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPublicSnippets.fulfilled, (state, action) => {
        state.loading = false
        state.snippets = action.payload
      })
      .addCase(fetchPublicSnippets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Une erreur est survenue'
      })

      // --- FETCH BY ID ---
      .addCase(fetchSnippetById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSnippetById.fulfilled, (state, action) => {
        state.loading = false
        state.currentSnippet = action.payload
      })
      .addCase(fetchSnippetById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Impossible de charger ce snippet'
      })

      // --- CREATE ---
      .addCase(createSnippet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSnippet.fulfilled, (state, action) => {
        state.loading = false
        state.snippets.unshift(action.payload)
      })
      .addCase(createSnippet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Erreur lors de la création'
      })

      // --- UPDATE ---
      .addCase(updateSnippet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSnippet.fulfilled, (state, action) => {
        state.loading = false
        const index = state.snippets.findIndex((s) => s.id === action.payload.id)
        if (index !== -1) state.snippets[index] = action.payload
        if (state.currentSnippet?.id === action.payload.id) state.currentSnippet = action.payload
      })
      .addCase(updateSnippet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Erreur lors de la mise à jour'
      })

      // --- DELETE ---
      .addCase(deleteSnippet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSnippet.fulfilled, (state, action) => {
        state.loading = false
        state.snippets = state.snippets.filter((s) => s.id !== action.payload)
        if (state.currentSnippet?.id === action.payload) state.currentSnippet = null
      })
      .addCase(deleteSnippet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Erreur lors de la suppression'
      })

      // --- LIKE / UNLIKE ---
      .addCase(toggleLikeSnippet.pending, (state) => {
        state.error = null
      })
      .addCase(toggleLikeSnippet.fulfilled, (state, action) => {
        const user = action.payload.currentUser
        const applyLike = (s: Snippet) => {
          if (action.payload.isLike) {
            s.like_count = (s.like_count || 0) + 1
            if (!s.likes) s.likes = []
            if (user) s.likes.push(user)
          } else {
            s.like_count = Math.max(0, (s.like_count || 0) - 1)
            if (user) s.likes = s.likes?.filter((u) => u.id !== user.id)
          }
        }
        const target = state.snippets.find((s) => s.id === action.payload.id)
        if (target) applyLike(target)
        if (state.currentSnippet?.id === action.payload.id) applyLike(state.currentSnippet)
      })
      .addCase(toggleLikeSnippet.rejected, (state, action) => {
        state.error = action.payload ?? 'Erreur de synchronisation du like'
      })

      // --- REVIEWS ---
      .addCase(addOrUpdateReview.fulfilled, (state, action: PayloadAction<ReviewResponse>) => {
        const newReview = action.payload.review
        const syncReview = (s: Snippet) => {
          if (!s.reviews) s.reviews = []
          const idx = s.reviews.findIndex((r) => r.reviewer.id === newReview.reviewer.id)
          if (idx !== -1)
             s.reviews[idx] = newReview
          else  
            s.reviews.push(newReview)
        }
        const target = state.snippets.find((s) => s.id === newReview.snippet_id)
        if (target) syncReview(target)
        if (state.currentSnippet?.id === newReview.snippet_id) syncReview(state.currentSnippet)
      })
      .addCase(removeReview.fulfilled, (state, action: PayloadAction<{ snippetId: number; userId: number }>) => {
        const { snippetId, userId } = action.payload
        const syncRemove = (s: Snippet) => {
          if (s.reviews) s.reviews = s.reviews.filter((r) => r.reviewer.id !== userId)
        }
        const target = state.snippets.find((s) => s.id === snippetId)
        if (target) syncRemove(target)
        if (state.currentSnippet?.id === snippetId) syncRemove(state.currentSnippet)
      })
  },
})

export const { clearSnippetError, setCurrentSnippet } = snippetSlice.actions
export default snippetSlice.reducer
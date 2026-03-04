// state/slices/snippetSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { snippetService } from '../../services/SnippetService'
import { type CreateSnippetRequest } from '../../interfaces/SnippetContrat'
import type { Snippet } from '../../models/Snippet'
import type { User } from '../../models/User'
import axios from 'axios'
import type ApiError from '../../interfaces/ApiError'
import type ReviewResponse from '../../interfaces/ReviewResponse'
import {
  addOrUpdateReview,
  removeReview,
} from './reviewSlice'

interface SnippetState {
  snippets: Snippet[]
  currentSnippet: Snippet | null
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  page: number
  error: string | null
}

const initialState: SnippetState = {
  snippets: [],
  currentSnippet: null,
  loading: false,
  loadingMore: false,
  hasMore: true,
  page: 1,
  error: null,
}

const handleAxiosError = (
  err: unknown,
  defaultMessage: string,
): string => {
  if (
    axios.isAxiosError<ApiError>(err) &&
    err.response?.data
  ) {
    const errorData = err.response.data
    return String(errorData.error || defaultMessage)
  }
  return defaultMessage
}

// --- Thunks ---

export const fetchPublicSnippets = createAsyncThunk<
  { snippets: Snippet[], hasMore: boolean, total: number },
  { page: number, limit: number, topic: string, language?: string, sortBy?: string },
  { rejectValue: string }
>('snippets/fetchAll', async ({ page, limit, topic, language = 'All', sortBy = 'newest' }, { rejectWithValue, signal }) => {
  try {
    return await snippetService.getPublicSnippets(page, limit, topic, signal, language, sortBy)
  } catch (err) {
    return rejectWithValue(
      handleAxiosError(
        err,
        'Échec de la récupération des snippets',
      ),
    )
  }
})

export const fetchSnippetById = createAsyncThunk<
  Snippet,
  number,
  { rejectValue: string }
>('snippets/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await snippetService.getSnippet(id)
  } catch (err) {
    return rejectWithValue(
      handleAxiosError(
        err,
        'Impossible de charger le snippet',
      ),
    )
  }
})

export const createSnippet = createAsyncThunk<
  Snippet,
  CreateSnippetRequest,
  { rejectValue: string }
>(
  'snippets/create',
  async (snippetData, { rejectWithValue }) => {
    try {
      return await snippetService.createSnippet(snippetData as unknown as FormData)
    } catch (err) {
      return rejectWithValue(
        handleAxiosError(
          err,
          'Échec de la création du snippet',
        ),
      )
    }
  },
)

// Using FormData
export const updateSnippet = createAsyncThunk<
  Snippet,
  { id: number; snippetData: FormData },
  { rejectValue: string }
>(
  'snippets/update',
  async ({ id, snippetData }, { rejectWithValue }) => {
    try {
      return await snippetService.updateSnippet(
        id,
        snippetData,
      )
    } catch (err) {
      return rejectWithValue(
        handleAxiosError(
          err,
          'Échec de la mise à jour du snippet',
        ),
      )
    }
  },
)

export const deleteSnippet = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('snippets/delete', async (id, { rejectWithValue }) => {
  try {
    await snippetService.deleteSnippet(id)
    return id
  } catch (err) {
    return rejectWithValue(
      handleAxiosError(
        err,
        'Échec de la suppression du snippet',
      ),
    )
  }
})

export const syncLikeSnippet = createAsyncThunk<
  { id: number; isLike: boolean; currentUser: User },
  { id: number; isLike: boolean; currentUser: User },
  { rejectValue: string }
>(
  'snippets/syncLike',
  async ({ id, isLike, currentUser }, { rejectWithValue, signal }) => {
    try {
      if (isLike) {
        await snippetService.likeSnippet(id, signal)
      } else {
        await snippetService.unlikeSnippet(id, signal)
      }
      return { id, isLike, currentUser }
    } catch (err) {
      if (axios.isCancel(err)) {
        throw err;
      }
      return rejectWithValue(
        handleAxiosError(err, 'Échec du traitement du like/unlike')
      )
    }
  },
)

// --- Slice ---

const snippetSlice = createSlice({
  name: 'snippets',
  initialState,
  reducers: {
    clearSnippetError: (state) => {
      state.error = null
    },
    setCurrentSnippet: (
      state,
      action: PayloadAction<Snippet | null>,
    ) => {
      state.currentSnippet = action.payload
    },
    resetSnippets: (state) => {
      state.snippets = []
      state.page = 1
      state.hasMore = true
      state.error = null
      state.loading = false
      state.loadingMore = false
    },
    optimisticToggleLike: (
      state,
      action: PayloadAction<{ id: number; isLike: boolean; currentUser: User }>
    ) => {
      const { id, isLike, currentUser } = action.payload;
      const targetSnippetList = [
        state.snippets.find((s) => s.id === id),
        state.currentSnippet?.id === id ? state.currentSnippet : undefined
      ].filter(Boolean) as Snippet[];

      targetSnippetList.forEach(snippet => {
        const userAlreadyAssigned = snippet.likes?.some(u => u.id === currentUser.id);
        if (isLike) {
          if (!userAlreadyAssigned) {
            snippet.like_count = (snippet.like_count || 0) + 1;
            snippet.likes = snippet.likes ? [...snippet.likes, currentUser] : [currentUser];
          }
        } else {
          if (userAlreadyAssigned) {
            snippet.like_count = Math.max(0, (snippet.like_count || 1) - 1);
            snippet.likes = snippet.likes?.filter((u) => u.id !== currentUser.id) || [];
          }
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH ALL ---
      .addCase(fetchPublicSnippets.pending, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.loading = true
          state.snippets = [] // Clear if it's the first page specifically
        } else {
          state.loadingMore = true
        }
        state.error = null
      })
      .addCase(
        fetchPublicSnippets.fulfilled,
        (state, action) => {
          state.loading = false
          state.loadingMore = false

          if (action.meta.arg.page === 1) {
            state.snippets = action.payload.snippets
          } else {
            // Only append if the snippet doesn't already exist to avoid dupes in StrictMode
            const newSnippets = action.payload.snippets.filter(
              (newSnip) => !state.snippets.find(s => s.id === newSnip.id)
            )
            state.snippets = [...state.snippets, ...newSnippets]
          }

          state.hasMore = action.payload.hasMore
          state.page = action.meta.arg.page
        },
      )
      .addCase(
        fetchPublicSnippets.rejected,
        (state, action) => {
          state.loading = false
          state.loadingMore = false
          state.error =
            action.payload ?? 'Une erreur est survenue'
        },
      )

      // --- FETCH BY ID ---
      .addCase(fetchSnippetById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchSnippetById.fulfilled,
        (state, action) => {
          state.loading = false
          state.currentSnippet = action.payload
        },
      )
      .addCase(
        fetchSnippetById.rejected,
        (state, action) => {
          state.loading = false
          state.error =
            action.payload ??
            'Impossible de charger ce snippet'
        },
      )

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
        state.error =
          action.payload ?? 'Erreur lors de la création'
      })

      // --- UPDATE ---
      .addCase(updateSnippet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSnippet.fulfilled, (state, action) => {
        state.loading = false
        const index = state.snippets.findIndex(
          (s) => s.id === action.payload.id,
        )
        if (index !== -1)
          state.snippets[index] = action.payload
        if (state.currentSnippet?.id === action.payload.id)
          state.currentSnippet = action.payload
      })
      .addCase(updateSnippet.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ?? 'Erreur lors de la mise à jour'
      })

      // --- DELETE ---
      .addCase(deleteSnippet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSnippet.fulfilled, (state, action) => {
        state.loading = false
        state.snippets = state.snippets.filter(
          (s) => s.id !== action.payload,
        )
        if (state.currentSnippet?.id === action.payload)
          state.currentSnippet = null
      })
      .addCase(deleteSnippet.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ?? 'Erreur lors de la suppression'
      })

      // --- SYNC LIKE / UNLIKE ---
      .addCase(syncLikeSnippet.rejected, (state, action) => {
        // Do not rollback if the request was intentionally aborted
        if (action.meta.aborted || action.error.message === 'canceled' || action.error.name === 'AbortError') {
          return;
        }

        const { id, isLike, currentUser } = action.meta.arg;
        const targetSnippetList = [
          state.snippets.find((s) => s.id === id),
          state.currentSnippet?.id === id ? state.currentSnippet : undefined
        ].filter(Boolean) as Snippet[];

        targetSnippetList.forEach(snippet => {
          const userAlreadyAssigned = snippet.likes?.some(u => u.id === currentUser.id);
          if (isLike) { // rolling back a like -> unlike
            if (userAlreadyAssigned) {
              snippet.like_count = Math.max(0, (snippet.like_count || 1) - 1);
              snippet.likes = snippet.likes?.filter((u) => u.id !== currentUser.id) || [];
            }
          } else { // rolling back an unlike -> like
            if (!userAlreadyAssigned) {
              snippet.like_count = (snippet.like_count || 0) + 1;
              snippet.likes = snippet.likes ? [...snippet.likes, currentUser] : [currentUser];
            }
          }
        });
      })

      // --- REVIEWS ---
      .addCase(
        addOrUpdateReview.fulfilled,
        (state, action: PayloadAction<ReviewResponse>) => {
          const newReview = action.payload.review
          const syncReview = (s: Snippet) => {
            if (!s.reviews) s.reviews = []
            const idx = s.reviews.findIndex(
              (r) =>
                r.reviewer.id === newReview.reviewer.id,
            )
            if (idx !== -1) s.reviews[idx] = newReview
            else s.reviews.push(newReview)
          }
          const target = state.snippets.find(
            (s) => s.id === newReview.snippet_id,
          )
          if (target) syncReview(target)
          if (
            state.currentSnippet?.id ===
            newReview.snippet_id
          )
            syncReview(state.currentSnippet)
        },
      )
      .addCase(
        removeReview.fulfilled,
        (
          state,
          action: PayloadAction<{
            snippetId: number
            userId: number
          }>,
        ) => {
          const { snippetId, userId } = action.payload
          const syncRemove = (s: Snippet) => {
            if (s.reviews)
              s.reviews = s.reviews.filter(
                (r) => r.reviewer.id !== userId,
              )
          }
          const target = state.snippets.find(
            (s) => s.id === snippetId,
          )
          if (target) syncRemove(target)
          if (state.currentSnippet?.id === snippetId)
            syncRemove(state.currentSnippet)
        },
      )
  },
})

export const { clearSnippetError, setCurrentSnippet, resetSnippets, optimisticToggleLike } =
  snippetSlice.actions
export default snippetSlice.reducer
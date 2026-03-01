import {
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit'
import { userService } from '../../services/UserService'
import type { User } from '../../models/User'
import axios from 'axios'
import type ApiError from '../../interfaces/ApiError'
import type MessageResponse from '../../interfaces/MessageResponse'
import {
  createSnippet,
  updateSnippet,
  deleteSnippet,
  optimisticToggleLike,
  syncLikeSnippet,
} from './snippetSlice'

interface UserState {
  currentUserProfile: User | null
  followers: User[]
  following: User[]
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  currentUserProfile: null,
  followers: [],
  following: [],
  loading: false,
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

export const fetchUserProfile = createAsyncThunk<
  User,
  number,
  { rejectValue: string }
>(
  'users/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.getUserProfile(userId)
    } catch (err) {
      return rejectWithValue(
        handleAxiosError(
          err,
          'Échec de la récupération du profil',
        ),
      )
    }
  },
)

export const followUser = createAsyncThunk<
  MessageResponse,
  number,
  { rejectValue: string }
>('users/follow', async (userId, { rejectWithValue }) => {
  try {
    return await userService.followUser(userId)
  } catch (err) {
    return rejectWithValue(
      handleAxiosError(err, "Échec de l'abonnement"),
    )
  }
})

export const unfollowUser = createAsyncThunk<
  MessageResponse,
  number,
  { rejectValue: string }
>('users/unfollow', async (userId, { rejectWithValue }) => {
  try {
    return await userService.unfollowUser(userId)
  } catch (err) {
    return rejectWithValue(
      handleAxiosError(err, 'Échec du désabonnement'),
    )
  }
})

export const fetchFollowers = createAsyncThunk<
  User[],
  number,
  { rejectValue: string }
>(
  'users/fetchFollowers',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.getFollowers(userId)
    } catch (err) {
      return rejectWithValue(
        handleAxiosError(
          err,
          'Échec de la récupération des abonnés',
        ),
      )
    }
  },
)

export const fetchFollowing = createAsyncThunk<
  User[],
  number,
  { rejectValue: string }
>(
  'users/fetchFollowing',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.getFollowing(userId)
    } catch (err) {
      return rejectWithValue(
        handleAxiosError(
          err,
          'Échec de la récupération des abonnements',
        ),
      )
    }
  },
)

export const updateProfile = createAsyncThunk<
  User,
  FormData,
  { rejectValue: string }
>(
  'users/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      return await userService.updateProfile(formData)
    } catch (err) {
      return rejectWithValue(
        handleAxiosError(
          err,
          'Échec lors de la mise à jour du profile',
        ),
      )
    }
  },
)

// --- Slice ---

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.currentUserProfile = null
      state.followers = []
      state.following = []
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      // --- PROFILE ---
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action) => {
          state.loading = false
          state.currentUserProfile = action.payload
        },
      )
      .addCase(
        fetchUserProfile.rejected,
        (state, action) => {
          state.loading = false
          state.error =
            action.payload ??
            'Échec de la récupération du profil'
        },
      )

      // --- FOLLOWERS ---
      .addCase(fetchFollowers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchFollowers.fulfilled,
        (state, action) => {
          state.loading = false
          state.followers = action.payload
        },
      )
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ??
          'Échec du chargement des abonnés'
      })

      // --- FOLLOWING ---
      .addCase(fetchFollowing.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchFollowing.fulfilled,
        (state, action) => {
          state.loading = false
          state.following = action.payload
        },
      )
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ??
          'Échec du chargement des abonnements'
      })

      // --- FOLLOW ---
      .addCase(followUser.pending, (state) => {
        state.error = null
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.loading = false
        const targetedUserId = action.meta.arg
        if (
          state.currentUserProfile &&
          state.currentUserProfile.id === targetedUserId
        ) {
          state.currentUserProfile.followers_count =
            (state.currentUserProfile.followers_count ||
              0) + 1
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ?? "Erreur lors de l'abonnement"
      })

      // --- UNFOLLOW ---
      .addCase(unfollowUser.pending, (state) => {
        state.error = null
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.loading = false
        const targetedUserId = action.meta.arg
        if (
          state.currentUserProfile &&
          state.currentUserProfile.id === targetedUserId
        ) {
          state.currentUserProfile.followers_count =
            Math.max(
              0,
              (state.currentUserProfile.followers_count ||
                0) - 1,
            )
        }
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ?? 'Erreur lors du désabonnement'
      })

      // --- UPDATE PROFILE ---
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        if (
          state.currentUserProfile &&
          state.currentUserProfile.id === action.payload.id
        ) {
          state.currentUserProfile = {
            ...state.currentUserProfile,
            ...action.payload,
          }
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ??
          'Une erreur est survenue lors de la mise à jour'
      })
      // ----- SNIPPETS -----
      // Snippet Creation
      .addCase(createSnippet.fulfilled, (state, action) => {
        if (
          state.currentUserProfile &&
          state.currentUserProfile.id ===
          action.payload.author.id
        ) {
          if (!state.currentUserProfile.snippets)
            state.currentUserProfile.snippets = []
          state.currentUserProfile.snippets.unshift(
            action.payload,
          )
        }
      })

      // Snippet Update
      .addCase(updateSnippet.fulfilled, (state, action) => {
        if (state.currentUserProfile?.snippets) {
          const index =
            state.currentUserProfile.snippets.findIndex(
              (s) => s.id === action.payload.id,
            )
          if (index !== -1) {
            state.currentUserProfile.snippets[index] =
              action.payload
          }
        }
      })

      // Snippet Delete
      .addCase(deleteSnippet.fulfilled, (state, action) => {
        if (state.currentUserProfile?.snippets) {
          state.currentUserProfile.snippets =
            state.currentUserProfile.snippets.filter(
              (s) => s.id !== action.payload,
            )
        }
      })
      // Snippet Like Optimistic Toggle
      .addCase(optimisticToggleLike, (state, action) => {
        if (state.currentUserProfile?.snippets) {
          const { id, isLike, currentUser } = action.payload;
          const snippet = state.currentUserProfile.snippets.find((s) => s.id === id);
          if (snippet) {
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
          }
        }
      })
      // Snippet Sync Like Rejected (Rollback)
      .addCase(syncLikeSnippet.rejected, (state, action) => {
        if (action.meta.aborted || action.error.message === 'canceled' || action.error.name === 'AbortError') {
          return;
        }
        if (state.currentUserProfile?.snippets) {
          const { id, isLike, currentUser } = action.meta.arg;
          const snippet = state.currentUserProfile.snippets.find((s) => s.id === id);
          if (snippet) {
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
          }
        }
      })
  },
})

export const { clearUserProfile } = userSlice.actions
export default userSlice.reducer

import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { type AuthResponse, authService } from '../../services/AuthService'
import type { User } from '../../models/User'
import type ApiError from '../../interfaces/ApiError'
import { followUser, unfollowUser, updateProfile } from './userSlice'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  emailSent: boolean
  currentEmail: string | null
}

const initialState: AuthState = {
  user: null,
  loading: true, // Note: you might want this to be false initially unless you immediately dispatch checkAuth
  error: null,
  emailSent: false,
  currentEmail: null,
}

// --- Thunks ---

export const checkAuth = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    return await authService.checkAuth()
  } catch {
    return rejectWithValue('Aucune session active')
  }
})

export const sendAuthEmail = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('auth/sendEmail', async (email, { rejectWithValue }) => {
  try {
    await authService.login(email)
    return email
  } catch (err) {
    if (
      axios.isAxiosError<ApiError>(err) &&
      err.response?.data
    ) {
      return rejectWithValue(err.response.data.error)
    }
    return rejectWithValue(
      "Une erreur est survenue lors de l'envoi",
    )
  }
})

export const verifyPasscode = createAsyncThunk<
  User,
  { email: string; code: string },
  { rejectValue: string }
>(
  'auth/verifyPasscode',
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyCode(
        email,
        code,
      )
      if (response.user) {
        return response.user
      }
      return rejectWithValue(
        'Utilisateur non trouvé dans la réponse',
      )
    } catch (err) {
      if (
        axios.isAxiosError<ApiError>(err) &&
        err.response?.data
      ) {
        return rejectWithValue(err.response.data.error)
      }
      return rejectWithValue('Code incorrect ou expiré')
    }
  },
)

export const registerUser = createAsyncThunk<
  AuthResponse,
  FormData,
  { rejectValue: string }
>(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      return await authService.register(formData)
    } catch (err) {
      if (
        axios.isAxiosError<ApiError>(err) &&
        err.response?.data
      ) {
        return rejectWithValue(err.response.data.error)
      }
      return rejectWithValue("Erreur lors de l'inscription")
    }
  },
)

export const logoutUser = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout()
  } catch (err) {
    if (
      axios.isAxiosError<ApiError>(err) &&
      err.response?.data
    ) {
      return rejectWithValue(err.response.data.error)
    }
    return rejectWithValue('Erreur lors de la déconnexion')
  }
})

// --- Slice ---

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError(state) {
      state.error = null
    },
    // Nouvelle action ajoutée ici
    resetAuthStep(state) {
      state.emailSent = false
      state.currentEmail = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(
        checkAuth.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false
          state.user = action.payload
        },
      )
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false
        state.user = null
      })

      // sendAuthEmail
      .addCase(sendAuthEmail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        sendAuthEmail.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false
          state.emailSent = true
          state.currentEmail = action.payload
        },
      )
      .addCase(sendAuthEmail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Erreur inconnue'
      })

      // verifyPasscode
      .addCase(verifyPasscode.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        verifyPasscode.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false
          state.user = action.payload
          state.emailSent = false
          state.currentEmail = null
        },
      )
      .addCase(verifyPasscode.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ?? 'Erreur de validation'
      })

      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ?? "Erreur lors de l'inscription"
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.emailSent = false
        state.currentEmail = null
        state.error = null
      })
      // Follow
      .addCase(followUser.fulfilled, (state, action) => {
        const targetedUserId = action.meta.arg
        if (state.user) {
          if (!state.user.following_ids) {
            state.user.following_ids = []
          }
          if (
            !state.user.following_ids.includes(
              targetedUserId,
            )
          ) {
            state.user.following_ids.push(targetedUserId)
          }
        }
      })
      // Unfollow
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const targetedUserId = action.meta.arg
        if (state.user && state.user.following_ids) {
          state.user.following_ids =
            state.user.following_ids.filter(
              (id) => id !== targetedUserId,
            )
        }
      })
      // Profile Update
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        if (state.user) {
          state.user = { ...state.user, ...action.payload }
        }
      })

      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ??
          'Échec de la mise à jour du profil'
      })
  },
})

export const { resetError, resetAuthStep } = authSlice.actions
export default authSlice.reducer
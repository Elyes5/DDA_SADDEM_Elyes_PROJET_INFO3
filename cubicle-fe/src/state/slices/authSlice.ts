import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../models/User.ts';

const API_URL = 'https://ton-api.com';

interface ApiError {
  message: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  emailSent: boolean;
  currentEmail: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  emailSent: false,
  currentEmail: null,
};

// --- Thunks ---

// Phase 1 : Envoi de l'email
export const sendAuthEmail = createAsyncThunk<
  string, 
  string, 
  { rejectValue: string }
>(
  'auth/sendEmail',
  async (email, { rejectWithValue }) => {
    try {
      await axios.post(`${API_URL}/auth/send-email`, { email });
      return email;
    } catch (err) {
      if (axios.isAxiosError<ApiError>(err) && err.response?.data) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue("Une erreur est survenue lors de l'envoi");
    }
  }
);

export const verifyPasscode = createAsyncThunk<
  User,
  { email: string; code: string },
  { rejectValue: string }
>(
  'auth/verifyPasscode',
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const response = await axios.post<User>(`${API_URL}/auth/verify-code`, { email, code });
      return response.data;
    } catch (err) {
      if (axios.isAxiosError<ApiError>(err) && err.response?.data) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue("Code incorrect ou expiré");
    }
  }
);

// --- Slice ---

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.emailSent = false;
      state.currentEmail = null;
      state.error = null;
    },
    resetError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Phase 1 : sendAuthEmail
      .addCase(sendAuthEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendAuthEmail.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.emailSent = true;
        state.currentEmail = action.payload;
      })
      .addCase(sendAuthEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Erreur inconnue";
      })

      // Phase 2 : verifyPasscode
      .addCase(verifyPasscode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPasscode.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.emailSent = false;
        state.currentEmail = null;
      })
      .addCase(verifyPasscode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Erreur de validation";
      });
  },
});

export const { logout, resetError } = authSlice.actions;
export default authSlice.reducer;
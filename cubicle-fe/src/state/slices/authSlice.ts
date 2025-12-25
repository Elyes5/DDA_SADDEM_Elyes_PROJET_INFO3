import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  email: string;
  token: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface LoginPayload {
  email: string;
  token: string;
}

interface SignupData {
  username: string;
  first_name: string;
  email: string;
  last_name: string;
  avatar_url?: string;
  phone_number?: string;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};



export const loginUser = createAsyncThunk<
  User,
  LoginPayload,
  { rejectValue: string }
>(
  'auth/loginUser',
  ({ email, token }, { rejectWithValue }) => {
    // waiting for api to be built
    if (email === 'test@cubicle.com' && token === '123456') {
      return { email, token: 'fake-jwt-token' };
    }

    return rejectWithValue('Email ou mot de passe incorrect');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Erreur inconnue';
      });
  },
});

export const signupUser = createAsyncThunk<User, SignupData, { rejectValue: string }>(
  'auth/signup',
  // potentially async has to be added here:
  (userData, { rejectWithValue }) => {
    try {
      console.log("Données envoyées:", userData);
      return { token: "fake-jwt", email: userData.email }; 
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Erreur lors de l'inscription");
    }
  }
);


export const { logout } = authSlice.actions;
export default authSlice.reducer;

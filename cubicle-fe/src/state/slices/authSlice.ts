import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../models/User.ts'

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
    if (
      email === 'test@cubicle.com' &&
      token === '123456'
    ) {
      const user: User = {
        user_id: 1,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        email,
        avatar_url: 'https://example.com/avatar.png',
        phone_number: '+123456789',
        followers: [],
      };

      return user;
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

export const signupUser = createAsyncThunk<
  User,
  SignupData,
  { rejectValue: string }
>(
  'auth/signup',

  (userData, { rejectWithValue }) => {
    try {
      console.log('Données envoyées:', userData);

      const newUser: User = {
        user_id: 1,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        avatar_url: undefined,
        phone_number: undefined,
        followers: [],
      };

      return newUser;
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Erreur lors de l'inscription");
    }
  }
);


export const { logout } = authSlice.actions;
export default authSlice.reducer;

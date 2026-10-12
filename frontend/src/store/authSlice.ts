import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { authApi, type LoginPayload, type SignupPayload } from '@/api/authApi';
import type { UserInfoResponse } from '@/types/models';
import { getErrorMessage, getFieldErrors } from '@/utils/errors';
import type { RootState } from './index';

export interface AuthUser {
  id: number;
  username: string;
  roles: string[];
}

export interface SignupError {
  message: string;
  fieldErrors: Record<string, string>;
}

interface AuthState {
  user: AuthUser | null;
  /** 'ready' once the initial "who am I" check against the session cookie has finished. */
  status: 'idle' | 'loading' | 'ready';
  isLoggingIn: boolean;
  loginError: string | null;
  isSigningUp: boolean;
  signupError: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  isLoggingIn: false,
  loginError: null,
  isSigningUp: false,
  signupError: null,
};

// The JWT itself stays in the HttpOnly cookie; Redux only keeps who is signed in.
const toAuthUser = (data: UserInfoResponse): AuthUser => ({ id: data.id, username: data.username, roles: data.roles });

export const fetchCurrentUser = createAsyncThunk<AuthUser | null, void, { state: RootState }>(
  'auth/fetchCurrentUser',
  async () => {
    try {
      return toAuthUser(await authApi.currentUser());
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) return null;
      throw error;
    }
  },
  { condition: (_, { getState }) => getState().auth.status !== 'loading' },
);

export const login = createAsyncThunk<AuthUser, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return toAuthUser(await authApi.login(payload));
    } catch {
      return rejectWithValue('Invalid username or password. Please try again.');
    }
  },
);

export const signup = createAsyncThunk<void, SignupPayload, { rejectValue: SignupError }>(
  'auth/signup',
  async (payload, { rejectWithValue }) => {
    try {
      await authApi.signup(payload);
    } catch (error) {
      return rejectWithValue({ message: getErrorMessage(error), fieldErrors: getFieldErrors(error) });
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Any protected request came back 401: the cookie expired or was cleared. */
    sessionExpired: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'ready';
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.status = 'ready';
      })
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
        state.loginError = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.user = action.payload;
        state.status = 'ready';
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.loginError = action.payload ?? 'Sign in failed. Please try again.';
      })
      .addCase(signup.pending, (state) => {
        state.isSigningUp = true;
        state.signupError = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.isSigningUp = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isSigningUp = false;
        state.signupError = action.payload?.message ?? 'Sign up failed. Please try again.';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { sessionExpired } = authSlice.actions;
export default authSlice.reducer;

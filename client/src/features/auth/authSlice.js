import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/api';

// Retrieve initial state from localStorage
const storedToken = localStorage.getItem('token');
let storedUser = null;
try {
  const item = localStorage.getItem('user');
  if (item) storedUser = JSON.parse(item);
} catch (e) {
  storedUser = null;
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      return rejectWithValue(message);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Session expired.');
    }
  }
);

const initialState = {
  user: storedUser,
  profile: null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
  successMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    updateProfileLocally: (state, action) => {
      if (action.payload.user) {
        state.user = { ...state.user, ...action.payload.user };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
      if (action.payload.profile) {
        state.profile = action.payload.profile;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.token = action.payload.token;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.profile = action.payload.employee;
        state.token = action.payload.token;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Load User
    builder
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.profile = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  },
});

export const { logout, clearError, clearSuccessMessage, updateProfileLocally } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import Cookies from 'js-cookie'
import { authApi } from '@/services/auth/api'
import type { LoginRequest, RegisterRequest, AuthResponse, User, RegisterResponse } from '@/models/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  rememberMe: boolean
}

const initialState: AuthState = {
  user: null,
  token: Cookies.get('auth_token') || null,
  isAuthenticated: !!Cookies.get('auth_token'),
  isLoading: false,
  error: null,
  rememberMe: false,
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)

      // Log the full response to see what backend returns
      console.log('Login successful! Backend response:', response)
      console.log(' Access Token:', response.accessToken)
      console.log(' Refresh Token:', response.refreshToken)
      console.log(' User:', response.user)

      // Check if token exists
      if (!response.accessToken) {
        console.error(' No access token in response! Full response:', response)
        return rejectWithValue('No token received from server')
      }

      // Store tokens in cookies
      const cookieOptions = credentials.RememberMe
        ? { expires: 7 } // 7 days
        : undefined // Session cookie

      Cookies.set('auth_token', response.accessToken, cookieOptions)
      Cookies.set('refresh_token', response.refreshToken, cookieOptions)
      console.log('Access token saved to cookie:', Cookies.get('auth_token'))

      return response
    } catch (error: any) {
      console.error('Login failed:', error.response?.data)
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData)

      // Don't auto-login after registration - user needs to verify email first
      // Cookies will be set after email verification and login

      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout()
      Cookies.remove('auth_token')
      Cookies.remove('refresh_token')
    } catch (error: any) {
      // Even if the API call fails, we should clear local auth state
      Cookies.remove('auth_token')
      Cookies.remove('refresh_token')
      return rejectWithValue(error.response?.data?.message || 'Logout failed')
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getCurrentUser()
      return user
    } catch (error: any) {
      // Token might be invalid, clear it
      Cookies.remove('auth_token')
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.accessToken
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        // Registration successful but user is NOT authenticated yet
        // They need to verify their email first
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = null
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
  },
})

export const { clearError, setRememberMe } = authSlice.actions
export default authSlice.reducer

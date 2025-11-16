import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { login, clearError, setRememberMe } from '@/store/slices/authSlice'
import type { LoginRequest } from '@/models/auth'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated, rememberMe } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState<LoginRequest>({
    Email: '',
    Password: '',
    RememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<{
    Email?: string
    Password?: string
  }>({})

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  // Check for success message from email verification
  useEffect(() => {
    const state = location.state as { message?: string }
    if (state?.message) {
      setSuccessMessage(state.message)
      // Clear the state to prevent showing message on refresh
      navigate(location.pathname, { replace: true })
    }
  }, [location, navigate])

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'Email':
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Please enter a valid email address'
        return undefined
      case 'Password':
        if (!value) return 'Password is required'
        if (value.length < 6) return 'Password must be at least 6 characters'
        return undefined
      default:
        return undefined
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target

    if (name === 'RememberMe') {
      setFormData({ ...formData, RememberMe: checked })
      dispatch(setRememberMe(checked))
    } else {
      setFormData({ ...formData, [name]: value })

      // Clear field error on change
      if (fieldErrors[name as keyof typeof fieldErrors]) {
        setFieldErrors({ ...fieldErrors, [name]: undefined })
      }

      // Clear global error
      if (error) {
        dispatch(clearError())
      }
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    if (error) {
      setFieldErrors({ ...fieldErrors, [name]: error })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const errors = {
      Email: validateField('Email', formData.Email),
      Password: validateField('Password', formData.Password),
    }

    setFieldErrors(errors)

    // Check if there are any errors
    if (Object.values(errors).some((error) => error)) {
      return
    }

    // Dispatch login action
    const result = await dispatch(login(formData))

    if (login.fulfilled.match(result)) {
      // Login successful, navigation happens via useEffect
    }
  }

  return (
    <Box className="auth-container">
      <Box className="auth-card">
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'var(--font-display)',
              color: 'var(--neutral-800)',
              fontWeight: 700,
              mb: 1,
            }}
          >
            Co-Hire Share EV
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--neutral-600)',
              fontSize: '0.875rem',
            }}
          >
            Welcome back! Please login to your account
          </Typography>
        </Box>

        {/* Success Alert */}
        {successMessage && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              backgroundColor: 'rgba(144, 195, 153, 0.15)',
              color: '#4a7c59',
              '& .MuiAlert-icon': {
                color: 'var(--accent-green)',
              },
            }}
            onClose={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: '#b87d6f20',
              color: '#8a504a',
              '& .MuiAlert-icon': {
                color: '#b87d6f',
              },
            }}
            onClose={() => dispatch(clearError())}
          >
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <TextField
            fullWidth
            label="Email"
            name="Email"
            type="email"
            value={formData.Email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!fieldErrors.Email}
            helperText={fieldErrors.Email}
            disabled={isLoading}
            sx={{ mb: 2.5 }}
            className="auth-input"
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Password"
            name="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.Password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!fieldErrors.Password}
            helperText={fieldErrors.Password}
            disabled={isLoading}
            sx={{ mb: 2 }}
            className="auth-input"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Remember Me & Forgot Password */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  name="RememberMe"
                  checked={formData.RememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                  sx={{
                    color: 'var(--accent-blue)',
                    '&.Mui-checked': {
                      color: 'var(--accent-blue)',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: 'var(--neutral-600)' }}>
                  Remember me
                </Typography>
              }
            />
            <Link
              to="/forgot-password"
              style={{
                color: 'var(--accent-blue)',
                textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              Forgot password?
            </Link>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            className="btn-primary"
            sx={{
              mb: 2,
              height: '48px',
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>

          {/* Register Link */}
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: 'var(--neutral-600)',
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--accent-blue)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Sign up
            </Link>
          </Typography>
        </form>
      </Box>
    </Box>
  )
}

export default Login
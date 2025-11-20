import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material'
import { Email, ArrowBack, CheckCircle } from '@mui/icons-material'
import { authApi } from '@/services/auth/api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    try {
      await authApi.requestPasswordReset({ Email: email })
      setIsSuccess(true)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to send reset link. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box className="auth-container">
      <Box className="auth-card">
        {/* Back Button */}
        {!isSuccess && (
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/login')}
            sx={{
              color: 'var(--neutral-600)',
              textTransform: 'none',
              mb: 2,
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'var(--neutral-800)',
              },
            }}
          >
            Back to Login
          </Button>
        )}

        {/* Success State */}
        {isSuccess ? (
          <>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <CheckCircle
                sx={{ fontSize: 80, color: 'var(--accent-green)', mb: 2 }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--neutral-800)',
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Check Your Email
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'var(--neutral-600)', mb: 1 }}
              >
                We've sent a password reset link to:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'var(--accent-blue)',
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                {email}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--neutral-600)', mb: 2 }}
              >
                Click the link in the email to reset your password.
              </Typography>
            </Box>

            {/* Important Note */}
            <Alert
              severity="info"
              sx={{
                mb: 3,
                textAlign: 'left',
                backgroundColor: 'rgba(122, 154, 175, 0.15)',
                color: '#4a5d6a',
                '& .MuiAlert-icon': {
                  color: 'var(--accent-blue)',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Didn't receive the email?
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                • Check your spam or junk folder
              </Typography>
              <Typography variant="caption" component="div">
                • Make sure you entered the correct email address
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsSuccess(false)
                  setEmail('')
                }}
                sx={{
                  height: '48px',
                  borderColor: 'var(--accent-blue)',
                  color: 'var(--accent-blue)',
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    borderColor: '#6a8a9f',
                    backgroundColor: 'rgba(122, 154, 175, 0.1)',
                  },
                }}
              >
                Try Another Email
              </Button>
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{
                  color: 'var(--neutral-600)',
                  textTransform: 'none',
                }}
              >
                Back to Login
              </Button>
            </Box>
          </>
        ) : (
          <>
            {/* Email Input Form */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Email sx={{ fontSize: 64, color: 'var(--accent-blue)', mb: 2 }} />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--neutral-800)',
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Forgot Password?
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--neutral-600)' }}
              >
                Enter your email address and we'll send you a link to reset your
                password
              </Typography>
            </Box>

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
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="auth-input"
                sx={{ mb: 3 }}
                autoFocus
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                className="btn-primary"
                sx={{
                  height: '48px',
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </>
        )}
      </Box>
    </Box>
  )
}

export default ForgotPassword

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  LockReset,
  CheckCircle,
  Visibility,
  VisibilityOff,
  Error as ErrorIcon,
} from '@mui/icons-material'
import { authApi } from '@/services/auth/api'

type ResetStatus = 'form' | 'submitting' | 'success' | 'error'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<ResetStatus>('form')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const userId = searchParams.get('userId')
  const token = searchParams.get('token')

  useEffect(() => {
    // Check if userId and token are present
    if (!userId || !token) {
      setStatus('error')
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [userId, token])

  const validatePassword = () => {
    if (!formData.newPassword) {
      setError('New password is required')
      return false
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      setError('Password must contain uppercase, lowercase, and numbers')
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validatePassword()) return

    if (!userId || !token) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    setStatus('submitting')

    try {
      await authApi.confirmPasswordReset({
        UserId: userId,
        Token: token,
        NewPassword: formData.newPassword,
        ConfirmPassword: formData.confirmPassword,
      })
      setStatus('success')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successful! Please login with your new password.' },
        })
      }, 3000)
    } catch (err: any) {
      setStatus('error')
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          'Failed to reset password. The link may be expired or invalid. Please request a new password reset.'
      )
    }
  }

  return (
    <Box className="auth-container">
      <Box className="auth-card">
        {/* Error State (Invalid Link) */}
        {status === 'error' && (!userId || !token) && (
          <>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <ErrorIcon
                sx={{ fontSize: 80, color: 'var(--accent-terracotta)', mb: 2 }}
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
                Invalid Reset Link
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'var(--neutral-600)', mb: 3 }}
              >
                {error || 'This password reset link is invalid or has expired.'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/forgot-password')}
                className="btn-primary"
                sx={{
                  height: '48px',
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                Request New Reset Link
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
        )}

        {/* Form State */}
        {(status === 'form' || status === 'submitting') && userId && token && (
          <>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LockReset
                sx={{ fontSize: 64, color: 'var(--accent-blue)', mb: 2 }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--neutral-800)',
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Reset Your Password
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--neutral-600)' }}
              >
                Enter your new password below
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && status === 'form' && (
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
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                disabled={status === 'submitting'}
                className="auth-input"
                sx={{ mb: 2.5 }}
                autoFocus
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

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                disabled={status === 'submitting'}
                className="auth-input"
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password Requirements */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  backgroundColor: 'var(--neutral-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--neutral-200)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--neutral-700)',
                    fontWeight: 600,
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  Password must contain:
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'var(--neutral-600)', display: 'block' }}
                >
                  • At least 8 characters
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'var(--neutral-600)', display: 'block' }}
                >
                  • Uppercase and lowercase letters
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'var(--neutral-600)', display: 'block' }}
                >
                  • At least one number
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={status === 'submitting'}
                className="btn-primary"
                sx={{
                  height: '48px',
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {status === 'submitting' ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
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
                Password Reset Successful!
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'var(--neutral-600)', mb: 1 }}
              >
                Your password has been successfully reset.
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--neutral-600)', mb: 3 }}
              >
                Redirecting to login page in 3 seconds...
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/login')}
              className="btn-primary"
              sx={{
                height: '48px',
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Go to Login Now
            </Button>
          </>
        )}

        {/* Error State (After Submit) */}
        {status === 'error' && userId && token && (
          <>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <ErrorIcon
                sx={{ fontSize: 80, color: 'var(--accent-terracotta)', mb: 2 }}
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
                Reset Failed
              </Typography>

              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  textAlign: 'left',
                  backgroundColor: '#b87d6f20',
                  color: '#8a504a',
                  '& .MuiAlert-icon': {
                    color: '#b87d6f',
                  },
                }}
              >
                {error}
              </Alert>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/forgot-password')}
                className="btn-primary"
                sx={{
                  height: '48px',
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                Request New Reset Link
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
        )}
      </Box>
    </Box>
  )
}

export default ResetPassword

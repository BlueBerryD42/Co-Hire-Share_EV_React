import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material'
import { CheckCircle, Email, Error as ErrorIcon } from '@mui/icons-material'
import { authApi } from '@/services/auth/api'

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'error'

const EmailVerification = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<VerificationStatus>('pending')
  const [errorMessage, setErrorMessage] = useState('')
  const hasVerifiedRef = useRef(false) // Use ref instead of state to prevent re-renders
  const token = searchParams.get('token')
  const userId = searchParams.get('userId')
  const email = searchParams.get('email')

  // Debug: Log URL parameters
  useEffect(() => {
    console.log(' Email Verification Page Loaded')
    console.log(' Current URL:', window.location.href)
    console.log(' User ID from URL:', userId)
    console.log(' Token from URL:', token)
    console.log(' Email from URL:', email)
  }, [])

  useEffect(() => {
    // Only verify once - prevent double API calls
    if (hasVerifiedRef.current) {
      console.log(' Already verified, skipping...')
      return
    }

    // If there's a token and userId in the URL, verify it automatically
    if (token && userId) {
      console.log('Token and userId found, starting verification...')
      hasVerifiedRef.current = true // Mark as verified before making the call
      verifyEmail(userId, token)
    } else if (token && !userId) {
      console.log('Token found but userId missing. Attempting verification with just token...')
      hasVerifiedRef.current = true // Mark as verified before making the call
      verifyEmail('', token)
    } else {
      console.log('No token found in URL. Waiting for user to click resend.')
    }
  }, [token, userId])

  const verifyEmail = async (verificationUserId: string, verificationToken: string) => {
    setStatus('verifying')
    setErrorMessage('')

    try {
      console.log(' Calling verify email API')
      console.log('   User ID:', verificationUserId)
      console.log('   Token:', verificationToken.substring(0, 20) + '...')

      await authApi.verifyEmail(verificationUserId, verificationToken)
      console.log(' Email verified successfully!')
      setStatus('success')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Email verified successfully! Please login to continue.' }
        })
      }, 3000)
    } catch (error: any) {
      console.error(' Email verification failed:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Full error:', JSON.stringify(error.response, null, 2))
      setStatus('error')

      const errorMsg = error.response?.data?.message ||
                       error.response?.data?.title ||
                       error.response?.data?.errors?.Token?.[0] ||
                       error.response?.data?.errors?.UserId?.[0] ||
                       'Failed to verify email. The link may be expired or invalid.'

      setErrorMessage(errorMsg)
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      setErrorMessage('Email address not found. Please register again.')
      return
    }

    try {
      await authApi.resendVerificationEmail(email)
      setErrorMessage('')
      alert('Verification email sent! Please check your inbox.')
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
        'Failed to resend verification email. Please try again later.'
      )
    }
  }

  return (
    <Box className="auth-container">
      <Box className="auth-card" sx={{ textAlign: 'center' }}>
        {/* Icon based on status */}
        <Box sx={{ mb: 3 }}>
          {status === 'pending' && (
            <Email sx={{ fontSize: 80, color: 'var(--accent-blue)' }} />
          )}
          {status === 'verifying' && (
            <CircularProgress size={80} sx={{ color: 'var(--accent-blue)' }} />
          )}
          {status === 'success' && (
            <CheckCircle sx={{ fontSize: 80, color: 'var(--accent-green)' }} />
          )}
          {status === 'error' && (
            <ErrorIcon sx={{ fontSize: 80, color: 'var(--accent-terracotta)' }} />
          )}
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'var(--font-display)',
            color: 'var(--neutral-800)',
            fontWeight: 700,
            mb: 2,
          }}
        >
          {status === 'pending' && 'Check Your Email'}
          {status === 'verifying' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </Typography>

        {/* Message based on status */}
        {status === 'pending' && (
          <>
            <Typography
              variant="body1"
              sx={{ color: 'var(--neutral-600)', mb: 3 }}
            >
              We've sent a verification email to:
            </Typography>
            {email && (
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
            )}
            <Typography
              variant="body2"
              sx={{ color: 'var(--neutral-600)', mb: 2 }}
            >
              Please check your inbox and click the verification link to activate your
              account.
            </Typography>

            {/* Important Note for Port Issue */}
            <Alert
              severity="warning"
              sx={{
                mb: 3,
                textAlign: 'left',
                backgroundColor: 'rgba(237, 200, 134, 0.15)',
                color: '#7a5c1a',
                '& .MuiAlert-icon': {
                  color: 'var(--accent-gold)',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Important: If the email link doesn't work
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                1. Copy the link from your email
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                2. Replace <strong>https://localhost:3000</strong> with <strong>http://localhost:5173</strong>
              </Typography>
              <Typography variant="caption" component="div">
                3. Paste the corrected link in your browser
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleResendEmail}
                disabled={!email}
                sx={{
                  borderColor: 'var(--accent-blue)',
                  color: 'var(--accent-blue)',
                  '&:hover': {
                    borderColor: '#6a8a9f',
                    backgroundColor: 'rgba(122, 154, 175, 0.1)',
                  },
                }}
              >
                Resend Verification Email
              </Button>
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ color: 'var(--neutral-600)' }}
              >
                Back to Login
              </Button>
            </Box>
          </>
        )}

        {status === 'verifying' && (
          <Typography variant="body1" sx={{ color: 'var(--neutral-600)' }}>
            Please wait while we verify your email address...
          </Typography>
        )}

        {status === 'success' && (
          <>
            <Typography
              variant="body1"
              sx={{ color: 'var(--neutral-600)', mb: 3 }}
            >
              Your email has been successfully verified!
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--neutral-600)', mb: 3 }}
            >
              Redirecting to login page in 3 seconds...
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              className="btn-primary"
              sx={{ textTransform: 'none' }}
            >
              Go to Login Now
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            {errorMessage && (
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
              >
                {errorMessage}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {email && (
                <Button
                  variant="contained"
                  onClick={handleResendEmail}
                  className="btn-primary"
                  sx={{ textTransform: 'none' }}
                >
                  Resend Verification Email
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: 'var(--neutral-300)',
                  color: 'var(--neutral-700)',
                  '&:hover': {
                    borderColor: 'var(--neutral-400)',
                    backgroundColor: 'var(--neutral-100)',
                  },
                }}
              >
                Register Again
              </Button>
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ color: 'var(--neutral-600)' }}
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

export default EmailVerification

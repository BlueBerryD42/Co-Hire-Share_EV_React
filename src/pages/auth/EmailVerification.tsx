import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  TextField,
} from '@mui/material'
import { CheckCircle, Email, Error as ErrorIcon } from '@mui/icons-material'
import { authApi } from '@/services/auth/api'

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'error'

const EmailVerification = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<VerificationStatus>('pending')
  const [errorMessage, setErrorMessage] = useState('')
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const hasVerifiedRef = useRef(false)

  const token = searchParams.get('token')
  const userId = searchParams.get('userId')
  const email = searchParams.get('email')

  // Refs for code inputs
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Timer countdown
  useEffect(() => {
    if (timer > 0 && status === 'pending') {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else if (timer === 0) {
      setCanResend(true)
    }
  }, [timer, status])

  // Auto-verify if token and userId are in URL
  useEffect(() => {
    if (hasVerifiedRef.current) return

    if (token && userId) {
      console.log('Token and userId found, starting verification...')
      hasVerifiedRef.current = true
      verifyEmail(userId, token)
    }
  }, [token, userId])

  const verifyEmail = async (verificationUserId: string, verificationToken: string) => {
    setStatus('verifying')
    setErrorMessage('')

    try {
      await authApi.verifyEmail(verificationUserId, verificationToken)
      setStatus('success')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Email verified successfully! Please login to continue.' },
        })
      }, 3000)
    } catch (error: any) {
      console.error('Email verification failed:', error)
      setStatus('error')

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data?.errors?.Token?.[0] ||
        error.response?.data?.errors?.UserId?.[0] ||
        'Failed to verify email. The link may be expired or invalid.'

      setErrorMessage(errorMsg)
    }
  }

  // Handle manual code input
  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value.slice(-1) // Only take last character

    setVerificationCode(newCode)
    setErrorMessage('')

    // Auto-focus next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>
  ) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (!/^\d{6}$/.test(pastedData)) return

    const newCode = pastedData.split('')
    setVerificationCode(newCode)
    codeInputRefs.current[5]?.focus()
  }

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = verificationCode.join('')

    if (code.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code')
      return
    }

    if (!userId || !email) {
      setErrorMessage('Missing user information. Please try registering again.')
      return
    }

    await verifyEmail(userId, code)
  }

  const handleResendEmail = async () => {
    if (!email || !canResend) return

    try {
      await authApi.resendVerificationEmail(email)
      setErrorMessage('')
      setTimer(60)
      setCanResend(false)
      setVerificationCode(['', '', '', '', '', ''])

      // Show success message
      setStatus('pending')
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
          {status === 'pending' && 'Verify Your Email'}
          {status === 'verifying' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </Typography>

        {/* Error Alert */}
        {errorMessage && (
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
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        )}

        {/* Pending State - Manual Code Entry */}
        {status === 'pending' && (
          <>
            <Typography variant="body1" sx={{ color: 'var(--neutral-600)', mb: 1 }}>
              We've sent a verification code to:
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
              sx={{ color: 'var(--neutral-600)', mb: 3 }}
            >
              Enter the 6-digit code below to verify your account
            </Typography>

            <form onSubmit={handleManualVerification}>
              {/* 6-Digit Code Input */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                {verificationCode.map((digit, index) => (
                  <TextField
                    key={index}
                    inputRef={(el) => (codeInputRefs.current[index] = el)}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    onPaste={index === 0 ? handleCodePaste : undefined}
                    inputProps={{
                      maxLength: 1,
                      style: {
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        padding: '16px 0',
                      },
                    }}
                    sx={{
                      width: '56px',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'var(--neutral-50)',
                        borderRadius: 'var(--radius-md)',
                      },
                      '& .MuiOutlinedInput-root fieldset': {
                        borderColor: digit
                          ? 'var(--accent-blue)'
                          : 'var(--neutral-200)',
                        borderWidth: 2,
                      },
                      '& .MuiOutlinedInput-root:hover fieldset': {
                        borderColor: 'var(--accent-blue)',
                      },
                      '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                        borderColor: 'var(--accent-blue)',
                        boxShadow: '0 0 0 3px rgba(122, 154, 175, 0.15)',
                      },
                    }}
                  />
                ))}
              </Box>

              {/* Timer and Resend */}
              <Box sx={{ mb: 3 }}>
                {timer > 0 ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--accent-gold)',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Resend code in {timer}s
                  </Typography>
                ) : null}

                <Typography variant="body2" sx={{ color: 'var(--neutral-600)' }}>
                  Didn't receive the code?{' '}
                  <Button
                    onClick={handleResendEmail}
                    disabled={!canResend || !email}
                    sx={{
                      color: canResend ? 'var(--accent-blue)' : 'var(--neutral-400)',
                      textTransform: 'none',
                      padding: 0,
                      minWidth: 'auto',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: canResend ? 'underline' : 'none',
                      },
                      '&:disabled': {
                        color: 'var(--neutral-400)',
                      },
                    }}
                  >
                    {canResend ? 'Resend' : `Wait ${timer}s`}
                  </Button>
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="btn-primary"
                sx={{
                  height: '48px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  mb: 2,
                }}
              >
                Verify Email
              </Button>
            </form>

            {/* Important Note */}
            <Alert
              severity="info"
              sx={{
                mb: 2,
                textAlign: 'left',
                backgroundColor: 'rgba(122, 154, 175, 0.15)',
                color: '#4a5d6a',
                '& .MuiAlert-icon': {
                  color: 'var(--accent-blue)',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Tip: Check your spam folder
              </Typography>
              <Typography variant="caption" component="div">
                If you can't find the email, it might be in your spam or junk folder.
              </Typography>
            </Alert>

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
          </>
        )}

        {/* Verifying State */}
        {status === 'verifying' && (
          <Typography variant="body1" sx={{ color: 'var(--neutral-600)' }}>
            Please wait while we verify your email address...
          </Typography>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <Typography variant="body1" sx={{ color: 'var(--neutral-600)', mb: 3 }}>
              Your email has been successfully verified!
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--neutral-600)', mb: 3 }}>
              Redirecting to login page in 3 seconds...
            </Typography>
            <Button
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

        {/* Error State */}
        {status === 'error' && (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {email && (
                <Button
                  variant="contained"
                  onClick={handleResendEmail}
                  className="btn-primary"
                  sx={{
                    height: '48px',
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  Resend Verification Email
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => navigate('/register')}
                sx={{
                  height: '48px',
                  borderColor: 'var(--neutral-300)',
                  color: 'var(--neutral-700)',
                  textTransform: 'none',
                  fontSize: '1rem',
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

export default EmailVerification

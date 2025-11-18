import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Alert,
  Button,
} from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { authApi } from '@/services/auth/api'

const CorrectEmail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentEmail = searchParams.get('email') || ''

  const [newEmail, setNewEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [emailError, setEmailError] = useState('')

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setNewEmail(email)
    setEmailError('')
    setErrorMessage('')

    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!currentEmail) {
      setErrorMessage('Current email is missing. Please go back and try again.')
      return
    }

    if (!newEmail.trim()) {
      setEmailError('Please enter your new email address')
      return
    }

    if (!validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address')
      return
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setEmailError('New email must be different from the current email')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await authApi.correctEmail(currentEmail, newEmail)
      setSuccessMessage('Email corrected successfully! A verification email has been sent to your new email address.')

      // Redirect to verification page after 3 seconds
      setTimeout(() => {
        navigate(`/confirm-email?email=${encodeURIComponent(newEmail)}`, {
          replace: true,
        })
      }, 3000)
    } catch (error: any) {
      console.error('Email correction failed:', error)

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data?.errors?.newEmail?.[0] ||
        error.response?.data?.errors?.currentEmail?.[0] ||
        'Failed to correct email. Please try again later.'

      setErrorMessage(errorMsg)
      setIsSubmitting(false)
    }
  }

  return (
    <Box className="auth-container">
      <Box className="auth-card">
        {/* Icon */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <EditIcon sx={{ fontSize: 80, color: 'var(--accent-blue)' }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'var(--font-display)',
            color: 'var(--neutral-800)',
            fontWeight: 700,
            mb: 2,
            textAlign: 'center',
          }}
        >
          Correct Email Address
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'var(--neutral-600)',
            mb: 4,
            textAlign: 'center',
          }}
        >
          Enter your correct email address to receive the verification link
        </Typography>

        {/* Error Alert */}
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
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              backgroundColor: 'rgba(160, 188, 156, 0.2)',
              color: '#4a6947',
              '& .MuiAlert-icon': {
                color: 'var(--accent-green)',
              },
            }}
          >
            {successMessage}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Current Email (Read-only) */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: 'var(--neutral-700)', mb: 1, fontWeight: 600 }}
            >
              Current Email
            </Typography>
            <TextField
              fullWidth
              value={currentEmail}
              disabled
              sx={{
                '& .MuiInputBase-input': {
                  backgroundColor: 'var(--neutral-100)',
                },
              }}
            />
          </Box>

          {/* New Email */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: 'var(--neutral-700)', mb: 1, fontWeight: 600 }}
            >
              New Email Address
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="Enter your correct email"
              value={newEmail}
              onChange={handleEmailChange}
              error={!!emailError}
              helperText={emailError}
              disabled={isSubmitting || !!successMessage}
              autoFocus
              required
              sx={{
                '& .MuiInputBase-root': {
                  height: '48px',
                },
              }}
            />
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting || !!emailError || !newEmail.trim() || !!successMessage}
            className="btn-primary"
            sx={{
              height: '48px',
              textTransform: 'none',
              fontSize: '1rem',
              mb: 2,
            }}
          >
            {isSubmitting ? 'Updating Email...' : 'Update Email'}
          </Button>

          {/* Back to Verification Button */}
          <Button
            variant="text"
            onClick={() => navigate(`/confirm-email?email=${encodeURIComponent(currentEmail)}`)}
            disabled={isSubmitting}
            sx={{
              color: 'var(--neutral-600)',
              textTransform: 'none',
              width: '100%',
            }}
          >
            Back to Verification
          </Button>
        </form>
      </Box>
    </Box>
  )
}

export default CorrectEmail

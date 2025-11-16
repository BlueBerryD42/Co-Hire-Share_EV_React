import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  LinearProgress,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { register, clearError } from '@/store/slices/authSlice'
import type { RegisterRequest } from '@/models/auth'

interface PasswordStrength {
  score: number // 0-4
  label: string
  color: string
}

const Register = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState<RegisterRequest>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: '',
  })
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string | undefined
  }>({})

  // Note: We don't auto-redirect on isAuthenticated anymore
  // because registration requires email verification first

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, label: '', color: '' }

    let score = 0

    // Length check
    if (password.length >= 8) score++
    if (password.length >= 12) score++

    // Complexity checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z\d]/.test(password)) score++

    // Cap at 4
    score = Math.min(score, 4)

    const strengths = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Weak', color: 'var(--accent-terracotta)' },
      { score: 2, label: 'Fair', color: 'var(--accent-gold)' },
      { score: 3, label: 'Good', color: 'var(--accent-blue)' },
      { score: 4, label: 'Strong', color: 'var(--accent-green)' },
    ]

    return strengths[score]
  }

  const validateField = (name: string, value: string | boolean): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value || (typeof value === 'string' && !value.trim()))
          return 'Full name is required'
        if (typeof value === 'string' && value.trim().length < 2)
          return 'Name must be at least 2 characters'
        return undefined

      case 'email':
        if (!value || (typeof value === 'string' && !value.trim()))
          return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (typeof value === 'string' && !emailRegex.test(value))
          return 'Please enter a valid email address'
        return undefined

      case 'phoneNumber':
        if (!value || (typeof value === 'string' && !value.trim()))
          return 'Phone number is required'
        const phoneRegex = /^[\d\s\-+()]{10,}$/
        if (typeof value === 'string' && !phoneRegex.test(value))
          return 'Please enter a valid phone number (at least 10 digits)'
        return undefined

      case 'password':
        if (!value) return 'Password is required'
        if (typeof value === 'string' && value.length < 8)
          return 'Password must be at least 8 characters'
        return undefined

      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== formData.password) return 'Passwords do not match'
        return undefined

      case 'acceptedTerms':
        if (!value) return 'You must accept the terms and conditions'
        return undefined

      default:
        return undefined
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target
    const newValue = name === 'acceptedTerms' ? checked : value

    setFormData({ ...formData, [name]: newValue })

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }

    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: undefined })
    }

    // Clear global error
    if (error) {
      dispatch(clearError())
    }
  }

  const handleBlur = (e: React.FocusEvent<Element>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, checked } = target;

    const fieldValue = name === 'acceptedTerms' ? checked : value;
    const error = validateField(name, fieldValue);

    if (error) {
      setFieldErrors({ ...fieldErrors, [name]: error });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const errors = {
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      phoneNumber: validateField('phoneNumber', formData.phoneNumber),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      acceptedTerms: validateField('acceptedTerms', formData.acceptedTerms),
    }

    setFieldErrors(errors)

    // Check if there are any errors
    if (Object.values(errors).some((error) => error)) {
      return
    }

    // Dispatch register action
    const result = await dispatch(register(formData))

    if (register.fulfilled.match(result)) {
     // Registration successful, redirect to email confirmation page
     navigate(`/confirm-email?email=${encodeURIComponent(formData.email)}`)
    }
  }

  return (
    <Box className="auth-container">
      <Box className="auth-card">
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'var(--font-display)',
              color: 'var(--neutral-800)',
              fontWeight: 700,
              mb: 1,
            }}
          >
            Create Account
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--neutral-600)',
              fontSize: '0.875rem',
            }}
          >
            Join Co-Hire Share EV today
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
            onClose={() => dispatch(clearError())}
          >
            {error}
          </Alert>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!fieldErrors.fullName}
            helperText={fieldErrors.fullName}
            disabled={isLoading}
            sx={{ mb: 2.5 }}
            className="auth-input"
          />

          {/* Email */}
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            disabled={isLoading}
            sx={{ mb: 2.5 }}
            className="auth-input"
          />

          {/* Phone Number */}
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!fieldErrors.phoneNumber}
            helperText={fieldErrors.phoneNumber}
            disabled={isLoading}
            sx={{ mb: 2.5 }}
            className="auth-input"
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            disabled={isLoading}
            sx={{ mb: 1 }}
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

          {/* Password Strength Indicator */}
          {formData.password && (
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={(passwordStrength.score / 4) * 100}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--neutral-200)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: passwordStrength.color,
                      borderRadius: 'var(--radius-full)',
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: passwordStrength.color,
                    fontWeight: 600,
                    minWidth: '60px',
                    textAlign: 'right',
                  }}
                >
                  {passwordStrength.label}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'var(--neutral-600)' }}>
                Use 8+ characters with a mix of letters, numbers & symbols
              </Typography>
            </Box>
          )}

          {/* Confirm Password */}
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!fieldErrors.confirmPassword}
            helperText={fieldErrors.confirmPassword}
            disabled={isLoading}
            sx={{ mb: 2.5 }}
            className="auth-input"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Terms & Conditions */}
          <FormControlLabel
            control={
              <Checkbox
                name="acceptedTerms"
                checked={formData.acceptedTerms}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                sx={{
                  color: fieldErrors.acceptedTerms
                    ? 'var(--accent-terracotta)'
                    : 'var(--accent-blue)',
                  '&.Mui-checked': {
                    color: 'var(--accent-blue)',
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: 'var(--neutral-600)' }}>
                I accept the{' '}
                <Link
                  to="/terms"
                  style={{
                    color: 'var(--accent-blue)',
                    textDecoration: 'none',
                  }}
                >
                  Terms & Conditions
                </Link>
              </Typography>
            }
            sx={{ mb: fieldErrors.acceptedTerms ? 0.5 : 3 }}
          />
          {fieldErrors.acceptedTerms && (
            <Typography
              variant="caption"
              sx={{
                color: 'var(--accent-terracotta)',
                display: 'block',
                mb: 2,
                ml: 4,
              }}
            >
              {fieldErrors.acceptedTerms}
            </Typography>
          )}

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
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>

          {/* Login Link */}
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: 'var(--neutral-600)',
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--accent-blue)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Sign in
            </Link>
          </Typography>
        </form>
      </Box>
    </Box>
  )
}

export default Register

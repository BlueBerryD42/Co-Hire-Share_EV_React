import { useState } from 'react'
import { Box, Button, TextField, Typography, Alert } from '@mui/material'
import axios from 'axios'

/**
 * Test page to debug API requests
 * Navigate to /test-api to use this
 */
const TestApi = () => {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<any>(null)

  const testLogin = async () => {
    setResponse(null)
    setError(null)

    try {
      console.log('Sending login request with:', {
        emailOrPhone: email,
        password: password,
      })

      const res = await axios.post('/api/Auth/login', {
        emailOrPhone: email,
        password: password,
      })

      console.log('Success Response:', res.data)
      setResponse(res.data)
    } catch (err: any) {
      console.error('Error Response:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
      })
      setError({
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      })
    }
  }

  const testWithDifferentFields = async () => {
    setResponse(null)
    setError(null)

    // Try common backend field variations
    const variations = [
      { email: email, password: password }, // Common C# naming
      { Email: email, Password: password }, // PascalCase
      { username: email, password: password }, // username instead
      { userName: email, password: password }, // camelCase
    ]

    for (const payload of variations) {
      try {
        console.log('Testing with payload:', payload)
        const res = await axios.post('/api/Auth/login', payload)
        console.log(' SUCCESS with payload:', payload)
        setResponse({ payload, result: res.data })
        return
      } catch (err: any) {
        console.log(' Failed with payload:', payload, 'Error:', err.response?.data)
      }
    }

    setError({ message: 'All variations failed. Check console for details.' })
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        API Test Page
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        This page helps debug API connection issues. Check the browser console (F12) for detailed
        logs.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Email/Phone"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={testLogin}>
            Test Login (Standard)
          </Button>
          <Button variant="outlined" onClick={testWithDifferentFields}>
            Try Different Field Names
          </Button>
        </Box>
      </Box>

      {response && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="h6">Success!</Typography>
          <pre style={{ overflow: 'auto' }}>{JSON.stringify(response, null, 2)}</pre>
        </Alert>
      )}

      {error && (
        <Alert severity="error">
          <Typography variant="h6">Error Details:</Typography>
          <Typography variant="body2">
            <strong>Status:</strong> {error.status} {error.statusText}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Backend Response:</strong>
          </Typography>
          <pre style={{ overflow: 'auto', fontSize: '12px' }}>
            {JSON.stringify(error.data, null, 2)}
          </pre>
        </Alert>
      )}

      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Expected Request Format:
        </Typography>
        <pre>
          {JSON.stringify(
            {
              emailOrPhone: 'test@example.com',
              password: 'password123',
            },
            null,
            2
          )}
        </pre>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          API Endpoint:
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          POST /api/Auth/login
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          Full URL: https://localhost:61601/api/Auth/login
        </Typography>
      </Box>
    </Box>
  )
}

export default TestApi

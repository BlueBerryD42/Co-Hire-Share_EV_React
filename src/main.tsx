import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './styles/globals.css'
import App from './App'

const theme = createTheme({
  palette: {
    background: {
      default: '#edede9',
      paper: '#f5ebe0',
    },
    primary: {
      main: '#7a9aaf',
      dark: '#4a6070',
      light: '#a7bfce',
    },
    secondary: {
      main: '#6b5a4d',
    },
    success: {
      main: '#7a9b76',
    },
    warning: {
      main: '#d4a574',
    },
    error: {
      main: '#b87d6f',
    },
    text: {
      primary: '#2d2520',
      secondary: '#6b5a4d',
    },
  },
  typography: {
    fontFamily: '"Inter","Helvetica Neue",system-ui,sans-serif',
    h1: { fontFamily: '"Lexend","Inter",sans-serif' },
    h2: { fontFamily: '"Lexend","Inter",sans-serif' },
    h3: { fontFamily: '"Lexend","Inter",sans-serif' },
  },
})

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element #root not found')
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)

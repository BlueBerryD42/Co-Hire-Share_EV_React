import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { store } from "./store/store";
import "./styles/globals.css";
import App from "./App";

// Create MUI theme matching the design system
const theme = createTheme({
  palette: {
    primary: {
      main: "#7a9aaf", // accent-blue
      light: "#9ab5c7",
      dark: "#5a7a8f",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#8f7d70", // neutral-600
      light: "#b8a398",
      dark: "#6b5a4d",
      contrastText: "#ffffff",
    },
    success: {
      main: "#7a9b76", // accent-green
      light: "#9ab896",
      dark: "#5a7b56",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#d4a574", // accent-gold
      light: "#e4b894",
      dark: "#b48554",
      contrastText: "#2d2520",
    },
    error: {
      main: "#b87d6f", // accent-terracotta
      light: "#d89d8f",
      dark: "#985d4f",
      contrastText: "#ffffff",
    },
    background: {
      default: "#edede9", // neutral-50
      paper: "#f5ebe0", // neutral-100
    },
    text: {
      primary: "#4a3f35", // neutral-800
      secondary: "#6b5a4d", // neutral-700
    },
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica Neue', system-ui, sans-serif",
    h1: {
      fontFamily: "'Lexend', 'Inter', sans-serif",
      fontWeight: 600,
      color: "#4a3f35",
    },
    h2: {
      fontFamily: "'Lexend', 'Inter', sans-serif",
      fontWeight: 600,
      color: "#4a3f35",
    },
    h3: {
      fontFamily: "'Lexend', 'Inter', sans-serif",
      fontWeight: 600,
      color: "#4a3f35",
    },
    h4: {
      fontFamily: "'Lexend', 'Inter', sans-serif",
      fontWeight: 600,
      color: "#4a3f35",
    },
    body1: {
      color: "#6b5a4d",
    },
    body2: {
      color: "#8f7d70",
    },
  },
  shape: {
    borderRadius: 12, // radius-md
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 500,
          padding: "10px 24px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5ebe0",
          borderRadius: 12,
          border: "1px solid #e3d5ca",
          boxShadow: "0 2px 8px rgba(45, 37, 32, 0.06)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#edede9",
            borderRadius: 12,
            "& fieldset": {
              borderColor: "#e3d5ca",
            },
            "&:hover fieldset": {
              borderColor: "#d6ccc2",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#7a9aaf",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);

import { Box, Typography, Button, Alert } from "@mui/material";
import {
  ErrorOutline,
  CloudOff,
  Lock,
  CreditCard,
  AccessTime,
  CloudUpload,
  Warning,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  type:
    | "404"
    | "500"
    | "no-internet"
    | "permission-denied"
    | "payment-failed"
    | "session-expired"
    | "upload-failed"
    | "validation";
  title?: string;
  message?: string;
  onRetry?: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

const ErrorStates = ({
  type,
  title,
  message,
  onRetry,
  onAction,
  actionLabel,
}: ErrorStateProps) => {
  // ErrorBoundary is now inside BrowserRouter, so useNavigate should always work
  const navigate = useNavigate();

  // Safe navigation helper - wraps navigation calls in try-catch as fallback
  const safeNavigate = (path: string | number) => {
    try {
      if (typeof path === 'string') {
        navigate(path);
      } else {
        navigate(path);
      }
    } catch {
      // Fallback if navigate fails (shouldn't happen, but just in case)
      if (typeof path === 'string') {
        window.location.href = path;
      } else {
        window.history.back();
      }
    }
  };

  const errorConfig = {
    "404": {
      icon: ErrorOutline,
      defaultTitle: "Page not found",
      defaultMessage: "The page you're looking for doesn't exist",
      color: "var(--accent-terracotta)",
      actions: [
        { label: "Go to Dashboard", onClick: () => safeNavigate("/") },
        { label: "Go Back", onClick: () => safeNavigate(-1) },
      ],
    },
    "500": {
      icon: ErrorOutline,
      defaultTitle: "Something went wrong",
      defaultMessage: "We're working on fixing it",
      color: "var(--accent-terracotta)",
      actions: [
        { label: "Try Again", onClick: onRetry },
        { label: "Contact Support", onClick: () => safeNavigate("/help") },
      ],
    },
    "no-internet": {
      icon: CloudOff,
      defaultTitle: "No internet connection",
      defaultMessage: "Please check your connection and try again",
      color: "var(--accent-terracotta)",
      actions: [{ label: "Retry", onClick: onRetry }],
    },
    "permission-denied": {
      icon: Lock,
      defaultTitle: "Access denied",
      defaultMessage: "You don't have permission to view this",
      color: "var(--accent-terracotta)",
      actions: [{ label: "Go to Dashboard", onClick: () => safeNavigate("/") }],
    },
    "payment-failed": {
      icon: CreditCard,
      defaultTitle: "Payment failed",
      defaultMessage: "Your payment couldn't be processed",
      color: "var(--accent-terracotta)",
      actions: [
        { label: "Try Again", onClick: onRetry },
        { label: "Change Method", onClick: onAction },
        { label: "Contact Support", onClick: () => safeNavigate("/help") },
      ],
    },
    "session-expired": {
      icon: AccessTime,
      defaultTitle: "Session expired",
      defaultMessage: "Please log in again to continue",
      color: "var(--accent-gold)",
      actions: [{ label: "Log In", onClick: () => safeNavigate("/login") }],
    },
    "upload-failed": {
      icon: CloudUpload,
      defaultTitle: "Upload failed",
      defaultMessage: "File couldn't be uploaded. Try again.",
      color: "var(--accent-terracotta)",
      actions: [
        { label: "Retry", onClick: onRetry },
        { label: "Choose Different File", onClick: onAction },
      ],
    },
    validation: {
      icon: Warning,
      defaultTitle: "Please check your input",
      defaultMessage: message || "Some fields have errors",
      color: "var(--accent-gold)",
      actions: [],
    },
  };

  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        p: 4,
        textAlign: "center",
      }}
    >
      <Icon
        sx={{
          fontSize: 80,
          color: config.color,
          mb: 3,
          opacity: 0.8,
        }}
      />
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: "var(--neutral-800)",
          mb: 1,
        }}
      >
        {title || config.defaultTitle}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "var(--neutral-600)",
          mb: 4,
          maxWidth: "500px",
        }}
      >
        {message || config.defaultMessage}
      </Typography>

      {type === "validation" && message && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            maxWidth: "500px",
            bgcolor: "var(--accent-gold)",
            color: "var(--neutral-800)",
            "& .MuiAlert-icon": {
              color: "var(--neutral-800)",
            },
          }}
        >
          {message}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {config.actions.map((action, index) => (
          <Button
            key={index}
            variant={index === 0 ? "contained" : "outlined"}
            onClick={action.onClick}
            sx={{
              bgcolor: index === 0 ? "var(--accent-blue)" : "transparent",
              color: index === 0 ? "white" : "var(--neutral-700)",
              borderColor: "var(--neutral-300)",
              "&:hover": {
                bgcolor:
                  index === 0 ? "var(--accent-blue)" : "var(--neutral-100)",
                borderColor: "var(--neutral-400)",
              },
            }}
          >
            {action.label}
          </Button>
        ))}
        {onAction && actionLabel && (
          <Button
            variant="outlined"
            onClick={onAction}
            sx={{
              borderColor: "var(--neutral-300)",
              color: "var(--neutral-700)",
              "&:hover": {
                bgcolor: "var(--neutral-100)",
                borderColor: "var(--neutral-400)",
              },
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ErrorStates;

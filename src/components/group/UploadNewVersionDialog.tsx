import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  LinearProgress,
  IconButton,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  AttachFile as FileIcon,
} from '@mui/icons-material'
import { documentApi } from '@/services/group/documents'
import type { UUID } from '@/models/booking'
import { formatFileSize } from '@/models/document'

interface UploadNewVersionDialogProps {
  documentId: UUID
  documentName: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function UploadNewVersionDialog({
  documentId,
  documentName,
  open,
  onClose,
  onSuccess,
}: UploadNewVersionDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [changeDescription, setChangeDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      await documentApi.uploadNewVersion(documentId, file, changeDescription)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Close dialog after a short delay
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 500)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to upload new version')
      console.error('Error uploading version:', err)
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setFile(null)
      setChangeDescription('')
      setError(null)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UploadIcon sx={{ color: '#7a9b76' }} />
            <Typography variant="h6" component="span">
              Upload New Version
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={uploading} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {documentName}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* File Selection */}
        <Box sx={{ mb: 3 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="version-file-input"
          />
          <label htmlFor="version-file-input">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              disabled={uploading}
              startIcon={<FileIcon />}
              sx={{
                borderColor: '#7a9b76',
                color: '#7a9b76',
                '&:hover': {
                  borderColor: '#6a8b66',
                  bgcolor: '#f5ebe0',
                },
              }}
            >
              {file ? 'Change File' : 'Select File'}
            </Button>
          </label>

          {file && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: '#f5ebe0',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="subtitle2">{file.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.size)}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={handleRemoveFile}
                disabled={uploading}
                sx={{ color: '#b87d6f' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Change Description */}
        <TextField
          label="Change Description (Optional)"
          placeholder="Describe what changed in this version..."
          value={changeDescription}
          onChange={(e) => setChangeDescription(e.target.value)}
          multiline
          rows={3}
          fullWidth
          disabled={uploading}
          sx={{ mb: 2 }}
        />

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Uploading... {uploadProgress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#7a9b76',
                },
              }}
            />
          </Box>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          Uploading a new version will update the document. The previous version will be preserved in the version history.
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          variant="contained"
          startIcon={<UploadIcon />}
          sx={{
            bgcolor: '#7a9b76',
            '&:hover': { bgcolor: '#6a8b66' },
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Version'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

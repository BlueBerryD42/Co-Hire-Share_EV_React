import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Paper,
} from '@mui/material'
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material'
import { documentApi } from '@/services/group/documents'
import { DocumentType, getDocumentTypeName, formatFileSize } from '@/models/document'
import type { UUID } from '@/models/booking'

interface UploadDocumentDialogProps {
  open: boolean
  onClose: () => void
  groupId: UUID
  onSuccess?: () => void
}

export default function UploadDocumentDialog({
  open,
  onClose,
  groupId,
  onSuccess,
}: UploadDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.Other)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validate file size (50MB limit)
      if (selectedFile.size > 52428800) {
        setError('File size must be less than 50MB')
        return
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF, JPG, PNG, DOC, and DOCX files are allowed')
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Simulate upload progress (since we don't have progress tracking in the API yet)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await documentApi.uploadDocument(groupId, file, documentType, description || undefined)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset form
      setFile(null)
      setDocumentType(DocumentType.Other)
      setDescription('')

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

      // Close dialog after short delay
      setTimeout(() => {
        onClose()
        setUploadProgress(0)
      }, 500)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload document')
      console.error('Error uploading document:', err)
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setFile(null)
      setDocumentType(DocumentType.Other)
      setDescription('')
      setError(null)
      setUploadProgress(0)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="span" fontWeight={600}>
          Upload Document
        </Typography>
        <IconButton onClick={handleClose} disabled={uploading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* File Upload Area */}
        <Box sx={{ mb: 3 }}>
          <input
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Paper
              sx={{
                p: 3,
                border: '2px dashed',
                borderColor: file ? '#7a9b76' : '#d0d0d0',
                bgcolor: file ? '#f5ebe0' : '#fafafa',
                cursor: uploading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: '#7a9b76',
                  bgcolor: '#f5ebe0',
                },
                textAlign: 'center',
              }}
              component="div"
            >
              {file ? (
                <Box>
                  <FileIcon sx={{ fontSize: 48, color: '#7a9b76', mb: 1 }} />
                  <Typography variant="body1" fontWeight={600}>
                    {file.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(file.size)}
                  </Typography>
                  {!uploading && (
                    <Button size="small" sx={{ mt: 1 }}>
                      Change File
                    </Button>
                  )}
                </Box>
              ) : (
                <Box>
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#d0d0d0', mb: 1 }} />
                  <Typography variant="body1" fontWeight={600}>
                    Click to upload or drag and drop
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PDF, JPG, PNG, DOC, DOCX (max 50MB)
                  </Typography>
                </Box>
              )}
            </Paper>
          </label>
        </Box>

        {/* Document Type */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Document Type</InputLabel>
          <Select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            label="Document Type"
            disabled={uploading}
          >
            {Object.values(DocumentType).map((type) => (
              <MenuItem key={type} value={type}>
                {getDocumentTypeName(type as DocumentType)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Description */}
        <TextField
          fullWidth
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          placeholder="Add a brief description of the document..."
          disabled={uploading}
        />

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Uploading...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {uploadProgress}%
              </Typography>
            </Box>
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

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
          startIcon={<CloudUploadIcon />}
          sx={{
            bgcolor: '#7a9b76',
            '&:hover': { bgcolor: '#6a8b66' },
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

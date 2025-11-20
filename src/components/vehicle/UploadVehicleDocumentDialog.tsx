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
import { DocumentType, formatFileSize } from '@/models/document'
import type { UUID } from '@/models/booking'

// Vehicle-specific document types (using group document types)
const VehicleDocumentType = {
  Registration: DocumentType.Other, // Will use Other type with description
  Insurance: DocumentType.InsurancePolicy,
  Image: DocumentType.Other,
}

interface UploadVehicleDocumentDialogProps {
  open: boolean
  onClose: () => void
  groupId: UUID
  vehicleId?: UUID
  onSuccess?: (documentId: UUID, documentType: string, fileName: string) => void
}

export default function UploadVehicleDocumentDialog({
  open,
  onClose,
  groupId,
  vehicleId,
  onSuccess,
}: UploadVehicleDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>('Registration')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validate file size (50MB limit)
      if (selectedFile.size > 52428800) {
        setError('Kích thước file phải nhỏ hơn 50MB')
        return
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Chỉ chấp nhận file PDF, JPG, PNG, DOC, DOCX')
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const getDocumentTypeForApi = (): DocumentType => {
    switch (documentType) {
      case 'Insurance':
        return DocumentType.InsurancePolicy
      case 'Registration':
      case 'Image':
      default:
        return DocumentType.Other
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Build description with vehicle context
      const fullDescription = vehicleId
        ? `[Vehicle: ${vehicleId}] ${documentType}: ${description || file.name}`
        : `${documentType}: ${description || file.name}`

      const uploadedDoc = await documentApi.uploadDocument(
        groupId,
        file,
        getDocumentTypeForApi(),
        fullDescription
      )

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset form
      setFile(null)
      setDocumentType('Registration')
      setDescription('')

      // Call success callback with document info
      if (onSuccess) {
        onSuccess(uploadedDoc.id, documentType, file.name)
      }

      // Close dialog after short delay
      setTimeout(() => {
        onClose()
        setUploadProgress(0)
      }, 500)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tải lên tài liệu')
      console.error('Error uploading document:', err)
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setFile(null)
      setDocumentType('Registration')
      setDescription('')
      setError(null)
      setUploadProgress(0)
      onClose()
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'Registration':
        return 'Giấy đăng ký xe'
      case 'Insurance':
        return 'Bảo hiểm xe'
      case 'Image':
        return 'Hình ảnh xe'
      default:
        return type
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="span" fontWeight={600}>
          Tải lên tài liệu xe
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
            id="vehicle-file-upload"
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="vehicle-file-upload">
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
                    <Button size="small" sx={{ mt: 1 }} onClick={(e) => {
                      e.preventDefault()
                      setFile(null)
                      const input = document.getElementById('vehicle-file-upload') as HTMLInputElement
                      if (input) input.value = ''
                    }}>
                      Chọn file khác
                    </Button>
                  )}
                </Box>
              ) : (
                <Box>
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#d0d0d0', mb: 1 }} />
                  <Typography variant="body1" fontWeight={600}>
                    Click để tải lên hoặc kéo thả file vào đây
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PDF, JPG, PNG, DOC, DOCX (tối đa 50MB)
                  </Typography>
                </Box>
              )}
            </Paper>
          </label>
        </Box>

        {/* Document Type */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Loại tài liệu</InputLabel>
          <Select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            label="Loại tài liệu"
            disabled={uploading}
          >
            <MenuItem value="Registration">{getDocumentTypeLabel('Registration')}</MenuItem>
            <MenuItem value="Insurance">{getDocumentTypeLabel('Insurance')}</MenuItem>
            <MenuItem value="Image">{getDocumentTypeLabel('Image')}</MenuItem>
          </Select>
        </FormControl>

        {/* Description */}
        <TextField
          fullWidth
          label="Mô tả (Tùy chọn)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          placeholder="Thêm mô tả về tài liệu..."
          disabled={uploading}
        />

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Đang tải lên...
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
          Hủy
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
          {uploading ? 'Đang tải lên...' : 'Tải lên tài liệu'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}


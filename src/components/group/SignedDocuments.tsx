import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material'
import { documentApi } from '@/services/group/documents'
import {
  type DocumentListItemResponse,
  type DocumentQueryParameters,
  SignatureStatus,
  getDocumentTypeName,
  getDocumentTypeColor,
  formatFileSize,
  getFileIcon,
} from '@/models/document'
import type { UUID } from '@/models/booking'

interface SignedDocumentsProps {
  groupId: UUID
}

export default function SignedDocuments({ groupId }: SignedDocumentsProps) {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<DocumentListItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSignedDocuments()
  }, [groupId])

  const fetchSignedDocuments = async () => {
    setLoading(true)
    setError(null)

    try {
      const params: DocumentQueryParameters = {
        page: 1,
        pageSize: 50,
        signatureStatus: SignatureStatus.FullySigned,
        sortBy: 'UpdatedAt',
        sortDescending: true,
      }

      const response = await documentApi.getGroupDocuments(groupId, params)
      setDocuments(response.items)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load signed documents'
      setError(errorMessage)
      console.error('Error fetching signed documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocument = (documentId: UUID) => {
    navigate(`/groups/${groupId}/documents/${documentId}`)
  }

  const handleDownloadDocument = async (documentId: UUID, fileName: string) => {
    try {
      const blob = await documentApi.downloadDocument(documentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to download document'
      alert(errorMessage)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: '#7a9b76' }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  if (documents.length === 0) {
    return (
      <Card sx={{ bgcolor: '#f5ebe0' }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: '#d0d0d0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No signed documents yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Documents that are fully signed will appear here
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#7a9b76' }}>
          Signed Documents ({documents.length})
        </Typography>
        <Chip
          icon={<VerifiedUserIcon />}
          label="Legally Binding"
          sx={{
            bgcolor: '#7a9b76',
            color: 'white',
          }}
        />
      </Box>

      <Grid container spacing={2}>
        {documents.map((doc) => (
          <Grid item xs={12} sm={6} md={4} key={doc.id}>
            <Card
              sx={{
                bgcolor: '#f5ebe0',
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
                cursor: 'pointer',
                border: '2px solid #7a9b76',
              }}
              onClick={() => handleViewDocument(doc.id)}
            >
              <CardContent>
                {/* Header with icon and badges */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h4" sx={{ fontSize: '2rem' }}>
                    {getFileIcon(doc.fileName)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Chip
                      label={getDocumentTypeName(doc.type)}
                      size="small"
                      sx={{
                        bgcolor: getDocumentTypeColor(doc.type),
                        color: 'white',
                      }}
                    />
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Signed"
                      size="small"
                      sx={{
                        bgcolor: '#7a9b76',
                        color: 'white',
                      }}
                    />
                  </Box>
                </Box>

                {/* File name */}
                <Typography
                  variant="h6"
                  noWrap
                  sx={{ mb: 1, fontWeight: 600, fontSize: '1rem' }}
                >
                  {doc.fileName}
                </Typography>

                {/* Description */}
                {doc.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {doc.description}
                  </Typography>
                )}

                {/* Signatures completed */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <CheckCircleIcon fontSize="small" sx={{ color: '#7a9b76' }} />
                  <Typography variant="caption" color="text.secondary">
                    All signatures completed ({doc.signatureCount}/{doc.signatureCount})
                  </Typography>
                </Box>

                {/* Date and uploader */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(doc.fileSize)}
                  </Typography>
                </Box>

                {/* Uploader */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                  <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    By: {doc.uploaderName}
                  </Typography>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewDocument(doc.id)
                      }}
                      sx={{
                        bgcolor: '#7a9b76',
                        color: 'white',
                        '&:hover': { bgcolor: '#6a8b66' },
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadDocument(doc.id, doc.fileName)
                      }}
                      sx={{
                        bgcolor: '#7a9b76',
                        color: 'white',
                        '&:hover': { bgcolor: '#6a8b66' },
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

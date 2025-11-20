import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  DrawOutlined as SignatureIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material'
import { documentApi } from '@/services/group/documents'
import {
  type DocumentListItemResponse,
  type DocumentQueryParameters,
  SignatureStatus,
  getDocumentTypeName,
  getDocumentTypeColor,
  formatFileSize,
} from '@/models/document'
import type { UUID } from '@/models/booking'

interface PendingSignaturesProps {
  groupId: UUID
}

export default function PendingSignatures({ groupId }: PendingSignaturesProps) {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<DocumentListItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingSignatures()
  }, [groupId])

  const fetchPendingSignatures = async () => {
    setLoading(true)
    setError(null)

    try {
      const params: DocumentQueryParameters = {
        page: 1,
        pageSize: 50,
        signatureStatus: SignatureStatus.SentForSigning,
        sortBy: 'CreatedAt',
        sortDescending: true,
      }

      const response = await documentApi.getGroupDocuments(groupId, params)

      // Also fetch partially signed documents
      const partialParams: DocumentQueryParameters = {
        ...params,
        signatureStatus: SignatureStatus.PartiallySigned,
      }
      const partialResponse = await documentApi.getGroupDocuments(groupId, partialParams)

      // Combine both results
      setDocuments([...response.items, ...partialResponse.items])
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load pending signatures'
      setError(errorMessage)
      console.error('Error fetching pending signatures:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocument = (documentId: UUID) => {
    navigate(`/groups/${groupId}/documents/${documentId}`)
  }

  const handleRemindSigners = async (documentId: UUID) => {
    try {
      await documentApi.remindSigners(documentId)
      // Show success message
      alert('Reminder sent to pending signers')
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to send reminder'
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
            <SignatureIcon sx={{ fontSize: 60, color: '#d0d0d0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No pending signatures
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              All documents are either signed or not yet sent for signing
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#7a9b76' }}>
        Pending Signatures ({documents.length})
      </Typography>

      <List sx={{ p: 0 }}>
        {documents.map((doc) => (
          <Card key={doc.id} sx={{ bgcolor: '#f5ebe0', mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {doc.fileName}
                    </Typography>
                    <Chip
                      label={getDocumentTypeName(doc.type)}
                      size="small"
                      sx={{
                        bgcolor: getDocumentTypeColor(doc.type),
                        color: 'white',
                      }}
                    />
                  </Box>

                  {doc.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {doc.description}
                    </Typography>
                  )}

                  {/* Signature Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Signature Progress
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.signedCount}/{doc.signatureCount} signed
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(doc.signedCount / doc.signatureCount) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#d4a574',
                        },
                      }}
                    />
                  </Box>

                  {/* Document Info */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        By: {doc.uploaderName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(doc.fileSize)}
                    </Typography>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                  <Tooltip title="View Document">
                    <IconButton
                      onClick={() => handleViewDocument(doc.id)}
                      sx={{
                        bgcolor: '#7a9b76',
                        color: 'white',
                        '&:hover': { bgcolor: '#6a8b66' },
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remind Signers">
                    <IconButton
                      onClick={() => handleRemindSigners(doc.id)}
                      sx={{
                        bgcolor: '#d4a574',
                        color: 'white',
                        '&:hover': { bgcolor: '#c49564' },
                      }}
                    >
                      <NotificationsIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </List>
    </Box>
  )
}

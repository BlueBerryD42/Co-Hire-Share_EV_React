import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Paper,
} from '@mui/material'
import {
  Description as DescriptionIcon,
  Edit as SignIcon,
  Schedule as ClockIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { documentApi } from '@/services/group/documents'
import {
  type PendingSignatureResponse,
  getDocumentTypeName,
  getDocumentTypeColor,
} from '@/models/document'
import { formatDistanceToNow } from 'date-fns'

export default function MyPendingSignatures() {
  const navigate = useNavigate()
  const [pendingSignatures, setPendingSignatures] = useState<PendingSignatureResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingSignatures()
  }, [])

  const fetchPendingSignatures = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await documentApi.getMyPendingSignatures()
      setPendingSignatures(data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load pending signatures'
      setError(errorMessage)
      console.error('Error fetching pending signatures:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignDocument = (signature: PendingSignatureResponse) => {
    // Navigate to sign page with token
    navigate(`/groups/${signature.groupId}/documents/${signature.documentId}/sign?token=${signature.signingToken}`)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#7a9b76' }} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#7a9b76', mb: 1 }}>
          My Pending Signatures
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Documents waiting for your signature
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!loading && pendingSignatures.length === 0 && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: '#f5ebe0',
          }}
        >
          <CheckIcon sx={{ fontSize: 80, color: '#7a9b76', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            All Caught Up!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You have no documents waiting for your signature.
          </Typography>
        </Paper>
      )}

      {/* Pending Signatures List */}
      <Stack spacing={2}>
        {pendingSignatures.map((signature) => (
          <Card
            key={signature.documentId}
            sx={{
              bgcolor: signature.isMyTurn ? '#fff8f0' : '#f5ebe0',
              border: signature.isMyTurn ? '2px solid #d4a574' : 'none',
              position: 'relative',
            }}
          >
            <CardContent>
              {/* My Turn Badge */}
              {signature.isMyTurn && (
                <Chip
                  label="Your Turn"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: '#d4a574',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              )}

              {/* Document Info */}
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
                <DescriptionIcon sx={{ color: '#7a9b76', fontSize: 40 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {signature.fileName}
                  </Typography>
                  {signature.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {signature.description}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      size="small"
                      label={getDocumentTypeName(signature.documentType)}
                      sx={{
                        bgcolor: getDocumentTypeColor(signature.documentType),
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                    <Chip
                      size="small"
                      icon={<GroupIcon />}
                      label={signature.groupName}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={`Order: ${signature.signatureOrder}`}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={signature.signingMode === 'Sequential' ? 'Sequential' : 'Parallel'}
                      variant="outlined"
                    />
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {/* Timeline Info */}
                  <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ClockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Sent {formatDistanceToNow(new Date(signature.sentAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                    {signature.dueDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ClockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Due {formatDistanceToNow(new Date(signature.dueDate), { addSuffix: true })}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {/* Actions */}
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<SignIcon />}
                      onClick={() => handleSignDocument(signature)}
                      disabled={!signature.isMyTurn && signature.signingMode === 'Sequential'}
                      sx={{
                        bgcolor: '#7a9b76',
                        '&:hover': { bgcolor: '#6a8b66' },
                      }}
                    >
                      {signature.isMyTurn ? 'Sign Now' : 'View & Sign'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/groups/${signature.groupId}/documents/${signature.documentId}`)}
                      sx={{
                        borderColor: '#7a9b76',
                        color: '#7a9b76',
                      }}
                    >
                      View Details
                    </Button>
                  </Stack>

                  {/* Sequential Mode Warning */}
                  {!signature.isMyTurn && signature.signingMode === 'Sequential' && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      This document requires sequential signing. You can sign after the previous signer completes their signature.
                    </Alert>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}

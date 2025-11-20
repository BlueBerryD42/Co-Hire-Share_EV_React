import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  NatureOutlined as SignatureIcon,
} from '@mui/icons-material'
import { documentApi } from '@/services/group/documents'
import {
  type DocumentDetailResponse,
  type DocumentSignatureStatusResponse,
  getDocumentTypeName,
  getDocumentTypeColor,
  getSignatureStatusName,
  getSignatureStatusColor,
  formatFileSize,
  SignatureStatus,
} from '@/models/document'
import type { UUID } from '@/models/booking'

export default function DocumentDetail() {
  const { groupId, documentId } = useParams<{ groupId: string; documentId: string }>()
  const navigate = useNavigate()

  const [documentData, setDocumentData] = useState<DocumentDetailResponse | null>(null)
  const [signatureStatus, setSignatureStatus] = useState<DocumentSignatureStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    if (documentId) {
      fetchDocumentDetails()
      fetchSignatureStatus()
      loadPreview()
    }
  }, [documentId])

  const fetchDocumentDetails = async () => {
    if (!documentId) return

    setLoading(true)
    setError(null)

    try {
      const data = await documentApi.getDocumentById(documentId as UUID)
      setDocumentData(data)
      setEditDescription(data.description || '')
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load document'
      setError(errorMessage)
      console.error('Error fetching document:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSignatureStatus = async () => {
    if (!documentId) return

    try {
      const status = await documentApi.getSignatureStatus(documentId as UUID)
      setSignatureStatus(status)
    } catch (err: any) {
      // Signature status might not be available if document hasn't been sent for signing
      // 404 = endpoint not found, 400 = document not in signing workflow yet
      const statusCode = err.response?.status
      if (statusCode === 404 || statusCode === 400) {
        console.log('Signature status not available:', 'Document has not been sent for signing yet')
      } else {
        console.error('Error fetching signature status:', err.message)
      }
    }
  }

  const loadPreview = async () => {
    if (!documentId) return

    try {
      const blob = await documentApi.previewDocument(documentId as UUID)
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (err: any) {
      // Preview might not be available for all file types or backend might have issues - this is not critical
      console.log('Preview not available:', err.response?.status === 500 ? 'Backend error generating preview' : err.message)
      // Don't set error as preview is optional
    }
  }

  const handleDownload = async () => {
    if (!documentData) return

    try {
      const blob = await documentApi.downloadDocument(documentData.id)
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = documentData.fileName
      window.document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      window.document.body.removeChild(link)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to download document'
      setError(errorMessage)
      console.error('Error downloading document:', err)
    }
  }

  const handleDelete = async () => {
    if (!documentData) return

    if (!window.confirm('Are you sure you want to delete this document?')) return

    try {
      await documentApi.deleteDocument(documentData.id)
      navigate(`/groups/${groupId}/documents`)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete document'
      setError(errorMessage)
      console.error('Error deleting document:', err)
    }
  }

  const handleSaveEdit = async () => {
    if (!documentData) return

    try {
      await documentApi.updateDocument(documentData.id, {
        description: editDescription,
      })
      setEditDialogOpen(false)
      await fetchDocumentDetails()
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update document'
      setError(errorMessage)
      console.error('Error updating document:', err)
    }
  }

  const handleSendForSigning = () => {
    // Navigate to signing dialog or open a modal
    navigate(`/groups/${groupId}/documents/${documentId}/send-for-signing`)
  }

  const handleSign = () => {
    // Navigate to signing page or open signing dialog
    navigate(`/groups/${groupId}/documents/${documentId}/sign`)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#7a9b76' }} />
      </Box>
    )
  }

  if (!documentData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Document not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/groups/${groupId}/documents`)}
          sx={{ mt: 2 }}
        >
          Back to Documents
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/groups/${groupId}/documents`)}
          sx={{ mb: 2 }}
        >
          Back to Documents
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#7a9b76', mb: 1 }}>
              {documentData.fileName}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label={getDocumentTypeName(documentData.type)}
                sx={{
                  bgcolor: getDocumentTypeColor(documentData.type),
                  color: 'white',
                }}
              />
              <Chip
                label={getSignatureStatusName(documentData.signatureStatus)}
                sx={{
                  bgcolor: getSignatureStatusColor(documentData.signatureStatus),
                  color: 'white',
                }}
              />
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ borderColor: '#7a9b76', color: '#7a9b76' }}
            >
              Download
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
              sx={{ borderColor: '#7a9b76', color: '#7a9b76' }}
            >
              Edit
            </Button>
            {documentData.signatureStatus === SignatureStatus.Draft && (
              <Button
                variant="contained"
                startIcon={<SignatureIcon />}
                onClick={handleSendForSigning}
                sx={{
                  bgcolor: '#7a9b76',
                  '&:hover': { bgcolor: '#6a8b66' },
                }}
              >
                Send for Signing
              </Button>
            )}
            {signatureStatus && signatureStatus.signatures.some(s => s.isPending && s.isCurrentSigner) && (
              <Button
                variant="contained"
                startIcon={<SignatureIcon />}
                onClick={handleSign}
                sx={{
                  bgcolor: '#d4a574',
                  '&:hover': { bgcolor: '#c49564' },
                }}
              >
                Sign Document
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              sx={{ borderColor: '#b87d6f', color: '#b87d6f' }}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Preview Section */}
        <Box>
          <Card sx={{ bgcolor: '#f5ebe0' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Document Preview
              </Typography>
              {previewUrl ? (
                <Box
                  sx={{
                    width: '100%',
                    height: '600px',
                    bgcolor: 'white',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    src={previewUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                    title="Document Preview"
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '400px',
                    bgcolor: 'white',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 80, color: '#d0d0d0', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Preview not available for this file type
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    sx={{ mt: 2, borderColor: '#7a9b76', color: '#7a9b76' }}
                  >
                    Download to View
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Details Section */}
        <Box>
          {/* Document Information */}
          <Card sx={{ bgcolor: '#f5ebe0', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Document Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    File Name
                  </Typography>
                  <Typography variant="body1">{documentData.fileName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    File Size
                  </Typography>
                  <Typography variant="body1">{formatFileSize(documentData.fileSize)}</Typography>
                </Box>
                {documentData.pageCount && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Pages
                    </Typography>
                    <Typography variant="body1">{documentData.pageCount}</Typography>
                  </Box>
                )}
                {documentData.author && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Author
                    </Typography>
                    <Typography variant="body1">{documentData.author}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(documentData.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {new Date(documentData.updatedAt).toLocaleString()}
                  </Typography>
                </Box>
                {documentData.description && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{documentData.description}</Typography>
                  </Box>
                )}
                {documentData.isVirusScanned && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Security
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: '#7a9b76' }}
                    >
                      Virus Scanned ✓
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Signature Status */}
          {signatureStatus && signatureStatus.totalSigners > 0 && (
            <Card sx={{ bgcolor: '#f5ebe0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Signature Status
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Progress: {signatureStatus.signedCount}/{signatureStatus.totalSigners} signed (
                    {signatureStatus.progressPercentage}%)
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 8,
                      bgcolor: '#e0e0e0',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${signatureStatus.progressPercentage}%`,
                        height: '100%',
                        bgcolor: '#7a9b76',
                        transition: 'width 0.3s',
                      }}
                    />
                  </Box>
                </Box>

                {signatureStatus.dueDate && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Due: {new Date(signatureStatus.dueDate).toLocaleDateString()}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <List>
                  {signatureStatus.signatures.map((signature) => (
                    <ListItem key={signature.id} disableGutters>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: signature.signedAt ? '#7a9b76' : '#d0d0d0' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={signature.signerName}
                        secondary={
                          signature.signedAt
                            ? `Signed on ${new Date(signature.signedAt).toLocaleString()}`
                            : signature.isPending
                            ? 'Pending signature'
                            : 'Awaiting turn'
                        }
                      />
                      {signature.isCurrentSigner && signature.isPending && (
                        <Chip label="Your turn" size="small" color="warning" />
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Document Description</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            multiline
            rows={4}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            sx={{
              bgcolor: '#7a9b76',
              '&:hover': { bgcolor: '#6a8b66' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

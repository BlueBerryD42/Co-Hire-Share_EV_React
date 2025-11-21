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
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Paper,
  LinearProgress,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  EditNote as EditNoteIcon,
} from '@mui/icons-material'
import { documentApi } from '@/services/group/documents'
import SendForSigningDialog from '@/components/group/SendForSigningDialog'
import DocumentVersionHistory from '@/components/group/DocumentVersionHistory'
import UploadNewVersionDialog from '@/components/group/UploadNewVersionDialog'
import {
  type DocumentDetailResponse,
  type DocumentSignatureStatusResponse,
  SignatureStatus,
  SigningMode,
  getDocumentTypeName,
  getDocumentTypeColor,
  getSignatureStatusName,
  getSignatureStatusColor,
  formatFileSize,
} from '@/models/document'
import type { UUID } from '@/models/booking'

export default function DocumentViewer() {
  const { groupId, documentId } = useParams<{ groupId: string; documentId: string }>()
  const navigate = useNavigate()

  // State
  const [documentData, setDocumentData] = useState<DocumentDetailResponse | null>(null)
  const [signatureStatus, setSignatureStatus] = useState<DocumentSignatureStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(true)

  // PDF viewer state
  const [zoom, setZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog states
  const [signDialogOpen, setSignDialogOpen] = useState(false)
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)
  const [uploadVersionOpen, setUploadVersionOpen] = useState(false)
  const [versionMenuAnchor, setVersionMenuAnchor] = useState<null | HTMLElement>(null)

  useEffect(() => {
    if (documentId) {
      fetchDocument()
      fetchSignatureStatus()
      loadPdfPreview()
    }
  }, [documentId])

  const fetchDocument = async () => {
    if (!documentId) return

    setLoading(true)
    setError(null)

    try {
      const data = await documentApi.getDocumentById(documentId as UUID)
      setDocumentData(data)
      setTotalPages(data.pageCount || 1)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load document')
      console.error('Error fetching document:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSignatureStatus = async () => {
    if (!documentId) return

    try {
      const data = await documentApi.getSignatureStatus(documentId as UUID)
      setSignatureStatus(data)
    } catch (err: any) {
      // Signature status might not be available if document hasn't been sent for signing
      // 404 = endpoint not found, 400 = document not in signing workflow yet
      const status = err.response?.status
      if (status === 404 || status === 400) {
        console.log('Signature status not available:', 'Document has not been sent for signing yet')
      } else {
        console.error('Error fetching signature status:', err.message)
      }
    }
  }

  const loadPdfPreview = async () => {
    if (!documentId) return

    try {
      const blob = await documentApi.previewDocument(documentId as UUID)
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (err: any) {
      // Preview might not be available for all file types - this is not critical
      console.log('Preview not available:', err.response?.status === 500 ? 'Backend error generating preview' : err.message)
      // Don't set error state as preview is optional
    }
  }

  const handleDownload = async () => {
    if (!documentId || !documentData) return

    try {
      const blob = await documentApi.downloadDocument(documentId as UUID)
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = documentData.fileName
      window.document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      window.document.body.removeChild(link)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to download document')
    }
  }

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank')
      printWindow?.print()
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50))
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handleVersionMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setVersionMenuAnchor(event.currentTarget)
  }

  const handleVersionMenuClose = () => {
    setVersionMenuAnchor(null)
  }

  const handleViewVersionHistory = () => {
    setVersionMenuAnchor(null)
    setVersionHistoryOpen(true)
  }

  const handleUploadNewVersion = () => {
    setVersionMenuAnchor(null)
    setUploadVersionOpen(true)
  }

  const handleDeleteDocument = async () => {
    if (!documentId) return

    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    try {
      await documentApi.deleteDocument(documentId as UUID)
      setVersionMenuAnchor(null)
      navigate(`/groups/${groupId}/documents`)
    } catch (err: any) {
      console.error('Error deleting document:', err)
      setError(err.response?.data?.error || 'Failed to delete document')
    }
  }

  const renderSignatureTimeline = () => {
    if (!signatureStatus) return null

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Signature Status
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              {signatureStatus.signedCount} of {signatureStatus.totalSigners} signed
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {Math.round(signatureStatus.progressPercentage)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={signatureStatus.progressPercentage}
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

        {/* Signature List */}
        <List>
          {signatureStatus.signatures.map((sig, index) => (
            <React.Fragment key={sig.id}>
              <ListItem
                sx={{
                  bgcolor: sig.isCurrentSigner ? '#f5f5f5' : 'transparent',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: getSignatureStatusColor(sig.status) }}>
                    {sig.status === SignatureStatus.FullySigned ? (
                      <CheckCircleIcon />
                    ) : sig.status === SignatureStatus.Cancelled || sig.status === SignatureStatus.Expired ? (
                      <CancelIcon />
                    ) : (
                      <PendingIcon />
                    )}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={sig.isCurrentSigner ? 600 : 400}>
                        {sig.signerName}
                      </Typography>
                      {sig.isCurrentSigner && (
                        <Chip label="Your Turn" size="small" color="primary" />
                      )}
                    </Box>
                  }
                  primaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {sig.signerEmail}
                      </Typography>
                      {sig.signedAt && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Signed on {new Date(sig.signedAt).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
                <Chip
                  label={getSignatureStatusName(sig.status)}
                  size="small"
                  sx={{
                    bgcolor: getSignatureStatusColor(sig.status),
                    color: 'white',
                  }}
                />
              </ListItem>
              {index < signatureStatus.signatures.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {/* Sign Button */}
        {signatureStatus.signatures.some((sig) => sig.isCurrentSigner && sig.isPending) && (
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate(`/groups/${groupId}/documents/${documentId}/sign`)}
            sx={{
              mt: 2,
              bgcolor: '#7a9b76',
              '&:hover': { bgcolor: '#6a8b66' },
            }}
          >
            Sign Document
          </Button>
        )}

        {/* Send for Signing Button (Draft Status) */}
        {signatureStatus.status === SignatureStatus.Draft && (
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => setSignDialogOpen(true)}
            sx={{
              mt: 2,
              bgcolor: '#d4a574',
              '&:hover': { bgcolor: '#c49564' },
            }}
          >
            Send for Signing
          </Button>
        )}
      </Box>
    )
  }

  const renderDocumentInfo = () => {
    if (!documentData) return null

    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Document Information
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              File Name
            </Typography>
            <Typography variant="body2">{documentData.fileName}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Type
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={getDocumentTypeName(documentData.type)}
                size="small"
                sx={{ bgcolor: getDocumentTypeColor(documentData.type), color: 'white' }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={getSignatureStatusName(documentData.signatureStatus)}
                size="small"
                sx={{ bgcolor: getSignatureStatusColor(documentData.signatureStatus), color: 'white' }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body2">
              {new Date(documentData.createdAt).toLocaleString()}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Updated
            </Typography>
            <Typography variant="body2">
              {new Date(documentData.updatedAt).toLocaleString()}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              File Size
            </Typography>
            <Typography variant="body2">{formatFileSize(documentData.fileSize)}</Typography>
          </Box>

          {documentData.pageCount && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Pages
              </Typography>
              <Typography variant="body2">{documentData.pageCount}</Typography>
            </Box>
          )}

          {documentData.author && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Author
              </Typography>
              <Typography variant="body2">{documentData.author}</Typography>
            </Box>
          )}

          {documentData.description && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body2">{documentData.description}</Typography>
            </Box>
          )}

          <Box>
            <Typography variant="caption" color="text.secondary">
              Virus Scan
            </Typography>
            <Typography variant="body2">
              {documentData.isVirusScanned ? '✓ Scanned' : '⚠ Not scanned'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#7a9b76' }} />
      </Box>
    )
  }

  if (error || !documentData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Document not found'}</Alert>
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
    <Box sx={{
      display: 'flex',
      height: 'calc(100vh - 64px)',
      overflow: 'hidden',
      width: 'calc(100% + 48px)',
      margin: '-24px',
      marginRight: 0,
      marginTop: 0,
    }}>
      {/* Main PDF Viewer Area */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f5',
        minWidth: 0,
        overflow: 'hidden'
      }}>
        {/* Toolbar */}
        <Paper sx={{ p: 2, borderRadius: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, overflow: 'hidden' }}>
            <IconButton onClick={() => navigate(`/groups/${groupId}/documents`)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ maxWidth: { xs: 200, sm: 300, md: 400 } }}>
              {documentData.fileName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {/* Page Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="small" onClick={handlePreviousPage} disabled={currentPage === 1}>
                <NavigateBeforeIcon fontSize="small" />
              </IconButton>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', minWidth: 40, textAlign: 'center' }}>
                {currentPage}/{totalPages}
              </Typography>
              <IconButton size="small" onClick={handleNextPage} disabled={currentPage === totalPages}>
                <NavigateNextIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Zoom Controls */}
            <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" sx={{ fontSize: '0.75rem', minWidth: 45, textAlign: 'center' }}>
              {zoom}%
            </Typography>
            <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomInIcon fontSize="small" />
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* Action Buttons */}
            <Tooltip title="Download">
              <IconButton onClick={handleDownload}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton onClick={handlePrint}>
                <PrintIcon />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* Version Control Button */}
            <Tooltip title="Version Control">
              <IconButton
                onClick={handleVersionMenuClick}
                sx={{
                  bgcolor: versionMenuAnchor ? '#7a9b76' : 'transparent',
                  color: versionMenuAnchor ? 'white' : 'inherit',
                  '&:hover': {
                    bgcolor: versionMenuAnchor ? '#6a8b66' : 'rgba(122, 155, 118, 0.1)',
                  },
                }}
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* Version Control Menu */}
        <Menu
          anchorEl={versionMenuAnchor}
          open={Boolean(versionMenuAnchor)}
          onClose={handleVersionMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleViewVersionHistory}>
            <ListItemIcon>
              <HistoryIcon fontSize="small" sx={{ color: '#7a9b76' }} />
            </ListItemIcon>
            <ListItemText>View Version History</ListItemText>
          </MenuItem>

          {/* Only show Upload New Version if document is not in signing process */}
          {(!signatureStatus ||
            signatureStatus.status === SignatureStatus.Draft ||
            signatureStatus.status === SignatureStatus.Cancelled ||
            signatureStatus.status === SignatureStatus.Expired) && [
            <MenuItem key="upload" onClick={handleUploadNewVersion}>
              <ListItemIcon>
                <UploadIcon fontSize="small" sx={{ color: '#7a9b76' }} />
              </ListItemIcon>
              <ListItemText>Upload New Version</ListItemText>
            </MenuItem>,
            <Divider key="divider" />,
            <MenuItem key="delete" onClick={handleDeleteDocument} sx={{ color: '#b87d6f' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: '#b87d6f' }} />
              </ListItemIcon>
              <ListItemText>Delete Document</ListItemText>
            </MenuItem>
          ]}
        </Menu>

        {/* PDF Display Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            p: 0.5,
            pr: 0,
            bgcolor: '#e0e0e0',
            minHeight: 0,
          }}
        >
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              style={{
                width: zoom === 100 ? '100%' : `${zoom}%`,
                maxWidth: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: 'white',
              }}
              title="PDF Viewer"
            />
          ) : (
            <Typography color="text.secondary">Loading PDF...</Typography>
          )}
        </Box>
      </Box>

      {/* Side Drawer */}
      <Drawer
        anchor="right"
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: { xs: 280, sm: 300, md: 340 },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: { xs: 280, sm: 300, md: 340 },
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
          },
        }}
      >
        <Box sx={{ p: 2, overflow: 'auto', height: '100%' }}>
          {renderDocumentInfo()}
          {renderSignatureTimeline()}
        </Box>
      </Drawer>

      {/* Send for Signing Dialog */}
      {documentData && (
        <SendForSigningDialog
          open={signDialogOpen}
          onClose={() => setSignDialogOpen(false)}
          documentId={documentId as UUID}
          groupId={groupId as UUID}
          documentType={documentData.type}
          onSuccess={() => {
            fetchDocument()
            fetchSignatureStatus()
          }}
        />
      )}

      {/* Version History Dialog */}
      {documentId && (
        <DocumentVersionHistory
          documentId={documentId as UUID}
          open={versionHistoryOpen}
          onClose={() => setVersionHistoryOpen(false)}
          allowDelete={true}
        />
      )}

      {/* Upload New Version Dialog */}
      {documentId && documentData && (
        <UploadNewVersionDialog
          documentId={documentId as UUID}
          documentName={documentData.fileName}
          open={uploadVersionOpen}
          onClose={() => setUploadVersionOpen(false)}
          onSuccess={() => {
            fetchDocument()
            fetchSignatureStatus()
            loadPdfPreview()
          }}
        />
      )}
    </Box>
  )
}

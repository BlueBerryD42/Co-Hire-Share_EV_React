import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Stack,
} from '@mui/material'
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  FilterList as FilterListIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  GetApp as GetAppIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material'
import { documentApi } from '@/services/group/documents'
import UploadDocumentDialog from '@/components/group/UploadDocumentDialog'
import {
  DocumentType,
  SignatureStatus,
  type DocumentListItemResponse,
  type DocumentQueryParameters,
  getDocumentTypeName,
  getDocumentTypeColor,
  getSignatureStatusName,
  getSignatureStatusColor,
  formatFileSize,
  getFileIcon,
} from '@/models/document'
import type { UUID } from '@/models/booking'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function Documents() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()

  // State
  const [tabValue, setTabValue] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [documents, setDocuments] = useState<DocumentListItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // Filters
  const [filterType, setFilterType] = useState<DocumentType | ''>('')
  const [filterStatus, setFilterStatus] = useState<SignatureStatus | ''>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('CreatedAt')
  const [sortDescending, setSortDescending] = useState(true)

  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedDocument, setSelectedDocument] = useState<DocumentListItemResponse | null>(null)
  const [editDescription, setEditDescription] = useState('')

  // Fetch documents
  useEffect(() => {
    if (groupId) {
      fetchDocuments()
    }
  }, [groupId, tabValue, page, filterType, filterStatus, searchTerm, sortBy, sortDescending])

  const fetchDocuments = async () => {
    if (!groupId) return

    setLoading(true)
    setError(null)

    try {
      const params: DocumentQueryParameters = {
        page,
        pageSize,
        sortBy,
        sortDescending,
      }

      // Apply filters based on active tab
      if (tabValue === 1) {
        // Contracts tab
        params.documentType = DocumentType.OwnershipAgreement
      } else if (tabValue === 2) {
        // Receipts tab - you may need to adjust this based on your document types
        params.documentType = DocumentType.Other
      } else if (tabValue === 3) {
        // Insurance tab
        params.documentType = DocumentType.InsurancePolicy
      } else if (tabValue === 4) {
        // Registration tab
        params.documentType = DocumentType.MaintenanceContract
      } else if (tabValue === 5) {
        // Other tab
        params.documentType = DocumentType.Other
      }

      // Apply additional filters
      if (filterType !== '') {
        params.documentType = filterType
      }
      if (filterStatus !== '') {
        params.signatureStatus = filterStatus
      }
      if (searchTerm) {
        params.searchTerm = searchTerm
      }

      const response = await documentApi.getGroupDocuments(groupId as UUID, params)
      setDocuments(response?.items || [])
      setTotalCount(response?.totalCount || 0)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load documents'
      setError(errorMessage)
      console.error('Error fetching documents:', err)
      setDocuments([]) // Ensure documents is always an array
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setPage(1)
  }

  const handleViewDocument = (documentId: UUID) => {
    navigate(`/groups/${groupId}/documents/${documentId}`)
  }

  const handleDownloadDocument = async (documentId: UUID, fileName: string) => {
    try {
      setError(null)
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
      setError(errorMessage)
      console.error('Error downloading document:', err)
    }
  }

  const handleDeleteDocument = async (documentId: UUID) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return

    try {
      setError(null)
      await documentApi.deleteDocument(documentId)
      await fetchDocuments() // Refresh the list
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete document'
      setError(errorMessage)
      console.error('Error deleting document:', err)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, document: DocumentListItemResponse) => {
    setAnchorEl(event.currentTarget)
    setSelectedDocument(document)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedDocument(null)
  }

  const handleEditDocument = (document: DocumentListItemResponse) => {
    setSelectedDocument(document)
    setEditDescription(document.description || '')
    setEditDialogOpen(true)
    handleMenuClose()
  }

  const handleSaveEdit = async () => {
    if (!selectedDocument) return

    try {
      setError(null)
      await documentApi.updateDocument(selectedDocument.id, {
        description: editDescription,
      })
      setEditDialogOpen(false)
      setSelectedDocument(null)
      setEditDescription('')
      await fetchDocuments() // Refresh the list
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update document'
      setError(errorMessage)
      console.error('Error updating document:', err)
    }
  }

  const renderDocumentCard = (document: DocumentListItemResponse) => (
    <Card
      key={document.id}
      sx={{
        bgcolor: '#f5ebe0',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={() => handleViewDocument(document.id)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" sx={{ fontSize: '2rem' }}>
            {getFileIcon(document.fileName)}
          </Typography>
          <Box>
            <Chip
              label={getDocumentTypeName(document.type)}
              size="small"
              sx={{
                bgcolor: getDocumentTypeColor(document.type),
                color: 'white',
                mr: 0.5,
              }}
            />
            <Chip
              label={getSignatureStatusName(document.signatureStatus)}
              size="small"
              sx={{
                bgcolor: getSignatureStatusColor(document.signatureStatus),
                color: 'white',
              }}
            />
          </Box>
        </Box>

       <Typography
          variant="h6"
          noWrap
          sx={{ mb: 1, fontWeight: 600, maxWidth: 200 }}
        >
          {document.fileName}
        </Typography>

        {document.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {document.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(document.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(document.fileSize)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            By: {document.uploaderName}
          </Typography>
          <Box>
            <Tooltip title="View">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDocument(document.id)
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
                  handleDownloadDocument(document.id, document.fileName)
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleMenuOpen(e, document)
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {document.signatureStatus !== SignatureStatus.Draft && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="caption" color="text.secondary">
              Signatures: {document.signedCount}/{document.signatureCount}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )

  const renderDocumentList = (document: DocumentListItemResponse) => (
    <Card
      key={document.id}
      sx={{
        bgcolor: '#f5ebe0',
        mb: 2,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 2,
        },
      }}
      onClick={() => handleViewDocument(document.id)}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <Typography variant="h4">{getFileIcon(document.fileName)}</Typography>
          </Grid>
          <Grid >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {document.fileName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {document.description}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={getDocumentTypeName(document.type)}
                size="small"
                sx={{ bgcolor: getDocumentTypeColor(document.type), color: 'white', mr: 1 }}
              />
              <Chip
                label={getSignatureStatusName(document.signatureStatus)}
                size="small"
                sx={{ bgcolor: getSignatureStatusColor(document.signatureStatus), color: 'white' }}
              />
            </Box>
          </Grid>
          <Grid >
            <Typography variant="body2" color="text.secondary">
              {new Date(document.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatFileSize(document.fileSize)}
            </Typography>
          </Grid>
          <Grid >
            <Typography variant="body2" color="text.secondary">
              By: {document.uploaderName}
            </Typography>
            {document.signatureStatus !== SignatureStatus.Draft && (
              <Typography variant="caption" color="text.secondary">
                Signatures: {document.signedCount}/{document.signatureCount}
              </Typography>
            )}
          </Grid>
          <Grid >
            <Tooltip title="View">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDocument(document.id)
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownloadDocument(document.id, document.fileName)
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                handleMenuOpen(e, document)
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#7a9b76' }}>
          Documents & E-Contracts
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              bgcolor: '#7a9b76',
              '&:hover': { bgcolor: '#6a8b66' },
              mr: 2,
            }}
          >
            Upload Document
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDialogOpen(true)}
            sx={{ borderColor: '#7a9b76', color: '#7a9b76' }}
          >
            Filters
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="document tabs">
          <Tab label="All Documents" />
          <Tab label="Contracts" />
          <Tab label="Receipts" />
          <Tab label="Insurance" />
          <Tab label="Registration" />
          <Tab label="Other" />
        </Tabs>
      </Box>

      {/* Search and View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
          size="small"
        />
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_e, newMode) => newMode && setViewMode(newMode)}
          aria-label="view mode"
        >
          <ToggleButton value="grid" aria-label="grid view">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: '#7a9b76' }} />
        </Box>
      )}

      {/* Documents */}
      {!loading && (
        <TabPanel value={tabValue} index={tabValue}>
          {documents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <DescriptionIcon sx={{ fontSize: 80, color: '#d4a574', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No documents found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Upload your first document to get started
              </Typography>
            </Box>
          ) : viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {documents.map((doc) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
                  {renderDocumentCard(doc)}
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box>{documents.map(renderDocumentList)}</Box>
          )}
        </TabPanel>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (selectedDocument) handleViewDocument(selectedDocument.id)
            handleMenuClose()
          }}
        >
          <VisibilityIcon sx={{ mr: 1 }} /> View
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedDocument) handleDownloadDocument(selectedDocument.id, selectedDocument.fileName)
            handleMenuClose()
          }}
        >
          <DownloadIcon sx={{ mr: 1 }} /> Download
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedDocument) handleEditDocument(selectedDocument)
          }}
        >
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ShareIcon sx={{ mr: 1 }} /> Share
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedDocument) handleDeleteDocument(selectedDocument.id)
            handleMenuClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Upload Dialog */}
      <UploadDocumentDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        groupId={groupId as UUID}
        onSuccess={fetchDocuments}
      />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sửa mô tả tài liệu</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Mô tả"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            multiline
            rows={4}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            sx={{
              bgcolor: '#7a9b76',
              '&:hover': { bgcolor: '#6a8b66' },
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* TODO: Add Filter Dialog */}
    </Box>
  )
}

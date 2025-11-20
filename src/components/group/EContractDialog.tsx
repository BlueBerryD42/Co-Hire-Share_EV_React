import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Chip,
  Menu,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
} from '@mui/material'
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  HowToReg as SignIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material'
import { documentApi } from '@/services/group/documents'
import UploadDocumentDialog from './UploadDocumentDialog'
import {
  type DocumentListItemResponse,
  DocumentType,
  SignatureStatus,
  getDocumentTypeName,
  getDocumentTypeColor,
  getSignatureStatusName,
  getSignatureStatusColor,
  formatFileSize,
  getFileIcon,
} from '@/models/document'
import type { UUID } from '@/models/booking'

interface EContractDialogProps {
  open: boolean
  onClose: () => void
  groupId: UUID
}

export default function EContractDialog({ open, onClose, groupId }: EContractDialogProps) {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<DocumentListItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<DocumentListItemResponse | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [editDescription, setEditDescription] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (open && groupId) {
      fetchDocuments()
    }
  }, [open, groupId])

  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await documentApi.getGroupDocuments(groupId, {
        page: 1,
        pageSize: 50,
        sortBy: 'CreatedAt',
        sortDescending: true,
      })
      setDocuments(response?.items || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load documents')
      console.error('Error fetching documents:', err)
      setDocuments([]) // Ensure documents is always an array
    } finally {
      setLoading(false)
    }
  }

  const handleView = (documentId: UUID) => {
    navigate(`/groups/${groupId}/documents/${documentId}`)
    onClose()
  }

  const handleDownload = async (documentId: UUID, fileName: string) => {
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
      setError(err.response?.data?.error || 'Failed to download document')
    }
  }

  const handleDelete = async (documentId: UUID) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return

    try {
      await documentApi.deleteDocument(documentId)
      fetchDocuments()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete document')
    }
  }

  const handleEdit = (document: DocumentListItemResponse) => {
    setSelectedDocument(document)
    setEditDescription(document.description || '')
    setEditDialogOpen(true)
    setAnchorEl(null)
  }

  const handleSaveEdit = async () => {
    if (!selectedDocument) return

    try {
      await documentApi.updateDocument(selectedDocument.id, {
        description: editDescription,
      })
      setEditDialogOpen(false)
      setSelectedDocument(null)
      setEditDescription('')
      fetchDocuments()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update document')
    }
  }

  const handleSign = (documentId: UUID) => {
    navigate(`/groups/${groupId}/documents/${documentId}/sign`)
    onClose()
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, document: DocumentListItemResponse) => {
    setAnchorEl(event.currentTarget)
    setSelectedDocument(document)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedDocument(null)
  }

  const filteredDocuments = (documents || []).filter((doc) =>
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DescriptionIcon sx={{ color: '#7a9b76', fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              E-Contract & Tài liệu
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* Search and Upload */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
            <TextField
              placeholder="Tìm kiếm tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                bgcolor: '#7a9b76',
                '&:hover': { bgcolor: '#6a8b66' },
              }}
            >
              Tải lên
            </Button>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: '#7a9b76' }} />
            </Box>
          )}

          {/* Documents List */}
          {!loading && (
            <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
              {filteredDocuments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <DescriptionIcon sx={{ fontSize: 64, color: '#d4a574', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary">
                    {searchTerm ? 'Không tìm thấy tài liệu' : 'Chưa có tài liệu nào'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchTerm
                      ? 'Thử tìm kiếm với từ khóa khác'
                      : 'Tải lên tài liệu đầu tiên để bắt đầu'}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {filteredDocuments.map((doc) => (
                    <Card
                      key={doc.id}
                      sx={{
                        bgcolor: '#f5ebe0',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                            <Box sx={{ fontSize: '2.5rem' }}>{getFileIcon(doc.fileName)}</Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                {doc.fileName}
                              </Typography>
                              {doc.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {doc.description}
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                <Chip
                                  label={getDocumentTypeName(doc.type)}
                                  size="small"
                                  sx={{
                                    bgcolor: getDocumentTypeColor(doc.type),
                                    color: 'white',
                                  }}
                                />
                                <Chip
                                  label={getSignatureStatusName(doc.signatureStatus)}
                                  size="small"
                                  sx={{
                                    bgcolor: getSignatureStatusColor(doc.signatureStatus),
                                    color: 'white',
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(doc.createdAt).toLocaleDateString('vi-VN')} · {formatFileSize(doc.fileSize)} · Bởi {doc.uploaderName}
                              </Typography>
                              {doc.signatureStatus !== SignatureStatus.Draft && (
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                  Chữ ký: {doc.signedCount}/{doc.signatureCount}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          {/* Action Buttons */}
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                            <Tooltip title="Xem">
                              <IconButton
                                size="small"
                                onClick={() => handleView(doc.id)}
                                sx={{ color: '#7a9b76' }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Tải xuống">
                              <IconButton
                                size="small"
                                onClick={() => handleDownload(doc.id, doc.fileName)}
                                sx={{ color: '#6b9bd1' }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {doc.signatureStatus === SignatureStatus.SentForSigning ||
                            doc.signatureStatus === SignatureStatus.PartiallySigned ? (
                              <Tooltip title="Ký tài liệu">
                                <IconButton
                                  size="small"
                                  onClick={() => handleSign(doc.id)}
                                  sx={{ color: '#d4a574' }}
                                >
                                  <SignIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, doc)}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Đóng
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              bgcolor: '#7a9b76',
              '&:hover': { bgcolor: '#6a8b66' },
            }}
          >
            Tải lên tài liệu mới
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (selectedDocument) handleView(selectedDocument.id)
            handleMenuClose()
          }}
        >
          <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} /> Xem
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedDocument) handleDownload(selectedDocument.id, selectedDocument.fileName)
            handleMenuClose()
          }}
        >
          <DownloadIcon sx={{ mr: 1, fontSize: 20 }} /> Tải xuống
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedDocument) handleEdit(selectedDocument)
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 20 }} /> Sửa mô tả
        </MenuItem>
        {(selectedDocument?.signatureStatus === SignatureStatus.SentForSigning ||
          selectedDocument?.signatureStatus === SignatureStatus.PartiallySigned) && (
          <MenuItem
            onClick={() => {
              if (selectedDocument) handleSign(selectedDocument.id)
              handleMenuClose()
            }}
          >
            <SignIcon sx={{ mr: 1, fontSize: 20 }} /> Ký tài liệu
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            if (selectedDocument) handleDelete(selectedDocument.id)
            handleMenuClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} /> Xóa
        </MenuItem>
      </Menu>

      {/* Upload Dialog */}
      <UploadDocumentDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        groupId={groupId}
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
    </>
  )
}


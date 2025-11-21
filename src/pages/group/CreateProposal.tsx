import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  MenuItem,
  Select,
  Slider,
  Snackbar,
  TextField,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Avatar,
  LinearProgress,
  Divider,
  CircularProgress,
} from '@mui/material'
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Article as PreviewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import type { UUID } from '@/models/booking'
import type { ProposalType } from '@/models/proposal'
import { proposalApi } from '@/services/group/proposals'
import { documentApi } from '@/services/group/documents'
import type { DocumentListItemResponse, DocumentSignatureStatusResponse } from '@/models/document'
import { getSignatureStatusColor, getSignatureStatusName, getDocumentTypeName, getDocumentTypeColor, formatFileSize } from '@/models/document'

const formatDateTimeLocal = (date: Date) => {
  const iso = date.toISOString()
  return iso.slice(0, 16)
}

const getProposalTypeLabel = (type: ProposalType): string => {
  const typeMap: Record<ProposalType, string> = {
    MaintenanceBudget: 'Ngân sách bảo trì',
    VehicleUpgrade: 'Nâng cấp xe',
    VehicleSale: 'Bán xe',
    PolicyChange: 'Thay đổi quy tắc',
    MembershipChange: 'Thành viên',
    Other: 'Khác',
  }
  return typeMap[type] || type
}

const CreateProposal = () => {
  const navigate = useNavigate()
  const { groupId } = useParams<{ groupId: UUID }>()
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'MaintenanceBudget' as ProposalType,
    description: '',
    amount: '',
    votingStartDate: formatDateTimeLocal(new Date()),
    votingEndDate: formatDateTimeLocal(new Date(Date.now() + 72 * 60 * 60 * 1000)),
    requiredMajority: 60,
  })

  // Document assignment state
  const [attachedDocuments, setAttachedDocuments] = useState<UUID[]>([])
  const [availableDocuments, setAvailableDocuments] = useState<DocumentListItemResponse[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)

  // Document detail state (combined preview + signatures)
  const [detailDocId, setDetailDocId] = useState<UUID | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [documentSignatures, setDocumentSignatures] = useState<DocumentSignatureStatusResponse | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [previewError, setPreviewError] = useState(false)

  const isValid = useMemo(() => {
    return form.title.trim().length > 5 && form.description.trim().length > 20
  }, [form.title, form.description])

  // Load documents when component mounts
  useEffect(() => {
    if (groupId) {
      fetchDocuments()
    }
  }, [groupId])

  const fetchDocuments = async () => {
    if (!groupId) return

    setLoadingDocuments(true)
    try {
      console.log('Fetching documents for groupId:', groupId)
      const docs = await documentApi.getGroupDocuments(groupId as UUID, { page: 1, pageSize: 100 })
      console.log('Fetched documents:', docs)
      setAvailableDocuments(docs.items || [])

      if (!docs.items || docs.items.length === 0) {
        console.log('No documents found in this group')
      }
    } catch (err: any) {
      console.error('Error fetching documents:', err)
      console.error('Error details:', err.response?.data || err.message)
      setSnackbar({
        open: true,
        message: `Không thể tải danh sách tài liệu: ${err.response?.data?.error || err.message || 'Lỗi không xác định'}`,
        severity: 'error',
      })
    } finally {
      setLoadingDocuments(false)
    }
  }

  const fetchSignatureStatus = async (documentId: UUID) => {
    try {
      const status = await documentApi.getSignatureStatus(documentId)
      setDocumentSignatures(status)
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 404) {
        // Document not sent for signing yet
        setDocumentSignatures(null)
      }
      console.error('Error fetching signature status:', err)
    }
  }

  const handleChange = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleAttachDocument = (documentId: UUID) => {
    if (!attachedDocuments.includes(documentId)) {
      setAttachedDocuments((prev) => [...prev, documentId])
    }
    setShowDocumentDialog(false)
  }

  const handleRemoveDocument = (documentId: UUID) => {
    setAttachedDocuments((prev) => prev.filter((id) => id !== documentId))
  }

  const handleViewDetail = async (documentId: UUID) => {
    setDetailDocId(documentId)
    setLoadingDetail(true)
    setPreviewError(false)

    // Load both preview and signatures simultaneously
    try {
      const [blob] = await Promise.all([
        documentApi.previewDocument(documentId),
        fetchSignatureStatus(documentId)
      ])
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (err: any) {
      console.error('Error loading document detail:', err)
      setPreviewError(true)
      // Still try to load signatures even if preview fails
      await fetchSignatureStatus(documentId)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleCloseDetail = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setDetailDocId(null)
    setPreviewUrl(null)
    setPreviewError(false)
    setDocumentSignatures(null)
  }

  const handleSubmit = async () => {
    if (!groupId || !isValid) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin',
        severity: 'error',
      })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        groupId,
        title: form.title,
        description: form.description,
        type: form.type,
        amount: form.amount ? Number(form.amount) : undefined,
        votingStartDate: new Date(form.votingStartDate).toISOString(),
        votingEndDate: new Date(form.votingEndDate).toISOString(),
        requiredMajority: form.requiredMajority / 100,
      }
      const created = await proposalApi.create(payload)
      setSnackbar({ open: true, message: 'Đã tạo đề xuất', severity: 'success' })
      navigate(`/groups/${groupId}/proposals/${created.id}`)
    } catch (submitError) {
      setSnackbar({
        open: true,
        message: submitError instanceof Error ? submitError.message : 'Không thể tạo đề xuất',
        severity: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold text-neutral-900">Tạo đề xuất mới</h1>
        <p className="text-neutral-600">
          Cung cấp thông tin rõ ràng để các thành viên bỏ phiếu minh bạch.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6">
          <TextField
            label="Tiêu đề"
            value={form.title}
            onChange={(event) => handleChange('title', event.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />
          <Select
            label="Loại đề xuất"
            value={form.type}
            onChange={(event) => handleChange('type', event.target.value as ProposalType)}
            fullWidth
            sx={{ mb: 3 }}
          >
            <MenuItem value="MaintenanceBudget">Ngân sách bảo trì</MenuItem>
            <MenuItem value="VehicleUpgrade">Nâng cấp xe</MenuItem>
            <MenuItem value="VehicleSale">Bán xe</MenuItem>
            <MenuItem value="PolicyChange">Thay đổi quy tắc</MenuItem>
            <MenuItem value="MembershipChange">Thành viên</MenuItem>
            <MenuItem value="Other">Khác</MenuItem>
          </Select>
          <TextField
            label="Mô tả chi tiết"
            value={form.description}
            multiline
            minRows={4}
            onChange={(event) => handleChange('description', event.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />
          <TextField
            label="Giá trị ước tính (VND)"
            type="number"
            value={form.amount}
            onChange={(event) => handleChange('amount', event.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />
          <TextField
            label="Bắt đầu bỏ phiếu"
            type="datetime-local"
            value={form.votingStartDate}
            onChange={(event) => handleChange('votingStartDate', event.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />
          <TextField
            label="Kết thúc bỏ phiếu"
            type="datetime-local"
            value={form.votingEndDate}
            onChange={(event) => handleChange('votingEndDate', event.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />
          <div className="mb-6">
            <p className="text-sm font-semibold text-neutral-800">
              Ngưỡng chấp nhận ({form.requiredMajority}%)
            </p>
            <Slider
              value={form.requiredMajority}
              min={50}
              max={90}
              step={5}
              onChange={(_, value) => handleChange('requiredMajority', value as number)}
            />
          </div>

          {/* Document Assignment Section */}
          <Card sx={{ mb: 3, bgcolor: '#f5ebe0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tài liệu đính kèm
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setShowDocumentDialog(true)}
                  sx={{ borderColor: '#7a9b76', color: '#7a9b76' }}
                >
                  Thêm tài liệu
                </Button>
              </Box>

              {attachedDocuments.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    px: 2,
                    border: '2px dashed #d0d0d0',
                    borderRadius: 2,
                    bgcolor: 'white',
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 48, color: '#d0d0d0', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Chưa có tài liệu nào được đính kèm
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Nhấn "Thêm tài liệu" để chọn tài liệu từ nhóm
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {attachedDocuments.map((docId) => {
                    const doc = availableDocuments.find((d) => d.id === docId)
                    if (!doc) return null
                    return (
                      <Box
                        key={docId}
                        sx={{
                          bgcolor: 'white',
                          borderRadius: 2,
                          mb: 1.5,
                          border: '2px solid #e0e0e0',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#7a9b76',
                            boxShadow: '0 2px 8px rgba(122, 155, 118, 0.15)',
                          },
                        }}
                      >
                        <ListItem
                          sx={{
                            p: 2,
                            alignItems: 'flex-start',
                          }}
                        >
                          <ListItemIcon sx={{ mt: 0.5, minWidth: 48 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                bgcolor: '#f5ebe0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <DescriptionIcon sx={{ color: '#7a9b76', fontSize: 28 }} />
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
                                  {doc.fileName}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  <Chip
                                    label={getDocumentTypeName(doc.type)}
                                    size="small"
                                    sx={{
                                      bgcolor: getDocumentTypeColor(doc.type),
                                      color: 'white',
                                      fontSize: '0.7rem',
                                      height: 22,
                                      fontWeight: 600,
                                    }}
                                  />
                                  <Chip
                                    label={getSignatureStatusName(doc.signatureStatus)}
                                    size="small"
                                    sx={{
                                      bgcolor: getSignatureStatusColor(doc.signatureStatus),
                                      color: 'white',
                                      fontSize: '0.7rem',
                                      height: 22,
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                  📄 {formatFileSize(doc.fileSize)} • Due Date: {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                                </Typography>
                                {doc.description && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    sx={{
                                      mt: 0.5,
                                      p: 1,
                                      bgcolor: '#f8f9fa',
                                      borderRadius: 1,
                                      fontStyle: 'italic',
                                    }}
                                  >
                                    "{doc.description.length > 80 ? `${doc.description.substring(0, 80)}...` : doc.description}"
                                  </Typography>
                                )}
                                {doc.uploaderName && (
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                   {doc.uploaderName}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 1.5, bgcolor: '#fafafa' }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDetail(docId)}
                            sx={{
                              bgcolor: '#7a9b76',
                              '&:hover': { bgcolor: '#6a8b66' },
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              boxShadow: 1,
                            }}
                          >
                            Chi tiết
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CloseIcon />}
                            onClick={() => handleRemoveDocument(docId)}
                            title="Xóa khỏi đề xuất"
                            sx={{
                              borderColor: '#b87d6f',
                              color: '#b87d6f',
                              '&:hover': {
                                borderColor: '#a86d5f',
                                bgcolor: '#fef5f3',
                              },
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            Xóa
                          </Button>
                        </Box>
                      </Box>
                    )
                  })}
                </List>
              )}
            </CardContent>
          </Card>

          <Button
            variant="contained"
            fullWidth
            disabled={!isValid || submitting}
            onClick={() => handleSubmit()}
            sx={{ mt: 2 }}
          >
            {submitting ? 'Đang gửi...' : 'Gửi đề xuất'}
          </Button>
        </div>

        <div className="space-y-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-2xl font-semibold text-neutral-900">Xem trước</h2>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-500">Tiêu đề</p>
            <p className="text-lg font-semibold text-neutral-900">
              {form.title || 'Chưa nhập tiêu đề'}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-500">Loại · Ngưỡng</p>
            <p className="text-lg font-semibold text-neutral-900">
              {getProposalTypeLabel(form.type)} · {form.requiredMajority}%
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-500">Mô tả</p>
            <p className="text-sm text-neutral-700">
              {form.description || 'Mô tả sẽ xuất hiện tại đây.'}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            Bỏ phiếu từ {new Date(form.votingStartDate).toLocaleString('vi-VN')} đến{' '}
            {new Date(form.votingEndDate).toLocaleString('vi-VN')}
          </div>
          <Alert severity="info">
            Các file đính kèm và checklist ký số sẽ được thêm ở giai đoạn kết nối Document service.
          </Alert>
        </div>
      </section>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Document Selection Dialog */}
      <Dialog
        open={showDocumentDialog}
        onClose={() => setShowDocumentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" component="span">
              Chọn tài liệu đính kèm
            </Typography>
            {!loadingDocuments && availableDocuments.length > 0 && (
              <Typography variant="caption" color="text.secondary" display="block">
                {availableDocuments.length} tài liệu có sẵn
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={fetchDocuments}
            disabled={loadingDocuments}
            title="Làm mới danh sách"
            size="small"
          >
            <RefreshIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loadingDocuments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Đang tải...</Typography>
            </Box>
          ) : availableDocuments.length === 0 ? (
            <Alert severity="info">Chưa có tài liệu nào trong nhóm này.</Alert>
          ) : (
            <List>
              {availableDocuments.map((doc) => (
                <ListItemButton
                  key={doc.id}
                  onClick={() => handleAttachDocument(doc.id)}
                  disabled={attachedDocuments.includes(doc.id)}
                  sx={{
                    bgcolor: attachedDocuments.includes(doc.id) ? '#f0f0f0' : 'white',
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      bgcolor: attachedDocuments.includes(doc.id) ? '#f0f0f0' : '#f5ebe0',
                    },
                  }}
                >
                  <ListItemIcon>
                    <DescriptionIcon sx={{ fontSize: 32, color: '#7a9b76' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {doc.fileName}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 0.5 }}>
                          <Chip
                            label={getDocumentTypeName(doc.type)}
                            size="small"
                            sx={{
                              bgcolor: getDocumentTypeColor(doc.type),
                              color: 'white',
                              fontSize: '0.7rem',
                            }}
                          />
                          <Chip
                            label={getSignatureStatusName(doc.signatureStatus)}
                            size="small"
                            sx={{
                              bgcolor: getSignatureStatusColor(doc.signatureStatus),
                              color: 'white',
                              fontSize: '0.7rem',
                            }}
                          />
                          {attachedDocuments.includes(doc.id) && (
                            <Chip label="✓ Đã chọn" size="small" sx={{ bgcolor: '#7a9b76', color: 'white', fontSize: '0.7rem' }} />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatFileSize(doc.fileSize)} • Tải lên: {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                        </Typography>
                        {doc.description && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {doc.description.length > 80 ? `${doc.description.substring(0, 80)}...` : doc.description}
                          </Typography>
                        )}
                        {doc.uploaderName && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                            Người tải: {doc.uploaderName}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDocumentDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Unified Document Detail Dialog */}
      <Dialog
        open={detailDocId !== null}
        onClose={handleCloseDetail}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
          <Box>
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
              Chi tiết tài liệu
            </Typography>
            {detailDocId && (() => {
              const doc = availableDocuments.find((d) => d.id === detailDocId)
              return doc ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {doc.fileName}
                </Typography>
              ) : null
            })()}
          </Box>
          <IconButton onClick={handleCloseDetail} disabled={loadingDetail}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          {loadingDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress sx={{ color: '#7a9b76' }} />
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, height: '100%' }}>
              {/* PDF Preview Section */}
              <Box sx={{ borderRight: { lg: '1px solid #e0e0e0' }, overflow: 'auto', bgcolor: '#f5f5f5', p: 2 }}>
                {previewError ? (
                  <Box sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Không thể tải xem trước tài liệu
                    </Alert>
                    <Typography variant="body2" color="text.secondary">
                      Có lỗi xảy ra khi tải tài liệu. Vui lòng thử lại.
                    </Typography>
                  </Box>
                ) : previewUrl ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      bgcolor: 'white',
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: 1,
                    }}
                  >
                    <iframe
                      src={previewUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                      title="Xem trước tài liệu"
                    />
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <PreviewIcon sx={{ fontSize: 80, color: '#d0d0d0', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Xem trước không khả dụng
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Signature Status Section */}
              <Box sx={{ overflow: 'auto', bgcolor: '#fafafa', p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#7a9b76' }}>
                  Trạng thái ký
                </Typography>

                {!documentSignatures ? (
                  <Alert severity="info">
                    Tài liệu này chưa được gửi để ký. Không có thông tin chữ ký.
                  </Alert>
                ) : (
                  <Box>
                    {/* Progress Bar */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Tiến độ ký
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {Math.round(documentSignatures.progressPercentage)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={documentSignatures.progressPercentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#7a9b76',
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {documentSignatures.signedCount} / {documentSignatures.totalSigners} người đã ký
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Signature List */}
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                      Danh sách người ký
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {documentSignatures.signatures.map((sig) => (
                        <ListItem
                          key={sig.id}
                          sx={{
                            bgcolor: sig.isPending ? '#fff8f0' : '#f0f8f0',
                            borderRadius: 2,
                            mb: 1,
                            border: '1px solid',
                            borderColor: sig.isPending ? '#d4a574' : '#7a9b76',
                            p: 1.5,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 42 }}>
                            <Avatar sx={{ bgcolor: sig.isPending ? '#d4a574' : '#7a9b76', width: 36, height: 36 }}>
                              {sig.isPending ? <PendingIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight={600}>
                                {sig.signerName}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {sig.signerEmail}
                                </Typography>
                                {sig.signedAt && (
                                  <Typography variant="caption" display="block" sx={{ color: '#7a9b76', mt: 0.5, fontWeight: 600 }}>
                                    ✓ Đã ký: {new Date(sig.signedAt).toLocaleDateString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <Chip
                            label={sig.isPending ? 'Chờ ký' : 'Đã ký'}
                            size="small"
                            sx={{
                              bgcolor: sig.isPending ? '#d4a574' : '#7a9b76',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    {documentSignatures.dueDate && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="caption">
                          Hạn ký: {new Date(documentSignatures.dueDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
          <Button onClick={handleCloseDetail} sx={{ color: '#7a9b76', fontWeight: 600 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  )
}

export default CreateProposal


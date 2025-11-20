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
  const [selectedDocForSignatures, setSelectedDocForSignatures] = useState<UUID | null>(null)
  const [documentSignatures, setDocumentSignatures] = useState<DocumentSignatureStatusResponse | null>(null)
  const [loadingSignatures, setLoadingSignatures] = useState(false)

  // Document preview state
  const [previewDocId, setPreviewDocId] = useState<UUID | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
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
      const docs = await documentApi.getGroupDocuments(groupId as UUID, { page: 1, pageSize: 100 })
      setAvailableDocuments(docs.items || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setLoadingDocuments(false)
    }
  }

  const fetchSignatureStatus = async (documentId: UUID) => {
    setLoadingSignatures(true)
    try {
      const status = await documentApi.getSignatureStatus(documentId)
      setDocumentSignatures(status)
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 404) {
        // Document not sent for signing yet
        setDocumentSignatures(null)
      }
      console.error('Error fetching signature status:', err)
    } finally {
      setLoadingSignatures(false)
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

  const handleViewSignatures = async (documentId: UUID) => {
    setSelectedDocForSignatures(documentId)
    await fetchSignatureStatus(documentId)
  }

  const handleCloseSignatures = () => {
    setSelectedDocForSignatures(null)
    setDocumentSignatures(null)
  }

  const handlePreviewDocument = async (documentId: UUID) => {
    setPreviewDocId(documentId)
    setLoadingPreview(true)
    setPreviewError(false)

    try {
      const blob = await documentApi.previewDocument(documentId)
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (err: any) {
      console.error('Error loading preview:', err)
      setPreviewError(true)
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewDocId(null)
    setPreviewUrl(null)
    setPreviewError(false)
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
                <Alert severity="info">
                  Chưa có tài liệu nào được đính kèm. Nhấn "Thêm tài liệu" để chọn.
                </Alert>
              ) : (
                <List>
                  {attachedDocuments.map((docId) => {
                    const doc = availableDocuments.find((d) => d.id === docId)
                    if (!doc) return null
                    return (
                      <ListItem
                        key={docId}
                        sx={{
                          bgcolor: 'white',
                          borderRadius: 1,
                          mb: 1,
                          border: '1px solid #e0e0e0',
                        }}
                        secondaryAction={
                          <Box>
                            <IconButton
                              edge="end"
                              onClick={() => handlePreviewDocument(docId)}
                              sx={{ mr: 1 }}
                              title="Xem nội dung tài liệu"
                            >
                              <PreviewIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleViewSignatures(docId)}
                              sx={{ mr: 1 }}
                              title="Xem trạng thái ký"
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveDocument(docId)}
                              title="Xóa khỏi đề xuất"
                            >
                              <CloseIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemIcon>
                          <DescriptionIcon sx={{ color: '#7a9b76', fontSize: 32 }} />
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
                              </Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                              </Typography>
                              {doc.description && (
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                  {doc.description.length > 60 ? `${doc.description.substring(0, 60)}...` : doc.description}
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
                      </ListItem>
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
        <DialogTitle>Chọn tài liệu đính kèm</DialogTitle>
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

      {/* Signature Status Dialog */}
      <Dialog
        open={selectedDocForSignatures !== null}
        onClose={handleCloseSignatures}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Trạng thái ký tài liệu
          {selectedDocForSignatures && (() => {
            const doc = availableDocuments.find((d) => d.id === selectedDocForSignatures)
            return doc ? ` - ${doc.fileName}` : ''
          })()}
        </DialogTitle>
        <DialogContent>
          {loadingSignatures ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Đang tải...</Typography>
            </Box>
          ) : !documentSignatures ? (
            <Alert severity="info">
              Tài liệu này chưa được gửi để ký. Không có thông tin chữ ký.
            </Alert>
          ) : (
            <Box>
              {/* Progress Bar */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {documentSignatures.signedCount} / {documentSignatures.totalSigners} đã ký
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
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
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Signature List */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Danh sách người ký
              </Typography>
              <List>
                {documentSignatures.signatures.map((sig) => (
                  <ListItem
                    key={sig.id}
                    sx={{
                      bgcolor: sig.isPending ? '#fff8f0' : '#f0f8f0',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: sig.isPending ? '#d4a574' : '#7a9b76' }}>
                        {sig.isPending ? <PendingIcon /> : <CheckCircleIcon />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={sig.signerName}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {sig.signerEmail}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Thứ tự: {sig.signatureOrder}
                          </Typography>
                          {sig.signedAt && (
                            <Typography variant="caption" display="block" color="success.main">
                              Đã ký: {new Date(sig.signedAt).toLocaleString('vi-VN')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Chip
                      label={sig.isPending ? 'Chờ ký' : 'Đã ký'}
                      size="small"
                      color={sig.isPending ? 'warning' : 'success'}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSignatures}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog
        open={previewDocId !== null}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Xem trước tài liệu
          {previewDocId && (() => {
            const doc = availableDocuments.find((d) => d.id === previewDocId)
            return doc ? ` - ${doc.fileName}` : ''
          })()}
        </DialogTitle>
        <DialogContent>
          {loadingPreview ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress sx={{ color: '#7a9b76' }} />
            </Box>
          ) : previewError ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                Không thể tải xem trước tài liệu
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Có lỗi xảy ra khi tải tài liệu. Vui lòng thử lại hoặc tải xuống tài liệu để xem.
              </Typography>
            </Box>
          ) : previewUrl ? (
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
                title="Xem trước tài liệu"
              />
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview} sx={{ color: '#7a9b76' }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  )
}

export default CreateProposal


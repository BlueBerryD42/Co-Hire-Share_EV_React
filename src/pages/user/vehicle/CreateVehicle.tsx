import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Alert,
  Button,
  MenuItem,
  Snackbar,
  TextField,
  Box,
  Chip,
  IconButton,
  Typography,
} from '@mui/material'
import { Car, Upload, X, FileText, Eye, Download, CheckCircle, AlertCircle } from 'lucide-react'
import vehicleService from '@/services/vehicleService'
import { groupApi } from '@/services/group/groups'
import UploadVehicleDocumentDialog from '@/components/vehicle/UploadVehicleDocumentDialog'
import vehicleDocumentService from '@/services/vehicle/vehicleDocuments'
import { useAppSelector } from '@/store/hooks'
import { useRole } from '@/hooks/useRole'
import type { CreateVehicleDto } from '@/models/vehicle'
import type { GroupDto } from '@/models/group'
import type { UUID } from '@/models/booking'
import type { DocumentListItemResponse } from '@/models/document'

/**
 * CreateVehicle Page - Tạo xe mới cho nhóm
 */
const CreateVehicle = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedGroupId = searchParams.get('groupId')
  const { user } = useAppSelector((state) => state.auth)
  const { isStaffOrAdmin } = useRole()

  const [groups, setGroups] = useState<GroupDto[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const [formData, setFormData] = useState<CreateVehicleDto>({
    vin: '',
    plateNumber: '',
    model: '',
    year: new Date().getFullYear(),
    color: undefined,
    odometer: 0,
    groupId: preselectedGroupId || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Document upload state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ id: UUID; fileName: string; type: string }>>([])
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [previewingDocumentId, setPreviewingDocumentId] = useState<UUID | null>(null)

  // Fetch user's groups
  useEffect(() => {
    if (user?.id) {
      fetchUserGroups()
    }
  }, [user?.id, isStaffOrAdmin])

  const fetchUserGroups = async () => {
    try {
      setLoadingGroups(true)
      const userGroups = await groupApi.getUserGroups()
      
      // Staff/Admin can add vehicles to any active/pending group
      // Regular users can only add vehicles to groups where they are Admin
      // Note: Allow PendingApproval groups - admins can add vehicles while waiting for approval
      let eligibleGroups: GroupDto[]
      if (isStaffOrAdmin) {
        // Staff/Admin can add to any active or pending group (not rejected/dissolved)
        eligibleGroups = userGroups.filter(
          (g) => g.status === 'Active' || g.status === 'Inactive' || g.status === 'PendingApproval'
        )
      } else {
        // Regular users: only groups where they are Admin (including pending)
        eligibleGroups = userGroups.filter((g) => {
          // Exclude rejected/dissolved groups
          if (g.status === 'Rejected' || g.status === 'Dissolved') return false
          
          // Check if current user is Admin in this group
          const userMembership = g.members.find((m) => m.userId === user?.id)
          return userMembership?.roleInGroup === 'Admin'
        })
      }
      
      setGroups(eligibleGroups)

      // If there's only one eligible group, auto-select it
      if (eligibleGroups.length === 1 && !formData.groupId) {
        setFormData((prev) => ({ ...prev, groupId: eligibleGroups[0].id }))
      }
      
      // If preselected group is not in eligible groups, clear it
      if (preselectedGroupId && !eligibleGroups.some(g => g.id === preselectedGroupId)) {
        setFormData((prev) => ({ ...prev, groupId: '' }))
        setSnackbar({
          open: true,
          severity: 'warning',
          message: 'Bạn không có quyền thêm xe vào nhóm này. Chỉ quản trị viên nhóm mới có thể thêm xe.',
        })
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Không thể tải danh sách nhóm',
      })
    } finally {
      setLoadingGroups(false)
    }
  }

  const validateVietnamesePlateNumber = (plateNumber: string): boolean => {
    // Remove all spaces and dashes for validation
    const cleaned = plateNumber.replace(/[\s\-\.]/g, '')

    // Format 1: Standard plates - 2 digits + 1 letter + 4-5 digits
    // Examples: 30A12345, 51B12345, 29C123456
    const standardFormat = /^[0-9]{2}[A-Z]{1}[0-9]{4,5}$/

    // Format 2: Diplomatic/Official plates
    // Examples: NG001, CV123, HC123, QT123, NN001
    const diplomaticFormat = /^(NG|CV|HC|QT|NN)[0-9]{3,4}$/

    // Format 3: Army/Police plates
    // Examples: QD123456, CA123456, TM123456
    const militaryFormat = /^(QD|CA|TM|TC|BT)[0-9]{4,6}$/

    return standardFormat.test(cleaned) ||
           diplomaticFormat.test(cleaned) ||
           militaryFormat.test(cleaned)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.vin || formData.vin.trim().length === 0) {
      newErrors.vin = 'Vui lòng nhập số VIN'
    } else if (formData.vin.length !== 17) {
      newErrors.vin = 'Số VIN phải có 17 ký tự'
    }

    if (!formData.plateNumber || formData.plateNumber.trim().length === 0) {
      newErrors.plateNumber = 'Vui lòng nhập biển số xe'
    } else if (!validateVietnamesePlateNumber(formData.plateNumber)) {
      newErrors.plateNumber = 'Biển số xe không đúng định dạng Việt Nam (VD: 30A-12345, 51B-123.45)'
    }

    if (!formData.model || formData.model.trim().length === 0) {
      newErrors.model = 'Vui lòng nhập model xe'
    }

    if (formData.year < 1900 || formData.year > 2030) {
      newErrors.year = 'Năm sản xuất không hợp lệ'
    }

    if (formData.odometer < 0) {
      newErrors.odometer = 'Số km không được âm'
    }

    if (!formData.groupId) {
      newErrors.groupId = 'Vui lòng chọn nhóm'
    }

    // Require registration document (paperwork)
    const hasRegistration = uploadedDocuments.some((doc) => doc.type === 'Registration')
    if (!hasRegistration) {
      newErrors.documents = 'Vui lòng tải lên ít nhất một giấy đăng ký xe (bắt buộc)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDocumentUploadSuccess = (documentId: UUID, documentType: string, fileName: string) => {
    setUploadedDocuments((prev) => [
      ...prev,
      {
        id: documentId,
        fileName: fileName,
        type: documentType,
      },
    ])
    setSnackbar({
      open: true,
      severity: 'success',
      message: 'Đã tải lên tài liệu thành công',
    })
  }

  const handleRemoveDocument = (documentId: UUID) => {
    setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
    // Clear document error if removing a document
    if (errors.documents) {
      setErrors((prev) => ({ ...prev, documents: '' }))
    }
  }

  const handlePreviewDocument = async (documentId: UUID) => {
    if (!formData.groupId) return
    
    try {
      setPreviewingDocumentId(documentId)
      const blob = await vehicleDocumentService.previewVehicleDocument(documentId)
      const url = window.URL.createObjectURL(blob)
      const doc = uploadedDocuments.find(d => d.id === documentId)
      const fileExtension = doc?.fileName.split('.').pop()?.toLowerCase()
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')
      const isPDF = fileExtension === 'pdf'

      if (isImage || isPDF) {
        const newWindow = window.open(url, '_blank')
        if (!newWindow) {
          // Popup blocked, download instead
          const a = document.createElement('a')
          a.href = url
          a.download = doc?.fileName || 'document'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        } else {
          setTimeout(() => window.URL.revokeObjectURL(url), 1000)
        }
      } else {
        // Download for other file types
        const a = document.createElement('a')
        a.href = url
        a.download = doc?.fileName || 'document'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error: any) {
      console.error('Error previewing document:', error)
      setSnackbar({
        open: true,
        severity: 'error',
        message: error?.response?.data?.message || 'Không thể xem tài liệu',
      })
    } finally {
      setPreviewingDocumentId(null)
    }
  }

  const handleDownloadDocument = async (documentId: UUID) => {
    try {
      const blob = await vehicleDocumentService.downloadVehicleDocument(documentId)
      const url = window.URL.createObjectURL(blob)
      const doc = uploadedDocuments.find(d => d.id === documentId)
      const a = document.createElement('a')
      a.href = url
      a.download = doc?.fileName || 'document'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setSnackbar({
        open: true,
        severity: 'success',
        message: 'Đã tải xuống tài liệu',
      })
    } catch (error: any) {
      console.error('Error downloading document:', error)
      setSnackbar({
        open: true,
        severity: 'error',
        message: error?.response?.data?.message || 'Không thể tải xuống tài liệu',
      })
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
        return 'Khác'
    }
  }

  // Check if required documents are present
  const hasRequiredDocuments = uploadedDocuments.some((doc) => doc.type === 'Registration')

  const handleChange = (field: keyof CreateVehicleDto, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Vui lòng kiểm tra lại thông tin',
      })
      return
    }

    setSubmitting(true)
    try {
      // Prepare data - convert empty strings to undefined for optional fields
      const payload: CreateVehicleDto = {
        vin: formData.vin.trim(),
        plateNumber: formData.plateNumber.trim(),
        model: formData.model.trim(),
        year: formData.year,
        color: formData.color?.trim() || undefined,
        odometer: formData.odometer,
        groupId: formData.groupId,
      }

      const created = await vehicleService.createVehicle(payload)
      setSnackbar({
        open: true,
        message: 'Đã gửi yêu cầu tạo xe. Xe của bạn đang chờ phê duyệt từ nhân viên.',
        severity: 'success',
      })

      // Navigate to vehicle detail page after 1 second
      setTimeout(() => {
        navigate(`/vehicles/${created.id}`)
      }, 1000)
    } catch (submitError: any) {
      console.error('Error creating vehicle:', submitError)
      const errorMessage = submitError?.response?.data?.message ||
                          submitError?.message ||
                          'Không thể tạo xe'
      setSnackbar({
        open: true,
        severity: 'error',
        message: errorMessage,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-neutral-900 flex items-center gap-3">
            <Car className="w-10 h-10 text-primary" />
            Thêm xe mới
          </h1>
          <p className="text-neutral-600 mt-2">
            Thêm xe vào nhóm để các thành viên có thể đặt lịch sử dụng
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-card space-y-8">
            {/* Group Selection */}
            <TextField
              label="Nhóm"
              select
              value={formData.groupId}
              onChange={(e) => handleChange('groupId', e.target.value)}
              fullWidth
              required
              disabled={loadingGroups || groups.length === 0}
              error={!!errors.groupId}
              helperText={
                errors.groupId ||
                (groups.length === 0 && !loadingGroups && !isStaffOrAdmin
                  ? 'Bạn không có quyền thêm xe vào nhóm nào. Chỉ quản trị viên nhóm mới có thể thêm xe.'
                  : groups.length === 0 && !loadingGroups && isStaffOrAdmin
                    ? 'Không có nhóm nào đang hoạt động.'
                    : !isStaffOrAdmin
                      ? 'Chỉ hiển thị các nhóm mà bạn là quản trị viên'
                      : '')
              }
              sx={{ mb: 2 }}
            >
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </TextField>
            
            {/* Info Alert for non-admin users */}
            {!isStaffOrAdmin && groups.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Chỉ quản trị viên nhóm mới có thể thêm xe vào nhóm. Bạn chỉ thấy các nhóm mà bạn là quản trị viên.
              </Alert>
            )}

            {/* VIN */}
            <TextField
              label="Số VIN (Vehicle Identification Number)"
              value={formData.vin}
              onChange={(e) => handleChange('vin', e.target.value.toUpperCase())}
              fullWidth
              required
              inputProps={{ maxLength: 17 }}
              error={!!errors.vin}
              helperText={errors.vin || `${formData.vin.length}/17 ký tự`}
              placeholder="VD: 1HGBH41JXMN109186"
              sx={{ mb: 2 }}
            />

            {/* Plate Number */}
            <TextField
              label="Biển số xe"
              value={formData.plateNumber}
              onChange={(e) => handleChange('plateNumber', e.target.value.toUpperCase())}
              fullWidth
              required
              inputProps={{ maxLength: 20 }}
              error={!!errors.plateNumber}
              helperText={
                errors.plateNumber ||
                'Định dạng: 30A-12345, 51B-123.45 (xe dân dụng), NG-001 (ngoại giao), QD-12345 (quân đội)'
              }
              placeholder="VD: 30A-12345 hoặc 51B-123.45"
              sx={{ mb: 2 }}
            />

            {/* Model */}
            <TextField
              label="Model xe"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: 100 }}
              error={!!errors.model}
              helperText={errors.model}
              placeholder="VD: Tesla Model 3, VinFast VF8"
              sx={{ mb: 2 }}
            />

            {/* Year & Color */}
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Năm sản xuất"
                type="number"
                value={formData.year}
                onChange={(e) => handleChange('year', parseInt(e.target.value))}
                fullWidth
                required
                error={!!errors.year}
                helperText={errors.year}
                inputProps={{ min: 1900, max: 2030 }}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Màu sắc"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                fullWidth
                placeholder="VD: Trắng, Đen, Xanh"
                sx={{ mb: 2 }}
              />
            </div>

            {/* Odometer */}
            <TextField
              label="Số km đã đi"
              type="number"
              value={formData.odometer}
              onChange={(e) => handleChange('odometer', parseInt(e.target.value))}
              fullWidth
              required
              error={!!errors.odometer}
              helperText={errors.odometer || 'Nhập số km hiện tại của xe'}
              inputProps={{ min: 0 }}
              sx={{ mb: 2 }}
            />

            {/* Document Upload Section */}
            <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid #e5e7eb' }}>
              <div className="flex items-center justify-between mb-2">
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tài liệu xe
                </Typography>
                {hasRequiredDocuments && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                      Đã có giấy đăng ký xe
                    </Typography>
                  </div>
                )}
              </div>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Vui lòng tải lên giấy đăng ký xe (bắt buộc) và các tài liệu khác nếu có
              </Typography>

              {/* Required Documents Status */}
              {!hasRequiredDocuments && (
                <Alert severity="warning" icon={<AlertCircle />} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Thiếu tài liệu bắt buộc:</strong> Vui lòng tải lên ít nhất một giấy đăng ký xe trước khi tạo xe.
                  </Typography>
                </Alert>
              )}

              {/* Uploaded Documents Preview */}
              {uploadedDocuments.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Tài liệu đã tải lên ({uploadedDocuments.length})
                  </Typography>
                  <div className="space-y-2">
                    {uploadedDocuments.map((doc) => {
                      const isRequired = doc.type === 'Registration'
                      return (
                        <Box
                          key={doc.id}
                          sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: isRequired ? 'primary.main' : '#e5e7eb',
                            borderRadius: 2,
                            bgcolor: isRequired ? 'primary.50' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {doc.fileName}
                              </Typography>
                              <div className="flex items-center gap-2 mt-1">
                                <Chip
                                  label={getDocumentTypeLabel(doc.type)}
                                  size="small"
                                  color={isRequired ? 'primary' : 'default'}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                {isRequired && (
                                  <Chip
                                    label="Bắt buộc"
                                    size="small"
                                    color="success"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <IconButton
                              size="small"
                              onClick={() => handlePreviewDocument(doc.id)}
                              disabled={previewingDocumentId === doc.id}
                              title="Xem tài liệu"
                            >
                              <Eye className="w-4 h-4" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadDocument(doc.id)}
                              title="Tải xuống"
                            >
                              <Download className="w-4 h-4" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveDocument(doc.id)}
                              color="error"
                              title="Xóa"
                            >
                              <X className="w-4 h-4" />
                            </IconButton>
                          </div>
                        </Box>
                      )
                    })}
                  </div>
                </Box>
              )}

              {/* Upload Button */}
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => {
                  if (!formData.groupId) {
                    setSnackbar({
                      open: true,
                      severity: 'error',
                      message: 'Vui lòng chọn nhóm trước khi tải lên tài liệu',
                    })
                    return
                  }
                  setUploadDialogOpen(true)
                }}
                disabled={!formData.groupId}
                sx={{ mb: 1 }}
              >
                Tải lên tài liệu
              </Button>

              {errors.documents && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                  {errors.documents}
                </Typography>
              )}
            </Box>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <Button variant="outlined" onClick={() => navigate('/vehicles')}>
              Hủy
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={submitting || loadingGroups || groups.length === 0 || !hasRequiredDocuments}
              title={!hasRequiredDocuments ? 'Vui lòng tải lên giấy đăng ký xe trước khi tạo xe' : ''}
            >
              {submitting ? 'Đang tạo...' : 'Tạo xe'}
            </Button>
          </div>
        </form>

        {/* Document Upload Dialog */}
        {formData.groupId && (
          <UploadVehicleDocumentDialog
            open={uploadDialogOpen}
            onClose={() => setUploadDialogOpen(false)}
            groupId={formData.groupId}
            onSuccess={handleDocumentUploadSuccess}
          />
        )}

        {/* Snackbar */}
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
      </div>
    </div>
  )
}

export default CreateVehicle

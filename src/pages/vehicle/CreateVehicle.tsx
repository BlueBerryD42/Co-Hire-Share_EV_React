import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Alert,
  Button,
  MenuItem,
  Snackbar,
  TextField,
} from '@mui/material'
import { Car } from 'lucide-react'
import vehicleService from '@/services/vehicleService'
import { groupApi } from '@/services/group/groups'
import type { CreateVehicleDto } from '@/models/vehicle'
import type { GroupDto } from '@/models/group'

/**
 * CreateVehicle Page - Tạo xe mới cho nhóm
 */
const CreateVehicle = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedGroupId = searchParams.get('groupId')

  const [groups, setGroups] = useState<GroupDto[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
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

  // Fetch user's groups
  useEffect(() => {
    fetchUserGroups()
  }, [])

  const fetchUserGroups = async () => {
    try {
      setLoadingGroups(true)
      const userGroups = await groupApi.getUserGroups()
      setGroups(userGroups)

      // If there's only one group, auto-select it
      if (userGroups.length === 1 && !formData.groupId) {
        setFormData((prev) => ({ ...prev, groupId: userGroups[0].id }))
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.vin || formData.vin.trim().length === 0) {
      newErrors.vin = 'Vui lòng nhập số VIN'
    } else if (formData.vin.length !== 17) {
      newErrors.vin = 'Số VIN phải có 17 ký tự'
    }

    if (!formData.plateNumber || formData.plateNumber.trim().length === 0) {
      newErrors.plateNumber = 'Vui lòng nhập biển số xe'
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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
        message: 'Đã tạo xe thành công',
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
          <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-card space-y-6">
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
                (groups.length === 0 && !loadingGroups
                  ? 'Bạn chưa tham gia nhóm nào. Vui lòng tạo hoặc tham gia nhóm trước.'
                  : '')
              }
            >
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </TextField>

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
              helperText={errors.plateNumber}
              placeholder="VD: 30A-12345"
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
              />

              <TextField
                label="Màu sắc"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                fullWidth
                placeholder="VD: Trắng, Đen, Xanh"
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
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <Button variant="outlined" onClick={() => navigate('/vehicles')}>
              Hủy
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={submitting || loadingGroups || groups.length === 0}
            >
              {submitting ? 'Đang tạo...' : 'Tạo xe'}
            </Button>
          </div>
        </form>

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

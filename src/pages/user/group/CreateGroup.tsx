import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  IconButton,
  MenuItem,
  Slider,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import { groupApi } from '@/services/group/groups'
import { userApi } from '@/services/user/api'
import { Car } from 'lucide-react'

const steps = ['Thông tin nhóm', 'Tỷ lệ sở hữu', 'Quy tắc & xuất bản', 'Thêm xe (Tùy chọn)']

type MemberDraft = {
  email: string
  userId: string | null
  userName: string
  share: number
  role: 'Admin' | 'Member'
}

const CreateGroup = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [groupInfo, setGroupInfo] = useState({ name: '', description: '' })
  const [members, setMembers] = useState<MemberDraft[]>([
    { email: '', userId: null, userName: '', share: 100, role: 'Admin' },
  ])
  const [rules, setRules] = useState({
    bookingWindow: 'Tối đa 2 tuần',
    cancellationPolicy: 'Thông báo trước 24h',
    paymentTerms: 'Chốt chi phí vào cuối tháng',
  })
  const [submitting, setSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const shareTotal = useMemo(() => members.reduce((sum, member) => sum + member.share, 0), [members])

  // Validation functions for each step
  const validateStep0 = (): boolean => {
    return groupInfo.name.trim().length >= 3
  }

  const validateStep1 = (): { isValid: boolean; message?: string } => {
    // Check all members have valid emails (userId)
    const invalidMembers = members.filter(
      (member) => !member.userId || (typeof member.userId === 'string' && member.userId.trim().length === 0),
    )
    if (invalidMembers.length > 0) {
      return {
        isValid: false,
        message: 'Vui lòng nhập email hợp lệ cho tất cả thành viên',
      }
    }

    // Check shares total 100%
    if (shareTotal !== 100) {
      return {
        isValid: false,
        message: 'Tổng tỷ lệ sở hữu phải bằng 100%',
      }
    }

    return { isValid: true }
  }

  const handleNextStep = () => {
    if (activeStep === 0) {
      if (!validateStep0()) {
        setSnackbar({
          open: true,
          severity: 'error',
          message: 'Vui lòng nhập tên nhóm (ít nhất 3 ký tự)',
        })
        return
      }
    } else if (activeStep === 1) {
      const validation = validateStep1()
      if (!validation.isValid) {
        setSnackbar({
          open: true,
          severity: 'error',
          message: validation.message || 'Vui lòng hoàn thành thông tin thành viên',
        })
        return
      }
    }
    setActiveStep((prev) => prev + 1)
  }

  const handleMemberShareChange = (index: number, value: number) => {
    setMembers((prev) =>
      prev.map((member, idx) => (idx === index ? { ...member, share: value } : member)),
    )
  }

  const addMemberRow = () => {
    setMembers((prev) => [...prev, { email: '', userId: null, userName: '', share: 0, role: 'Member' }])
  }

  const handleEmailChange = async (index: number, email: string) => {
    setMembers((prev) =>
      prev.map((member, idx) =>
        idx === index
          ? { ...member, email, userId: null, userName: '' }
          : member,
      ),
    )

    // Search for user by email
    if (email.trim().length > 0 && email.includes('@')) {
      try {
        const user = await userApi.searchByEmail(email.trim())
        setMembers((prev) =>
          prev.map((member, idx) =>
            idx === index
              ? {
                  ...member,
                  userId: user.id,
                  userName: `${user.firstName} ${user.lastName}`.trim() || email,
                }
              : member,
          ),
        )
      } catch (error) {
        // User not found - clear userId and userName
        setMembers((prev) =>
          prev.map((member, idx) =>
            idx === index ? { ...member, userId: null, userName: '' } : member,
          ),
        )
      }
    }
  }

  const removeMemberRow = (index: number) => {
    if (members.length === 1) return
    setMembers((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = async () => {
    if (shareTotal !== 100) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Tổng tỷ lệ sở hữu phải bằng 100%',
      })
      return
    }

    // Validate all members have userId
    const invalidMembers = members.filter(
      (member) => !member.userId || (typeof member.userId === 'string' && member.userId.trim().length === 0),
    )
    if (invalidMembers.length > 0) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Vui lòng nhập email hợp lệ cho tất cả thành viên',
      })
      return
    }

    // Transform to backend format (PascalCase and enum values)
    const payload = {
      Name: groupInfo.name,
      Description: groupInfo.description || null,
      Members: members
        .filter((member) => member.userId && member.share > 0)
        .map((member) => ({
          UserId: member.userId!,
          SharePercentage: member.share / 100,
          RoleInGroup: member.role === 'Admin' ? 1 : 0, // Convert string to enum: Admin=1, Member=0
        })),
    }

    setSubmitting(true)
    try {
      const created = await groupApi.createGroup(payload as any)
      setSnackbar({
        open: true,
        message: 'Đã gửi yêu cầu tạo nhóm. Nhóm của bạn đang chờ phê duyệt từ nhân viên.',
        severity: 'success',
      })
      navigate(`/groups/${created.id}`)
    } catch (submitError) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: submitError instanceof Error ? submitError.message : 'Không thể tạo nhóm',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold text-neutral-900">Khởi tạo nhóm đồng sở hữu</h1>
      </header>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div className="mt-8 space-y-6 rounded-3xl border border-neutral-200 bg-white p-6">
        {activeStep === 0 && (
          <div className="space-y-4">
            <TextField
              label="Tên nhóm"
              value={groupInfo.name}
              onChange={(event) => setGroupInfo((prev) => ({ ...prev, name: event.target.value }))}
              fullWidth
              sx={{ mb: 3 }}
            />
            <TextField
              label="Mô tả"
              value={groupInfo.description}
              onChange={(event) =>
                setGroupInfo((prev) => ({ ...prev, description: event.target.value }))
              }
              fullWidth
              multiline
              minRows={4}
            />
          </div>
        )}

        {activeStep === 1 && (
          <div className="space-y-6">
            {members.map((member, index) => (
              <div
                key={`${member.userId}-${index}`}
                className="space-y-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-700">Thành viên {index + 1}</p>
                  <IconButton size="small" onClick={() => removeMemberRow(index)}>
                    <Delete fontSize="inherit" />
                  </IconButton>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Email"
                    type="email"
                    value={member.email}
                    onChange={(event) => handleEmailChange(index, event.target.value)}
                    helperText={
                      member.userId
                        ? `✓ ${member.userName || member.email}`
                        : member.email && member.email.includes('@')
                          ? 'Đang tìm kiếm...'
                          : 'Nhập email người dùng'
                    }
                    error={member.email.length > 0 && !member.userId && member.email.includes('@')}
                  />
                  <TextField
                    label="Vai trò"
                    select
                    value={member.role}
                    onChange={(event) =>
                      setMembers((prev) =>
                        prev.map((row, idx) =>
                          idx === index
                            ? { ...row, role: event.target.value as MemberDraft['role'] }
                            : row,
                        ),
                      )
                    }
                    fullWidth
                  >
                    <MenuItem value="Member">Thành viên</MenuItem>
                    <MenuItem value="Admin">Quản trị viên</MenuItem>
                  </TextField>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    Tỷ lệ sở hữu ({member.share}%)
                  </p>
                  <Slider
                    value={member.share}
                    onChange={(_, value) => handleMemberShareChange(index, value as number)}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              </div>
            ))}
            <Button startIcon={<Add />} variant="outlined" onClick={() => addMemberRow()} sx={{ mt: 2 }}>
              Thêm thành viên
            </Button>
            <Alert
              severity={shareTotal === 100 ? 'success' : 'warning'}
              sx={{ mt: 2 }}
            >{`Tổng hiện tại: ${shareTotal}% (cần 100%)`}</Alert>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-4">
            <TextField
              label="Booking window"
              value={rules.bookingWindow}
              onChange={(event) => setRules((prev) => ({ ...prev, bookingWindow: event.target.value }))}
              fullWidth
              sx={{ mb: 3 }}
            />
            <TextField
              label="Chính sách huỷ"
              value={rules.cancellationPolicy}
              onChange={(event) =>
                setRules((prev) => ({ ...prev, cancellationPolicy: event.target.value }))
              }
              fullWidth
              sx={{ mb: 3 }}
            />
            <TextField
              label="Điều khoản thanh toán"
              value={rules.paymentTerms}
              onChange={(event) => setRules((prev) => ({ ...prev, paymentTerms: event.target.value }))}
              fullWidth
              sx={{ mb: 3 }}
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              Các quy tắc này sẽ được lưu trong mô tả nhóm và hiển thị cho mọi thành viên khi tham gia.
            </Alert>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-4">
            <Alert severity="info" sx={{ mb: 3 }}>
              Bạn có thể thêm xe vào nhóm ngay bây giờ hoặc thêm sau khi nhóm được phê duyệt. 
              Không có giới hạn số lượng xe trong một nhóm.
            </Alert>
            <Button
              variant="outlined"
              startIcon={<Car />}
              onClick={() => {
                // After group is created, navigate to vehicle creation with groupId
                // For now, just show info - vehicle creation will happen after group is created
              }}
              disabled
              fullWidth
              sx={{ py: 2 }}
            >
              Thêm xe sẽ có sẵn sau khi nhóm được tạo
            </Button>
            <Alert severity="success" sx={{ mt: 2 }}>
              Sau khi nhóm được phê duyệt, bạn có thể thêm xe từ trang "Xe của tôi" hoặc trang chi tiết nhóm.
            </Alert>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outlined" disabled={activeStep === 0} onClick={() => setActiveStep((prev) => prev - 1)}>
          Quay lại
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            disabled={submitting || shareTotal !== 100 || groupInfo.name.trim().length < 3}
            onClick={() => handleSubmit()}
          >
            {submitting ? 'Đang tạo...' : 'Xuất bản nhóm'}
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={
              (activeStep === 0 && !validateStep0()) ||
              (activeStep === 1 && !validateStep1().isValid)
            }
            onClick={handleNextStep}
          >
            {activeStep === 2 ? 'Bỏ qua và tạo nhóm' : 'Tiếp tục'}
          </Button>
        )}
      </div>

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
    </section>
  )
}

export default CreateGroup




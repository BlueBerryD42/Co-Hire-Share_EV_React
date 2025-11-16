import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  IconButton,
  Slider,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import type { CreateGroupDto } from '@/models/group'
import { groupApi } from '@/services/group/groups'

const steps = ['Thông tin nhóm', 'Tỷ lệ sở hữu', 'Quy tắc & xuất bản']

type MemberDraft = {
  userId: string
  share: number
  role: 'Admin' | 'Member'
}

const CreateGroup = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [groupInfo, setGroupInfo] = useState({ name: '', description: '' })
  const [members, setMembers] = useState<MemberDraft[]>([
    { userId: '', share: 100, role: 'Admin' },
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

  const handleMemberShareChange = (index: number, value: number) => {
    setMembers((prev) =>
      prev.map((member, idx) => (idx === index ? { ...member, share: value } : member)),
    )
  }

  const addMemberRow = () => {
    setMembers((prev) => [...prev, { userId: '', share: 0, role: 'Member' }])
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

    const payload: CreateGroupDto = {
      name: groupInfo.name,
      description: groupInfo.description,
      members: members
        .filter((member) => member.userId.trim().length > 0 && member.share > 0)
        .map((member) => ({
          userId: member.userId as unknown as string,
          sharePercentage: member.share / 100,
          roleInGroup: member.role,
        })),
    }

    setSubmitting(true)
    try {
      const created = await groupApi.createGroup(payload)
      setSnackbar({ open: true, message: 'Đã tạo nhóm thành công', severity: 'success' })
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
    <section className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Screen 43 · Create group</p>
        <h1 className="text-4xl font-semibold text-neutral-900">Khởi tạo nhóm đồng sở hữu</h1>
        <p className="text-neutral-600">
          Wizard ba bước giúp bạn xác định thông tin cơ bản, cấu trúc sở hữu và quy tắc hoạt động.
          Mọi dữ liệu sẽ được gửi đến Group microservice để tạo nhóm chính thức.
        </p>
      </header>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6">
        {activeStep === 0 && (
          <div className="space-y-4">
            <TextField
              label="Tên nhóm"
              value={groupInfo.name}
              onChange={(event) => setGroupInfo((prev) => ({ ...prev, name: event.target.value }))}
              fullWidth
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
                    label="User ID (GUID)"
                    value={member.userId}
                    onChange={(event) =>
                      setMembers((prev) =>
                        prev.map((row, idx) =>
                          idx === index ? { ...row, userId: event.target.value } : row,
                        ),
                      )
                    }
                    helperText="Nhập ID người dùng được cấp từ hệ thống"
                  />
                  <TextField
                    label="Vai trò"
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
                  />
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
            <Button startIcon={<Add />} variant="outlined" onClick={() => addMemberRow()}>
              Thêm thành viên
            </Button>
            <Alert
              severity={shareTotal === 100 ? 'success' : 'warning'}
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
            />
            <TextField
              label="Chính sách huỷ"
              value={rules.cancellationPolicy}
              onChange={(event) =>
                setRules((prev) => ({ ...prev, cancellationPolicy: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Điều khoản thanh toán"
              value={rules.paymentTerms}
              onChange={(event) => setRules((prev) => ({ ...prev, paymentTerms: event.target.value }))}
              fullWidth
            />
            <Alert severity="info">
              Các quy tắc này sẽ được lưu trong mô tả nhóm và hiển thị cho mọi thành viên khi tham gia.
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
            disabled={activeStep === 0 && groupInfo.name.trim().length < 3}
            onClick={() => setActiveStep((prev) => prev + 1)}
          >
            Tiếp tục
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



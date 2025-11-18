import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Slider,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from '@mui/material'
import type { UUID } from '@/models/booking'
import type { JoinGroupApplicationDto } from '@/models/application'
import { useGroup } from '@/hooks/useGroups'
import { applicationsApi } from '@/services/group/applications'

const steps = ['Giới thiệu', 'Sử dụng & trách nhiệm', 'Xác nhận']

const JoinGroupApplication = () => {
  const navigate = useNavigate()
  const { groupId } = useParams<{ groupId: UUID }>()
  const { data: group, loading, error } = useGroup(groupId)

  const [activeStep, setActiveStep] = useState(0)
  const [form, setForm] = useState<JoinGroupApplicationDto>({
    groupId: groupId as UUID,
    desiredOwnershipPercentage: 0.1,
    intendedUsageHoursPerWeek: 10,
    introduction: '',
    agreeToRules: false,
    backgroundCheckConsent: false,
    preferredContact: 'Email',
    emergencyContactName: '',
    emergencyContactPhone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  if (!groupId) {
    return (
      <section className="space-y-4 text-center">
        <p className="text-lg font-semibold text-accent-terracotta">Thiếu tham số nhóm.</p>
      </section>
    )
  }

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1))
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0))

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await applicationsApi.submit(groupId, form)
      setSnackbar({ open: true, message: 'Đã gửi yêu cầu tham gia', severity: 'success' })
      navigate(`/groups/${groupId}`)
    } catch (submitError) {
      setSnackbar({
        open: true,
        message: submitError instanceof Error ? submitError.message : 'Không thể gửi yêu cầu',
        severity: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold text-neutral-900">Ứng tuyển vào nhóm</h1>
        <p className="text-neutral-600">
          Cung cấp thông tin rõ ràng để admin có thể đánh giá nhanh hồ sơ của bạn. Mọi yêu cầu sẽ
          được chuyển thành thông báo đến admin của nhóm.
        </p>
      </header>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {loading && (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center text-neutral-600">
          Đang tải dữ liệu nhóm...
        </div>
      )}

      {error && (
        <Alert severity="error">
          Không thể tải thông tin nhóm. {error.message}
        </Alert>
      )}

      {group && (
        <div className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6">
          {activeStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-neutral-900">Giới thiệu bản thân</h2>
              <TextField
                label="Lời giới thiệu"
                value={form.introduction}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, introduction: event.target.value }))
                }
                fullWidth
                multiline
                minRows={4}
                helperText="Chia sẻ kinh nghiệm đồng sở hữu, nhu cầu sử dụng, lý do bạn phù hợp."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Người liên hệ khẩn cấp"
                  value={form.emergencyContactName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, emergencyContactName: event.target.value }))
                  }
                />
                <TextField
                  label="Số điện thoại liên hệ"
                  value={form.emergencyContactPhone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, emergencyContactPhone: event.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-semibold text-neutral-900">Kỳ vọng sử dụng</h2>
              <div>
                <p className="text-sm text-neutral-600">Tỷ lệ sở hữu mong muốn</p>
                <Slider
                  value={form.desiredOwnershipPercentage * 100}
                  onChange={(_, value) =>
                    setForm((prev) => ({
                      ...prev,
                      desiredOwnershipPercentage: Number(value) / 100,
                    }))
                  }
                  min={5}
                  max={100}
                  step={5}
                  valueLabelDisplay="auto"
                />
              </div>
              <TextField
                type="number"
                label="Giờ sử dụng dự kiến mỗi tuần"
                value={form.intendedUsageHoursPerWeek}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    intendedUsageHoursPerWeek: Number(event.target.value),
                  }))
                }
                helperText="Tham khảo lịch nhóm để đảm bảo sự công bằng"
              />
              <TextField
                label="Hình thức liên hệ ưu tiên"
                value={form.preferredContact}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, preferredContact: event.target.value as JoinGroupApplicationDto['preferredContact'] }))
                }
              />
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                Nhóm <strong>{group.name}</strong> hiện có {group.members.length} thành viên và{' '}
                {group.vehicles.length} xe. Hãy đảm bảo kế hoạch sử dụng của bạn cân bằng với quy
                tắc nhóm.
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-neutral-900">Xác nhận & chấp thuận</h2>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.agreeToRules}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, agreeToRules: event.target.checked }))
                    }
                  />
                }
                label="Tôi đồng ý tuân thủ quy tắc và lịch sử dụng chung của nhóm."
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.backgroundCheckConsent}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        backgroundCheckConsent: event.target.checked,
                      }))
                    }
                  />
                }
                label="Tôi đồng ý để nhóm thực hiện kiểm tra thông tin / KYC nếu cần."
              />
              <Alert severity="info">
                Sau khi gửi, admin sẽ nhận thông báo qua Notification Service và phản hồi qua
                message center hoặc email đã đăng ký.
              </Alert>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
              Quay lại
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => handleSubmit()}
                disabled={
                  submitting ||
                  !form.agreeToRules ||
                  !form.backgroundCheckConsent ||
                  form.introduction.trim().length < 20
                }
              >
                {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={form.introduction.trim().length < 10}
              >
                Tiếp tục
              </Button>
            )}
          </div>
        </div>
      )}

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

export default JoinGroupApplication




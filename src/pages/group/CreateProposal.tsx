import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  MenuItem,
  Select,
  Slider,
  Snackbar,
  TextField,
} from '@mui/material'
import type { UUID } from '@/models/booking'
import type { ProposalType } from '@/models/proposal'
import { proposalApi } from '@/services/group/proposals'

const formatDateTimeLocal = (date: Date) => {
  const iso = date.toISOString()
  return iso.slice(0, 16)
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

  const isValid = useMemo(() => {
    return form.title.trim().length > 5 && form.description.trim().length > 20
  }, [form.title, form.description])

  const handleChange = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
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
    <section className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Screen 29 · Create proposal</p>
        <h1 className="text-4xl font-semibold text-neutral-900">Tạo đề xuất mới</h1>
        <p className="text-neutral-600">
          Cung cấp thông tin rõ ràng để các thành viên bỏ phiếu minh bạch. Mọi trường dữ liệu đều
          đồng bộ với microservice Group & Notification.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6">
          <TextField
            label="Tiêu đề"
            value={form.title}
            onChange={(event) => handleChange('title', event.target.value)}
            fullWidth
          />
          <Select
            label="Loại đề xuất"
            value={form.type}
            onChange={(event) => handleChange('type', event.target.value as ProposalType)}
            fullWidth
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
          />
          <TextField
            label="Giá trị ước tính (VND)"
            type="number"
            value={form.amount}
            onChange={(event) => handleChange('amount', event.target.value)}
            fullWidth
          />
          <TextField
            label="Bắt đầu bỏ phiếu"
            type="datetime-local"
            value={form.votingStartDate}
            onChange={(event) => handleChange('votingStartDate', event.target.value)}
            fullWidth
          />
          <TextField
            label="Kết thúc bỏ phiếu"
            type="datetime-local"
            value={form.votingEndDate}
            onChange={(event) => handleChange('votingEndDate', event.target.value)}
            fullWidth
          />
          <div>
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
          <Button
            variant="contained"
            fullWidth
            disabled={!isValid || submitting}
            onClick={() => handleSubmit()}
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
              {form.type} · {form.requiredMajority}%
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
    </section>
  )
}

export default CreateProposal


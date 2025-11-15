import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from '@mui/material'
import { AddCircle, Payments, Download } from '@mui/icons-material'
import type { UUID } from '@/models/booking'
import { useFundBalance, useFundTransactions } from '@/hooks/useFund'
import { useGroup } from '@/hooks/useGroups'
import { fundApi } from '@/services/group/fund'

type FundAction = 'deposit' | 'withdraw'

const initialFormState = {
  amount: '',
  description: '',
  reference: '',
}

const SharedFund = () => {
  const { groupId } = useParams<{ groupId: UUID }>()
  const { data: group } = useGroup(groupId)
  const { data: balance, loading, error, reload } = useFundBalance(groupId)
  const {
    data: transactions,
    loading: txLoading,
    reload: reloadTransactions,
  } = useFundTransactions(groupId, 1, 8)

  const [dialog, setDialog] = useState<{ type: FundAction | null }>({ type: null })
  const [formValues, setFormValues] = useState(initialFormState)
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

  const contributions = useMemo(() => {
    if (!balance) return []
    return Object.entries(balance.statistics.memberContributions).map(([name, amount]) => ({
      name,
      amount,
      ratio:
        balance.statistics.totalDeposits > 0
          ? Math.round((amount / balance.statistics.totalDeposits) * 100)
          : 0,
    }))
  }, [balance])

  const handleOpenDialog = (type: FundAction) => {
    setDialog({ type })
    setFormValues(initialFormState)
  }

  const handleCloseDialog = () => {
    setDialog({ type: null })
  }

  const handleSubmit = async () => {
    if (!groupId || !dialog.type) return
    const amountNumber = Number(formValues.amount)
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập số tiền hợp lệ',
        severity: 'error',
      })
      return
    }
    setSubmitting(true)
    try {
      if (dialog.type === 'deposit') {
        await fundApi.deposit(groupId, {
          amount: amountNumber,
          description: formValues.description || 'Nạp quỹ',
          reference: formValues.reference,
        })
      } else {
        await fundApi.withdraw(groupId, {
          amount: amountNumber,
          reason: formValues.description || 'Rút quỹ',
          recipient: formValues.reference,
        })
      }
      setSnackbar({
        open: true,
        message: dialog.type === 'deposit' ? 'Đã nạp quỹ thành công' : 'Đã gửi yêu cầu rút quỹ',
        severity: 'success',
      })
      handleCloseDialog()
      await Promise.all([reload(), reloadTransactions()])
    } catch (submitError) {
      setSnackbar({
        open: true,
        message: submitError instanceof Error ? submitError.message : 'Có lỗi xảy ra',
        severity: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const currency = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  })

  return (
    <section className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="space-y-4 rounded-3xl border border-neutral-200 bg-neutral-100 p-6">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Screen 26 · Shared fund</p>
        <h1 className="text-4xl font-semibold text-neutral-900">
          Quỹ chung · {group?.name ?? 'Đang tải'}
        </h1>
        <p className="max-w-3xl text-neutral-600">
          Theo dõi số dư, đóng góp của từng thành viên và lịch sử giao dịch thời gian thực. Các thao
          tác nạp và rút quỹ sẽ tự động đồng bộ giữa các microservice.
        </p>
      </header>

      {error && (
        <Alert severity="error" onClose={() => reload()}>
          Không thể tải số dư quỹ. Thử lại sau vài phút.
        </Alert>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card space-y-2">
          <p className="text-sm text-neutral-500">Số dư khả dụng</p>
          <p className="text-3xl font-semibold text-neutral-900">
            {loading || !balance ? 'Đang tải...' : currency.format(balance.availableBalance)}
          </p>
          <p className="text-xs text-neutral-500">
            Cập nhật: {balance?.lastUpdated && new Date(balance.lastUpdated).toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="card space-y-2">
          <p className="text-sm text-neutral-500">Quỹ dự phòng</p>
          <p className="text-3xl font-semibold text-neutral-900">
            {loading || !balance ? '---' : currency.format(balance.reserveBalance)}
          </p>
          <p className="text-xs text-neutral-500">Dùng cho bảo trì khẩn cấp</p>
        </div>
        <div className="card space-y-2">
          <p className="text-sm text-neutral-500">Đã nạp trong tháng</p>
          <p className="text-3xl font-semibold text-neutral-900">
            {loading || !balance ? '---' : currency.format(balance.statistics.totalDeposits)}
          </p>
          <p className="text-xs text-neutral-500">Tổng giao dịch hợp lệ</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => handleOpenDialog('deposit')}
          className="card flex items-center gap-3 border-dashed text-left hover:border-accent-blue"
        >
          <AddCircle className="text-accent-blue" />
          <div>
            <p className="text-lg font-semibold text-neutral-900">Nạp quỹ</p>
            <p className="text-sm text-neutral-600">Ghi nhận ngay vào sổ quỹ</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleOpenDialog('withdraw')}
          className="card flex items-center gap-3 border-dashed text-left hover:border-accent-gold"
        >
          <Payments className="text-accent-gold" />
          <div>
            <p className="text-lg font-semibold text-neutral-900">Yêu cầu rút</p>
            <p className="text-sm text-neutral-600">Gửi tới admin để phê duyệt</p>
          </div>
        </button>
        <div className="card flex items-center gap-3 border-dashed text-neutral-600">
          <Download className="text-neutral-500" />
          <div>
            <p className="text-lg font-semibold text-neutral-900">Xuất sổ quỹ</p>
            <p className="text-sm">Tải file CSV/PDF (đang phát triển)</p>
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Đóng góp theo thành viên</h2>
          <p className="text-sm text-neutral-500">
            Dựa trên tổng nạp: {balance ? currency.format(balance.statistics.totalDeposits) : '---'}
          </p>
        </div>
        <div className="space-y-3">
          {contributions.length === 0 && (
            <p className="text-sm text-neutral-500">Chưa có giao dịch đóng góp nào.</p>
          )}
          {contributions.map((item) => (
            <div key={item.name} className="rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-neutral-900">{item.name}</p>
                <p className="text-sm font-semibold text-neutral-700">{item.ratio}%</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-accent-blue"
                  style={{ width: `${item.ratio}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-neutral-600">{currency.format(item.amount)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Giao dịch gần nhất</h2>
          <p className="text-sm text-neutral-500">
            {transactions?.totalCount ?? 0} giao dịch · hiển thị 8 mục mới nhất
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-3 py-2">Ngày</th>
                <th className="px-3 py-2">Loại</th>
                <th className="px-3 py-2">Người thực hiện</th>
                <th className="px-3 py-2 text-right">Số tiền</th>
                <th className="px-3 py-2 text-right">Số dư sau</th>
              </tr>
            </thead>
            <tbody>
              {txLoading && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-neutral-400">
                    Đang tải giao dịch...
                  </td>
                </tr>
              )}
              {!txLoading &&
                transactions?.transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-neutral-100">
                    <td className="px-3 py-2">
                      {new Date(tx.transactionDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-3 py-2 font-semibold text-neutral-800">{tx.type}</td>
                    <td className="px-3 py-2">{tx.initiatorName}</td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {currency.format(tx.amount)}
                    </td>
                    <td className="px-3 py-2 text-right">{currency.format(tx.balanceAfter)}</td>
                  </tr>
                ))}
              {!txLoading && (!transactions || transactions.transactions.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-neutral-400">
                    Chưa có giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={dialog.type !== null} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialog.type === 'deposit' ? 'Nạp quỹ' : 'Yêu cầu rút'}</DialogTitle>
        <DialogContent className="space-y-4">
          <TextField
            label="Số tiền (VND)"
            type="number"
            fullWidth
            value={formValues.amount}
            onChange={(event) => setFormValues((prev) => ({ ...prev, amount: event.target.value }))}
          />
          <TextField
            label={dialog.type === 'deposit' ? 'Mô tả' : 'Lý do rút'}
            fullWidth
            value={formValues.description}
            onChange={(event) =>
              setFormValues((prev) => ({ ...prev, description: event.target.value }))
            }
          />
          <TextField
            label={dialog.type === 'deposit' ? 'Mã tham chiếu (tuỳ chọn)' : 'Người nhận (tuỳ chọn)'}
            fullWidth
            value={formValues.reference}
            onChange={(event) =>
              setFormValues((prev) => ({ ...prev, reference: event.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Huỷ</Button>
          <Button onClick={() => handleSubmit()} disabled={submitting} variant="contained">
            {submitting ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default SharedFund

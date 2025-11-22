import { useMemo, useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Chip,
} from '@mui/material'
import { AddCircle, Payments, Download, CheckCircle, Cancel } from '@mui/icons-material'
import type { UUID } from '@/models/booking'
import { useFundBalance, useFundTransactions } from '@/hooks/useFund'
import { useGroup } from '@/hooks/useGroups'
import { fundApi } from '@/services/group/fund'
import { useAppSelector } from '@/store/hooks'
import type { FundTransactionStatus } from '@/models/fund'

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
  const { user } = useAppSelector((state) => state.auth)
  const location = useLocation()

  useEffect(() => {
    const checkPaymentStatus = () => {
      const pendingDepositJSON = sessionStorage.getItem('pendingFundDeposit');
      const searchParams = new URLSearchParams(location.search);
      const responseCode = searchParams.get('vnp_ResponseCode');
      const orderIdParam = searchParams.get('vnp_TxnRef');
  
      if (!pendingDepositJSON || !responseCode) {
        return;
      }
      
      const pendingDeposit = JSON.parse(pendingDepositJSON);
  
      if (pendingDeposit.orderId === orderIdParam) {
        if (responseCode === '00') {
          setSnackbar({
            open: true,
            message: 'Giao dịch thành công! Vui lòng chờ trong khi hệ thống cập nhật số dư.',
            severity: 'success',
          });
          // Wait a couple of seconds for backend IPN to be processed before reloading
          setTimeout(() => {
            reload();
            reloadTransactions();
          }, 3000); // 3-second delay
        } else {
          setSnackbar({
            open: true,
            message: 'Giao dịch không thành công hoặc đã bị hủy.',
            severity: 'error',
          });
        }
  
        // Clean up session storage and URL query params
        sessionStorage.removeItem('pendingFundDeposit');
        window.history.replaceState({}, document.title, `${location.pathname}`);
      }
    };
  
    checkPaymentStatus();
  }, [location.search, reload, reloadTransactions]);

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

  // Check if current user is group admin
  const isGroupAdmin = useMemo(() => {
    if (!group || !user?.id) return false
    const currentUserMember = group.members.find((m) => m.userId === user.id)
    return currentUserMember?.roleInGroup === 'Admin'
  }, [group, user])

  // Get pending withdrawals
  const pendingWithdrawals = useMemo(() => {
    if (!transactions?.transactions) return []
    return transactions.transactions.filter(
      (tx) => tx.type === 'Withdrawal' && tx.status === 'Pending'
    )
  }, [transactions])

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
    if (amountNumber < 10000) {
      setSnackbar({
        open: true,
        message: 'Số tiền phải lớn hơn hoặc bằng 10,000 VND',
        severity: 'error',
      })
      return
    }
    setSubmitting(true)
    try {
      if (dialog.type === 'deposit') {
        // Always use VNPay for fund deposits (no manual deposits allowed)
        const paymentResponse = await fundApi.createDepositPayment(groupId, {
          groupId,
          amount: amountNumber,
          description: formValues.description || 'Nạp quỹ',
          reference: formValues.reference,
        })
        
        // Store deposit info for callback handling
        sessionStorage.setItem('pendingFundDeposit', JSON.stringify({
          groupId,
          amount: amountNumber,
          orderId: paymentResponse.orderId,
        }))
        
        // Redirect to VNPay
        window.location.href = paymentResponse.paymentUrl
        return // Don't close dialog yet, redirect happens
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
            } catch (submitError: any) {
              let errorMessage = 'Có lỗi xảy ra';
              if (submitError instanceof Error) {
                errorMessage = submitError.message;
              } else if (submitError.response && submitError.response.data && submitError.response.data.message) {
                errorMessage = submitError.response.data.message;
              }
    
                        if (
                          (submitError.response && submitError.response.status === 400) ||
                          errorMessage.includes('Insufficient funds') ||
                          errorMessage.includes('Số dư không đủ') ||
                          errorMessage.includes('Không đủ tiền trong quỹ')
                        ) {
                          setSnackbar({
                            open: true,
                            message: 'Số dư quỹ không đủ để thực hiện giao dịch này.',
                            severity: 'error',
                          });
                        } else {                setSnackbar({
                  open: true,
                  message: errorMessage,
                  severity: 'error',
                });
              }
            } finally {
      setSubmitting(false)
    }
  }

  const handleApproveWithdrawal = async (transactionId: UUID) => {
    if (!groupId) return
    setSubmitting(true)
    try {
      await fundApi.approveWithdrawal(groupId, transactionId)
      setSnackbar({
        open: true,
        message: 'Đã phê duyệt yêu cầu rút quỹ',
        severity: 'success',
      })
      await Promise.all([reload(), reloadTransactions()])
    } catch (error: any) {
      let errorMessage = 'Không thể phê duyệt yêu cầu rút quỹ';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      if (
        (error.response && error.response.status === 400) ||
        errorMessage.includes('Insufficient funds') ||
        errorMessage.includes('Số dư không đủ') ||
        errorMessage.includes('Không đủ tiền trong quỹ')
      ) {
        setSnackbar({
          open: true,
          message: 'Số dư quỹ không đủ để phê duyệt yêu cầu rút này.',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectWithdrawal = async (transactionId: UUID) => {
    if (!groupId) return
    setSubmitting(true)
    try {
      await fundApi.rejectWithdrawal(groupId, transactionId)
      setSnackbar({
        open: true,
        message: 'Đã từ chối yêu cầu rút quỹ',
        severity: 'success',
      })
      await Promise.all([reload(), reloadTransactions()])
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Không thể từ chối yêu cầu rút quỹ',
        severity: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportPDF = async () => {
    if (!balance || !transactions || !group) {
      setSnackbar({
        open: true,
        message: 'Chưa có dữ liệu để xuất',
        severity: 'error',
      })
      return
    }

    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default

      // Fetch all transactions (not just first 8)
      const allTransactions = await fundApi.getTransactions(groupId!, { page: 1, pageSize: 1000 })

      const doc = new jsPDF()

      // Helper function to convert Vietnamese text
      const toNonAccent = (str: string) => {
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
      }

      // Title
      doc.setFontSize(20)
      doc.text('SO QUY CHUNG', 105, 20, { align: 'center' })

      doc.setFontSize(12)
      doc.text(`Nhom: ${toNonAccent(group.name)}`, 20, 35)
      doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 20, 42)

      // Summary section
      doc.setFontSize(14)
      doc.text('TONG QUAN', 20, 55)

      doc.setFontSize(10)
      const summaryData = [
        ['So du kha dung', currency.format(balance.availableBalance)],
        ['Quy du phong', currency.format(balance.reserveBalance)],
        ['Tong da nap', currency.format(balance.statistics.totalDeposits)],
        ['Tong da rut', currency.format(balance.statistics.totalWithdrawals)],
        ['Cap nhat cuoi', new Date(balance.lastUpdated).toLocaleString('vi-VN')],
      ]

      autoTable(doc, {
        startY: 60,
        head: [['Thong tin', 'Gia tri']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [122, 154, 175] },
        margin: { left: 20, right: 20 },
      })

      // Member contributions
      doc.setFontSize(14)
      const contributionsStartY = (doc as any).lastAutoTable.finalY + 15
      doc.text('DONG GOP THEO THANH VIEN', 20, contributionsStartY)

      const contributionsData = contributions.map(c => [
        toNonAccent(c.name),
        currency.format(c.amount),
        `${c.ratio}%`,
      ])

      autoTable(doc, {
        startY: contributionsStartY + 5,
        head: [['Thanh vien', 'So tien', 'Ty le']],
        body: contributionsData,
        theme: 'striped',
        headStyles: { fillColor: [122, 154, 175] },
        margin: { left: 20, right: 20 },
      })

      // Transactions
      doc.setFontSize(14)
      const txStartY = (doc as any).lastAutoTable.finalY + 15
      doc.text('LICH SU GIAO DICH', 20, txStartY)

      const transactionsData = allTransactions.transactions.map(tx => [
        new Date(tx.transactionDate).toLocaleDateString('vi-VN'),
        tx.type === 'Deposit' ? 'Nap' : 'Rut',
        toNonAccent(tx.initiatorName),
        tx.status === 'Completed' ? 'Hoan thanh' :
        tx.status === 'Pending' ? 'Cho duyet' :
        tx.status === 'Rejected' ? 'Tu choi' : 'Da duyet',
        currency.format(tx.amount),
      ])

      autoTable(doc, {
        startY: txStartY + 5,
        head: [['Ngay', 'Loai', 'Nguoi thuc hien', 'Trang thai', 'So tien']],
        body: transactionsData,
        theme: 'striped',
        headStyles: { fillColor: [122, 154, 175] },
        margin: { left: 20, right: 20 },
        columnStyles: {
          4: { halign: 'right' },
        },
      })

      // Save PDF
      const fileName = `So_Quy_${group.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)

      setSnackbar({
        open: true,
        message: 'Đã xuất sổ quỹ thành công',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error exporting PDF:', error)
      setSnackbar({
        open: true,
        message: 'Không thể xuất PDF. Vui lòng thử lại.',
        severity: 'error',
      })
    }
  }

  const currency = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  })

  return (
    <section className="space-y-8">
      <header className="space-y-4">
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
        <button
          type="button"
          onClick={handleExportPDF}
          className="card flex items-center gap-3 border-dashed text-left hover:border-success"
          disabled={!balance || !transactions}
        >
          <Download className="text-success" />
          <div>
            <p className="text-lg font-semibold text-neutral-900">Xuất sổ quỹ</p>
            <p className="text-sm text-neutral-600">Tải file PDF</p>
          </div>
        </button>
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

      {/* Pending Withdrawals Section - Only visible to group admins */}
      {isGroupAdmin && pendingWithdrawals.length > 0 && (
        <section className="card space-y-4 border-2 border-amber-200 bg-amber-50/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900">
                Yêu cầu rút quỹ chờ phê duyệt
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Có {pendingWithdrawals.length} yêu cầu đang chờ phê duyệt
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {pendingWithdrawals.map((tx) => (
              <div
                key={tx.id}
                className="rounded-lg border border-amber-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Chip
                        label="Chờ phê duyệt"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <span className="text-sm text-neutral-500">
                        {new Date(tx.transactionDate).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <p className="font-semibold text-lg text-neutral-900 mb-1">
                      {currency.format(tx.amount)}
                    </p>
                    <p className="text-sm text-neutral-600 mb-2">{tx.description}</p>
                    <p className="text-xs text-neutral-500">
                      Người yêu cầu: {tx.initiatorName}
                      {tx.reference && ` · Người nhận: ${tx.reference}`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => handleApproveWithdrawal(tx.id)}
                      disabled={submitting}
                    >
                      Phê duyệt
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => handleRejectWithdrawal(tx.id)}
                      disabled={submitting}
                    >
                      Từ chối
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2 text-right">Số tiền</th>
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
                    <td className="px-3 py-2">
                      {tx.status === 'Pending' && (
                        <Chip label="Chờ phê duyệt" color="warning" size="small" />
                      )}
                      {tx.status === 'Completed' && (
                        <Chip label="Hoàn thành" color="success" size="small" />
                      )}
                      {tx.status === 'Rejected' && (
                        <Chip label="Đã từ chối" color="error" size="small" />
                      )}
                      {tx.status === 'Approved' && (
                        <Chip label="Đã phê duyệt" color="info" size="small" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {currency.format(tx.amount)}
                    </td>
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
            sx={{ mb: 3 }}
          />
          <TextField
            label={dialog.type === 'deposit' ? 'Mô tả' : 'Lý do rút'}
            fullWidth
            value={formValues.description}
            onChange={(event) =>
              setFormValues((prev) => ({ ...prev, description: event.target.value }))
            }
            sx={{ mb: 3 }}
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
            {submitting
              ? 'Đang xử lý...'
              : dialog.type === 'deposit'
                ? 'Thanh toán qua VNPay'
                : 'Xác nhận'}
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

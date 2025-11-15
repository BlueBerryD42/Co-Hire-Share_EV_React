import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Button } from '@/components/shared'
import { StatCard } from '@/components/vehicle'
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  Download,
  Check,
  X,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import expenseService from '@/services/expenseService'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * PaymentHistory Page - Màn hình 22: Payment History
 * Lịch sử thanh toán với timeline view và monthly summary
 */
const PaymentHistory = () => {
  const navigate = useNavigate()

  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedMethod, setSelectedMethod] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    fetchPaymentHistory()
  }, [selectedMonth, selectedMethod, selectedStatus])

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true)

      const userId = 'current-user-id' // Get from auth context
      const params = {}

      if (selectedMonth !== 'all') {
        // Calculate date range for selected month
        const [year, month] = selectedMonth.split('-')
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0)
        params.startDate = startDate.toISOString()
        params.endDate = endDate.toISOString()
      }

      if (selectedMethod !== 'all') params.method = selectedMethod
      if (selectedStatus !== 'all') params.status = selectedStatus

      const data = await expenseService.getPaymentHistory(userId, params)

      setPayments(data.payments || [])
      setSummary(data.summary || null)
    } catch (error) {
      console.error('Error fetching payment history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status) => {
    const statusMap = {
      Success: 'success',
      Failed: 'error',
      Pending: 'warning',
      Refunded: 'info',
    }
    return statusMap[status] || 'default'
  }

  const getPaymentMethodIcon = (method) => {
    // Return appropriate icon based on payment method
    return <CreditCard className="w-5 h-5" />
  }

  const groupPaymentsByMonth = (payments) => {
    const grouped = {}
    payments.forEach((payment) => {
      const monthKey = format(new Date(payment.date), 'yyyy-MM')
      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(payment)
    })
    return grouped
  }

  const groupedPayments = groupPaymentsByMonth(payments)

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary" />
            Lịch sử thanh toán
          </h1>
          <p className="text-neutral-600 mt-2">
            Theo dõi tất cả các giao dịch thanh toán của bạn
          </p>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={CreditCard}
            label="Đã thanh toán (tháng này)"
            value={(summary?.totalPaid || 0).toLocaleString()}
            unit="đ"
            variant="success"
          />
          <StatCard
            icon={Calendar}
            label="Số giao dịch"
            value={summary?.totalTransactions || 0}
            variant="primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Danh mục phổ biến"
            value={summary?.mostCommonCategory || 'N/A'}
          />
          <StatCard
            icon={Check}
            label="Tỷ lệ thành công"
            value={summary?.successRate || 0}
            unit="%"
            variant="success"
          />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tháng
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="2024-12">Tháng 12/2024</option>
                <option value="2024-11">Tháng 11/2024</option>
                <option value="2024-10">Tháng 10/2024</option>
              </select>
            </div>

            {/* Method Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phương thức
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="momo">Momo</option>
                <option value="zalopay">ZaloPay</option>
                <option value="vnpay">VNPay</option>
                <option value="bank">Ngân hàng</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Trạng thái
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="Success">Thành công</option>
                <option value="Failed">Thất bại</option>
                <option value="Pending">Đang xử lý</option>
                <option value="Refunded">Đã hoàn tiền</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Payment Timeline */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-800">
              Giao dịch ({payments.length})
            </h2>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse bg-neutral-100 h-24 rounded-md" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Chưa có giao dịch nào
              </h3>
              <p className="text-neutral-600">
                Lịch sử thanh toán của bạn sẽ hiển thị ở đây
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedPayments).map(([monthKey, monthPayments]) => (
                <div key={monthKey}>
                  {/* Month Separator */}
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-neutral-800">
                      {format(new Date(monthKey + '-01'), 'MMMM yyyy', { locale: vi })}
                    </h3>
                    <div className="flex-1 h-px bg-neutral-200" />
                    <span className="text-sm text-neutral-600">
                      {monthPayments.length} giao dịch
                    </span>
                  </div>

                  {/* Payments */}
                  <div className="space-y-3">
                    {monthPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center gap-4 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                        onClick={() => {
                          // Navigate to payment receipt or details
                        }}
                      >
                        {/* Status Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          payment.status === 'Success' ? 'bg-success/20' :
                          payment.status === 'Failed' ? 'bg-error/20' :
                          payment.status === 'Refunded' ? 'bg-info/20' :
                          'bg-warning/20'
                        }`}>
                          {payment.status === 'Success' && <Check className="w-6 h-6 text-success" />}
                          {payment.status === 'Failed' && <X className="w-6 h-6 text-error" />}
                          {payment.status === 'Refunded' && <RefreshCw className="w-6 h-6 text-info" />}
                          {payment.status === 'Pending' && <CreditCard className="w-6 h-6 text-warning" />}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold text-neutral-800">
                              {payment.description || 'Thanh toán chi phí xe'}
                            </p>
                            <Badge variant={getStatusVariant(payment.status)} size="sm">
                              {payment.status === 'Success' && 'Thành công'}
                              {payment.status === 'Failed' && 'Thất bại'}
                              {payment.status === 'Pending' && 'Đang xử lý'}
                              {payment.status === 'Refunded' && 'Đã hoàn tiền'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-neutral-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(payment.date), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </span>
                            <span className="flex items-center gap-1">
                              {getPaymentMethodIcon(payment.method)}
                              {payment.methodName || payment.method}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            payment.status === 'Success' ? 'text-success' :
                            payment.status === 'Failed' ? 'text-error' :
                            'text-neutral-800'
                          }`}>
                            {payment.amount.toLocaleString()} đ
                          </p>
                          {payment.status === 'Failed' && (
                            <Button variant="ghost" size="sm" className="mt-1">
                              Thử lại
                            </Button>
                          )}
                          {payment.status === 'Success' && (
                            <button className="text-xs text-primary hover:underline mt-1">
                              <Download className="w-3 h-3 inline mr-1" />
                              Tải hóa đơn
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default PaymentHistory

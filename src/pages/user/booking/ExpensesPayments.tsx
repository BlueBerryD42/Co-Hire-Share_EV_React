import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Badge, Button } from '@/components/shared'
import { StatCard } from '@/components/vehicle'
import {
  DollarSign,
  Receipt,
  CreditCard,
  Download,
  ArrowLeft,
  Plus,
} from 'lucide-react'
import expenseService from '@/services/expenseService'
import { bookingApi } from '@/services/booking/api'
import type { Expense } from '@/models/expense'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * ExpensesPayments Page - Màn hình 18 (Booking version): Expenses & Payments
 * Hiển thị danh sách chi phí và thanh toán liên quan đến booking
 * This is the booking-specific version with hooks to Phong's vehicle expenses
 */

interface Summary {
  totalExpenses: number
  paidAmount: number
  pendingPayments: number
  pendingCount: number
}

const ExpensesPayments = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()

  // State
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  useEffect(() => {
    if (bookingId) {
      fetchBookingExpenses()
    }
  }, [bookingId, selectedCategory, selectedStatus])

  const fetchBookingExpenses = async () => {
    try {
      setLoading(true)
      if (!bookingId) return

      // 1. Get booking details to find the vehicleId
      const booking = await bookingApi.getBooking(bookingId)
      const vehicleId = booking.vehicleId
      if (!vehicleId) {
        throw new Error('Vehicle ID not found for this booking.')
      }

      // 2. Calculate date range (optional, but good to keep)
      // We can use the booking's start and end dates for a more precise filter
      const startDate = booking.startAt;
      const endDate = booking.endAt;

      const params: any = {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      }
      
      if (selectedCategory !== 'All') {
        params.category = selectedCategory
      }
      if (selectedStatus !== 'All') {
        params.status = selectedStatus
      }

      // 3. Fetch expenses for the vehicle within the date range
      const data = await expenseService.getVehicleExpenses(vehicleId, params);

      // No need to filter by bookingId anymore, we show all vehicle expenses
      // during the booking period.
      setExpenses(data)

      // 4. Calculate summary
      const total = data.reduce((sum, exp) => sum + exp.totalAmount, 0)
      const paid = data
        .filter((exp) => exp.status === 'Paid')
        .reduce((sum, exp) => sum + exp.totalAmount, 0)
      const pending = data
        .filter((exp) => exp.status === 'Pending')
        .reduce((sum, exp) => sum + exp.totalAmount, 0)
      
      setSummary({
        totalExpenses: total,
        paidAmount: paid,
        pendingPayments: pending,
        pendingCount: data.filter((exp) => exp.status === 'Pending').length,
      })

    } catch (error) {
      console.error('Error fetching booking expenses:', error)
      setExpenses([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  // Expense categories
  const categories = [
    { value: 'All', label: 'Tất cả', icon: '📋' },
    { value: 'Fuel', label: 'Nhiên liệu', icon: '⛽' },
    { value: 'Toll', label: 'Phí cầu đường', icon: '🚧' },
    { value: 'Parking', label: 'Phí đậu xe', icon: '🅿️' },
    { value: 'Cleaning', label: 'Vệ sinh', icon: '🧼' },
    { value: 'Damage', label: 'Sửa chữa', icon: '🔧' },
    { value: 'Other', label: 'Khác', icon: '📦' },
  ]

  // Status options
  const statusOptions = [
    { value: 'All', label: 'Tất cả' },
    { value: 'Pending', label: 'Chờ thanh toán' },
    { value: 'Paid', label: 'Đã thanh toán' },
    { value: 'Overdue', label: 'Quá hạn' },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
      Pending: 'warning',
      Paid: 'success',
      Overdue: 'error',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Fuel: '⛽',
      Toll: '🚧',
      Parking: '🅿️',
      Cleaning: '🧼',
      Damage: '🔧',
      Other: '📦',
    }
    return icons[category] || '📋'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-neutral-200 rounded-lg" />
            <div className="grid grid-cols-3 gap-6">
              <div className="h-32 bg-neutral-200 rounded-lg" />
              <div className="h-32 bg-neutral-200 rounded-lg" />
              <div className="h-32 bg-neutral-200 rounded-lg" />
            </div>
            <div className="h-96 bg-neutral-200 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate(`/booking/details/${bookingId}`)}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại chi tiết booking</span>
        </button>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 flex items-center gap-3">
                <Receipt className="w-8 h-8 text-primary" />
                Chi phí & Thanh toán
              </h1>
              <p className="text-neutral-600 mt-2">
                Quản lý chi phí phát sinh trong chuyến đi
              </p>
            </div>
            <button
              onClick={() => navigate(`/booking/${bookingId}/expenses/add`)}
              className="bg-[#d5bdaf] hover:bg-[#c4ac9e] text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Thêm chi phí
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard
              icon={Receipt}
              label="Tổng chi phí"
              value={summary.totalExpenses.toLocaleString()}
              unit="đ"
              variant="primary"
              trend={undefined}
              trendValue={undefined}
            />
            <StatCard
              icon={CreditCard}
              label="Đã thanh toán"
              value={summary.paidAmount.toLocaleString()}
              unit="đ"
              variant="success"
              trend={undefined}
              trendValue={undefined}
            />
            <StatCard
              icon={DollarSign}
              label="Chờ thanh toán"
              value={summary.pendingPayments.toLocaleString()}
              unit="đ"
              trend={summary.pendingCount > 0 ? 'up' : undefined}
              trendValue={summary.pendingCount > 0 ? `${summary.pendingCount} khoản` : undefined}
              variant={summary.pendingCount > 0 ? 'warning' : 'default'}
            />
          </div>
        )}

        {/* Filters */}
        <Card onClick={() => { }} className="mb-6">
          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Danh mục
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === cat.value
                      ? 'bg-neutral-800 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Trạng thái
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedStatus === option.value
                      ? 'bg-neutral-800 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Expenses List */}
        <Card onClick={() => { }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-800">
              Danh sách chi phí
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { }}>
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">Chưa có chi phí nào</p>
              <p className="text-sm text-neutral-500 mb-6">
                Chi phí phát sinh trong chuyến đi sẽ hiển thị ở đây
              </p>
              <Button
                variant="accent"
                onClick={() => navigate(`/booking/${bookingId}/expenses/add`)}
                className="mx-auto !text-black"
              >
                <Plus className="w-5 h-5 mr-2 !text-black" />
                Thêm chi phí đầu tiên
              </Button>

            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense: any) => (
                <div
                  key={expense.id}
                  className="p-4 border border-neutral-200 rounded-lg hover:border-primary hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icon */}
                      <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                        {getCategoryIcon(expense.category || expense.expenseType)}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-800">
                            {expense.description}
                          </h3>
                          {getStatusBadge(expense.status || 'Pending')}
                        </div>
                        <p className="text-sm text-neutral-600">
                          {format(new Date(expense.date), 'dd MMM yyyy', { locale: vi })} • {expense.category}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-neutral-800">
                          {expense.totalAmount.toLocaleString()} đ
                        </p>
                        {expense.yourShare && (
                          <p className="text-sm text-neutral-600">
                            Phần của bạn: {expense.yourShare.toLocaleString()} đ
                          </p>
                        )}
                      </div>

                      {/* Payment Button for Pending expenses */}
                      {expense.status === 'Pending' && (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => navigate(`/booking/${bookingId}/payments?expenses=${expense.id}`)}
                          className="!text-black ml-4"
                        >
                          <CreditCard className="w-4 h-4 mr-2 !text-black" />
                          Thanh toán
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Bottom Actions */}
        {summary && summary.pendingPayments > 0 && (
          <div className="mt-6">
            <Card onClick={() => { }} className="bg-warning/10 border-warning">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-1">
                    Bạn có {summary.pendingCount || 0} khoản chờ thanh toán
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Tổng số tiền: {summary.pendingPayments.toLocaleString()} đ
                  </p>
                </div>
                <Button
                  variant="warning"
                  onClick={() => {
                    // Get all pending expense IDs
                    const pendingExpenseIds = expenses
                      .filter(exp => exp.status === 'Pending')
                      .map(exp => exp.id)
                      .join(',')
                    navigate(`/booking/${bookingId}/payments?expenses=${pendingExpenseIds}`)
                  }}
                >
                  Thanh toán ngay
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExpensesPayments
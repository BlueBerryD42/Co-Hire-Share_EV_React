import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Badge, Button } from '@/components/shared'
import { StatCard } from '@/components/vehicle'
import {
  DollarSign,
  Receipt,
  CreditCard,
  Calendar,
  Filter,
  Download,
  Plus,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'
import expenseService from '@/services/expenseService'
import vehicleService from '@/services/vehicleService'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * ExpensesPayments Page - Màn hình 18: Expenses & Payments
 * Hiển thị danh sách chi phí và thanh toán của xe
 */
const ExpensesPayments = () => {
  const { vehicleId } = useParams()
  const navigate = useNavigate()

  // State
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [dateRange, setDateRange] = useState('thisMonth')

  useEffect(() => {
    if (vehicleId) {
      fetchExpenses()
    }
  }, [vehicleId, selectedCategory, selectedStatus, dateRange])

  const fetchExpenses = async () => {
    try {
      setLoading(true)

      // Calculate date range
      const now = new Date()
      let startDate, endDate = now

      switch (dateRange) {
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'last3Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
          break
        case 'last6Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
          break
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }

      if (selectedCategory !== 'All') params.category = selectedCategory
      if (selectedStatus !== 'All') params.status = selectedStatus

      const [expensesData, summaryData] = await Promise.all([
        expenseService.getVehicleExpenses(vehicleId, params),
        expenseService.getExpenseSummary(vehicleId, params),
      ])

      setExpenses(expensesData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Categories từ backend (8 loại)
  const categories = [
    { value: 'All', label: 'Tất cả', icon: '📋' },
    { value: 'Charging', label: 'Sạc điện', icon: '⚡' },
    { value: 'Maintenance', label: 'Bảo trì', icon: '🔧' },
    { value: 'Insurance', label: 'Bảo hiểm', icon: '🛡️' },
    { value: 'Cleaning', label: 'Vệ sinh', icon: '🧼' },
    { value: 'Parking', label: 'Đậu xe', icon: '🅿️' },
    { value: 'Registration', label: 'Đăng ký', icon: '📄' },
    { value: 'Other', label: 'Khác', icon: '📦' },
  ]

  const statusOptions = [
    { value: 'All', label: 'Tất cả' },
    { value: 'Paid', label: 'Đã thanh toán', variant: 'success' },
    { value: 'Pending', label: 'Chờ thanh toán', variant: 'warning' },
    { value: 'Overdue', label: 'Quá hạn', variant: 'error' },
  ]

  const dateRangeOptions = [
    { value: 'thisMonth', label: 'Tháng này' },
    { value: 'last3Months', label: '3 tháng qua' },
    { value: 'last6Months', label: '6 tháng qua' },
    { value: 'thisYear', label: 'Năm nay' },
  ]

  const getStatusVariant = (status) => {
    const statusMap = {
      Paid: 'success',
      Pending: 'warning',
      Overdue: 'error',
    }
    return statusMap[status] || 'default'
  }

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category)
    return cat?.icon || '📋'
  }

  const handleExpenseClick = (expense) => {
    navigate(`/vehicles/${vehicleId}/expenses/${expense.id}`)
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/vehicles/${vehicleId}`)}
            className="flex items-center gap-2 text-neutral-700 hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại chi tiết xe</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 flex items-center gap-3">
                <Receipt className="w-8 h-8 text-primary" />
                Chi phí & Thanh toán
              </h1>
              <p className="text-neutral-600 mt-2">Quản lý chi phí và thanh toán của xe</p>
            </div>
            <Button
              variant="accent"
              onClick={() => navigate(`/vehicles/${vehicleId}/expenses/add`)}
              className="!text-black"
            >
              <Plus className="w-5 h-5 mr-2 !text-black" />
              Thêm chi phí
            </Button>

          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            icon={DollarSign}
            label="Tổng chi phí (tháng này)"
            value={(summary?.totalExpenses || 0).toLocaleString()}
            unit="đ"
            variant="primary"
          />
          <StatCard
            icon={CreditCard}
            label="Phần của bạn"
            value={(summary?.yourShare || 0).toLocaleString()}
            unit="đ"
            variant="success"
          />
          <StatCard
            icon={Calendar}
            label="Chờ thanh toán"
            value={(summary?.pendingPayments || 0).toLocaleString()}
            unit="đ"
            variant="warning"
          />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="space-y-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Khoảng thời gian
              </label>
              <div className="flex flex-wrap gap-2">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDateRange(option.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${dateRange === option.value
                      ? 'bg-neutral-800 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

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
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-800">
              Danh sách chi phí ({expenses.length})
            </h2>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse bg-neutral-100 h-20 rounded-md" />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Chưa có chi phí nào
              </h3>
              <p className="text-neutral-600 mb-6">
                Bắt đầu thêm chi phí để theo dõi tài chính của xe
              </p>
              <Button
                variant="accent"
                onClick={() => navigate(`/vehicles/${vehicleId}/expenses/add`)}
                className="border border-black !text-black"
              >
                <Plus className="w-5 h-5 mr-2 !text-black" />
                Thêm chi phí đầu tiên
              </Button>

            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  onClick={() => handleExpenseClick(expense)}
                  className="flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 rounded-md cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm">
                      {getCategoryIcon(expense.category)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-neutral-800">
                          {expense.description || expense.category}
                        </h3>
                        <Badge variant={getStatusVariant(expense.status)} size="sm">
                          {expense.status === 'Paid' && 'Đã thanh toán'}
                          {expense.status === 'Pending' && 'Chờ thanh toán'}
                          {expense.status === 'Overdue' && 'Quá hạn'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(expense.date), 'dd/MM/yyyy', { locale: vi })}
                        </span>
                        <span>{expense.category}</span>
                        {expense.hasReceipt && (
                          <span className="flex items-center gap-1 text-primary">
                            <Receipt className="w-4 h-4" />
                            Có hóa đơn
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-neutral-800">
                        {expense.totalAmount.toLocaleString()} đ
                      </div>
                      <div className="text-sm text-primary font-medium">
                        Phần bạn: {expense.yourShare.toLocaleString()} đ
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Bottom Actions */}
        {summary && summary.pendingPayments > 0 && (
          <div className="mt-6">
            <Card className="bg-warning/10 border-warning">
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
                  onClick={() => navigate(`/vehicles/${vehicleId}/payments`)}
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

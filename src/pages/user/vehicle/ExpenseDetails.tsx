import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Badge, Button } from '@/components/shared'
import {
  Receipt,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Download,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react'
import expenseService from '@/services/expenseService'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

/**
 * ExpenseDetails Page - Màn hình 19: Expense Details
 * Hiển thị chi tiết một chi phí với split breakdown và payment status
 */
const ExpenseDetails = () => {
  const { vehicleId, expenseId } = useParams()
  const navigate = useNavigate()

  const [expense, setExpense] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (expenseId) {
      fetchExpenseDetails()
    }
  }, [expenseId])

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true)
      const data = await expenseService.getExpenseById(expenseId)
      setExpense(data)
    } catch (error) {
      console.error('Error fetching expense details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-neutral-200 rounded-lg" />
            <div className="h-96 bg-neutral-200 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Receipt className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">
            Không tìm thấy chi phí
          </h2>
          <Button onClick={() => navigate(`/vehicles/${vehicleId}/expenses`)}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  const getStatusVariant = (status) => {
    const statusMap = {
      Paid: 'success',
      Pending: 'warning',
      Overdue: 'error',
    }
    return statusMap[status] || 'default'
  }

  const getCategoryIcon = (category) => {
    const icons = {
      Charging: '⚡',
      Maintenance: '🔧',
      Insurance: '🛡️',
      Cleaning: '🧼',
      Parking: '🅿️',
      Registration: '📄',
      Other: '📦',
    }
    return icons[category] || '📋'
  }

  // Data for pie chart
  const pieChartData = expense.memberShares?.map((member) => ({
    name: member.name,
    value: member.amount,
    percentage: member.percentage,
  })) || []

  const COLORS = ['#7a9aaf', '#7a9b76', '#d4a574', '#b87d6f', '#6b5a4d', '#8f7d70']

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/vehicles/${vehicleId}/expenses`)}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại danh sách chi phí</span>
        </button>

        {/* Header Card */}
        <Card className="mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center text-3xl">
                {getCategoryIcon(expense.category)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={getStatusVariant(expense.status)}>
                    {expense.category}
                  </Badge>
                  <Badge variant={getStatusVariant(expense.status)}>
                    {expense.status === 'Paid' && 'Đã thanh toán'}
                    {expense.status === 'Pending' && 'Chờ thanh toán'}
                    {expense.status === 'Overdue' && 'Quá hạn'}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-neutral-800 mb-1">
                  {expense.description || expense.category}
                </h1>
                <div className="flex items-center gap-4 text-sm text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(expense.date), 'dd MMMM yyyy', { locale: vi })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Thêm bởi {expense.addedBy || 'Admin'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="text-right">
              <p className="text-sm text-neutral-600 mb-1">Tổng chi phí</p>
              <p className="text-3xl font-bold text-primary">
                {expense.totalAmount.toLocaleString()} đ
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-neutral-200">
            {expense.status === 'Pending' && (
              <Button
                variant="accent"
                onClick={() => navigate(`/vehicles/${vehicleId}/payments?expenses=${expenseId}`)}
                className="!text-black"
              >
                <DollarSign className="w-4 h-4 mr-2 !text-black" />
                Thanh toán phần của bạn
              </Button>

            )}
            {expense.receipts && expense.receipts.length > 0 && (
              <Button variant="ghost">
                <Download className="w-4 h-4 mr-2" />
                Tải hóa đơn
              </Button>
            )}
            <Button variant="ghost">
              Chia sẻ
            </Button>
          </div>
        </Card>

        {/* Split Breakdown */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-6">
            Phân chia chi phí
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString()} đ`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Members List */}
            <div className="space-y-3">
              {expense.memberShares?.map((member, index) => (
                <div
                  key={member.userId || index}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-medium text-neutral-800">{member.name}</p>
                      <p className="text-sm text-neutral-600">
                        {member.percentage}% sở hữu
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-800">
                      {member.amount.toLocaleString()} đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Payment Status per Member */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-6">
            Trạng thái thanh toán
          </h2>

          <div className="space-y-3">
            {expense.memberShares?.map((member, index) => (
              <div
                key={member.userId || index}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">{member.name}</p>
                    <p className="text-sm text-neutral-600">
                      {member.amount.toLocaleString()} đ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {member.paymentStatus === 'Paid' ? (
                    <>
                      <Badge variant="success" size="sm">
                        <Check className="w-3 h-3 mr-1" />
                        Đã thanh toán
                      </Badge>
                      <span className="text-sm text-neutral-600">
                        {member.paymentDate && format(new Date(member.paymentDate), 'dd/MM/yyyy')}
                      </span>
                    </>
                  ) : member.paymentStatus === 'Overdue' ? (
                    <Badge variant="error" size="sm">
                      <X className="w-3 h-3 mr-1" />
                      Quá hạn
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Chờ thanh toán
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Receipts/Attachments */}
        {expense.receipts && expense.receipts.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-6">
              Hóa đơn & Tài liệu đính kèm
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {expense.receipts.map((receipt, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                >
                  <div className="aspect-square bg-neutral-100 rounded-md overflow-hidden">
                    {receipt.type === 'image' ? (
                      <img
                        src={receipt.url}
                        alt={`Receipt ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                    <Button variant="ghost" size="sm" className="text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Tải xuống
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Notes/Description */}
        {expense.notes && (
          <Card>
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Ghi chú</h2>
            <p className="text-neutral-700 leading-relaxed">{expense.notes}</p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ExpenseDetails

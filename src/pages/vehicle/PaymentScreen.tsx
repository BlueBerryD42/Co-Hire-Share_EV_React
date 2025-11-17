import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowBack, CreditCard, Security, Check } from '@mui/icons-material'
import { Card, Button, Badge } from '@/components/shared'
import expenseService from '@/services/expenseService'

/**
 * PaymentScreen Page - Màn hình 21: Payment Screen
 * Màn hình thanh toán với các phương thức: Momo, ZaloPay, VNPay, Bank Transfer
 */
const PaymentScreen = () => {
  const { vehicleId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [expenses, setExpenses] = useState([])
  const [selectedMethod, setSelectedMethod] = useState('momo')
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Payment methods (Vietnamese e-wallets)
  const paymentMethods = [
    {
      id: 'momo',
      name: 'Momo',
      logo: 'https://developers.momo.vn/v3/assets/images/square-logo.png',
      description: 'Ví điện tử Momo',
      fee: 0,
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay.png',
      description: 'Ví điện tử ZaloPay',
      fee: 0,
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      logo: 'https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png',
      description: 'Cổng thanh toán VNPay',
      fee: 0,
    },
    {
      id: 'bank',
      name: 'Chuyển khoản ngân hàng',
      logo: null,
      description: 'Chuyển khoản qua ngân hàng',
      fee: 0,
    },
  ]

  useEffect(() => {
    // Get expense IDs from URL params
    const expenseIds = searchParams.get('expenses')?.split(',') || []
    if (expenseIds.length > 0) {
      fetchExpensesToPay(expenseIds)
    }
  }, [searchParams])

  const fetchExpensesToPay = async (expenseIds) => {
    try {
      setLoading(true)
      // Fetch expense details for each ID
      const expensePromises = expenseIds.map(id => expenseService.getExpenseById(id))
      const expensesData = await Promise.all(expensePromises)
      setExpenses(expensesData)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = expenses.reduce((sum, exp) => sum + (exp.yourShare || 0), 0)
  const serviceFee = 0 // No service fee for now
  const finalAmount = totalAmount + serviceFee

  const handlePayment = async () => {
    try {
      setProcessing(true)

      // Mock payment data
      const paymentData = {
        expenseIds: expenses.map(e => e.id),
        amount: finalAmount,
        method: selectedMethod,
        returnUrl: `${window.location.origin}/vehicles/${vehicleId}/payments/success`,
        cancelUrl: `${window.location.origin}/vehicles/${vehicleId}/payments/cancel`,
      }

      const paymentResult = await expenseService.createPayment(paymentData)

      // Redirect to payment gateway
      if (paymentResult.paymentUrl) {
        window.location.href = paymentResult.paymentUrl
      } else {
        // If direct payment (bank transfer)
        navigate(`/vehicles/${vehicleId}/payments/pending`, {
          state: { paymentId: paymentResult.id }
        })
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-neutral-200 rounded-lg" />
            <div className="h-96 bg-neutral-200 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCard sx={{ fontSize: 64, color: '#d5bdaf', mb: 2 }} />
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">
            Không có khoản thanh toán nào
          </h2>
          <Button onClick={() => navigate(`/vehicles/${vehicleId}/expenses`)}>
            Quay lại danh sách chi phí
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate(`/vehicles/${vehicleId}/expenses`)}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary mb-6 transition-colors"
        >
          <ArrowBack fontSize="small" />
          <span className="font-medium">Quay lại</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Thanh toán</h1>
          <p className="text-neutral-600">Chọn phương thức thanh toán phù hợp</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Methods */}
            <Card>
              <h2 className="text-xl font-semibold text-neutral-800 mb-6">
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-5 h-5 text-primary"
                    />

                    {/* Logo */}
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-neutral-200">
                      {method.logo ? (
                        <img
                          src={method.logo}
                          alt={method.name}
                          className="max-w-full max-h-full object-contain p-2"
                        />
                      ) : (
                        <CreditCard sx={{ fontSize: 32, color: '#8f7d70' }} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-800">{method.name}</p>
                      <p className="text-sm text-neutral-600">{method.description}</p>
                      {method.fee > 0 && (
                        <p className="text-xs text-neutral-500 mt-1">
                          Phí: {method.fee.toLocaleString()} đ
                        </p>
                      )}
                    </div>

                    {/* Selected Check */}
                    {selectedMethod === method.id && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check sx={{ fontSize: 16, color: 'white' }} />
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {/* Security Notice */}
              <div className="mt-6 flex items-start gap-3 p-4 bg-neutral-50 rounded-lg">
                <Security sx={{ fontSize: 20, color: '#7a9b76', flexShrink: 0, mt: 0.5 }} />
                <div>
                  <p className="text-sm font-medium text-neutral-800">Thanh toán an toàn</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Giao dịch được bảo mật với mã hóa SSL 256-bit. Thông tin của bạn được bảo vệ tuyệt đối.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <h2 className="text-xl font-semibold text-neutral-800 mb-6">
                Tóm tắt thanh toán
              </h2>

              {/* Expenses List */}
              <div className="space-y-3 mb-6">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-800">
                        {expense.description || expense.category}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {expense.category}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-800">
                      {expense.yourShare?.toLocaleString()} đ
                    </p>
                  </div>
                ))}
              </div>

              {/* Amount Breakdown */}
              <div className="space-y-3 py-4 border-t border-neutral-200">
                <div className="flex justify-between text-neutral-700">
                  <span>Tổng phụ</span>
                  <span>{totalAmount.toLocaleString()} đ</span>
                </div>
                {serviceFee > 0 && (
                  <div className="flex justify-between text-neutral-700">
                    <span>Phí dịch vụ</span>
                    <span>{serviceFee.toLocaleString()} đ</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-neutral-800 pt-3 border-t border-neutral-200">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{finalAmount.toLocaleString()} đ</span>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                variant="accent"
                fullWidth
                size="lg"
                onClick={handlePayment}
                loading={processing}
                disabled={processing}
                className="mt-6"
              >
                {processing ? 'Đang xử lý...' : `Thanh toán ${finalAmount.toLocaleString()} đ`}
              </Button>

              {/* Terms */}
              <p className="text-xs text-neutral-600 text-center mt-4">
                Bằng việc thanh toán, bạn đồng ý với{' '}
                <a href="/terms" className="text-primary hover:underline">
                  Điều khoản dịch vụ
                </a>{' '}
                của chúng tôi
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentScreen

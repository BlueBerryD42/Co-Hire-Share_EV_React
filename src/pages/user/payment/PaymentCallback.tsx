import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material'
import { CircularProgress } from '@mui/material'
import { Alert, Button, Card } from '@/components/shared'
import { useFundBalance } from '@/hooks/useFund'
import type { UUID } from '@/models/booking'

const PaymentCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  const success = searchParams.get('success') === 'true'
  const type = searchParams.get('type') // 'fund' or 'invoice'
  const groupId = searchParams.get('groupId') as UUID | null
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')

  const { reload: reloadFundBalance } = useFundBalance(groupId || undefined)

  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      setLoading(false)

      // Reload fund balance if it's a fund deposit
      if (type === 'fund' && groupId) {
        reloadFundBalance()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [type, groupId, reloadFundBalance])

  const handleGoToFund = () => {
    if (groupId) {
      navigate(`/groups/${groupId}/fund`)
    }
  }

  const handleGoHome = () => {
    navigate('/home')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <CircularProgress size={48} sx={{ color: '#7a9aaf', mb: 2 }} />
          <p className="text-neutral-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center py-12">
          {success ? (
            <>
              <CheckCircle sx={{ fontSize: 80, color: '#7a9b76', mb: 3 }} />
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                Thanh toán thành công!
              </h1>
              {type === 'fund' && (
                <>
                  <p className="text-neutral-600 mb-4">
                    Bạn đã nạp quỹ thành công qua VNPay
                  </p>
                  {amount && (
                    <p className="text-2xl font-semibold text-primary mb-6">
                      {Number(amount).toLocaleString('vi-VN')} VND
                    </p>
                  )}
                  {orderId && (
                    <p className="text-sm text-neutral-500 mb-6">
                      Mã giao dịch: {orderId}
                    </p>
                  )}
                  <div className="flex gap-4 justify-center">
                    {groupId && (
                      <Button
                        variant="accent"
                        onClick={handleGoToFund}
                        className="!text-black"
                      >
                        Xem quỹ nhóm
                      </Button>

                    )}
                    <Button variant="outline" onClick={handleGoHome}>
                      Về trang chủ
                    </Button>
                  </div>
                </>
              )}
              {type === 'invoice' && (
                <>
                  <p className="text-neutral-600 mb-6">
                    Hóa đơn của bạn đã được thanh toán thành công
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="accent" onClick={handleGoHome}>
                      Về trang chủ
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <ErrorIcon sx={{ fontSize: 80, color: '#b87d6f', mb: 3 }} />
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                Thanh toán thất bại
              </h1>
              <p className="text-neutral-600 mb-6">
                Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
              </p>
              <div className="flex gap-4 justify-center">
                {groupId && type === 'fund' && (
                  <Button
                    variant="accent"
                    onClick={handleGoToFund}
                    className="!text-black"
                  >
                    Quay lại quỹ nhóm
                  </Button>

                )}
                <Button variant="outline" onClick={handleGoHome}>
                  Về trang chủ
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default PaymentCallback


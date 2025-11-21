import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '@/components/shared'
import { ArrowLeft, Upload, X } from 'lucide-react'
import expenseService from '@/services/expenseService'
import { bookingApi } from '@/services/booking/api'

/**
 * AddExpense for Booking - Thêm chi phí phát sinh trong chuyến đi
 * Chi phí booking: Fuel, Toll, Parking, Cleaning, Damage, Other
 */
const AddExpense = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()

  const [booking, setBooking] = useState<any>(null)
  const [formData, setFormData] = useState({
    category: 'Fuel',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
  })

  const [receipts, setReceipts] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Booking-specific categories
  const categories = [
    { value: 'Fuel', label: 'Nhiên liệu', icon: '⛽', description: 'Chi phí đổ xăng/sạc điện' },
    { value: 'Toll', label: 'Phí cầu đường', icon: '🚧', description: 'Phí cầu đường, BOT' },
    { value: 'Parking', label: 'Phí đậu xe', icon: '🅿️', description: 'Phí đậu xe' },
    { value: 'Cleaning', label: 'Vệ sinh', icon: '🧼', description: 'Chi phí rửa xe, vệ sinh' },
    { value: 'Damage', label: 'Sửa chữa', icon: '🔧', description: 'Chi phí sửa chữa hư hỏng' },
    { value: 'Other', label: 'Khác', icon: '📦', description: 'Chi phí khác' },
  ]

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      const data = await bookingApi.getBooking(bookingId!)
      setBooking(data)
    } catch (error) {
      console.error('Error fetching booking:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Validate file size (max 5MB per file)
    const maxSize = 5 * 1024 * 1024
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        alert(`File ${file.name} quá lớn (tối đa 5MB)`)
        return false
      }
      return true
    })

    setReceipts((prev) => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeReceipt = (index: number) => {
    setReceipts((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Vui lòng nhập số tiền hợp lệ'
    }

    if (!formData.date) {
      newErrors.date = 'Vui lòng chọn ngày'
    }

    if (!formData.description || formData.description.trim().length < 5) {
      newErrors.description = 'Vui lòng nhập mô tả (ít nhất 5 ký tự)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !booking) {
      return
    }

    try {
      setLoading(true)

      // Map frontend category to backend ExpenseType enum
      const categoryMap: Record<string, number> = {
        'Fuel': 0,        // Fuel
        'Toll': 8,        // Toll
        'Parking': 7,     // Parking
        'Cleaning': 4,    // Cleaning
        'Damage': 5,      // Repair
        'Other': 9,       // Other
      }

      const expenseData = {
        groupId: booking.groupId,
        vehicleId: booking.vehicleId,
        expenseType: categoryMap[formData.category] || 9,
        amount: parseFloat(formData.amount),
        description: formData.description,
        dateIncurred: new Date(formData.date).toISOString(),
        notes: formData.notes || undefined,
        isRecurring: false,
      }

      const createdExpense = await expenseService.createExpense(expenseData)

      // Upload receipts if any
      if (receipts.length > 0) {
        const formDataUpload = new FormData()
        receipts.forEach((file) => {
          formDataUpload.append('receipts', file)
        })
        await expenseService.uploadReceipt(createdExpense.id, formDataUpload)
      }

      // Navigate back to expenses list
      navigate(`/booking/${bookingId}/expenses`)
    } catch (error) {
      console.error('Error creating expense:', error)
      alert('Có lỗi xảy ra khi tạo chi phí. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = categories.find(c => c.value === formData.category)

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate(`/booking/${bookingId}/expenses`)}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại danh sách chi phí</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Thêm chi phí</h1>
          <p className="text-neutral-600">
            Thêm chi phí phát sinh trong chuyến đi #{booking?.vehiclePlateNumber || '...'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card onClick={() => { }}>
            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Loại chi phí <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <label
                    key={cat.value}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.category === cat.value
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={formData.category === cat.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="text-sm font-medium text-neutral-800">{cat.label}</span>
                  </label>
                ))}
              </div>
              {selectedCategory && (
                <p className="mt-2 text-sm text-neutral-600">{selectedCategory.description}</p>
              )}
              {errors.category && (
                <p className="mt-2 text-sm text-error">{errors.category}</p>
              )}
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Số tiền <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className={errors.amount ? 'border-error' : ''}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600">
                  đ
                </span>
              </div>
              {errors.amount && (
                <p className="mt-2 text-sm text-error">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Ngày phát sinh <span className="text-error">*</span>
              </label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'border-error' : ''}
              />
              {errors.date && (
                <p className="mt-2 text-sm text-error">{errors.date}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Mô tả <span className="text-error">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ví dụ: Đổ xăng 95 tại cây xăng ABC, 30 lít"
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.description ? 'border-error' : 'border-neutral-300'
                  }`}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-error">{errors.description}</p>
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Ghi chú thêm (tùy chọn)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Thông tin bổ sung..."
                rows={2}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Receipts Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Hóa đơn / Biên lai (tùy chọn)
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="receipt-upload"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-10 h-10 text-neutral-400" />
                  <p className="text-sm font-medium text-neutral-700">
                    Click để tải lên hình ảnh hoặc PDF
                  </p>
                  <p className="text-xs text-neutral-500">Tối đa 5MB mỗi file</p>
                </label>
              </div>

              {/* Preview Receipts */}
              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Receipt ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeReceipt(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-neutral-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/booking/${bookingId}/expenses`)}
                disabled={loading}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={loading}
                className="flex-1 !text-black"
              >
                {loading ? 'Đang tạo...' : 'Tạo chi phí'}
              </Button>

            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default AddExpense

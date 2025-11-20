import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '@/components/shared'
import { ArrowLeft, Upload, X, Plus } from 'lucide-react'
import expenseService from '@/services/expenseService'

/**
 * AddExpense Page - Màn hình 20: Add Expense
 * Form thêm chi phí mới với upload receipts và split method
 */
const AddExpense = () => {
  const { vehicleId } = useParams()
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState({
    category: 'Maintenance',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    splitMethod: 'ownership', // 'ownership' | 'usage' | 'custom'
    customSplits: [],
  })

  const [receipts, setReceipts] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Categories (8 loại từ backend)
  const categories = [
    { value: 'Charging', label: 'Sạc điện', icon: '⚡' },
    { value: 'Maintenance', label: 'Bảo trì', icon: '🔧' },
    { value: 'Insurance', label: 'Bảo hiểm', icon: '🛡️' },
    { value: 'Cleaning', label: 'Vệ sinh', icon: '🧼' },
    { value: 'Parking', label: 'Đậu xe', icon: '🅿️' },
    { value: 'Registration', label: 'Đăng ký', icon: '📄' },
    { value: 'Other', label: 'Khác', icon: '📦' },
  ]

  const splitMethods = [
    {
      value: 'ownership',
      label: 'Theo % sở hữu',
      description: 'Chia theo tỷ lệ phần trăm sở hữu (mặc định)',
    },
    {
      value: 'usage',
      label: 'Theo mức sử dụng',
      description: 'Chia theo số chuyến đã đặt trong tháng',
    },
    {
      value: 'custom',
      label: 'Tùy chỉnh',
      description: 'Nhập thủ công phần chia cho từng thành viên',
    },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)

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
        setPreviews((prev) => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeReceipt = (index) => {
    setReceipts((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors = {}

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      const expenseData = {
        vehicleId,
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        splitMethod: formData.splitMethod,
        customSplits: formData.splitMethod === 'custom' ? formData.customSplits : undefined,
      }

      const createdExpense = await expenseService.createExpense(expenseData)

      // Upload receipts if any
      if (receipts.length > 0) {
        const formData = new FormData()
        receipts.forEach((file) => {
          formData.append('receipts', file)
        })
        await expenseService.uploadReceipt(createdExpense.id, formData)
      }

      // Navigate to expense details
      navigate(`/vehicles/${vehicleId}/expenses/${createdExpense.id}`)
    } catch (error) {
      console.error('Error creating expense:', error)
      alert('Có lỗi xảy ra khi tạo chi phí. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate(`/vehicles/${vehicleId}/expenses`)}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Thêm chi phí mới</h1>
          <p className="text-neutral-600">Nhập thông tin chi phí và chọn phương thức chia</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Danh mục chi phí <span className="text-error">*</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    formData.category === cat.value
                      ? 'border-primary bg-primary/5'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-sm font-medium text-neutral-800">{cat.label}</span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-error">{errors.category}</p>
            )}
          </Card>

          {/* Amount & Date */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Chi tiết chi phí</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Số tiền"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0"
                required
                error={errors.amount}
              />
              <Input
                label="Ngày"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                error={errors.date}
              />
            </div>
          </Card>

          {/* Description */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Mô tả <span className="text-error">*</span>
            </h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả chi tiết về chi phí này..."
              rows={4}
              className={`w-full bg-neutral-50 border-2 rounded-md px-4 py-3 text-neutral-700 transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none resize-none ${
                errors.description ? 'border-error' : 'border-neutral-200'
              }`}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-error">{errors.description}</p>
            )}
          </Card>

          {/* Upload Receipts */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Hóa đơn / Chứng từ (không bắt buộc)
            </h3>

            {/* Upload Button */}
            <div className="mb-4">
              <label className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <Upload className="w-5 h-5 text-neutral-600" />
                <span className="text-neutral-700 font-medium">
                  Chọn file hoặc kéo thả vào đây
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-neutral-600 mt-2">
                Hỗ trợ: JPG, PNG, PDF (tối đa 5MB mỗi file)
              </p>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                      <img
                        src={preview}
                        alt={`Receipt ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeReceipt(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Split Method */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Phương thức chia chi phí <span className="text-error">*</span>
            </h3>
            <div className="space-y-3">
              {splitMethods.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.splitMethod === method.value
                      ? 'border-primary bg-primary/5'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="splitMethod"
                    value={method.value}
                    checked={formData.splitMethod === method.value}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{method.label}</p>
                    <p className="text-sm text-neutral-600">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Preview Split (Mock data) */}
            {formData.amount && (
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <h4 className="font-semibold text-neutral-800 mb-4">Xem trước phân chia</h4>
                <div className="space-y-2">
                  {/* Mock members */}
                  {[
                    { name: 'Bạn', percentage: 40 },
                    { name: 'Thành viên 2', percentage: 30 },
                    { name: 'Thành viên 3', percentage: 30 },
                  ].map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-md"
                    >
                      <span className="text-neutral-700">{member.name}</span>
                      <div className="text-right">
                        <span className="font-semibold text-neutral-800">
                          {((parseFloat(formData.amount) || 0) * member.percentage / 100).toLocaleString()} đ
                        </span>
                        <span className="text-sm text-neutral-600 ml-2">
                          ({member.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 sticky bottom-4 bg-neutral-50 py-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/vehicles/${vehicleId}/expenses`)}
              disabled={loading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="accent"
              loading={loading}
              disabled={loading}
              className="flex-1"
            >
              <Plus className="w-5 h-5 mr-2" />
              Thêm chi phí
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddExpense

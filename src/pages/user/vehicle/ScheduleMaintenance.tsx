import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Input, Label, Select, Textarea, Checkbox } from '@/components/shared'
import { ArrowLeft, Calendar, Wrench } from 'lucide-react'
import maintenanceService from '@/services/maintenanceService'
import vehicleService from '@/services/vehicleService'
import { ServiceType, MaintenancePriority, type ScheduleMaintenanceRequest } from '@/models/maintenance'
import { useAppSelector } from '@/store/hooks'
import { UserRole } from '@/utils/roles'

const ScheduleMaintenance = () => {
  const { id: vehicleId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAppSelector(state => state.auth)

  const [vehicle, setVehicle] = useState<any>(null)
  const [formData, setFormData] = useState<Partial<ScheduleMaintenanceRequest>>({
    vehicleId: vehicleId,
    serviceType: ServiceType.OilChange,
    priority: MaintenancePriority.Medium,
    scheduledDate: '',
    estimatedDuration: 60,
    estimatedCost: 0,
    serviceProvider: '',
    notes: '',
    forceSchedule: false, // Add forceSchedule to state
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conflictError, setConflictError] = useState<any | null>(null) // State for conflict details

  useEffect(() => {
    if (vehicleId) {
      vehicleService.getVehicleById(vehicleId)
        .then(setVehicle)
        .catch(err => console.error("Failed to fetch vehicle", err));
    }
  }, [vehicleId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const val = type === 'checkbox' ? e.target.checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    // Clear previous errors on input change
    setError(null);
    setConflictError(null);
  }
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const dateTime = value.includes('T') ? value : `${value}T09:00`;
    setFormData(prev => ({...prev, [name]: dateTime}));
    setError(null);
    setConflictError(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleId) return

    setLoading(true)
    setError(null)
    setConflictError(null)

    try {
      const submissionData: ScheduleMaintenanceRequest = {
        ...formData,
        vehicleId,
        serviceType: Number(formData.serviceType) as ServiceType,
        priority: Number(formData.priority) as MaintenancePriority,
        estimatedDuration: Number(formData.estimatedDuration),
        estimatedCost: Number(formData.estimatedCost),
        scheduledDate: new Date(formData.scheduledDate!).toISOString(),
        forceSchedule: formData.forceSchedule, // Include forceSchedule
      } as ScheduleMaintenanceRequest;

      await maintenanceService.scheduleMaintenance(submissionData)
      // TODO: Show success toast
      navigate(`/vehicles/${vehicleId}`)
    } catch (err: any) {
      console.error('Failed to schedule maintenance:', err)
      if (err.response && err.response.status === 409) {
        // Handle conflict error
        setConflictError(err.response.data);
        setError("Lịch trình bị xung đột. Vui lòng kiểm tra thông báo bên dưới.");
      } else {
        setError(err.response?.data?.message || 'Đã xảy ra lỗi khi lên lịch bảo trì.')
      }
    } finally {
      setLoading(false)
    }
  }
  
  const serviceTypeOptions = Object.entries(ServiceType)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, ' $1').trim(),
      value: value,
    }));

  const priorityOptions = Object.entries(MaintenancePriority)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({
      label: key,
      value: value,
    }));

  const isAdmin = user?.role === UserRole.SystemAdmin || user?.role === UserRole.GroupAdmin


  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/vehicles/${vehicleId}`)}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại chi tiết xe</span>
        </button>

        <Card>
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-neutral-800 flex items-center gap-3">
                <Wrench className="w-8 h-8 text-primary" />
                Lên lịch bảo trì
              </h1>
              {vehicle && <p className="text-neutral-600 mt-2">Cho xe: {vehicle.model} ({vehicle.plateNumber})</p>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="serviceType">Loại dịch vụ</Label>
                  <Select name="serviceType" id="serviceType" value={formData.serviceType} onChange={handleInputChange}>
                    {serviceTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Mức độ ưu tiên</Label>
                  <Select name="priority" id="priority" value={formData.priority} onChange={handleInputChange}>
                    {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledDate">Ngày giờ dự kiến</Label>
                <Input type="datetime-local" name="scheduledDate" id="scheduledDate" value={formData.scheduledDate} onChange={handleDateChange} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="estimatedDuration">Thời gian dự kiến (phút)</Label>
                  <Input type="number" name="estimatedDuration" id="estimatedDuration" value={formData.estimatedDuration} onChange={handleInputChange} placeholder="VD: 120" />
                </div>
                <div>
                  <Label htmlFor="estimatedCost">Chi phí dự kiến (đ)</Label>
                  <Input type="number" name="estimatedCost" id="estimatedCost" value={formData.estimatedCost} onChange={handleInputChange} placeholder="VD: 500000" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="serviceProvider">Nhà cung cấp dịch vụ</Label>
                <Input type="text" name="serviceProvider" id="serviceProvider" value={formData.serviceProvider} onChange={handleInputChange} placeholder="VD: Gara ABC" />
              </div>

              <div>
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea name="notes" id="notes" value={formData.notes} onChange={handleInputChange} rows={4} placeholder="Thêm ghi chú hoặc yêu cầu đặc biệt..."/>
              </div>

              {/* Conflict Error Display */}
              {conflictError && (
                <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
                    <p className="font-bold text-yellow-800">Cảnh báo Xung đột Lịch trình</p>
                    <p className="text-sm text-yellow-700 mt-1">{conflictError.message}</p>
                    {/* Optionally display details of conflicts */}
                </div>
              )}

              {/* Force Schedule Checkbox for Admins */}
              {conflictError && isAdmin && (
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-md">
                    <Checkbox name="forceSchedule" id="forceSchedule" checked={formData.forceSchedule} onChange={handleInputChange} />
                    <Label htmlFor="forceSchedule">Bỏ qua xung đột và vẫn lên lịch (Admin)</Label>
                </div>
              )}

              {error && <p className="text-sm text-error text-center">{error}</p>}

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={() => navigate(`/vehicles/${vehicleId}`)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" loading={loading} disabled={loading}>
                  {loading ? 'Đang lưu...' : (conflictError ? 'Thử lại' : 'Lên lịch')}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ScheduleMaintenance

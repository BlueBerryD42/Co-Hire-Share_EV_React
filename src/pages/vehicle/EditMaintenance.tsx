// src/pages/vehicle/EditMaintenance.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Input, Label, Select, Textarea } from '@/components/shared';
import { ArrowLeft, Wrench } from 'lucide-react';
import maintenanceService from '@/services/maintenanceService';
import { ServiceType, MaintenancePriority, MaintenanceSchedule } from '@/models/maintenance';
import { format } from 'date-fns';

const EditMaintenance = () => {
  const { id: vehicleId, scheduleId } = useParams<{ id: string, scheduleId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<MaintenanceSchedule>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scheduleId) {
      setLoading(true);
      maintenanceService.getScheduleById(scheduleId)
        .then(data => {
          // Format date for datetime-local input
          const formattedDate = data.scheduledDate ? format(new Date(data.scheduledDate), "yyyy-MM-dd'T'HH:mm") : '';
          setFormData({ ...data, scheduledDate: formattedDate });
        })
        .catch(err => {
            console.error("Failed to fetch maintenance schedule", err);
            setError("Không thể tải dữ liệu bảo trì.");
        })
        .finally(() => setLoading(false));
    }
  }, [scheduleId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleId) return;

    setLoading(true);
    setError(null);

    try {
      // Construct a payload with only the updatable fields
      const submissionData: Partial<MaintenanceSchedule> = {
        serviceType: Number(formData.serviceType),
        priority: Number(formData.priority),
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
        estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : undefined,
        serviceProvider: formData.serviceProvider,
        notes: formData.notes,
      };

      await maintenanceService.updateSchedule(scheduleId, submissionData);
      // TODO: Show success toast
      navigate(`/vehicles/${vehicleId}/maintenance/${scheduleId}`);
    } catch (err: any) {
      console.error('Failed to update maintenance:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật.');
    } finally {
      setLoading(false);
    }
  };

  const serviceTypeOptions = Object.entries(ServiceType)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({ label: key.replace(/([A-Z])/g, ' $1').trim(), value }));

  const priorityOptions = Object.entries(MaintenancePriority)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({ label: key, value }));

  if (!formData.id) {
      return <div className="text-center p-8">Đang tải...</div>
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/vehicles/${vehicleId}/maintenance/${scheduleId}`)}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại chi tiết</span>
        </button>

        <Card>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-neutral-800 flex items-center gap-3 mb-6">
              <Wrench className="w-8 h-8 text-primary" />
              Chỉnh sửa Lịch bảo trì
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form fields are similar to ScheduleMaintenance */}
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
                <Input type="datetime-local" name="scheduledDate" id="scheduledDate" value={formData.scheduledDate} onChange={handleInputChange} required />
              </div>
               <div>
                  <Label htmlFor="estimatedCost">Chi phí dự kiến (đ)</Label>
                  <Input type="number" name="estimatedCost" id="estimatedCost" value={formData.estimatedCost} onChange={handleInputChange} />
                </div>
              <div>
                <Label htmlFor="serviceProvider">Nhà cung cấp dịch vụ</Label>
                <Input type="text" name="serviceProvider" id="serviceProvider" value={formData.serviceProvider} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea name="notes" id="notes" value={formData.notes} onChange={handleInputChange} rows={4}/>
              </div>

              {error && <p className="text-sm text-error text-center">{error}</p>}

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={() => navigate(`/vehicles/${vehicleId}/maintenance/${scheduleId}`)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" loading={loading} disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EditMaintenance;

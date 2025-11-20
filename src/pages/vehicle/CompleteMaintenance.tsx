// src/pages/vehicle/CompleteMaintenance.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Input, Label, Textarea, Checkbox } from '@/components/shared';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import maintenanceService from '@/services/maintenanceService';
import { CompleteMaintenanceRequest } from '@/models/maintenance';

const CompleteMaintenance = () => {
  const { id: vehicleId, scheduleId } = useParams<{ id: string, scheduleId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<CompleteMaintenanceRequest>>({
    actualCost: 0,
    odometerReading: 0,
    workPerformed: '',
    partsReplaced: '',
    notes: '',
    createExpenseRecord: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    const val = isCheckbox ? e.target.checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleId) return;

    setLoading(true);
    setError(null);

    try {
        const submissionData: CompleteMaintenanceRequest = {
            ...formData,
            actualCost: Number(formData.actualCost),
            odometerReading: Number(formData.odometerReading),
        } as CompleteMaintenanceRequest;

      await maintenanceService.completeMaintenance(scheduleId, submissionData);
      // TODO: Show success toast
      navigate(`/vehicles/${vehicleId}`);
    } catch (err: any) {
      console.error('Failed to complete maintenance:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi hoàn thành bảo trì.');
    } finally {
      setLoading(false);
    }
  };

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
              <CheckCircle className="w-8 h-8 text-success" />
              Hoàn thành Bảo trì
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="actualCost">Chi phí thực tế (đ)</Label>
                  <Input type="number" name="actualCost" id="actualCost" value={formData.actualCost} onChange={handleInputChange} required />
                </div>
                 <div>
                  <Label htmlFor="odometerReading">Số KM trên đồng hồ</Label>
                  <Input type="number" name="odometerReading" id="odometerReading" value={formData.odometerReading} onChange={handleInputChange} required />
                </div>
                 <div>
                  <Label htmlFor="workPerformed">Công việc đã thực hiện</Label>
                  <Textarea name="workPerformed" id="workPerformed" value={formData.workPerformed} onChange={handleInputChange} rows={4} required placeholder="VD: Thay dầu, thay lọc gió..."/>
                </div>
                 <div>
                  <Label htmlFor="partsReplaced">Phụ tùng đã thay thế</Label>
                  <Textarea name="partsReplaced" id="partsReplaced" value={formData.partsReplaced} onChange={handleInputChange} rows={3} placeholder="VD: Lọc dầu (OEM), Lọc gió (OEM)"/>
                </div>
                <div>
                  <Label htmlFor="notes">Ghi chú thêm</Label>
                  <Textarea name="notes" id="notes" value={formData.notes} onChange={handleInputChange} rows={3} />
                </div>
                <div className="flex items-center gap-3">
                    <Checkbox name="createExpenseRecord" id="createExpenseRecord" checked={formData.createExpenseRecord} onChange={handleInputChange} />
                    <Label htmlFor="createExpenseRecord">Tự động tạo một khoản chi phí cho nhóm</Label>
                </div>


              {error && <p className="text-sm text-error text-center">{error}</p>}

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={() => navigate(`/vehicles/${vehicleId}/maintenance/${scheduleId}`)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" loading={loading} disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Hoàn thành'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompleteMaintenance;

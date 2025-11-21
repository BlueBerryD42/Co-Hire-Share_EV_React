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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    const val = isCheckbox ? e.target.checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate workPerformed
    const workPerformed = formData.workPerformed?.trim() || '';
    if (!workPerformed) {
      errors.workPerformed = 'Vui lòng nhập công việc đã thực hiện';
    } else if (workPerformed.length < 10) {
      errors.workPerformed = `Cần thêm ${10 - workPerformed.length} ký tự nữa (tối thiểu 10 ký tự)`;
    } else if (workPerformed.length > 2000) {
      errors.workPerformed = 'Mô tả quá dài (tối đa 2000 ký tự)';
    }

    // Validate actualCost
    if (!formData.actualCost || Number(formData.actualCost) <= 0) {
      errors.actualCost = 'Vui lòng nhập chi phí thực tế';
    }

    // Validate odometerReading
    if (!formData.odometerReading || Number(formData.odometerReading) <= 0) {
      errors.odometerReading = 'Vui lòng nhập số km';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleId) return;

    // Validate form before submission
    if (!validateForm()) {
      setError('Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setLoading(true);
    setError(null);

    try {
        const submissionData: CompleteMaintenanceRequest = {
            ...formData,
            actualCost: Number(formData.actualCost),
            odometerReading: Number(formData.odometerReading),
            workPerformed: formData.workPerformed?.trim() || '',
            partsReplaced: formData.partsReplaced?.trim() || '',
            notes: formData.notes?.trim() || '',
        } as CompleteMaintenanceRequest;

      console.log('🔧 [Complete] Submitting data:', submissionData);
      console.log('🔧 [Complete] WorkPerformed length:', submissionData.workPerformed.length);
      await maintenanceService.completeMaintenance(scheduleId, submissionData);
      // TODO: Show success toast
      navigate(`/vehicles/${vehicleId}`);
    } catch (err: any) {
      console.error('❌ [Complete] Failed to complete maintenance:', err);
      console.error('❌ [Complete] Response data:', err.response?.data);
      console.error('❌ [Complete] Response status:', err.response?.status);
      console.error('❌ [Complete] Full error:', JSON.stringify(err.response?.data, null, 2));
      setError(err.response?.data?.message || err.response?.data?.title || 'Đã xảy ra lỗi khi hoàn thành bảo trì.');
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
                  <Label htmlFor="actualCost">
                    Chi phí thực tế (đ) <span className="text-error">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="actualCost"
                    id="actualCost"
                    value={formData.actualCost}
                    onChange={handleInputChange}
                    required
                    min={1}
                    className={validationErrors.actualCost ? 'border-error' : ''}
                  />
                  {validationErrors.actualCost && (
                    <p className="text-sm text-error mt-1">{validationErrors.actualCost}</p>
                  )}
                </div>
                 <div>
                  <Label htmlFor="odometerReading">
                    Số KM trên đồng hồ <span className="text-error">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="odometerReading"
                    id="odometerReading"
                    value={formData.odometerReading}
                    onChange={handleInputChange}
                    required
                    min={1}
                    className={validationErrors.odometerReading ? 'border-error' : ''}
                  />
                  {validationErrors.odometerReading && (
                    <p className="text-sm text-error mt-1">{validationErrors.odometerReading}</p>
                  )}
                </div>
                 <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="workPerformed">
                      Công việc đã thực hiện <span className="text-error">*</span>
                    </Label>
                    <span className={`text-sm ${
                      (formData.workPerformed?.length || 0) < 10
                        ? 'text-error font-medium'
                        : (formData.workPerformed?.length || 0) > 2000
                        ? 'text-error font-medium'
                        : 'text-neutral-500'
                    }`}>
                      {formData.workPerformed?.length || 0} / 2000 ký tự
                      {(formData.workPerformed?.length || 0) < 10 && (
                        <span className="ml-1">(cần tối thiểu 10)</span>
                      )}
                    </span>
                  </div>
                  <Textarea
                    name="workPerformed"
                    id="workPerformed"
                    value={formData.workPerformed}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    minLength={10}
                    maxLength={2000}
                    placeholder="VD: Thay dầu động cơ 5W-30, kiểm tra hệ thống phanh, bơm căng lốp xe..."
                    className={validationErrors.workPerformed ? 'border-error' : ''}
                  />
                  {validationErrors.workPerformed && (
                    <p className="text-sm text-error mt-1">{validationErrors.workPerformed}</p>
                  )}
                </div>
                 <div>
                  <Label htmlFor="partsReplaced">Phụ tùng đã thay thế</Label>
                  <Textarea
                    name="partsReplaced"
                    id="partsReplaced"
                    value={formData.partsReplaced}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="VD: Lọc dầu (OEM), Lọc gió (OEM), 4L dầu động cơ 5W-30..."
                  />
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

// src/pages/vehicle/MaintenanceDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Dialog } from '@/components/shared';
import { ArrowLeft, Edit, Trash, CheckCircle } from 'lucide-react';
import maintenanceService from '@/services/maintenanceService';
import { MaintenanceSchedule, MaintenanceStatus, ServiceType, MaintenancePriority } from '@/models/maintenance';

const MaintenanceDetails = () => {
  const { id: vehicleId, scheduleId } = useParams<{ id: string, scheduleId: string }>();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState<MaintenanceSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    if (scheduleId) {
      setLoading(true);
      maintenanceService.getScheduleById(scheduleId)
        .then(setSchedule)
        .catch(err => console.error("Failed to fetch maintenance schedule", err))
        .finally(() => setLoading(false));
    }
  }, [scheduleId]);

  const handleCancelMaintenance = async () => {
    if (!scheduleId || !cancellationReason) {
      console.error('❌ [Cancel] Missing scheduleId or cancellationReason');
      return;
    }

    // Trim the reason and validate length
    const trimmedReason = cancellationReason.trim();
    if (trimmedReason.length < 10) {
      console.error('❌ [Cancel] Reason too short:', trimmedReason.length);
      alert('Lý do hủy phải có ít nhất 10 ký tự');
      return;
    }

    const requestData = { cancellationReason: trimmedReason };
    console.log('🗑️ [Cancel] Attempting to cancel maintenance:', scheduleId);
    console.log('🗑️ [Cancel] Request data:', requestData);
    console.log('🗑️ [Cancel] Reason length:', trimmedReason.length);

    try {
      await maintenanceService.cancelMaintenance(scheduleId, requestData);
      setCancelModalOpen(false);
      // TODO: show success toast
      navigate(`/vehicles/${vehicleId}`);
    } catch (error: any) {
      console.error('❌ [Cancel] Failed to cancel maintenance:', error);
      console.error('❌ [Cancel] Response data:', error.response?.data);
      console.error('❌ [Cancel] Response status:', error.response?.status);
      console.error('❌ [Cancel] Full error:', JSON.stringify(error.response?.data, null, 2));

      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Đã xảy ra lỗi khi hủy bảo trì';
      alert(errorMessage);
    }
  };
  
  const getServiceTypeText = (serviceType: string) => {
    const map: { [key: string]: string } = {
      'OilChange': "Thay dầu",
      'TireRotation': "Đảo lốp",
      'BrakeInspection': "Kiểm tra phanh",
      'BatteryCheck': "Kiểm tra ắc quy",
      'AirFilterReplacement': "Thay lọc gió",
      'TransmissionService': "Dịch vụ hộp số",
      'CoolantService': "Dịch vụ hệ thống làm mát",
      'WheelAlignment': "Cân chỉnh bánh xe",
      'TireReplacement': "Thay lốp",
      'EngineTuneUp': "Tinh chỉnh động cơ",
      'WiperReplacement': "Thay gạt nước",
      'LightingService': "Dịch vụ hệ thống chiếu sáng",
      'AirConditioningService': "Dịch vụ điều hòa",
      'GeneralInspection': "Kiểm tra tổng quát",
      'SuspensionService': "Dịch vụ hệ thống treo",
      'ExhaustService': "Dịch vụ hệ thống xả",
      'EVBatteryCheck': "Kiểm tra pin xe điện",
      'EVChargingSystemService': "Dịch vụ hệ thống sạc",
      'EVSoftwareUpdate': "Cập nhật phần mềm xe điện",
      'Other': "Khác",
    };
    return map[serviceType] || serviceType;
  }

  const getStatusText = (status: string) => {
    const map: { [key: string]: string } = {
      'Scheduled': "Đã lên lịch",
      'InProgress': "Đang tiến hành",
      'Completed': "Đã hoàn thành",
      'Cancelled': "Đã hủy",
      'Overdue': "Quá hạn",
    };
    return map[status] || status;
  }

  const getPriorityText = (priority: string) => {
    const map: { [key: string]: string } = {
        'Low': "Thấp",
        'Medium': "Trung bình",
        'High': "Cao",
        'Critical': "Khẩn cấp",
    };
    return map[priority] || priority;
  }

  if (loading) {
    return <div className="text-center p-8">Đang tải chi tiết bảo trì...</div>;
  }

  if (!schedule) {
    return <div className="text-center p-8">Không tìm thấy lịch bảo trì.</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/vehicles/${vehicleId}`)}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại Chi tiết xe</span>
        </button>
        
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-800">
                  Chi tiết Bảo trì
                </h1>
                <p className="text-neutral-600 mt-1">
                  {getServiceTypeText(schedule.serviceType as unknown as string)} - {new Date(schedule.scheduledDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/vehicles/${vehicleId}/maintenance/${scheduleId}/edit`)}>
                  <Edit className="w-4 h-4 mr-2"/> Sửa
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setCancelModalOpen(true)}>
                  <Trash className="w-4 h-4 mr-2"/> Hủy
                </Button>
              </div>
            </div>

            <div className="space-y-4 py-6 border-t border-b border-neutral-200">
                <p><strong>Loại dịch vụ:</strong> {getServiceTypeText(schedule.serviceType as unknown as string)}</p>
                <p><strong>Ngày dự kiến:</strong> {new Date(schedule.scheduledDate).toLocaleString('vi-VN')}</p>
                <p><strong>Trạng thái:</strong> {getStatusText(schedule.status as unknown as string)}</p>
                <p><strong>Ưu tiên:</strong> {getPriorityText(schedule.priority as unknown as string)}</p>
                <p><strong>Nhà cung cấp:</strong> {schedule.serviceProvider || 'Chưa có'}</p>
                <p><strong>Chi phí dự kiến:</strong> {schedule.estimatedCost?.toLocaleString() || 'Chưa có'} đ</p>
                <p><strong>Ghi chú:</strong> {schedule.notes || 'Không có'}</p>
            </div>
            
            <div className="mt-6">
                <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => navigate(`/vehicles/${vehicleId}/maintenance/${scheduleId}/complete`)}>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Đánh dấu là Hoàn thành
                </Button>
            </div>
          </div>
        </Card>
      </div>

      <Dialog isOpen={isCancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Xác nhận Hủy">
          <div className="p-4">
            <p className="mb-4">Bạn có chắc chắn muốn hủy lịch bảo trì này không? Hành động này không thể hoàn tác.</p>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700">
                  Lý do hủy <span className="text-error">*</span>
                </label>
                <span className={`text-sm ${
                  (cancellationReason?.length || 0) < 10
                    ? 'text-error font-medium'
                    : 'text-neutral-500'
                }`}>
                  {cancellationReason?.length || 0} / 500 ký tự
                  {(cancellationReason?.length || 0) < 10 && (
                    <span className="ml-1">(cần tối thiểu 10)</span>
                  )}
                </span>
              </div>
              <textarea
                className={`w-full p-2 border rounded-md ${
                  cancellationReason && cancellationReason.length > 0 && cancellationReason.length < 10
                    ? 'border-error'
                    : 'border-neutral-300'
                }`}
                rows={3}
                placeholder="VD: Đã tìm được garage khác có giá tốt hơn, hoặc hoãn lại do lịch trình..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                minLength={10}
                maxLength={500}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
                <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>Không</Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelMaintenance}
                  disabled={!cancellationReason || cancellationReason.trim().length < 10}
                >
                  Có, Hủy
                </Button>
            </div>
          </div>
      </Dialog>
    </div>
  );
};

export default MaintenanceDetails;

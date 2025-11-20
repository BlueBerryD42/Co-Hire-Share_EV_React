import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Badge, Button } from '@/components/shared'
import { StatCard } from '@/components/vehicle'
import { useAppSelector } from '@/store/hooks';
import { groupApi } from '@/services/group/groups';
import {
  Car,
  Calendar,
  DollarSign,
  Gauge,
  Battery,
  ArrowLeft,
  Wrench,
  FileText,
  TrendingUp,
  Users, // Make sure Users is imported
  MapPin, // Make sure MapPin is imported
  Upload,
  Download,
  Eye,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import vehicleService from '@/services/vehicleService';
import maintenanceService from '@/services/maintenanceService';
import vehicleDocumentService from '@/services/vehicle/vehicleDocuments';
import UploadVehicleDocumentDialog from '@/components/vehicle/UploadVehicleDocumentDialog';
import { Chip, IconButton, Alert, Snackbar } from '@mui/material';
import { formatFileSize } from '@/models/document';
import StatusBadge from '@/components/shared/StatusBadge';

/**
 * VehicleDetails Page - Màn hình 11: Vehicle Details
 * Hiển thị chi tiết xe với tabs: Usage Stats, Maintenance, Documents, Bookings
 */
const VehicleDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // State
  const [vehicle, setVehicle] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [healthScore, setHealthScore] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // overview, stats, maintenance, documents, bookings
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [resubmitting, setResubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const { user } = useAppSelector((state) => state.auth);
  const [ownershipPercentage, setOwnershipPercentage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchVehicleDetails()
    }
  }, [id])

  const [groupStatus, setGroupStatus] = useState<string | null>(null);

  // New useEffect to fetch group details and find ownership
  useEffect(() => {
    const fetchOwnership = async () => {
      if (vehicle?.groupId && user?.id) {
        try {
          const group = await groupApi.getGroup(vehicle.groupId);
          setGroupStatus(group.status); // Store group status
          const currentUserMember = group.members.find(m => m.userId === user.id);
          if (currentUserMember) {
            // Backend provides sharePercentage as a decimal (e.g., 0.25 for 25%)
            setOwnershipPercentage(currentUserMember.sharePercentage * 100);
          }
        } catch (err) {
          console.error("Failed to fetch group details for ownership:", err);
        }
      }
    };

    fetchOwnership();
  }, [vehicle, user]);
  
  const fetchVehicleDetails = async () => {
    try {
      setLoading(true)

      // Fetch vehicle details, statistics, and health score in parallel
      // Use Promise.allSettled to allow partial failures
      const [vehicleResult, statsResult, healthResult] = await Promise.allSettled([
        vehicleService.getVehicleById(id),
        vehicleService.getVehicleStatistics(id, {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          includeBenchmarks: true,
        }),
        vehicleService.getHealthScore(id, {
          includeHistory: true,
          includeBenchmark: true,
        }),
      ])

      // Set data if successful, otherwise log error
      if (vehicleResult.status === 'fulfilled') {
        setVehicle(vehicleResult.value)
      } else {
        console.error('Error fetching vehicle:', vehicleResult.reason)
      }

      if (statsResult.status === 'fulfilled') {
        setStatistics(statsResult.value)
      } else {
        console.error('Error fetching statistics:', statsResult.reason)
      }

      if (healthResult.status === 'fulfilled') {
        setHealthScore(healthResult.value)
      } else {
        console.error('Error fetching health score:', healthResult.reason)
        // Set default health score to prevent UI errors
        setHealthScore({
          overallScore: 0,
          category: 'Unknown',
          message: 'Không thể tải điểm sức khỏe xe',
        })
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-neutral-200 rounded-lg" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-32 bg-neutral-200 rounded-md" />
              <div className="h-32 bg-neutral-200 rounded-md" />
              <div className="h-32 bg-neutral-200 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Không tìm thấy xe</h2>
          <Button onClick={() => navigate('/vehicles')}>Quay lại danh sách</Button>
        </div>
      </div>
    )
  }

  // Mock images for carousel (replace with actual images)
  // Use placehold.co instead of via.placeholder.com (more reliable)
  const vehicleImages = vehicle.images || [
    'https://placehold.co/800x500/e5e7eb/6b7280?text=Vehicle+Front',
    'https://placehold.co/800x500/e5e7eb/6b7280?text=Vehicle+Back',
    'https://placehold.co/800x500/e5e7eb/6b7280?text=Vehicle+Left',
    'https://placehold.co/800x500/e5e7eb/6b7280?text=Vehicle+Right',
  ]

  const handleResubmit = async () => {
    if (!vehicle?.id) return
    
    try {
      setResubmitting(true)
      await vehicleService.resubmitVehicle(vehicle.id)
      setSnackbar({
        open: true,
        message: 'Đã gửi lại yêu cầu phê duyệt thành công',
        severity: 'success',
      })
      // Refresh vehicle data
      await fetchVehicleDetails()
    } catch (error: any) {
      console.error('Error resubmitting vehicle:', error)
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể gửi lại yêu cầu',
        severity: 'error',
      })
    } finally {
      setResubmitting(false)
    }
  }

  const isPendingOrRejected = vehicle?.status === 'PendingApproval' || vehicle?.status === 'Rejected'
  const isGroupInactive = groupStatus && groupStatus !== 'Active'
  const canBook = vehicle?.status === 'Available' && !isGroupInactive && !isPendingOrRejected

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-primary'
    if (score >= 40) return 'text-warning'
    return 'text-error'
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: Car },
    { id: 'stats', label: 'Thống kê', icon: TrendingUp },
    { id: 'maintenance', label: 'Bảo trì', icon: Wrench },
    { id: 'documents', label: 'Tài liệu', icon: FileText },
    { id: 'bookings', label: 'Lịch đặt', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/vehicles')}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại danh sách xe</span>
        </button>

        {/* Hero Section - Image Carousel */}
        <Card padding="none" className="mb-6 overflow-hidden">
          <div className="relative">
            {/* Main Image */}
            <div className="relative h-96 bg-neutral-200">
              <img
                src={vehicleImages[currentImageIndex]}
                alt={`${vehicle.model} ${vehicle.year}`}
                className="w-full h-full object-cover"
              />

              {/* Status Badge Overlay */}
              <div className="absolute top-4 right-4">
                <StatusBadge status={vehicle.status} size="medium" />
              </div>

              {/* Navigation Arrows */}
              {vehicleImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? vehicleImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                  >
                    <ArrowLeft className="w-6 h-6 text-neutral-700" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === vehicleImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                  >
                    <ArrowLeft className="w-6 h-6 text-neutral-700 rotate-180" />
                  </button>
                </>
              )}

              {/* Image Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {vehicleImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === index ? 'bg-white w-8' : 'bg-white/60'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                    {vehicle.model} {vehicle.year}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-neutral-600">
                    <span className="flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      Biển số: {vehicle.plateNumber}
                    </span>
                    <span className="flex items-center gap-2">
                      <Gauge className="w-4 h-4" />
                      VIN: {vehicle.vin}
                    </span>
                    {vehicle.color && (
                      <span className="flex items-center gap-2">
                        Màu: {vehicle.color}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {vehicle.status === 'Rejected' && (
                    <Button
                      variant="outlined"
                      startIcon={<RefreshCw />}
                      onClick={handleResubmit}
                      disabled={resubmitting}
                      sx={{ borderColor: '#7a9b76', color: '#7a9b76' }}
                    >
                      {resubmitting ? 'Đang gửi...' : 'Gửi lại phê duyệt'}
                    </Button>
                  )}
                  <Button
                    className="bg-black text-white hover:bg-neutral-800"
                    onClick={() => navigate(`/booking/create?vehicleId=${id}`)}
                    disabled={!canBook}
                    title={
                      !canBook 
                        ? isGroupInactive 
                          ? 'Nhóm của xe này chưa được phê duyệt hoặc không hoạt động. Không thể đặt lịch.'
                          : isPendingOrRejected
                            ? 'Xe này đang chờ phê duyệt hoặc đã bị từ chối. Không thể đặt lịch.'
                            : 'Chỉ có thể đặt lịch cho xe sẵn sàng'
                        : ''
                    }
                  >
                    Đặt lịch ngay
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Rejection Reason Alert */}
        {vehicle.status === 'Rejected' && vehicle.rejectionReason && (
          <Alert 
            severity="error" 
            icon={<AlertCircle />}
            sx={{ mb: 4 }}
            action={
              <Button
                size="small"
                onClick={handleResubmit}
                disabled={resubmitting}
                startIcon={<RefreshCw />}
              >
                Gửi lại
              </Button>
            }
          >
            <div>
              <strong>Xe đã bị từ chối:</strong>
              <p className="mt-1">{vehicle.rejectionReason}</p>
              {vehicle.reviewedAt && (
                <p className="text-xs mt-1 opacity-75">
                  Ngày xem xét: {new Date(vehicle.reviewedAt).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </Alert>
        )}

        {/* Pending Approval Alert */}
        {vehicle.status === 'PendingApproval' && (
          <Alert severity="warning" sx={{ mb: 4 }}>
            Xe của bạn đang chờ được phê duyệt bởi nhân viên. Bạn sẽ nhận được thông báo khi có kết quả.
            {vehicle.submittedAt && (
              <p className="text-xs mt-1 opacity-75">
                Đã gửi: {new Date(vehicle.submittedAt).toLocaleDateString('vi-VN')}
              </p>
            )}
          </Alert>
        )}

        {/* Group Inactive Alert */}
        {isGroupInactive && (
          <Alert severity="warning" sx={{ mb: 4 }}>
            <div>
              <strong>Nhóm của xe này chưa được phê duyệt hoặc không hoạt động:</strong>
              <p className="mt-1">
                {groupStatus === 'PendingApproval' && 'Nhóm đang chờ được phê duyệt bởi nhân viên.'}
                {groupStatus === 'Rejected' && 'Nhóm đã bị từ chối.'}
                {groupStatus === 'Inactive' && 'Nhóm đã tạm ngưng hoạt động.'}
                {groupStatus === 'Dissolved' && 'Nhóm đã giải thể.'}
                {' '}Xe không thể được đặt lịch cho đến khi nhóm được phê duyệt và hoạt động.
              </p>
            </div>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={Users}
            label="Phần sở hữu của bạn"
            value={ownershipPercentage.toFixed(0)}
            unit="%"
            variant="primary"
          />
          <StatCard
            icon={Gauge}
            label="Số km đã đi"
            value={(vehicle.odometer || 0).toLocaleString()}
            unit="km"
          />
          <StatCard
            icon={Battery}
            label="Điểm sức khỏe"
            value={healthScore?.overallScore ?? 'N/A'}
            variant={
              !healthScore ? 'default' :
                healthScore.overallScore >= 80 ? 'success' :
                  healthScore.overallScore >= 60 ? 'primary' :
                    healthScore.overallScore >= 40 ? 'warning' : 'error'
            }
          />
          <StatCard
            icon={DollarSign}
            label="Chi phí (30 ngày qua)"
            value={statistics?.efficiency?.totalCosts?.toLocaleString() || 0}
            unit="đ"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button
            variant="primary"
            onClick={() => navigate(`/vehicles/${id}/expenses`)}
            className="w-full"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Chi phí & Thanh toán
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/vehicles/${id}/payments/history`)}
            className="w-full"
          >
            <FileText className="w-5 h-5 mr-2" />
            Lịch sử thanh toán
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/vehicles/${id}/analytics`)}
            className="w-full"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Phân tích chi phí
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-neutral-200">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-neutral-600 hover:text-neutral-800'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab vehicle={vehicle} healthScore={healthScore} />}
          {activeTab === 'stats' && <StatsTab statistics={statistics} />}
          {activeTab === 'maintenance' && <MaintenanceTab vehicleId={id} groupStatus={groupStatus} />}
          {activeTab === 'documents' && <DocumentsTab vehicleId={id} groupId={vehicle?.groupId} />}
          {activeTab === 'bookings' && <BookingsTab vehicleId={id} />}
        </div>
      </div>
    </div>
  )
}

// Overview Tab Component
const OverviewTab = ({ vehicle, healthScore }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Vehicle Specs */}
    <Card>
      <h3 className="text-xl font-semibold text-neutral-800 mb-4">Thông số kỹ thuật</h3>
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b border-neutral-200">
          <span className="text-neutral-600">Hãng xe</span>
          <span className="font-semibold text-neutral-800">{vehicle.model.split(' ')[0]}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-neutral-200">
          <span className="text-neutral-600">Dòng xe</span>
          <span className="font-semibold text-neutral-800">{vehicle.model}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-neutral-200">
          <span className="text-neutral-600">Năm sản xuất</span>
          <span className="font-semibold text-neutral-800">{vehicle.year}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-neutral-200">
          <span className="text-neutral-600">Biển số</span>
          <span className="font-semibold text-neutral-800">{vehicle.plateNumber}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-neutral-200">
          <span className="text-neutral-600">Số VIN</span>
          <span className="font-semibold text-neutral-800 text-sm">{vehicle.vin}</span>
        </div>
        {vehicle.color && (
          <div className="flex justify-between py-2 border-b border-neutral-200">
            <span className="text-neutral-600">Màu sắc</span>
            <span className="font-semibold text-neutral-800">{vehicle.color}</span>
          </div>
        )}
        <div className="flex justify-between py-2">
          <span className="text-neutral-600">Số km hiện tại</span>
          <span className="font-semibold text-neutral-800">{vehicle.odometer?.toLocaleString()} km</span>
        </div>
      </div>
    </Card>

    {/* Health Score Breakdown */}
    <Card>
      <h3 className="text-xl font-semibold text-neutral-800 mb-4">Điểm sức khỏe xe</h3>
      {healthScore ? (
        <div className="space-y-4">
          {/* Overall Score */}
          <div className="text-center py-6 bg-neutral-50 rounded-lg">
            <div className="text-5xl font-bold text-primary mb-2">
              {healthScore.overallScore}
            </div>
            <div className="text-lg text-neutral-600">
              {healthScore.category === 'Excellent' && 'Xuất sắc'}
              {healthScore.category === 'Good' && 'Tốt'}
              {healthScore.category === 'Fair' && 'Trung bình'}
              {healthScore.category === 'Poor' && 'Kém'}
              {healthScore.category === 'Critical' && 'Nguy hiểm'}
            </div>
          </div>

          {/* Breakdown */}
          {healthScore.breakdown && Array.isArray(healthScore.breakdown) && (
            <div className="space-y-3">
              {healthScore.breakdown.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-700">{item.component}</span>
                    <span className="font-semibold">{item.score}/{item.maxScore}</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {healthScore.recommendations && healthScore.recommendations.length > 0 && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h4 className="font-semibold text-neutral-800 mb-3">Khuyến nghị</h4>
              <ul className="space-y-2">
                {healthScore.recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                    <span className="text-primary mt-1">•</span>
                    <span>{rec.recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Battery className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-neutral-600 mb-1">N/A</p>
          <p className="text-sm text-neutral-500">Chưa có dữ liệu</p>
          <p className="text-xs text-neutral-400 mt-2">
            Điểm sức khỏe sẽ được tính sau khi xe có dữ liệu bảo trì và sử dụng
          </p>
        </div>
      )}
    </Card>
  </div>
)

// Stats Tab Component
const StatsTab = ({ statistics }) => (
  <div className="space-y-6">
    <Card>
      <h3 className="text-xl font-semibold text-neutral-800 mb-4">Thống kê sử dụng (30 ngày qua)</h3>
      {statistics?.usage ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-neutral-600 mb-2">Tổng số chuyến</p>
            <p className="text-3xl font-bold text-neutral-800">{statistics.usage.totalTrips}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 mb-2">Tổng quãng đường</p>
            <p className="text-3xl font-bold text-neutral-800">
              {statistics.usage.totalDistance?.toLocaleString()} km
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 mb-2">Tổng thời gian</p>
            <p className="text-3xl font-bold text-neutral-800">
              {statistics.usage.totalHours?.toFixed(1)} giờ
            </p>
          </div>
        </div>
      ) : (
        <p className="text-neutral-600">Chưa có dữ liệu thống kê</p>
      )}
    </Card>
  </div>
)

// Maintenance Tab Component
const MaintenanceTab = ({ vehicleId, groupStatus }) => {
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([])
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null); // Add error state
  
  const isGroupInactive = groupStatus && groupStatus !== 'Active'

  const fetchMaintenanceData = async () => {
    try {
      setLoading(true)
      setError(null); // Reset error on new fetch
      const [scheduleData, historyData] = await Promise.all([
        maintenanceService.getVehicleMaintenanceSchedule(vehicleId, { pageNumber: 1, pageSize: 20 }),
        maintenanceService.getVehicleMaintenanceHistory(vehicleId, { pageNumber: 1, pageSize: 20 }),
      ])
      
      // --- DEBUG LOGGING ---
      console.log("DEBUG: Raw Schedule Data:", scheduleData);
      console.log("DEBUG: Raw History Data:", historyData);
      // --- END DEBUG LOGGING ---

              setSchedules(scheduleData?.items || [])
              setRecords(historyData?.items || [])
    } catch (err: any) {
      console.error("Error fetching maintenance data:", err)
      setError(err.response?.data?.message || "Không thể tải dữ liệu bảo trì. Vui lòng thử lại.");
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (vehicleId) {
      fetchMaintenanceData()
    }
  }, [vehicleId])
  
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
    return map[serviceType] || serviceType; // Fallback to raw string if not found
  }

  const getStatusText = (status: string) => {
    const map: { [key: string]: { text: string, color: string } } = {
      'Scheduled': { text: "Đã lên lịch", color: "text-blue-600" },
      'InProgress': { text: "Đang tiến hành", color: "text-primary" },
      'Completed': { text: "Đã hoàn thành", color: "text-success" },
      'Cancelled': { text: "Đã hủy", color: "text-neutral-500" },
      'Overdue': { text: "Quá hạn", color: "text-error" },
    };
    return map[status] || { text: "Không xác định", color: "text-neutral-500" };
  }


  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-24 bg-neutral-200 rounded"></div>
          <div className="h-8 bg-neutral-200 rounded w-1/3 mt-6"></div>
          <div className="h-24 bg-neutral-200 rounded"></div>
        </div>
      </Card>
    )
  }

  // Display error message if fetching fails
  if (error) {
    return (
        <Card>
            <div className="text-center py-8">
                <p className="text-error font-semibold">Đã xảy ra lỗi</p>
                <p className="text-neutral-600 mt-2">{error}</p>
                <Button onClick={fetchMaintenanceData} className="mt-4">Thử lại</Button>
            </div>
        </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Action Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => navigate(`/vehicles/${vehicleId}/maintenance/create`)}
          disabled={isGroupInactive}
          title={
            isGroupInactive 
              ? 'Nhóm của xe này chưa được phê duyệt hoặc không hoạt động. Không thể lên lịch bảo trì.'
              : ''
          }
        >
          <Wrench className="w-4 h-4 mr-2" />Lên lịch bảo trì mới
        </Button>
      </div>

      {/* Upcoming Schedules */}
      <Card>
        <h3 className="text-xl font-semibold text-neutral-800 mb-4">Lịch trình sắp tới</h3>
        {schedules.length > 0 ? (
          <ul className="divide-y divide-neutral-200">
            {schedules.map(item => {
              console.log("DEBUG: Rendering schedule item:", item); // Add debug log for each item
              return (
              <li 
                key={item.id} 
                className="py-4 flex justify-between items-center cursor-pointer hover:bg-neutral-50"
                onClick={() => navigate(`/vehicles/${vehicleId}/maintenance/${item.id}`)}
              >
                <div>
                  <p className="font-semibold text-neutral-800">{getServiceTypeText(item.serviceType)}</p>
                  <p className="text-sm text-neutral-600">
                    {new Date(item.scheduledDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${getStatusText(item.status).color}`}>
                    {getStatusText(item.status).text}
                  </span>
                </div>
              </li>
            )})}
          </ul>
        ) : (
          <p className="text-neutral-600 text-center py-8">Không có lịch trình bảo trì nào sắp tới.</p>
        )}
      </Card>

      {/* Completed History */}
      <Card>
        <h3 className="text-xl font-semibold text-neutral-800 mb-4">Lịch sử đã hoàn thành</h3>
        {records.length > 0 ? (
          <ul className="divide-y divide-neutral-200">
            {records.map(item => (
              <li key={item.id} className="py-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-neutral-800">{getServiceTypeText(item.serviceType)}</p>
                  <p className="text-sm text-neutral-600">
                    {new Date(item.serviceDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500">Chi phí</p>
                    <p className="font-medium text-neutral-700">{item.actualCost.toLocaleString()} đ</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Số km</p>
                    <p className="font-medium text-neutral-700">{item.odometerReading.toLocaleString()} km</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-600 text-center py-8">Chưa có lịch sử bảo trì nào.</p>
        )}
      </Card>
    </div>
  )
}

// Documents Tab Component
const DocumentsTab = ({ vehicleId, groupId }) => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const fetchDocuments = useCallback(async () => {
    if (!vehicleId || !groupId) {
      setLoading(false)
      setError('Thiếu thông tin xe hoặc nhóm')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('Fetching vehicle documents:', { vehicleId, groupId })
      const docs = await vehicleDocumentService.getVehicleDocuments(groupId, vehicleId)
      console.log('Fetched documents:', docs)
      setDocuments(docs || [])
    } catch (error: any) {
      console.error('Error fetching vehicle documents:', error)
      setError(error?.response?.data?.message || 'Không thể tải tài liệu xe')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [vehicleId, groupId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleDownload = async (documentId) => {
    try {
      const blob = await vehicleDocumentService.downloadVehicleDocument(documentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = documents.find(d => d.id === documentId)?.fileName || 'document'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setSnackbar({
        open: true,
        message: 'Đã tải xuống tài liệu thành công',
        severity: 'success',
      })
    } catch (error: any) {
      console.error('Error downloading document:', error)
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải xuống tài liệu',
        severity: 'error',
      })
    }
  }

  const handleView = async (documentId) => {
    try {
      const doc = documents.find(d => d.id === documentId)
      if (!doc) {
        throw new Error('Document not found')
      }

      // Try preview first, fallback to download if preview fails
      try {
        const blob = await vehicleDocumentService.previewVehicleDocument(documentId)
        const url = window.URL.createObjectURL(blob)
        
        // Check file type
        const fileExtension = doc.fileName.split('.').pop()?.toLowerCase()
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')
        const isPDF = fileExtension === 'pdf'

        if (isImage || isPDF) {
          // Open in new tab for images and PDFs
          const newWindow = window.open(url, '_blank')
          if (!newWindow) {
            // Popup blocked, try download instead
            const a = document.createElement('a')
            a.href = url
            a.download = doc.fileName
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
            setSnackbar({
              open: true,
              message: 'Đã tải xuống tài liệu (popup bị chặn)',
              severity: 'warning',
            })
          } else {
            setSnackbar({
              open: true,
              message: 'Đang mở tài liệu...',
              severity: 'success',
            })
            // Clean up URL after a delay
            setTimeout(() => window.URL.revokeObjectURL(url), 1000)
          }
        } else {
          // For other file types, download instead
          const a = document.createElement('a')
          a.href = url
          a.download = doc.fileName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
          setSnackbar({
            open: true,
            message: 'Đã tải xuống tài liệu',
            severity: 'success',
          })
        }
      } catch (previewError) {
        // If preview fails, try download instead
        console.warn('Preview failed, trying download:', previewError)
        await handleDownload(documentId)
      }
    } catch (error: any) {
      console.error('Error viewing document:', error)
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || error?.message || 'Không thể xem tài liệu. Vui lòng thử tải xuống.',
        severity: 'error',
      })
    }
  }

  const getDocumentTypeLabel = (doc) => {
    const type = vehicleDocumentService.getVehicleDocumentType(doc)
    switch (type) {
      case 'Registration':
        return 'Giấy đăng ký xe'
      case 'Insurance':
        return 'Bảo hiểm xe'
      case 'Image':
        return 'Hình ảnh xe'
      default:
        return 'Khác'
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-neutral-600">Đang tải tài liệu...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4">{error}</p>
          {groupId && vehicleId && (
            <Button
              variant="outlined"
              onClick={fetchDocuments}
            >
              Thử lại
            </Button>
          )}
          {!groupId && (
            <p className="text-sm text-neutral-500 mt-2">
              Xe này chưa được gán vào nhóm. Vui lòng liên hệ quản trị viên.
            </p>
          )}
        </div>
      </Card>
    )
  }

  if (!groupId) {
    return (
      <Card>
        <div className="p-8 text-center">
          <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 mb-2">Xe này chưa được gán vào nhóm</p>
          <p className="text-sm text-neutral-500">
            Không thể hiển thị tài liệu vì xe chưa thuộc nhóm nào.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-neutral-800">Tài liệu xe</h3>
          {groupId && (
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{ bgcolor: '#7a9b76', '&:hover': { bgcolor: '#6a8b66' } }}
            >
              Tải lên tài liệu
            </Button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 mb-4">Chưa có tài liệu nào</p>
            {groupId && (
              <Button
                variant="outlined"
                onClick={() => setUploadDialogOpen(true)}
              >
                Tải lên tài liệu đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50"
              >
                <div className="flex items-center gap-4 flex-1">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{doc.fileName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Chip
                        label={getDocumentTypeLabel(doc)}
                        size="small"
                        sx={{ height: 20, fontSize: '0.75rem' }}
                      />
                      <span className="text-sm text-neutral-500">
                        {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IconButton
                    size="small"
                    onClick={() => handleView(doc.id)}
                    title="Xem"
                  >
                    <Eye className="w-5 h-5" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(doc.id)}
                    title="Tải xuống"
                  >
                    <Download className="w-5 h-5" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {groupId && (
          <UploadVehicleDocumentDialog
            open={uploadDialogOpen}
            onClose={() => setUploadDialogOpen(false)}
            groupId={groupId}
            vehicleId={vehicleId}
            onSuccess={() => {
              fetchDocuments()
              setUploadDialogOpen(false)
              setSnackbar({
                open: true,
                message: 'Đã tải lên tài liệu thành công',
                severity: 'success',
              })
            }}
          />
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </Card>
  )
}

// Bookings Tab Component
const BookingsTab = ({ vehicleId }) => (
  <Card>
    <h3 className="text-xl font-semibold text-neutral-800 mb-4">Lịch sử đặt xe</h3>
    <p className="text-neutral-600">Đang phát triển...</p>
  </Card>
)

export default VehicleDetails

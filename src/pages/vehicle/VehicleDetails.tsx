import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Badge, Button } from '@/components/shared'
import { StatCard } from '@/components/vehicle'
import {
  Car,
  Calendar,
  DollarSign,
  Gauge,
  Battery,
  ArrowLeft,
  MapPin,
  Users,
  Wrench,
  FileText,
  TrendingUp,
} from 'lucide-react'
import vehicleService from '@/services/vehicleService'

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

  useEffect(() => {
    if (id) {
      fetchVehicleDetails()
    }
  }, [id])

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

  const getStatusVariant = (status) => {
    const statusMap = {
      Available: 'success',
      InUse: 'primary',
      Maintenance: 'warning',
      Unavailable: 'error',
    }
    return statusMap[status] || 'default'
  }

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
                <Badge variant={getStatusVariant(vehicle.status)} size="lg">
                  {vehicle.status === 'Available' && 'Sẵn sàng'}
                  {vehicle.status === 'InUse' && 'Đang sử dụng'}
                  {vehicle.status === 'Maintenance' && 'Đang bảo trì'}
                  {vehicle.status === 'Unavailable' && 'Không khả dụng'}
                </Badge>
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
                <Button
                  className="bg-black text-white hover:bg-neutral-800"
                  onClick={() => navigate(`/booking/create?vehicleId=${id}`)}
                >
                  Đặt lịch ngay
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={Users}
            label="Phần sở hữu của bạn"
            value={vehicle.ownershipPercentage || 0}
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
            value={healthScore?.overallScore || 0}
            variant={
              healthScore?.overallScore >= 80 ? 'success' :
                healthScore?.overallScore >= 60 ? 'primary' :
                  healthScore?.overallScore >= 40 ? 'warning' : 'error'
            }
          />
          <StatCard
            icon={DollarSign}
            label="Chi phí tháng này"
            value={statistics?.costs?.thisMonth?.toLocaleString() || 0}
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
          {activeTab === 'maintenance' && <MaintenanceTab vehicleId={id} />}
          {activeTab === 'documents' && <DocumentsTab vehicleId={id} />}
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
        <p className="text-neutral-600">Đang tải thông tin sức khỏe xe...</p>
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
const MaintenanceTab = ({ vehicleId }) => (
  <Card>
    <h3 className="text-xl font-semibold text-neutral-800 mb-4">Lịch sử bảo trì</h3>
    <p className="text-neutral-600">Đang phát triển...</p>
  </Card>
)

// Documents Tab Component
const DocumentsTab = ({ vehicleId }) => (
  <Card>
    <h3 className="text-xl font-semibold text-neutral-800 mb-4">Tài liệu xe</h3>
    <p className="text-neutral-600">Đang phát triển...</p>
  </Card>
)

// Bookings Tab Component
const BookingsTab = ({ vehicleId }) => (
  <Card>
    <h3 className="text-xl font-semibold text-neutral-800 mb-4">Lịch sử đặt xe</h3>
    <p className="text-neutral-600">Đang phát triển...</p>
  </Card>
)

export default VehicleDetails

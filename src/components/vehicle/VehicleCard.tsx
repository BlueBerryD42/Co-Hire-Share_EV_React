import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { Card, Badge } from '@/components/shared'
import { Car, Battery, Gauge } from 'lucide-react'

/**
 * VehicleCard Component - Hiển thị thông tin tóm tắt của một xe
 * Dùng trong màn hình 10. My Vehicles
 */
const VehicleCard = ({ vehicle, onSelect }) => {
  const navigate = useNavigate()
  // Xác định màu status badge
  const getStatusVariant = (status) => {
    const statusMap = {
      Available: 'success',
      InUse: 'primary',
      Maintenance: 'warning',
      Unavailable: 'error',
    }
    return statusMap[status] || 'default'
  }

  // Xác định màu health score
  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-primary'
    if (score >= 40) return 'text-warning'
    return 'text-error'
  }

  // Xác định health category text tiếng Việt
  const getHealthCategoryText = (category) => {
    const categoryMap = {
      Excellent: 'Xuất sắc',
      Good: 'Tốt',
      Fair: 'Trung bình',
      Poor: 'Kém',
      Critical: 'Nguy hiểm',
    }
    return categoryMap[category] || category
  }

  return (
    <Card
      hover
      className="relative overflow-hidden cursor-pointer"
      onClick={() => onSelect && onSelect(vehicle)}
    >
      {/* Vehicle Image */}
      <div className="relative h-48 bg-neutral-200 rounded-md overflow-hidden mb-4">
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.model} ${vehicle.year}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-16 h-16 text-neutral-400" />
          </div>
        )}

        {/* Status Badge - Position: Top Right */}
        <div className="absolute top-3 right-3">
          <Badge variant={getStatusVariant(vehicle.status)}>
            {vehicle.status === 'Available' && 'Sẵn sàng'}
            {vehicle.status === 'InUse' && 'Đang dùng'}
            {vehicle.status === 'Maintenance' && 'Bảo trì'}
            {vehicle.status === 'Unavailable' && 'Không khả dụng'}
          </Badge>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="space-y-3">
        {/* Model & Year */}
        <div>
          <h3 className="text-xl font-semibold text-neutral-800">
            {vehicle.model}
          </h3>
          <p className="text-sm text-neutral-600">
            Năm {vehicle.year} • Biển số: {vehicle.plateNumber}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-neutral-200">
          {/* Ownership */}
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {vehicle.ownershipPercentage || 0}%
            </div>
            <div className="text-xs text-neutral-600 mt-1">Sở hữu</div>
          </div>

          {/* Odometer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Gauge className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-semibold text-neutral-800">
                {(vehicle.odometer || 0).toLocaleString()} km
              </span>
            </div>
            <div className="text-xs text-neutral-600 mt-1">Số km</div>
          </div>

          {/* Health Score */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Battery className="w-4 h-4 text-neutral-600" />
              <span className={`text-sm font-semibold ${getHealthScoreColor(vehicle.healthScore?.overallScore || 0)}`}>
                {vehicle.healthScore?.overallScore || 0}
              </span>
            </div>
            <div className="text-xs text-neutral-600 mt-1">
              {getHealthCategoryText(vehicle.healthScore?.category)}
            </div>
          </div>
        </div>

        {/* Ownership Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-neutral-600 mb-1">
            <span>Phần sở hữu của bạn</span>
            <span className="font-semibold">{vehicle.ownershipPercentage || 0}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${vehicle.ownershipPercentage || 0}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <button
            className="flex-1 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/booking/create?vehicleId=${vehicle.id}`)
            }}
          >
            Đặt lịch
          </button>
          <button
            className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onSelect && onSelect(vehicle)
            }}
          >
            Chi tiết
          </button>
        </div>
      </div>
    </Card>
  )
}

VehicleCard.propTypes = {
  vehicle: PropTypes.shape({
    id: PropTypes.string,
    model: PropTypes.string,
    year: PropTypes.number,
    plateNumber: PropTypes.string,
    status: PropTypes.string,
    odometer: PropTypes.number,
    ownershipPercentage: PropTypes.number,
    imageUrl: PropTypes.string,
    healthScore: PropTypes.shape({
      overallScore: PropTypes.number,
      category: PropTypes.string,
    }),
  }).isRequired,
  onSelect: PropTypes.func,
}

export default VehicleCard

import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from '@mui/material'
import { Card } from '@/components/shared'
import StatusBadge from '@/components/shared/StatusBadge'
import { Car, Battery, Gauge, AlertCircle } from 'lucide-react'

/**
 * VehicleCard Component - Hiển thị thông tin tóm tắt của một xe
 * Dùng trong màn hình 10. My Vehicles
 */
const VehicleCard = ({ vehicle, onSelect }) => {
  const navigate = useNavigate()
  // Check if vehicle is pending/rejected (disable actions)
  const isPendingOrRejected = vehicle.status === 'PendingApproval' || vehicle.status === 'Rejected'
  
  // Check if group is inactive (show warning but don't hide)
  const isGroupInactive = vehicle.groupStatus && vehicle.groupStatus !== 'Active'
  
  // Get combined status tooltip text
  const getCombinedStatusTooltip = () => {
    const parts = []
    
    // Vehicle status
    if (vehicle.status === 'PendingApproval') {
      parts.push('Xe đang chờ phê duyệt từ nhân viên.')
    } else if (vehicle.status === 'Rejected') {
      parts.push('Xe đã bị từ chối.')
    }
    
    // Group status
    if (isGroupInactive) {
      const groupStatusMap = {
        'PendingApproval': 'Nhóm đang chờ phê duyệt.',
        'Rejected': 'Nhóm đã bị từ chối.',
        'Inactive': 'Nhóm đã tạm ngưng hoạt động.',
        'Dissolved': 'Nhóm đã giải thể.',
      }
      parts.push(groupStatusMap[vehicle.groupStatus] || 'Nhóm không hoạt động.')
    }
    
    if (parts.length === 0) return ''
    
    const message = parts.join(' ')
    return isGroupInactive || isPendingOrRejected 
      ? `${message} Xe không thể sử dụng cho đến khi được giải quyết.`
      : message
  }
  
  // Get combined status badge info
  const getCombinedStatusBadge = () => {
    // Priority: Group status > Vehicle status (if group is inactive, that's the blocker)
    if (isGroupInactive) {
      const groupStatusMap = {
        'PendingApproval': { label: 'Chờ duyệt nhóm', color: 'bg-amber-100 text-amber-800' },
        'Rejected': { label: 'Nhóm bị từ chối', color: 'bg-red-100 text-red-800' },
        'Inactive': { label: 'Nhóm tạm ngưng', color: 'bg-gray-100 text-gray-800' },
        'Dissolved': { label: 'Nhóm đã giải thể', color: 'bg-gray-100 text-gray-800' },
      }
      return groupStatusMap[vehicle.groupStatus] || { label: 'Nhóm không hoạt động', color: 'bg-gray-100 text-gray-800' }
    }
    
    // Vehicle status (if group is active)
    if (isPendingOrRejected) {
      const vehicleStatusMap = {
        'PendingApproval': { label: 'Chờ phê duyệt', color: 'bg-amber-100 text-amber-800' },
        'Rejected': { label: 'Bị từ chối', color: 'bg-red-100 text-red-800' },
      }
      return vehicleStatusMap[vehicle.status] || { label: vehicle.status, color: 'bg-neutral-200 text-neutral-600' }
    }
    
    // Normal status (use StatusBadge component)
    return null
  }
  
  const combinedStatus = getCombinedStatusBadge()

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

        {/* Combined Status Badge - Position: Top Right */}
        <div className="absolute top-3 right-3">
          {combinedStatus ? (
            <Tooltip 
              title={getCombinedStatusTooltip()}
              arrow
              placement="left"
            >
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${combinedStatus.color}`}>
                <AlertCircle className="w-3 h-3" />
                {combinedStatus.label}
              </div>
            </Tooltip>
          ) : (
            <StatusBadge status={vehicle.status} />
          )}
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
            {vehicle.healthScore && vehicle.healthScore.overallScore != null ? (
              <>
                <div className="flex items-center justify-center gap-1">
                  <Battery className="w-4 h-4 text-neutral-600" />
                  <span className={`text-sm font-semibold ${getHealthScoreColor(vehicle.healthScore.overallScore)}`}>
                    {vehicle.healthScore.overallScore}
                  </span>
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  {getHealthCategoryText(vehicle.healthScore.category)}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-1">
                  <Battery className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm font-semibold text-neutral-400">
                    N/A
                  </span>
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  Chưa có dữ liệu
                </div>
              </>
            )}
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
          <Tooltip
            title={
              isPendingOrRejected || isGroupInactive
                ? getCombinedStatusTooltip() || 'Không thể đặt lịch cho xe này'
                : ''
            }
            arrow
          >
            <span className="flex-1">
              <button
                className={`w-full px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
                  isPendingOrRejected || isGroupInactive
                    ? 'text-neutral-400 border-neutral-200 cursor-not-allowed'
                    : 'text-primary border-primary hover:bg-primary hover:text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isPendingOrRejected && !isGroupInactive) {
                    navigate(`/booking/create?vehicleId=${vehicle.id}`)
                  }
                }}
                disabled={isPendingOrRejected || isGroupInactive}
              >
                Đặt lịch
              </button>
            </span>
          </Tooltip>
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
    groupStatus: PropTypes.string,
    groupName: PropTypes.string,
    healthScore: PropTypes.shape({
      overallScore: PropTypes.number,
      category: PropTypes.string,
    }),
  }).isRequired,
  onSelect: PropTypes.func,
}

export default VehicleCard

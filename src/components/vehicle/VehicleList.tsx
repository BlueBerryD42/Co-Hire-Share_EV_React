import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import VehicleCard from './VehicleCard'
import { Car } from 'lucide-react'

/**
 * VehicleList Component - Hiển thị danh sách xe dạng grid
 * Dùng trong màn hình 10. My Vehicles
 */
const VehicleList = ({ vehicles, loading, onSelectVehicle }) => {
  const navigate = useNavigate()
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-neutral-100 border border-neutral-200 rounded-md p-6 animate-pulse"
          >
            <div className="h-48 bg-neutral-200 rounded-md mb-4" />
            <div className="space-y-3">
              <div className="h-6 bg-neutral-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
              <div className="h-20 bg-neutral-200 rounded" />
              <div className="h-10 bg-neutral-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
          <Car className="w-12 h-12 text-neutral-400" />
        </div>
        <h3 className="text-2xl font-semibold text-neutral-800 mb-2">
          Chưa có xe nào
        </h3>
        <p className="text-neutral-600 mb-6 max-w-md">
          Bạn chưa có xe nào trong hệ thống. Hãy tham gia một nhóm hoặc tạo nhóm mới để bắt đầu.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/app/groups/marketplace')}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-accent-blue transition-colors"
          >
            Duyệt nhóm
          </button>
          <button
            onClick={() => navigate('/app/groups/create')}
            className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 font-semibold rounded-md hover:border-neutral-400 transition-colors"
          >
            Tạo nhóm mới
          </button>
        </div>
      </div>
    )
  }

  // Vehicle grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onSelect={onSelectVehicle}
        />
      ))}
    </div>
  )
}

VehicleList.propTypes = {
  vehicles: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  onSelectVehicle: PropTypes.func,
}

export default VehicleList

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { VehicleList } from '@/components/vehicle'
import { Button, Badge } from '@/components/shared'
import { Car, Filter, Grid3x3, List, Plus, Users } from 'lucide-react'
import vehicleService from '@/services/vehicleService'

/**
 * MyVehicles Page - Màn hình 10: My Vehicles
 * Hiển thị danh sách xe mà user có quyền truy cập
 */
const MyVehicles = () => {
  const navigate = useNavigate()

  
  // State
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('model') // 'model' | 'ownership' | 'usage' | 'health'

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles()
  }, [])

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSort()
  }, [vehicles, statusFilter, sortBy])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const data = await vehicleService.getAllVehicles()
      setVehicles(data)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let result = [...vehicles]

    // Filter by status
    if (statusFilter !== 'All') {
      result = result.filter((v) => v.status === statusFilter)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'model':
          return a.model.localeCompare(b.model)
        case 'ownership':
          return (b.ownershipPercentage || 0) - (a.ownershipPercentage || 0)
        case 'usage':
          return (b.usagePercentage || 0) - (a.usagePercentage || 0)
        case 'health':
          return (b.healthScore?.overallScore || 0) - (a.healthScore?.overallScore || 0)
        default:
          return 0
      }
    })

    setFilteredVehicles(result)
  }

  const handleSelectVehicle = (vehicle) => {
    navigate(`/vehicles/${vehicle.id}`)
  }

  // Status filter options
  const statusOptions = [
    { value: 'All', label: 'Tất cả', count: vehicles.length },
    { value: 'Available', label: 'Sẵn sàng', count: vehicles.filter(v => v.status === 'Available').length },
    { value: 'InUse', label: 'Đang dùng', count: vehicles.filter(v => v.status === 'InUse').length },
    { value: 'Maintenance', label: 'Bảo trì', count: vehicles.filter(v => v.status === 'Maintenance').length },
  ]

  // Sort options
  const sortOptions = [
    { value: 'model', label: 'Tên xe' },
    { value: 'ownership', label: '% Sở hữu' },
    { value: 'usage', label: '% Sử dụng' },
    { value: 'health', label: 'Điểm sức khỏe' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 flex items-center gap-3">
                <Car className="w-8 h-8 text-primary" />
                Xe của tôi
              </h1>
              <p className="text-neutral-600 mt-2">
                Quản lý và theo dõi các xe bạn đang sở hữu
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate('/app/groups/marketplace')}>
                <Users className="w-4 h-4 mr-2" />
                Tham gia nhóm
              </Button>
              <Button variant="primary" onClick={() => navigate('/app/groups/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo nhóm mới
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-card">
              <p className="text-sm text-neutral-600">Tổng số xe</p>
              <p className="text-2xl font-bold text-neutral-800 mt-1">{vehicles.length}</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-card">
              <p className="text-sm text-neutral-600">Sẵn sàng</p>
              <p className="text-2xl font-bold text-success mt-1">
                {vehicles.filter(v => v.status === 'Available').length}
              </p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-card">
              <p className="text-sm text-neutral-600">Đang dùng</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {vehicles.filter(v => v.status === 'InUse').length}
              </p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-card">
              <p className="text-sm text-neutral-600">Bảo trì</p>
              <p className="text-2xl font-bold text-warning mt-1">
                {vehicles.filter(v => v.status === 'Maintenance').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-card mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === option.value
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>

            {/* Sort & View Mode */}
            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-md text-sm text-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sắp xếp: {option.label}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-neutral-100 rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-800'
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-800'
                  }`}
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle List */}
        <VehicleList
          vehicles={filteredVehicles}
          loading={loading}
          onSelectVehicle={handleSelectVehicle}
        />
      </div>
    </div>
  )
}

export default MyVehicles

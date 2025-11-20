import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { VehicleList } from '@/components/vehicle'
import { Button, Badge } from '@/components/shared'
import { Car, Filter, Grid3x3, List } from 'lucide-react'
import vehicleService from '@/services/vehicleService'
import { useGroups } from '@/hooks/useGroups'
import { useIsStaffOrAdmin } from '@/hooks/useRole'
import { useAppSelector } from '@/store/hooks'

/**
 * MyVehicles Page - Màn hình 10: My Vehicles
 * Hiển thị danh sách xe mà user có quyền truy cập
 */
const MyVehicles = () => {
  const navigate = useNavigate()
  const { data: groups, loading: groupsLoading } = useGroups()
  const isStaffOrAdmin = useIsStaffOrAdmin()
  const { user } = useAppSelector((state) => state.auth)

  // State
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('model') // 'model' | 'ownership' | 'usage' | 'health'

  // Check if user can create vehicles:
  // - Staff/Admin: can always create
  // - Regular users: only if they are Admin of at least one group (including pending)
  //   Note: Groups in PendingApproval status can still have vehicles added
  const hasAdminGroups = groups?.some(g => {
    // Allow Active, Inactive, and PendingApproval groups (not Rejected or Dissolved)
    if (g.status === 'Rejected' || g.status === 'Dissolved') return false
    const userMembership = g.members.find((m) => m.userId === user?.id)
    return userMembership?.roleInGroup === 'Admin'
  }) || false
  const canCreateVehicle = isStaffOrAdmin || hasAdminGroups
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('MyVehicles - Debug:', {
      groupsCount: groups?.length || 0,
      userGroups: groups?.map(g => ({
        id: g.id,
        name: g.name,
        status: g.status,
        userRole: g.members.find(m => m.userId === user?.id)?.roleInGroup,
        userId: user?.id
      })),
      hasAdminGroups,
      canCreateVehicle,
      isStaffOrAdmin
    })
  }

  // Fetch vehicles on mount and when groups/user changes
  useEffect(() => {
    if (user?.id) {
      fetchVehicles()
    }
  }, [user?.id, groups])

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSort()
  }, [vehicles, statusFilter, sortBy])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const vehicleData = await vehicleService.getAllVehicles()
      
      // Create a map of groupId -> group for quick lookup
      const groupsMap = new Map(groups?.map(g => [g.id, g]) || [])
      
      // Enrich vehicles with ownership percentage and group status
      const enrichedVehicles = vehicleData
        .map((vehicle) => {
          // If vehicle has no groupId, skip it (shouldn't happen but safety check)
          if (!vehicle.groupId) {
            return null
          }

          // Get group from cache (already fetched by useGroups hook)
          const group = groupsMap.get(vehicle.groupId)
          
          // If group not found in cache, skip (might be loading or user not a member)
          if (!group) {
            return null
          }

          // Find current user's membership in the group
          const userMembership = group.members.find((m) => m.userId === user?.id)
          
          // Only include vehicles where user is a member (unless staff/admin)
          if (!isStaffOrAdmin && !userMembership) {
            return null
          }

          // Calculate ownership percentage (sharePercentage is a decimal, e.g., 0.45 = 45%)
          const ownershipPercentage = userMembership 
            ? Math.round(userMembership.sharePercentage * 100)
            : 0

          return {
            ...vehicle,
            ownershipPercentage,
            groupStatus: group.status, // Include group status for display
            groupName: group.name, // Include group name for tooltip
          }
        })
        .filter((v): v is typeof vehicleData[0] & { ownershipPercentage: number; groupStatus: string; groupName: string } => v !== null)

      setVehicles(enrichedVehicles)
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
    { value: 'PendingApproval', label: 'Chờ phê duyệt', count: vehicles.filter(v => v.status === 'PendingApproval').length },
    { value: 'Rejected', label: 'Bị từ chối', count: vehicles.filter(v => v.status === 'Rejected').length },
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
              {canCreateVehicle && (
                <Button variant="contained" onClick={() => navigate('/vehicles/create')}>
                  + Thêm xe mới
                </Button>
              )}
              {(!groups || groups.length === 0) && !groupsLoading && (
                <Button variant="outlined" onClick={() => navigate('/groups/create')}>
                  Tạo nhóm mới
                </Button>
              )}
              <Button variant="outlined" onClick={() => navigate('/groups/marketplace')}>
                Tham gia nhóm mới
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
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
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-card">
              <p className="text-sm text-neutral-600">Chờ phê duyệt</p>
              <p className="text-2xl font-bold text-warning mt-1">
                {vehicles.filter(v => v.status === 'PendingApproval').length}
              </p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-card">
              <p className="text-sm text-neutral-600">Bị từ chối</p>
              <p className="text-2xl font-bold text-error mt-1">
                {vehicles.filter(v => v.status === 'Rejected').length}
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
                      ? 'bg-primary text-neutral-900'
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

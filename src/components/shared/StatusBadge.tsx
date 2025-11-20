import { Chip } from '@mui/material'

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'small' | 'medium'
  label?: string
}

const StatusBadge = ({ status, variant, size = 'small', label }: StatusBadgeProps) => {
  const getVariant = (
    status: string
  ): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    if (variant) return variant

    const statusLower = status.toLowerCase()
    
    // Vehicle/Group statuses
    if (
      statusLower.includes('active') ||
      statusLower.includes('approved') ||
      statusLower.includes('available') ||
      statusLower.includes('completed') ||
      statusLower.includes('success')
    ) {
      return 'success'
    }
    if (
      statusLower.includes('pendingapproval') ||
      statusLower.includes('pending') ||
      statusLower.includes('inuse') ||
      statusLower.includes('maintenance')
    ) {
      return 'warning'
    }
    if (
      statusLower.includes('error') ||
      statusLower.includes('failed') ||
      statusLower.includes('rejected') ||
      statusLower.includes('suspended') ||
      statusLower.includes('unavailable') ||
      statusLower.includes('dissolved')
    ) {
      return 'error'
    }
    if (statusLower.includes('info') || statusLower.includes('new')) {
      return 'info'
    }
    return 'default'
  }

  const getStatusLabel = (status: string): string => {
    if (label) return label
    
    const statusLower = status.toLowerCase()
    
    // Vietnamese labels
    if (statusLower === 'pendingapproval') return 'Chờ phê duyệt'
    if (statusLower === 'rejected') return 'Bị từ chối'
    if (statusLower === 'active') return 'Đang hoạt động'
    if (statusLower === 'inactive') return 'Không hoạt động'
    if (statusLower === 'dissolved') return 'Đã giải thể'
    if (statusLower === 'available') return 'Sẵn sàng'
    if (statusLower === 'inuse') return 'Đang sử dụng'
    if (statusLower === 'maintenance') return 'Bảo trì'
    if (statusLower === 'unavailable') return 'Không khả dụng'
    
    // Return original status if no match
    return status
  }

  const getColor = (variant: string) => {
    switch (variant) {
      case 'success':
        return { bgcolor: '#7a9b76', color: 'white' }
      case 'warning':
        return { bgcolor: '#d4a574', color: 'white' }
      case 'error':
        return { bgcolor: '#b87d6f', color: 'white' }
      case 'info':
        return { bgcolor: '#6b9bd1', color: 'white' }
      default:
        return { bgcolor: '#999999', color: 'white' }
    }
  }

  const chipVariant = getVariant(status)
  const colors = getColor(chipVariant)
  const displayLabel = getStatusLabel(status)

  return (
    <Chip
      label={displayLabel}
      size={size}
      sx={{
        ...colors,
        fontWeight: 500,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        height: size === 'small' ? 24 : 32,
      }}
    />
  )
}

export default StatusBadge


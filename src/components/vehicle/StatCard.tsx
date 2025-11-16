import PropTypes from 'prop-types'
import { Card } from '@/components/shared'

/**
 * StatCard Component - Hiển thị thống kê dạng card
 * Dùng trong Vehicle Details, Dashboard, Cost Analytics
 */
const StatCard = ({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  trendValue,
  variant = 'default',
  className = '',
}) => {
  // Variant colors
  const variantStyles = {
    default: 'text-neutral-700',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  }

  // Trend colors
  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-success'
    if (trend === 'down') return 'text-error'
    return 'text-neutral-600'
  }

  return (
    <Card className={`${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Label */}
          <p className="text-sm text-neutral-600 mb-2">{label}</p>

          {/* Value */}
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${variantStyles[variant]}`}>
              {value}
            </span>
            {unit && (
              <span className="text-lg text-neutral-600">{unit}</span>
            )}
          </div>

          {/* Trend */}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor(trend)}`}>
              {trend === 'up' && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={`p-3 rounded-lg bg-neutral-50 ${variantStyles[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  )
}

StatCard.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'error']),
  className: PropTypes.string,
}

export default StatCard

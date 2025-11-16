import PropTypes from 'prop-types'

/**
 * Badge Component - theo Design System
 * Variants: default, success, warning, error, primary, info
 */
const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  // Base styles
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors'

  // Variant styles
  const variantStyles = {
    default: 'bg-neutral-200 text-neutral-700',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    error: 'bg-error/20 text-error',
    primary: 'bg-primary/20 text-primary',
    info: 'bg-info/20 text-info',
  }

  // Size styles
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  return <span className={combinedClassName}>{children}</span>
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'error', 'primary', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
}

export default Badge

import PropTypes from 'prop-types'

/**
 * Button Component - theo Design System
 * Variants: primary, secondary, success, error, ghost
 * Sizes: sm, md, lg
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  // Variant styles
  const variantStyles = {
    primary: 'bg-neutral-700 text-neutral-50 hover:bg-neutral-800 focus:ring-neutral-600 shadow-card hover:shadow-card-hover',
    secondary: 'bg-transparent text-neutral-700 border-2 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-100',
    accent: 'bg-primary text-white hover:bg-accent-blue focus:ring-primary shadow-card hover:shadow-card-hover',
    success: 'bg-success text-white hover:bg-accent-green focus:ring-success shadow-card',
    error: 'bg-error text-white hover:bg-accent-terracotta focus:ring-error shadow-card',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
  }

  // Size styles
  const sizeStyles = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-6 py-3',
    lg: 'text-lg px-8 py-4',
  }

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : ''

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`

  return (
    <button
      type={type}
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'success', 'error', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
}

export default Button

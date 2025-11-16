import PropTypes from 'prop-types'

/**
 * Card Component - theo Design System
 * Elevated surface với shadow và hover effect
 */
const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'default',
  onClick,
  ...props
}) => {
  // Base styles
  const baseStyles = 'bg-neutral-100 border border-neutral-200 rounded-md shadow-card transition-all duration-300'

  // Hover effect
  const hoverStyles = hover ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5' : ''

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  }

  const combinedClassName = `${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`

  return (
    <div className={combinedClassName} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg']),
  onClick: PropTypes.func,
}

export default Card

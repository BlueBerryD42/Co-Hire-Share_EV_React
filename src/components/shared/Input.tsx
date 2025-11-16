import PropTypes from 'prop-types'

/**
 * Input Component - theo Design System
 */
const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const inputStyles = `
    w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3
    text-neutral-700 transition-all duration-300
    focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none
    disabled:bg-neutral-300 disabled:cursor-not-allowed
    ${error ? 'border-error focus:border-error focus:ring-error/15' : ''}
  `

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputStyles}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  )
}

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
}

export default Input

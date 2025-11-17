const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className = "",
  ...props
}) => {
  const baseClasses =
    "w-full bg-neutral-50 border-2 border-neutral-200 rounded-md px-4 py-3 text-neutral-700 placeholder-neutral-400 transition-all duration-200 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20";
  const errorClasses = error
    ? "border-accent-terracotta focus:border-accent-terracotta focus:ring-accent-terracotta/20"
    : "";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  const classes = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={classes}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-accent-terracotta">{error}</p>}
    </div>
  );
};

export default Input;

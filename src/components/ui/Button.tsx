const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  type = "button",
  className = "",
  ...props
}) => {
  const baseClasses =
    "font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-neutral-700 text-neutral-50 hover:bg-neutral-800 shadow-md hover:shadow-lg",
    accent: "bg-accent-blue text-white hover:opacity-90",
    success: "bg-accent-green text-white hover:opacity-90",
    warning: "bg-accent-gold text-white hover:opacity-90",
    error: "bg-accent-terracotta text-white hover:opacity-90",
    secondary:
      "bg-transparent text-neutral-700 border-2 border-neutral-300 hover:bg-neutral-100",
    ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;



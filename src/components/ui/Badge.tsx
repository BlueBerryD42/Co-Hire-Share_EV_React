const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  const baseClasses = "inline-flex items-center rounded-full font-medium";

  const variantClasses = {
    default: "bg-neutral-200 text-neutral-700",
    success: "bg-green-200/50 text-green-800",
    warning: "bg-yellow-200/50 text-yellow-800",
    error: "bg-red-200/50 text-red-800",
    primary: "bg-blue-200/50 text-blue-800",
    info: "bg-accent-blue/20 text-accent-blue",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;



const Card = ({
  children,
  className = "",
  hover = true,
  onClick,
  ...props
}) => {
  const baseClasses =
    "bg-neutral-100 border border-neutral-200 rounded-md p-6 transition-all duration-300";
  const hoverClasses = hover
    ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    : "";
  const shadowClasses = "shadow-sm";

  const classes = `${baseClasses} ${shadowClasses} ${hoverClasses} ${className}`;

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;



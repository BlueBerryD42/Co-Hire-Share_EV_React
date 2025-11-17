const Loading = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-neutral-200 border-t-accent-blue rounded-full animate-spin`}
      />
    </div>
  );
};

export default Loading;

export const LoadingSpinner = ({ className = "" }) => (
  <div className={`flex items-center justify-center p-8 ${className}`}>
    <div className="w-12 h-12 border-4 border-neutral-200 border-t-accent-blue rounded-full animate-spin" />
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-neutral-200 rounded ${className}`} />
);



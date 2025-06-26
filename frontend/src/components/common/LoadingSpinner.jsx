const LoadingSpinner = ({ size = "md", text = "Loading...", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <div className={`bg-orange-50 flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-orange-800 border-t-transparent mb-4`}></div>
      {text && <p className="text-sm text-orange-800 animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div
          className={`${sizes[size]} border-4 border-gray-200 border-t-primary rounded-full animate-spin`}
        />
        <div
          className={`${sizes[size]} border-4 border-transparent border-t-red-300 rounded-full animate-spin absolute top-0 left-0`}
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
        />
      </div>
      {text && <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export default Loader;

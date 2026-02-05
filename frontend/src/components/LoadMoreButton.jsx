const LoadMoreButton = ({ onClick, loading, hasMore }) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center py-6">
      <button
        onClick={onClick}
        disabled={loading}
        className={`px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 hover:shadow-lg ${
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-red-600'
        }`}
      >
        {loading ? (
          <span className="flex items-center">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Loading...
          </span>
        ) : (
          'Load More'
        )}
      </button>
    </div>
  );
};

export default LoadMoreButton;

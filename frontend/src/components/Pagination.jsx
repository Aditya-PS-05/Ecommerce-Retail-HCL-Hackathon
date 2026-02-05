const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  
  // Generate page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-lg transition-all transform hover:scale-105 ${
          currentPage === 1
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
        }`}
      >
        ← Prev
      </button>

      {/* Page Numbers */}
      {pages.map((page, index) =>
        page === '...' ? (
          <span key={index} className="px-2">...</span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg font-medium transition-all transform hover:scale-110 ${
              currentPage === page
                ? 'bg-primary text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-lg transition-all transform hover:scale-105 ${
          currentPage === totalPages
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
        }`}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;

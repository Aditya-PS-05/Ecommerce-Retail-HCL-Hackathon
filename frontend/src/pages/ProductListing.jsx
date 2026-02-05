import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard, Loader, Pagination, Breadcrumb, SearchBar } from '../components';
import { useCart } from '../context';
import api from '../api/axios';

const ProductListing = () => {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // URL Params
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'name';
  const sortOrder = searchParams.get('order') || 'asc';
  const searchQuery = searchParams.get('q') || '';

  const PRODUCTS_PER_PAGE = 12;

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    ...(selectedCategory && categories.length > 0
      ? [{ label: categories.find(c => (c.id || c._id) === selectedCategory)?.name || categories.find(c => (c.id || c._id) === selectedCategory)?.title || 'Category' }]
      : []),
  ];

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories || response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        sort: sortBy,
        order: sortOrder,
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await api.get('/products', { params });
      const data = response.data;

      setProducts(data.products || data || []);
      setTotalPages(data.total_pages || Math.ceil((data.total || 0) / PRODUCTS_PER_PAGE) || 1);
      setTotalProducts(data.total || (data.products || data || []).length);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, sortBy, sortOrder, searchQuery]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL params
  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Reset to page 1 when filters change (except when changing page itself)
    if (!('page' in updates)) {
      newParams.set('page', '1');
    }

    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    updateParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (categoryId) => {
    updateParams({ category: categoryId });
  };

  const handleSortChange = (e) => {
    const [sort, order] = e.target.value.split('-');
    updateParams({ sort, order });
  };

  const handleSearch = (query) => {
    updateParams({ q: query });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const clearFilters = () => {
    setSearchParams({ page: '1' });
  };

  const hasActiveFilters = selectedCategory || searchQuery || sortBy !== 'name' || sortOrder !== 'asc';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Products</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🔍</span>
                Filters
              </h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <SearchBar
                  value={searchQuery}
                  onSearch={handleSearch}
                  placeholder="Search products..."
                  className="w-full"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      !selectedCategory
                        ? 'bg-primary text-white shadow-md'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => {
                    const catId = category.id || category._id;
                    return (
                      <button
                        key={catId}
                        onClick={() => handleCategoryChange(catId)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                          selectedCategory === catId
                            ? 'bg-primary text-white shadow-md'
                            : 'hover:bg-gray-100 text-gray-700 hover:translate-x-1'
                        }`}
                      >
                        {category.logo_url ? (
                          <img src={category.logo_url} alt="" className="w-5 h-5 rounded" />
                        ) : (
                          <span>🏷️</span>
                        )}
                        {category.name || category.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all transform hover:scale-[1.02]"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-4 space-y-3">
              {/* Search Bar */}
              <SearchBar
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search products..."
                className="w-full"
              />

              {/* Filter Row */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="flex-shrink-0 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>
                      {cat.name || cat.title}
                    </option>
                  ))}
                </select>

                {/* Sort Dropdown */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                  className="flex-shrink-0 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price ↑</option>
                  <option value="price-desc">Price ↓</option>
                </select>

                {/* Clear Button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex-shrink-0 px-4 py-2 text-primary border border-primary rounded-lg text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {loading ? (
                  'Loading...'
                ) : (
                  <>
                    Showing <span className="font-medium">{products.length}</span> of{' '}
                    <span className="font-medium">{totalProducts}</span> products
                  </>
                )}
              </p>
              
              {/* View Toggle - Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm text-gray-500">View:</span>
                <button className="p-2 rounded bg-primary text-white">
                  <GridIcon />
                </button>
                <button className="p-2 rounded bg-gray-200 text-gray-600 hover:bg-gray-300">
                  <ListIcon />
                </button>
              </div>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {categories.find(c => (c.id || c._id) === selectedCategory)?.name || categories.find(c => (c.id || c._id) === selectedCategory)?.title}
                    <button
                      onClick={() => handleCategoryChange('')}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => handleSearch('')}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader size="lg" text="Loading products..." />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-red-600"
                >
                  Retry
                </button>
              </div>
            ) : (() => {
              // Filter products by search query on frontend
              const filteredProducts = searchQuery
                ? products.filter((p) => {
                    const title = (p.title || p.name || '').toLowerCase();
                    const description = (p.description || '').toLowerCase();
                    const query = searchQuery.toLowerCase();
                    return title.includes(query) || description.includes(query);
                  })
                : products;

              return filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-red-600"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id || product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && !searchQuery && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            );
            })()}
          </main>
        </div>
      </div>
    </div>
  );
};

// Icons
const GridIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

export default ProductListing;

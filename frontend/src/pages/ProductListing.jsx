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
      ? [{ label: categories.find(c => c._id === selectedCategory)?.name || 'Category' }]
      : []),
  ];

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories(mockCategories);
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

      setProducts(data.products || data);
      setTotalPages(data.total_pages || Math.ceil((data.total || mockProducts.length) / PRODUCTS_PER_PAGE));
      setTotalProducts(data.total || mockProducts.length);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      // Use mock data for demo
      let filtered = [...mockProducts];
      
      if (selectedCategory) {
        filtered = filtered.filter(p => p.category_id === selectedCategory);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
        );
      }

      // Sort
      filtered.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'price') {
          comparison = a.price - b.price;
        } else if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        }
        return sortOrder === 'desc' ? -comparison : comparison;
      });

      const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const paginated = filtered.slice(start, start + PRODUCTS_PER_PAGE);
      
      setProducts(paginated);
      setTotalPages(Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
      setTotalProducts(filtered.length);
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
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
              
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
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryChange(category._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        selectedCategory === category._id
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category.logo_url ? (
                        <img src={category.logo_url} alt="" className="w-5 h-5 rounded" />
                      ) : (
                        <span>🏷️</span>
                      )}
                      {category.name}
                    </button>
                  ))}
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
                  className="w-full px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
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
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
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
                    {categories.find(c => c._id === selectedCategory)?.name}
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
            ) : products.length === 0 ? (
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
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
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

// Mock data for demo
const mockCategories = [
  { _id: '1', name: 'Smartphones', logo_url: null },
  { _id: '2', name: 'Laptops', logo_url: null },
  { _id: '3', name: 'Audio', logo_url: null },
  { _id: '4', name: 'Accessories', logo_url: null },
  { _id: '5', name: 'Wearables', logo_url: null },
  { _id: '6', name: 'Gaming', logo_url: null },
];

const mockProducts = [
  { _id: '1', name: 'iPhone 15 Pro', price: 999.99, tax_percent: 18, stock: 25, category_id: '1', image_url: null, description: 'Latest Apple flagship with A17 Pro chip' },
  { _id: '2', name: 'Samsung Galaxy S24', price: 899.99, tax_percent: 18, stock: 30, category_id: '1', image_url: null, description: 'AI-powered smartphone with 200MP camera' },
  { _id: '3', name: 'Google Pixel 8', price: 699.99, tax_percent: 18, stock: 20, category_id: '1', image_url: null, description: 'Pure Android experience with Tensor G3' },
  { _id: '4', name: 'OnePlus 12', price: 799.99, tax_percent: 18, stock: 35, category_id: '1', image_url: null, description: 'Flagship killer with 100W fast charging' },
  { _id: '5', name: 'MacBook Air M3', price: 1299.99, tax_percent: 18, stock: 15, category_id: '2', image_url: null, description: 'Ultra-thin laptop with M3 chip' },
  { _id: '6', name: 'Dell XPS 15', price: 1499.99, tax_percent: 18, stock: 12, category_id: '2', image_url: null, description: 'Premium ultrabook with OLED display' },
  { _id: '7', name: 'HP Spectre x360', price: 1399.99, tax_percent: 18, stock: 18, category_id: '2', image_url: null, description: '2-in-1 convertible with pen support' },
  { _id: '8', name: 'Lenovo ThinkPad X1', price: 1199.99, tax_percent: 18, stock: 22, category_id: '2', image_url: null, description: 'Business laptop with legendary keyboard' },
  { _id: '9', name: 'AirPods Pro 2', price: 249.99, tax_percent: 18, stock: 50, category_id: '3', image_url: null, description: 'Active noise cancellation earbuds' },
  { _id: '10', name: 'Sony WH-1000XM5', price: 349.99, tax_percent: 18, stock: 28, category_id: '3', image_url: null, description: 'Industry-leading noise cancelling headphones' },
  { _id: '11', name: 'JBL Flip 6', price: 129.99, tax_percent: 18, stock: 45, category_id: '3', image_url: null, description: 'Portable waterproof Bluetooth speaker' },
  { _id: '12', name: 'Bose QuietComfort', price: 299.99, tax_percent: 18, stock: 32, category_id: '3', image_url: null, description: 'Legendary comfort with premium sound' },
  { _id: '13', name: 'USB-C Hub 7-in-1', price: 49.99, tax_percent: 18, stock: 100, category_id: '4', image_url: null, description: 'HDMI, USB-A, SD card, and more' },
  { _id: '14', name: 'MagSafe Wireless Charger', price: 39.99, tax_percent: 18, stock: 80, category_id: '4', image_url: null, description: '15W fast wireless charging pad' },
  { _id: '15', name: 'Anker Power Bank 20K', price: 59.99, tax_percent: 18, stock: 65, category_id: '4', image_url: null, description: '20000mAh with 65W fast charging' },
  { _id: '16', name: 'Apple Watch Ultra 2', price: 799.99, tax_percent: 18, stock: 20, category_id: '5', image_url: null, description: 'Rugged smartwatch for athletes' },
  { _id: '17', name: 'Samsung Galaxy Watch 6', price: 349.99, tax_percent: 18, stock: 35, category_id: '5', image_url: null, description: 'Health tracking with Wear OS' },
  { _id: '18', name: 'Fitbit Charge 6', price: 159.99, tax_percent: 18, stock: 40, category_id: '5', image_url: null, description: 'Advanced fitness tracker with GPS' },
  { _id: '19', name: 'PS5 DualSense Controller', price: 69.99, tax_percent: 18, stock: 55, category_id: '6', image_url: null, description: 'Haptic feedback gaming controller' },
  { _id: '20', name: 'Xbox Elite Controller 2', price: 179.99, tax_percent: 18, stock: 30, category_id: '6', image_url: null, description: 'Pro-level customizable controller' },
];

export default ProductListing;

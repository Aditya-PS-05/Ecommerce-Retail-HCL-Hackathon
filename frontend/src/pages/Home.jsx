import { useState, useEffect, useCallback } from 'react';
import { ProductCard, Loader, LoadMoreButton } from '../components';
import api from '../api/axios';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error] = useState(null);

  const PRODUCTS_PER_PAGE = 8;

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Use mock data for demo
      setCategories(mockCategories);
    }
  };

  const fetchProducts = useCallback(async (pageNum, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = {
        page: pageNum,
        limit: PRODUCTS_PER_PAGE,
        ...(selectedCategory && { category_id: selectedCategory }),
      };
      const response = await api.get('/products', { params });
      const newProducts = response.data.products || response.data;
      
      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }
      
      setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      // Use mock data for demo
      const filtered = selectedCategory
        ? mockProducts.filter((p) => p.category_id === selectedCategory)
        : mockProducts;
      
      const start = (pageNum - 1) * PRODUCTS_PER_PAGE;
      const newProducts = filtered.slice(start, start + PRODUCTS_PER_PAGE);
      
      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }
      
      setHasMore(start + PRODUCTS_PER_PAGE < filtered.length);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
    fetchProducts(1, true);
  }, [selectedCategory, fetchProducts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleAddToCart = (product) => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', product);
    alert(`Added "${product.name}" to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-red-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to RetailHub
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Discover amazing products at great prices
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 px-4 bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Categories</h2>
          
          {/* Category Tabs - Scrollable on mobile */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* All Categories Button */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            
            {/* Category Buttons */}
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategoryClick(category._id)}
                className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category._id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.logo_url ? (
                  <img
                    src={category.logo_url}
                    alt={category.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span>🏷️</span>
                )}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory
                ? categories.find((c) => c._id === selectedCategory)?.name || 'Products'
                : 'All Products'}
            </h2>
            <span className="text-gray-500">
              {products.length} items
            </span>
          </div>

          {/* Loading State */}
          {loading ? (
            <Loader size="lg" text="Loading products..." />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => fetchProducts(1, true)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📦</span>
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Load More Button */}
              <LoadMoreButton
                onClick={handleLoadMore}
                loading={loadingMore}
                hasMore={hasMore}
              />
            </>
          )}
        </div>
      </section>

      {/* Category Sections (McDonald's Style) */}
      {!selectedCategory && categories.length > 0 && (
        <section className="py-8 px-4 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            {categories.slice(0, 3).map((category) => (
              <CategorySection
                key={category._id}
                category={category}
                onAddToCart={handleAddToCart}
                onViewAll={() => handleCategoryClick(category._id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// Category Section Component (McDonald's style)
const CategorySection = ({ category, onAddToCart, onViewAll }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: { category_id: category._id, limit: 4 },
      });
      setProducts(response.data.products || response.data);
    } catch (err) {
      // Use mock data
      setProducts(mockProducts.filter((p) => p.category_id === category._id).slice(0, 4));
    } finally {
      setLoading(false);
    }
  };
    fetchCategoryProducts();
  }, [category._id]);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {category.logo_url ? (
            <img
              src={category.logo_url}
              alt={category.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-3xl">🏷️</span>
          )}
          <h3 className="text-2xl font-bold text-gray-800">{category.name}</h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-primary font-medium hover:underline"
        >
          View All →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

// Mock data for demo (when API is not available)
const mockCategories = [
  { _id: '1', name: 'Burgers', logo_url: null },
  { _id: '2', name: 'Pizza', logo_url: null },
  { _id: '3', name: 'Drinks', logo_url: null },
  { _id: '4', name: 'Sides', logo_url: null },
  { _id: '5', name: 'Desserts', logo_url: null },
];

const mockProducts = [
  { _id: '1', name: 'Classic Burger', price: 9.99, tax_percent: 8, stock: 50, category_id: '1', image_url: null },
  { _id: '2', name: 'Cheese Burger', price: 11.99, tax_percent: 8, stock: 45, category_id: '1', image_url: null },
  { _id: '3', name: 'Double Burger', price: 14.99, tax_percent: 8, stock: 30, category_id: '1', image_url: null },
  { _id: '4', name: 'Veggie Burger', price: 10.99, tax_percent: 8, stock: 25, category_id: '1', image_url: null },
  { _id: '5', name: 'Margherita Pizza', price: 12.99, tax_percent: 8, stock: 40, category_id: '2', image_url: null },
  { _id: '6', name: 'Pepperoni Pizza', price: 14.99, tax_percent: 8, stock: 35, category_id: '2', image_url: null },
  { _id: '7', name: 'BBQ Chicken Pizza', price: 15.99, tax_percent: 8, stock: 28, category_id: '2', image_url: null },
  { _id: '8', name: 'Veggie Pizza', price: 13.99, tax_percent: 8, stock: 32, category_id: '2', image_url: null },
  { _id: '9', name: 'Coca Cola', price: 2.99, tax_percent: 5, stock: 100, category_id: '3', image_url: null },
  { _id: '10', name: 'Sprite', price: 2.99, tax_percent: 5, stock: 90, category_id: '3', image_url: null },
  { _id: '11', name: 'Orange Juice', price: 3.99, tax_percent: 5, stock: 60, category_id: '3', image_url: null },
  { _id: '12', name: 'Milkshake', price: 4.99, tax_percent: 5, stock: 45, category_id: '3', image_url: null },
  { _id: '13', name: 'French Fries', price: 3.99, tax_percent: 8, stock: 80, category_id: '4', image_url: null },
  { _id: '14', name: 'Onion Rings', price: 4.49, tax_percent: 8, stock: 55, category_id: '4', image_url: null },
  { _id: '15', name: 'Chicken Nuggets', price: 5.99, tax_percent: 8, stock: 65, category_id: '4', image_url: null },
  { _id: '16', name: 'Ice Cream', price: 3.99, tax_percent: 5, stock: 40, category_id: '5', image_url: null },
  { _id: '17', name: 'Brownie', price: 4.49, tax_percent: 5, stock: 35, category_id: '5', image_url: null },
  { _id: '18', name: 'Apple Pie', price: 3.99, tax_percent: 5, stock: 30, category_id: '5', image_url: null },
];

export default Home;

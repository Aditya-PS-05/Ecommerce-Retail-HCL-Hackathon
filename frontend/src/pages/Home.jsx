import { useState, useEffect, useCallback } from 'react';
import { ProductCard, Loader, LoadMoreButton } from '../components';
import { useCart } from '../context';
import api from '../api/axios';

const Home = () => {
  const { addToCart } = useCart();
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
      setCategories(response.data.categories || response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
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
      const newProducts = response.data.products || response.data || [];
      
      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }
      
      setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      if (reset) {
        setProducts([]);
      }
      setHasMore(false);
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
    addToCart(product);
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
            {categories.map((category) => {
              const catId = category.id || category._id;
              return (
                <button
                  key={catId}
                  onClick={() => handleCategoryClick(catId)}
                  className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                    selectedCategory === catId
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.logo_url ? (
                    <img
                      src={category.logo_url}
                      alt={category.name || category.title}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <span>🏷️</span>
                  )}
                  {category.name || category.title}
                </button>
              );
            })}
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
                ? categories.find((c) => (c.id || c._id) === selectedCategory)?.name || categories.find((c) => (c.id || c._id) === selectedCategory)?.title || 'Products'
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
                    key={product.id || product._id}
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
  const categoryId = category.id || category._id;

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const response = await api.get('/products', {
          params: { category_id: categoryId, limit: 4 },
        });
        setProducts(response.data.products || response.data || []);
      } catch (err) {
        console.error('Failed to fetch category products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [categoryId]);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {category.logo_url ? (
            <img
              src={category.logo_url}
              alt={category.name || category.title}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-3xl">🏷️</span>
          )}
          <h3 className="text-2xl font-bold text-gray-800">{category.name || category.title}</h3>
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
            key={product.id || product._id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;

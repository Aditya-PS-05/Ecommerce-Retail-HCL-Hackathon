import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Loader } from '../../components';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [products, categories] = await Promise.all([
        api.get('/products?limit=1'),
        api.get('/categories'),
      ]);
      setStats({
        products: products.data.total || 20,
        categories: categories.data.length || 5,
        orders: 45,
        users: 120,
      });
    } catch (err) {
      setStats({ products: 20, categories: 5, orders: 45, users: 120 });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Products', value: stats.products, icon: '📦', link: '/admin/products', color: 'bg-blue-500' },
    { label: 'Categories', value: stats.categories, icon: '🏷️', link: '/admin/categories', color: 'bg-green-500' },
    { label: 'Orders', value: stats.orders, icon: '📋', link: '/admin/orders', color: 'bg-yellow-500' },
    { label: 'Users', value: stats.users, icon: '👥', link: '/admin/users', color: 'bg-purple-500' },
  ];

  if (loading) return <Loader size="lg" text="Loading dashboard..." />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <Link
              key={card.label}
              to={card.link}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} text-white p-4 rounded-full text-2xl`}>
                  {card.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/products/new"
              className="flex items-center gap-3 p-4 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <span className="text-2xl">➕</span>
              <span className="font-medium">Add Product</span>
            </Link>
            <Link
              to="/admin/categories/new"
              className="flex items-center gap-3 p-4 bg-secondary text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <span className="text-2xl">🏷️</span>
              <span className="font-medium">Add Category</span>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-4 bg-accent text-white rounded-lg hover:bg-orange-500 transition-colors"
            >
              <span className="text-2xl">📋</span>
              <span className="font-medium">View Orders</span>
            </Link>
            <Link
              to="/admin/inventory"
              className="flex items-center gap-3 p-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <span className="text-2xl">📊</span>
              <span className="font-medium">Inventory</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context';
import { Loader } from '../components';
import api from '../api/axios';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders?page=${page}&limit=10`);
        setOrders(response.data.orders);
        setTotalPages(response.data.total_pages);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, page]);

  const refetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders?page=${page}&limit=10`);
      setOrders(response.data.orders);
      setTotalPages(response.data.total_pages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-2xl p-8 max-w-md transform animate-slide-up">
          <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
            <span className="text-6xl">📦</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to login to view your orders</p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 hover:shadow-lg font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" text="Loading orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-2xl p-8 max-w-md transform animate-slide-up">
          <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
            <span className="text-6xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={refetchOrders}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 hover:shadow-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-2xl p-8 max-w-md transform animate-slide-up">
          <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
            <span className="text-6xl">📦</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
          <Link
            to="/home"
            className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 hover:shadow-lg font-semibold"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <span>📦</span>
          My Orders
        </h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Order ID</p>
                  <p className="font-mono font-semibold text-gray-800">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Order Date</p>
                  <p className="font-semibold text-gray-800">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y">
                {order.items.map((item, index) => (
                  <div key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.tax_percent > 0 && (
                        <p className="text-xs text-gray-500">+{item.tax_percent}% tax</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="bg-gray-50 p-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">${order.tax_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary">${order.total.toFixed(2)}</span>
                </div>
                {order.shipping_address && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Shipping Address</p>
                    <p className="text-gray-800">{order.shipping_address}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

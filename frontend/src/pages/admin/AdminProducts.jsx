import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Loader, Pagination, Modal } from '../../components';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      setCategories(mockCategories);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { page, limit: ITEMS_PER_PAGE } });
      setProducts(res.data.products || res.data);
      setTotalPages(res.data.total_pages || Math.ceil((res.data.total || 20) / ITEMS_PER_PAGE));
    } catch (err) {
      setProducts(mockProducts);
      setTotalPages(2);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteModal.product._id}`);
      setProducts(products.filter((p) => p._id !== deleteModal.product._id));
      alert('Product deleted successfully!');
    } catch (err) {
      alert('Failed to delete product');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, product: null });
    }
  };

  const getCategoryName = (categoryId) => {
    return categories.find((c) => c._id === categoryId)?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Products</h1>
            <p className="text-gray-500">Manage your product catalog</p>
          </div>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <span>➕</span> Add Product
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8">
              <Loader text="Loading products..." />
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-5xl mb-4 block">📦</span>
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Stock</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            {product.image_url ? (
                              <img src={product.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {getCategoryName(product.category_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">${product.price?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          product.stock > 20 ? 'bg-green-100 text-green-700' :
                          product.stock > 5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ open: true, product })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>

        {/* Delete Modal */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, product: null })}
          title="Delete Product"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <strong>{deleteModal.product?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeleteModal({ open: false, product: null })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Mock data
const mockCategories = [
  { _id: '1', name: 'Burgers' },
  { _id: '2', name: 'Pizza' },
  { _id: '3', name: 'Drinks' },
];

const mockProducts = [
  { _id: '1', name: 'Classic Burger', price: 9.99, stock: 50, category_id: '1', description: 'Juicy beef patty' },
  { _id: '2', name: 'Cheese Burger', price: 11.99, stock: 45, category_id: '1', description: 'With melted cheese' },
  { _id: '3', name: 'Pepperoni Pizza', price: 14.99, stock: 8, category_id: '2', description: 'Classic pepperoni' },
  { _id: '4', name: 'Coca Cola', price: 2.99, stock: 100, category_id: '3', description: 'Refreshing cola' },
  { _id: '5', name: 'Veggie Burger', price: 10.99, stock: 3, category_id: '1', description: 'Plant-based patty' },
];

export default AdminProducts;

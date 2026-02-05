import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth, CartProvider, useCart } from './context';
import { Navbar, Footer, ProtectedRoute, Loader } from './components';
import { Home, Landing, ProductListing, Login, Register, ForgotPassword, Cart, Orders, AdminDashboard, AdminProducts, ProductForm, AdminCategories, CategoryForm } from './pages';
import { AdminRoute } from './components';
import './App.css';

// Cart Notification Component
function CartNotification() {
  const { notification } = useCart();
  
  if (!notification) return null;
  
  return (
    <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-xl transition-all transform animate-slide-in ${
      notification.type === 'success' 
        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
        : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
    }`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{notification.type === 'success' ? '✓' : '⚠'}</span>
        <span>{notification.message}</span>
      </div>
    </div>
  );
}

// Layout with Navbar and Footer
function MainLayout({ children, user, logout }) {
  const { cartCount } = useCart();
  
  return (
    <>
      <Navbar user={user} cartCount={cartCount} onLogout={logout} />
      <CartNotification />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

// Main App Content with Auth
function AppContent() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Routes>
        {/* All Routes with Navbar/Footer */}
        <Route path="/" element={<MainLayout user={user} logout={logout}><Landing /></MainLayout>} />
        <Route path="/home" element={<MainLayout user={user} logout={logout}><Home /></MainLayout>} />
        <Route path="/products" element={<MainLayout user={user} logout={logout}><ProductListing /></MainLayout>} />
        <Route path="/login" element={<MainLayout user={user} logout={logout}><Login /></MainLayout>} />
        <Route path="/register" element={<MainLayout user={user} logout={logout}><Register /></MainLayout>} />
        <Route path="/forgot-password" element={<MainLayout user={user} logout={logout}><ForgotPassword /></MainLayout>} />
        <Route
          path="/cart"
          element={
            <MainLayout user={user} logout={logout}>
              <Cart />
            </MainLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <MainLayout user={user} logout={logout}>
              <ProtectedRoute user={user}>
                <Orders />
              </ProtectedRoute>
            </MainLayout>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <MainLayout user={user} logout={logout}>
              <AdminRoute user={user}>
                <AdminDashboard />
              </AdminRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/products"
          element={
            <MainLayout user={user} logout={logout}>
              <AdminRoute user={user}>
                <AdminProducts />
              </AdminRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <MainLayout user={user} logout={logout}>
              <AdminRoute user={user}>
                <ProductForm />
              </AdminRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <MainLayout user={user} logout={logout}>
              <AdminRoute user={user}>
                <ProductForm />
              </AdminRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <MainLayout user={user} logout={logout}>
              <AdminRoute user={user}>
                <AdminCategories />
              </AdminRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/categories/new"
          element={
            <MainLayout user={user} logout={logout}>
              <AdminRoute user={user}>
                <CategoryForm />
              </AdminRoute>
            </MainLayout>
          }
        />
        <Route
          path="/admin/categories/:id/edit"
          element={
            <MainLayout user={user} logout={logout}>
              <AdminRoute user={user}>
                <CategoryForm />
              </AdminRoute>
            </MainLayout>
          }
        />
      </Routes>
    </div>
  );
}

// App Wrapper with Providers
function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

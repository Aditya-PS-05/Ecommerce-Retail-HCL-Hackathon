import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth, CartProvider, useCart } from './context';
import { Navbar, Footer, ProtectedRoute, Loader } from './components';
import { Home, Landing, ProductListing, Login, Register, ForgotPassword } from './pages';
import './App.css';

// Cart Notification Component
function CartNotification() {
  const { notification } = useCart();
  
  if (!notification) return null;
  
  return (
    <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all transform ${
      notification.type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`}>
      {notification.message}
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
          path="/orders"
          element={
            <MainLayout user={user} logout={logout}>
              <ProtectedRoute user={user}>
                <div className="p-8 text-center">Orders Page (Coming Soon)</div>
              </ProtectedRoute>
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

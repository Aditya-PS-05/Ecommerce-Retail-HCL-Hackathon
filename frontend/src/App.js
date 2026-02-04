import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context';
import { Navbar, Footer, ProtectedRoute, Loader } from './components';
import { Home, Login, Register, ForgotPassword } from './pages';
import './App.css';

// Main App Content with Auth
function AppContent() {
  const { user, loading, logout } = useAuth();

  // Show loader while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar user={user} cartCount={0} onLogout={logout} />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute user={user}>
                <div className="p-8 text-center">Orders Page (Coming Soon)</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// App Wrapper with Providers
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

// Temporary Home component
function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to RetailHub</h1>
      <p className="text-gray-600">Your one-stop shop for everything!</p>
    </div>
  );
}

export default App;

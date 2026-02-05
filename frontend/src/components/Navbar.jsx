import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, cartCount = 0, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
            <span className="text-2xl font-bold text-primary bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">🛒 RetailHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium">
              Products
            </Link>
            
            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-primary transition-all duration-200 hover:scale-110">
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary"
                >
                  <span className="text-xl">👤</span>
                  <span>{user.name || user.email?.split('@')[0] || 'User'}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">
                      My Orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-2xl"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <Link to="/products" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
              Products
            </Link>
            <Link to="/cart" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
              Cart ({cartCount})
            </Link>
            {user ? (
              <>
                <Link to="/orders" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  My Orders
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <button onClick={onLogout} className="block py-2 text-red-500">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="block py-2 text-primary font-semibold" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

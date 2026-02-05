import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">🛒</span>
              <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">RetailHub</span>
            </h3>
            <p className="text-gray-300">
              Your one-stop shop for everything you need.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">
                  Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>📧 support@retailhub.com</li>
              <li>📞 +1 234 567 890</li>
              <li>📍 123 Main St, City</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-4 text-center text-gray-400">
          <p>© 2026 RetailHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

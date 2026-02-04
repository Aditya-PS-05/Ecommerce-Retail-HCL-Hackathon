import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">🛒 RetailHub</h3>
            <p className="text-gray-300">
              Your one-stop shop for everything you need.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-white">
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

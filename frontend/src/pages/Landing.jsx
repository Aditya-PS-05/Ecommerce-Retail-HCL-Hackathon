import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const Landing = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-red-600 text-white py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span className="text-xs font-medium">Now Live: Fast Checkout & Real-time Inventory</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl leading-tight">
            Your one-stop shop for premium electronics
          </h1>

          <p className="text-lg md:text-xl opacity-90 max-w-2xl mb-10">
            Discover the latest gadgets and tech accessories. Fast delivery, secure payments, and genuine products guaranteed.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/products" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-lg flex items-center gap-2">
              Browse Products
              <Icon icon="solar:arrow-right-linear" width="18" />
            </Link>
            <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all transform hover:scale-105 flex items-center gap-2">
              <Icon icon="solar:user-plus-linear" width="18" />
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="py-12 px-4 -mt-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="mx-auto text-sm text-gray-500 font-medium">Featured Products</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
              {[
                { name: 'Wireless Earbuds', price: '$79.99', icon: '🎧', color: 'from-blue-100 to-blue-50' },
                { name: 'Smart Watch', price: '$199.99', icon: '⌚', color: 'from-purple-100 to-purple-50' },
                { name: 'Power Bank', price: '$49.99', icon: '🔋', color: 'from-green-100 to-green-50' },
                { name: 'USB-C Hub', price: '$39.99', icon: '🔌', color: 'from-gray-100 to-gray-50' },
              ].map((item) => (
                <div key={item.name} className={`bg-gradient-to-br ${item.color} rounded-lg p-4 text-center hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer`}>
                  <div className="text-4xl mb-2 transition-transform hover:scale-110">{item.icon}</div>
                  <div className="font-semibold text-gray-800">{item.name}</div>
                  <div className="text-primary font-bold">{item.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Shop With Us</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Experience the best in online retail with our carefully curated selection.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'solar:delivery-linear', title: 'Fast Delivery', desc: 'Quick delivery to your doorstep' },
              { icon: 'solar:shield-check-linear', title: 'Secure Payments', desc: 'Encrypted payment processing' },
              { icon: 'solar:tag-price-linear', title: 'Best Prices', desc: 'Competitive prices & offers' },
              { icon: 'solar:headphones-round-linear', title: '24/7 Support', desc: 'Always here to help you' },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-2 text-center border border-transparent hover:border-primary/20">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-transform hover:scale-110 hover:rotate-6">
                  <Icon icon={feature.icon} width="28" className="text-primary" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Shop by Category</h2>
            <p className="text-gray-600">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Smartphones', icon: '📱', count: 24, color: 'bg-blue-50 hover:bg-blue-100' },
              { name: 'Laptops', icon: '💻', count: 18, color: 'bg-gray-50 hover:bg-gray-100' },
              { name: 'Audio', icon: '🎧', count: 32, color: 'bg-purple-50 hover:bg-purple-100' },
              { name: 'Accessories', icon: '🔌', count: 45, color: 'bg-green-50 hover:bg-green-100' },
              { name: 'Wearables', icon: '⌚', count: 15, color: 'bg-pink-50 hover:bg-pink-100' },
              { name: 'Gaming', icon: '🎮', count: 28, color: 'bg-red-50 hover:bg-red-100' },
            ].map((cat) => (
              <Link to="/products" key={cat.name} className={`${cat.color} rounded-xl p-6 text-center transition-all transform hover:-translate-y-1 hover:shadow-md cursor-pointer`}>
                <div className="text-4xl mb-2 transition-transform hover:scale-125">{cat.icon}</div>
                <div className="font-bold text-gray-800">{cat.name}</div>
                <div className="text-sm text-gray-500">{cat.count} items</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-gray-600">Simple steps to get your favorite products</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Browse & Select', desc: 'Explore our catalog and add items to your cart.', icon: 'solar:magnifer-linear' },
              { step: '02', title: 'Checkout', desc: 'Review your order and complete secure payment.', icon: 'solar:card-linear' },
              { step: '03', title: 'Enjoy', desc: 'Receive your order and enjoy your products.', icon: 'solar:gift-linear' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Icon icon={item.icon} width="36" className="text-primary" />
                </div>
                <div className="text-sm font-bold text-primary mb-2">Step {item.step}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-red-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start shopping?</h2>
          <p className="opacity-90 mb-8">
            Join thousands of happy customers and discover the best products today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-xl">
              Shop Now
            </Link>
            <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
              <Icon icon="solar:user-plus-linear" width="18" />
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

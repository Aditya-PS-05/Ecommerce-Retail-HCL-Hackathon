import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../context';
import { Loader } from '../components';
import api from '../api/axios';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🛒</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to login to view your cart</p>
          <Link
            to="/login"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600"
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
        <Loader size="lg" text="Loading cart..." />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <span className="text-6xl mb-4 block">✅</span>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-2">Your order has been placed successfully.</p>
          <p className="text-gray-600 mb-2">Payment Method: <strong>Cash on Delivery</strong></p>
          <p className="text-gray-600 mb-4">Order ID: <strong>{orderSuccess.id}</strong></p>
          <p className="text-lg font-bold text-gray-800 mb-6">Order Total: ${orderSuccess.total.toFixed(2)}</p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/orders"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600"
            >
              View Orders
            </Link>
            <Link
              to="/home"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🛒</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some products to your cart to get started</p>
          <Link
            to="/home"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      alert('Please enter a shipping address');
      return;
    }

    setCheckoutLoading(true);
    try {
      const orderItems = cart.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      const response = await api.post('/orders', {
        items: orderItems,
        shipping_address: shippingAddress
      });

      setOrderSuccess(response.data);
      await clearCart();
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to place order';
      alert(message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Cart Items */}
          <div className="divide-y">
            {cart.items.map((item) => (
              <div key={item.product_id} className="p-4 flex items-center gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                  <p className="text-primary font-bold">
                    ${(item.price * (1 + (item.tax_percent || 0) / 100)).toFixed(2)}
                    {item.tax_percent > 0 && (
                      <span className="text-xs text-gray-500 ml-1">(+{item.tax_percent}% tax)</span>
                    )}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right min-w-[80px]">
                  <p className="font-bold text-gray-800">
                    ${(item.price * item.quantity * (1 + (item.tax_percent || 0) / 100)).toFixed(2)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.product_id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-gray-50 p-4 border-t">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tax</span>
              <span className="font-semibold">${cart.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total</span>
              <span className="text-primary">${cart.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Section */}
        {!showCheckout ? (
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setShowCheckout(true)}
              className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-red-600"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/home"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 text-center"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Checkout</h2>
            
            {/* Shipping Address */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Shipping Address
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your full shipping address..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Payment Method
              </label>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-semibold text-green-800">Cash on Delivery</p>
                  <p className="text-sm text-green-600">Pay when your order arrives</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="flex justify-between text-lg font-bold">
                <span>Total to Pay</span>
                <span className="text-primary">${cart.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="flex gap-4">
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
              >
                {checkoutLoading ? 'Placing Order...' : 'Confirm Order (Cash on Delivery)'}
              </button>
              <button
                onClick={() => setShowCheckout(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

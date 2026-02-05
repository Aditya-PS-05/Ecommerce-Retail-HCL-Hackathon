import { Link } from 'react-router-dom';
import { useCart } from '../context';

const ProductCard = ({ product, onAddToCart }) => {
  const { cart } = useCart();
  const { id, _id, title, name, price, tax_percent, image_url, stock } = product;
  const productId = id || _id;
  const displayName = title || name;
  const finalPrice = price + (price * (tax_percent || 0) / 100);
  
  const isInCart = cart.items.some(item => item.product_id === productId);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image */}
      <Link to={`/products/${productId}`}>
        <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
          {image_url ? (
            <img src={image_url} alt={displayName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          ) : (
            <span className="text-6xl">📦</span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/products/${productId}`}>
          <h3 className="font-semibold text-lg text-gray-800 hover:text-primary truncate">
            {displayName}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary">${finalPrice.toFixed(2)}</span>
            {tax_percent > 0 && (
              <span className="text-xs text-gray-500 ml-1">(+{tax_percent}% tax)</span>
            )}
          </div>
          {stock <= 10 && stock > 0 && (
            <span className="text-xs text-orange-500">Only {stock} left</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={stock === 0 || isInCart}
          className={`w-full mt-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isInCart
              ? 'bg-green-500 text-white cursor-default shadow-md'
              : 'bg-primary text-white hover:bg-red-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {stock === 0 ? 'Out of Stock' : isInCart ? '✓ Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

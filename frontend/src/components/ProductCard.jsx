import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
  const { id, _id, title, name, price, tax_percent, image_url, stock } = product;
  const productId = id || _id;
  const displayName = title || name;
  const finalPrice = price + (price * (tax_percent || 0) / 100);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <Link to={`/products/${productId}`}>
        <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          {image_url ? (
            <img src={image_url} alt={displayName} className="w-full h-full object-cover" />
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
          disabled={stock === 0}
          className={`w-full mt-4 py-2 rounded-lg font-semibold transition-colors ${
            stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-red-600'
          }`}
        >
          {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

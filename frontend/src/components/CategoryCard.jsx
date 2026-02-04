import { Link } from 'react-router-dom';

const CategoryCard = ({ category, onClick }) => {
  const { _id, name, logo_url } = category;

  return (
    <Link
      to={`/products?category=${_id}`}
      onClick={onClick}
      className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
        {logo_url ? (
          <img src={logo_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">🏷️</span>
        )}
      </div>
      <span className="mt-2 text-sm font-medium text-gray-700 text-center">{name}</span>
    </Link>
  );
};

export default CategoryCard;

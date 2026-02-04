import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  // items = [{ label: 'Home', path: '/' }, { label: 'Products', path: '/products' }, ...]
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 py-3">
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">/</span>}
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link to={item.path} className="hover:text-primary">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;

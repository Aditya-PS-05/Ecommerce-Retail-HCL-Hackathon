import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, user }) => {
  const location = useLocation();

  if (!user) {
    // Redirect to login, but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

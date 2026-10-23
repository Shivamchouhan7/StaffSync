import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    user = null;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && (!user || !roles.includes(user.role))) {
    const destination = user?.role === 'hr'
      ? '/hr-portal'
      : user?.role === 'manager'
        ? '/manager-portal'
        : '/employee-portal';
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default ProtectedRoute;
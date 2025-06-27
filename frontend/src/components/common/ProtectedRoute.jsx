import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { hasRole, isAdmin } from '../../utils/roleUtils';

const ProtectedRoute = ({ children, requiredRoles = null, adminOnly = false, requireAuth = true }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin-only requirement
  if (adminOnly && !isAdmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You need administrator privileges to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn btn-outline btn-orange"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check specific role requirements
  if (requiredRoles && user) {
    const hasRequiredRole = Array.isArray(requiredRoles)
      ? requiredRoles.some(role => hasRole(user, role))
      : hasRole(user, requiredRoles);

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">⛔</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Insufficient Permissions</h1>
              <p className="text-gray-600 mb-2">
                You need {Array.isArray(requiredRoles) ? requiredRoles.join(' or ') : requiredRoles} privileges to access this page.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Current role: {user.role}
              </p>
              <button
                onClick={() => window.history.back()}
                className="btn btn-outline btn-orange"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
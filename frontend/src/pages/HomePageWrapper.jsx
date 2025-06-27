import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HomePage from './HomePage';
import GuestHomePage from './GuestHomePage';

const HomePageWrapper = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Show appropriate home page based on authentication status
  return isAuthenticated ? <HomePage /> : <GuestHomePage />;
};

export default HomePageWrapper;

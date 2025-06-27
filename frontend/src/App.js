import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { StatsProvider } from './contexts/StatsContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePageWrapper from './pages/HomePageWrapper';
import SearchPage from './pages/SearchPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CategoriesOverviewPage from './pages/CategoriesOverviewPage';
import CategoryPage from './pages/CategoryPage';
import FavoritePage from './pages/FavoritePage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';
import './styles/pages.css';

function App() {
  return (
    <AuthProvider>
      <StatsProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePageWrapper />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Guest can access these but need login for interactions */}
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <SearchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipes/:id"
                element={
                  <ProtectedRoute>
                    <RecipeDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <CategoriesOverviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories/:categorySlug"
                element={
                  <ProtectedRoute>
                    <CategoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/recipes/create"
                element={
                  <ProtectedRoute requiredRoles={['chef', 'admin']}>
                    <CreateRecipePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recipes/:id/edit"
                element={
                  <ProtectedRoute requiredRoles={['chef', 'admin']}>
                    <EditRecipePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <FavoritePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={<UserProfilePage />}
              />
              <Route
                path="/my-recipes"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={
                <div className="container px-4 py-8 mx-auto text-center">
                  <h1 className="mb-4 text-4xl font-bold">404 - Page Not Found</h1>
                  <p className="mb-8 text-gray-600">The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn btn-primary">Back to Home</a>
                </div>
              } />
            </Routes>
          </Layout>
        </Router>
      </StatsProvider>
    </AuthProvider>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CreateRecipePage from './pages/CreateRecipePage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

// Temporary pages
const CategoriesPage = () => (
  <div className="container px-4 py-8 mx-auto">
    <h1 className="mb-4 text-3xl font-bold">Recipe Categories</h1>
    <p>Categories page will be implemented here.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/recipes/create" 
              element={
                <ProtectedRoute>
                  <CreateRecipePage />
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
    </AuthProvider>
  );
}

export default App;
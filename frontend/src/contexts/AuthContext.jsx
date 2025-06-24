import { createContext, useState, useEffect, useContext } from 'react';
import { login, register, getProfile, logout } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('cookeasy_token');
      const savedUser = localStorage.getItem('cookeasy_user');
      
      if (token && savedUser) {
        try {
          // Parse saved user data
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Optionally refresh user data from server
          const response = await getProfile();
          setUser(response.user);
          localStorage.setItem('cookeasy_user', JSON.stringify(response.user));
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem('cookeasy_token');
          localStorage.removeItem('cookeasy_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await login(email, password);
      localStorage.setItem('cookeasy_token', response.access_token);
      localStorage.setItem('cookeasy_user', JSON.stringify(response.user));
      setUser(response.user);
      return { success: true, message: response.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await register(userData);
      localStorage.setItem('cookeasy_token', response.access_token);
      localStorage.setItem('cookeasy_user', JSON.stringify(response.user));
      setUser(response.user);
      return { success: true, message: response.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('cookeasy_token');
      localStorage.removeItem('cookeasy_user');
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cookeasy_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser,
    isAuthenticated: !!user,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
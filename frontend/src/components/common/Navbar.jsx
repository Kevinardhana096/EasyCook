import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaBars,
  FaTimes,
  FaUser,
  FaPlus,
  FaHeart,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="sticky top-0 z-50 bg-orange-50 backdrop-blur-md shadow-lg border-b border-orange-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-700 to-orange-900 bg-clip-text text-transparent">
                  CookEasy
                </h1>
                <p className="text-xs text-orange-900 font-serif hidden lg:block">
                  Simple Recipes
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className="text-orange-700 hover:text-orange-900 hover:underline font-normal font-brand transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
            >
              <span className="mr-2"></span>
              Home
            </Link>
            <Link
              to="/search"
              className="text-orange-700 hover:text-orange-900 hover:underline font-normal font-brand transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
            >
              <span className="mr-2"></span>
              Browse Recipes
            </Link>
            <Link
              to="/categories"
              className="text-orange-700 hover:text-orange-900 hover:underline font-normal  font-brand transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
            >
              <span className="mr-2"></span>
              Categories
            </Link>
            {isAuthenticated && (
              <Link
                to="/favorites"
                className="text-orange-700 hover:text-orange-900 hover:underline font-normal transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                <span className="mr-2"></span>
                My Favorites
              </Link>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/recipes/create"
                  className="text-orange-700 hover:text-orange-900 hover:underline font-normal transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
                >
                  <FaPlus className="mr-2" />
                  Create Recipe
                </Link>

                <div className="relative group">
                  <button className="flex items-center p-2 rounded-xl hover:bg-orange-100 transition-colors">
                    <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-orange-300 rounded-full flex items-center justify-center shadow-md ring-1 ring-white/60">
                      <span className="text-orange-800 font-semibold text-sm">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-orange-700 hover:text-orange-900 hover:underline font-normal transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50">
                      {user?.username}
                    </span>
                  </button>

                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="text-orange-700 hover:text-orange-900 hover:underline font-normal transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
                      >
                        <FaUser className="text-orange-800 mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/favorites"
                        className="text-orange-700 hover:text-orange-900 hover:underline font-normal transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
                      >
                        <FaHeart className="text-orange-800 mr-2" />
                        Favorites
                      </Link>
                      <Link
                        to="/settings"
                        className="text-orange-700 hover:text-orange-900 hover:underline font-normal transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
                      >
                        <FaCog className="text-orange-800 mr-2" />
                        Settings
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                      >
                        <FaSignOutAlt />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-orange-700 hover:text-orange-900 hover:underline font-normal transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-orange-700  hover:text-orange-900 px-6 py-2 rounded-xl font-normal hover:underline text-base transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg bg-orange-200 hover:bg-orange-300 text-white transition-colors"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipes..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-300 focus:outline-none transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-orange-100 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-orange-700 hover:text-orange-900 hover:underline font-normal font-brand transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                Home
              </Link>
              <Link
                to="/search"
                onClick={() => setIsMenuOpen(false)}
                className="text-orange-700 hover:text-orange-900 hover:underline font-normal font-brand transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                Browse Recipes
              </Link>
              <Link
                to="/categories"
                onClick={() => setIsMenuOpen(false)}
                className="text-orange-700 hover:text-orange-900 hover:underline font-normal font-brand transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                Categories
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/favorites"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-orange-700 hover:text-orange-900 hover:underline font-normal font-brand transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
                  >
                    My Favorites
                  </Link>
                  <Link
                    to="/recipes/create"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center w-full text-left px-4 py-3 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg"
                  >
                    <FaPlus className="mr-3" />
                    Create Recipe
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                  >
                    <FaUser className="mr-3 text-orange-500" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <FaSignOutAlt className="mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-orange-700 hover:text-orange-900 hover:underline font-normal font-brand transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-orange-700 hover:text-orange-900 hover:underline font-normal font-brand transition-colors duration-200 flex items-center px-3 py-2 rounded-lg hover:bg-orange-50"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;

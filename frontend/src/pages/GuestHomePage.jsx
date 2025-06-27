import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaUserPlus,
  FaSignInAlt,
  FaHeart,
  FaUsers,
  FaStar,
} from "react-icons/fa";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RecipeCard from "../components/recipe/RecipeCard";
import apiClient from "../api/client";

const GuestHomePage = () => {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalUsers: 0,
    totalCategories: 0,
  });

  useEffect(() => {
    loadFeaturedRecipes();
    loadStats();
  }, []);

  const loadFeaturedRecipes = async () => {
    try {
      // Load public recipes for guests
      const response = await apiClient.get(
        "/recipes?page=1&per_page=6&sort=rating"
      );
      setFeaturedRecipes(response.data.recipes || []);
    } catch (err) {
      console.error("Failed to load featured recipes:", err);
    }
  };

  const loadStats = async () => {
    try {
      // You can implement actual stats endpoints later
      setStats({
        totalRecipes: 120,
        totalUsers: 45,
        totalCategories: 12,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section for Guests */}
      <div
        className="hero min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/images/web.png')" }}
      >
        <div className="hero-content justify-end items-center text-right text-gray-800 relative z-10 w-full">
          <div className="mr-14 mb-28">
            <h1 className="text-9xl text-orange-50 font-bold font-serif">
              CookEasy
            </h1>
            <p className="py-6 text-orange-50 font-brand">
              Discover amazing recipes, connect with fellow food lovers, and
              start your culinary journey today.
            </p>
            <div className="flex flex-wrap gap-4 justify-end mt-6">
              <Link
                to="/register"
                className="btn text-white text-sm font-brand bg-gradient-to-r from-orange-700 to-orange-900 border-none hover:brightness-110"
              >
                <FaUserPlus className="mr-2" />
                Join Now
              </Link>
              <Link
                to="/login"
                className="btn bg-white text-sm font-brand text-orange-800 border border-orange-800 hover:bg-orange-50"
              >
                <FaSignInAlt className="mr-2" />
                Sign In
              </Link>
              <Link
                to="/search"
                className="btn text-white text-sm font-brand bg-gradient-to-r from-orange-700 to-orange-900 border-none hover:brightness-110"
              >
                <FaSearch className="mr-2" />
                Browse Recipes
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 container mx-auto px-4 py-16 font-brand">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-medium text-orange-800 font-brand mb-4 tracking-tight">
            Explore Our Highlights
          </h2>
          <p className="text-lg text-orange-700 max-w-xl mx-auto">
            Handpicked recipes loved discover what’s trending today!
          </p>
        </div>

        {/* Featured Recipes Preview */}
        <div className="mb-16">
          {featuredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRecipes.slice(0, 3).map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-orange-50 rounded-2xl transition-shadow duration-300 p-4"
                >
                  <RecipeCard recipe={recipe} showAuthor={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-orange-50">
              <p className="text-orange-800 text-lg">
                Loading amazing recipes...
              </p>
            </div>
          )}

          <div className="mt-10 text-right mr-4">
            <Link
              to="/register"
              className="btn text-orange-800 bg-white hover:bg-orange-50 text-base px-6 py-2 rounded-md shadow-md duration-200 border border-orange-200"
            >
              Join to See More Recipes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestHomePage;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaHeart,
  FaUsers,
  FaStar,
  FaPlus,
  FaEye,
  FaFire,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useStatsContext } from "../contexts/StatsContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RecipeCard from "../components/recipe/RecipeCard";
import { RealTimeStats } from "../components/common/StatCard";
import apiClient from "../api/client";
import { useStats } from "../hooks/useStats";

const HomePage = () => {
  const { user } = useAuth();
  const {
    stats,
    loading: statsLoading,
    lastUpdated,
    refreshStats,
  } = useStatsContext();
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(true);

  useEffect(() => {
    loadFeaturedRecipes();
  }, []);

  const loadFeaturedRecipes = async () => {
    try {
      setRecipesLoading(true);
      const response = await apiClient.get(
        "/recipes?page=1&per_page=6&sort_by=rating"
      );
      setFeaturedRecipes(response.data.recipes || []);
    } catch (err) {
      console.error("Failed to load featured recipes:", err);
    } finally {
      setRecipesLoading(false);
    }
  };

  // Prepare stats for display
  const displayStats = [
    {
      key: "recipes",
      icon: FaHeart,
      title: "Total Recipes",
      value: stats.total_recipes,
      description: "Delicious dishes to try",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      key: "users",
      icon: FaUsers,
      title: "Community",
      value: stats.total_users,
      description: "Active home chefs",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      key: "categories",
      icon: FaStar,
      title: "Categories",
      value: stats.total_categories,
      description: "Recipe varieties",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      key: "views",
      icon: FaEye,
      title: "Total Views",
      value: stats.total_views,
      description: "Recipe engagements",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      key: "likes",
      icon: FaFire,
      title: "Total Likes",
      value: stats.total_likes,
      description: "Community love",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      key: "rating",
      icon: FaStar,
      title: "Avg Rating",
      value: `${stats.average_rating}⭐`,
      description: "Quality score",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  if (statsLoading || recipesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
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
              Discover, create, and share amazing recipes with our community of
              food lovers.
            </p>
            <div className="flex gap-4 justify-end">
              <Link
                to="/search"
                className="btn text-white text-sm font-brand bg-gradient-to-r from-orange-700 to-orange-900 border-none hover:brightness-110"
              >
                <FaSearch className="mr-2" />
                Explore Recipes
              </Link>
              <Link
                to="/recipes/create"
                className="btn bg-white text-sm font-brand text-orange-800 border border-orange-800 hover:bg-orange-50"
              >
                <FaPlus className="mr-2" />
                Create Recipe
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 bg-orange-50 font-brand">
        {/* ✅ Quick Actions (Now First) */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-orange-800 text-center mb-10">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/categories"
              className="flex flex-col items-center justify-center bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition duration-300"
            >
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Browse Categories
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Explore recipes by cuisine type
              </p>
            </Link>

            <Link
              to="/favorites"
              className="flex flex-col items-center justify-center bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition duration-300"
            >
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                My Favorites
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Quick access to saved recipes
              </p>
            </Link>

            <Link
              to="/profile"
              className="flex flex-col items-center justify-center bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition duration-300"
            >
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                My Profile
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Manage your recipes and settings
              </p>
            </Link>
          </div>
        </div>

        {/* 🔽 Featured Recipes */}
        <div>
          <div className="mb-12">
            {/* Judul di tengah */}
            <h2 className="text-4xl font-semibold text-orange-800 text-center mb-2">
              Featured Recipes
            </h2>

            {/* Kalimat pemanis */}
            <p className="text-center text-orange-700 text-base mb-6">
              Get inspired by our top recipes—handpicked for flavor and
              creativity.
            </p>

            {/* Tombol di bawah judul, rata kanan */}
            <div className="flex justify-end">
              <Link
                to="/search"
                className="mr-2 inline-flex items-center px-5 py-3 text-sm font-medium text-orange-50 border bg-orange-800 border-orange-800 rounded-md hover:bg-orange-100 transition-colors duration-200"
              >
                View All
              </Link>
            </div>
          </div>

          {featuredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No featured recipes available yet.
              </p>
              <Link to="/recipes/create" className="btn btn-primary mt-4">
                <FaPlus className="mr-2" />
                Create First Recipe
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

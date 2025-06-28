import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaSearch,
  FaFilter,
  FaStar,
  FaClock,
  FaUsers,
  FaBookmark,
  FaShare,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import RecipeCard from "../components/recipe/RecipeCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useFavorites } from "../contexts/FavoritesContext";
import { useAuth } from "../contexts/AuthContext";

const FavoritePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const { user } = useAuth();
  const { loadFavorites, isLoading } = useFavorites();

  useEffect(() => {
    if (user) {
      fetchFavoriteRecipes();
    }
  }, [user]);

  const fetchFavoriteRecipes = async () => {
    try {
      const { recipesAPI } = await import("../api/recipes");
      const response = await recipesAPI.getFavorites();

      // Transform recipes to add author field for RecipeCard compatibility
      const transformedRecipes = (response.data.recipes || []).map(
        (recipe) => ({
          ...recipe,
          author:
            recipe.user?.username || recipe.user?.full_name || "Unknown Chef",
          rating: recipe.average_rating || 0,
          likes: recipe.like_count || 0,
          views: recipe.view_count || 0,
          image: recipe.image_url,
          cookTime: recipe.cook_time,
          isFavorited: true, // All recipes in favorites are favorited
        })
      );

      setFavoriteRecipes(transformedRecipes);
    } catch (err) {
      console.error("Error fetching favorite recipes:", err);
      // Use mock data as fallback
      setFavoriteRecipes(mockFavoriteRecipes);
    }
  };

  const handleToggleFavorite = async (recipeId, newFavoritedState) => {
    try {
      if (!newFavoritedState) {
        // Recipe was removed from favorites - remove it from the list immediately
        setFavoriteRecipes((prevRecipes) =>
          prevRecipes.filter((recipe) => recipe.id !== recipeId)
        );
      } else {
        // Recipe was added to favorites - refresh the list
        await fetchFavoriteRecipes();
      }
    } catch (err) {
      console.error("Error handling favorite toggle:", err);
      // If there's an error, refresh the list to ensure consistency
      await fetchFavoriteRecipes();
    }
  };

  // Mock data untuk fallback
  const mockFavoriteRecipes = [
    {
      id: 1,
      title: "Nasi Goreng Kampung",
      description:
        "Nasi goreng dengan cita rasa tradisional Indonesia yang autentik",
      image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
      average_rating: 4.8,
      cook_time: 25,
      difficulty: "Easy",
      user: { name: "Chef Sari" },
      view_count: 1200,
      category: { name: "Hidangan Utama" },
      is_favorited: true,
      created_at: "2024-01-15",
      notes: "Resep favorit untuk sarapan keluarga",
    },
    {
      id: 2,
      title: "Rendang Daging Sapi",
      description:
        "Rendang autentik dengan rempah-rempah pilihan dan bumbu yang meresap",
      image:
        "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop",
      average_rating: 4.9,
      cook_time: 180,
      difficulty: "Hard",
      user: { name: "Chef Budi" },
      view_count: 2100,
      category: { name: "Hidangan Utama" },
      is_favorited: true,
      created_at: "2024-01-10",
      notes: "Sempurna untuk acara spesial",
    },
  ];

  // Filter dan sort resep favorit
  const filteredRecipes = favoriteRecipes
    .filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "easy" && recipe.difficulty === "Easy") ||
        (filterBy === "medium" && recipe.difficulty === "Medium") ||
        (filterBy === "hard" && recipe.difficulty === "Hard");

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "rating":
          return (b.average_rating || 0) - (a.average_rating || 0);
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  if (!user) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 text-6xl text-gray-300">🔒</div>
            <h2 className="mb-4 text-2xl font-bold text-gray-700">
              Login Required
            </h2>
            <p className="mb-6 text-gray-600">
              Please login to view your favorite recipes
            </p>
            <Link to="/login" className="btn btn-primary">
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header Section */}
      <div className="bg-orange-50 text-orange-800 font-brand">
        <div className="relative px-4 py-24 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight underline">
                Your Favorite Recipe
              </h1>
            </div>
            <p className="text-base text-orange-700 mb-10 max-w-2xl mx-auto">
              A curated collection of recipes you've saved
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  {favoriteRecipes.length}
                </div>
                <div className="text-xs text-orang-700">Total Favorite</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  {favoriteRecipes.length > 0
                    ? (
                      favoriteRecipes.reduce(
                        (avg, recipe) => avg + (recipe.average_rating || 0),
                        0
                      ) / favoriteRecipes.length
                    ).toFixed(1)
                    : 0}
                </div>
                <div className="text-xs text-orange-00">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8 mx-auto max-w-6xl sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="bg-orange-950 rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md ">
              <FaSearch className="absolute text-orange-800 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find your favorite recipe..."
                className="w-full py-3 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:bg-white transition-all"
              />
            </div>

            {/* Filters and View Mode */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Filter */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="min-w-[130px] text-black px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-800 focus:border-transparent focus:bg-white transition-all"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="min-w-[165px] text-black px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:orange-pink-800 focus:border-transparent focus:bg-white transition-all"
              >
                <option value="newest">Latest Added</option>
                <option value="oldest">Longest Added</option>
                <option value="rating">Highest Rating</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "grid"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "list"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-16 bg-orange-50">
            <LoadingSpinner />
          </div>
        )}

        {/* Recipes Content */}
        {!isLoading && (
          <>
            {filteredRecipes.length > 0 ? (
              <div
                className={`${viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                  }`}
              >
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="relative group">
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300">
                      <RecipeCard
                        recipe={recipe}
                        onFavoriteToggle={handleToggleFavorite}
                        className={`${viewMode === "list" ? "flex flex-row" : ""
                          } border-0`}
                      />

                      {/* Favorite Notes (selalu terlihat jika ada) */}
                      {recipe.notes && (
                        <div className="absolute inset-x-0 bottom-0 p-3 text-sm text-white bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
                          <div className="flex items-start gap-2">
                            <FaBookmark className="text-yellow-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{recipe.notes}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaHeart className="text-3xl text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-700">
                  No favorite recipe yet
                </h3>
                <p className="mb-8 text-gray-500 max-w-md mx-auto">
                  {searchTerm
                    ? `Tidak ada resep favorit yang cocok dengan "${searchTerm}"`
                    : "Mulai jelajahi resep dan tambahkan ke favorit Anda"}
                </p>
                <Link
                  to="/recipes"
                  className="inline-flex items-center px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors"
                >
                  Jelajahi Resep
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritePage;

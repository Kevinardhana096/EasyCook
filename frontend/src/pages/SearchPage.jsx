import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import RecipeCard from "../components/recipe/RecipeCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import apiClient from "../api/client";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State management
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  // Search filters state
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    searchParams.get("difficulty") || ""
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sort") || "created_at"
  );
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load recipes when search params change
  useEffect(() => {
    loadRecipes();
  }, [searchTerm, selectedCategory, selectedDifficulty, sortBy, currentPage]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
    if (sortBy !== "created_at") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", currentPage.toString());

    setSearchParams(params);
  }, [
    searchTerm,
    selectedCategory,
    selectedDifficulty,
    sortBy,
    currentPage,
    setSearchParams,
  ]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get("/recipes/categories");
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadRecipes = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (selectedCategory) params.append("category_id", selectedCategory);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);
      if (sortBy) params.append("sort_by", sortBy);
      params.append("page", currentPage.toString());
      params.append("per_page", "12");

      let endpoint = "/recipes/";
      if (searchTerm) {
        endpoint = `/recipes/search?${params.toString()}`;
      } else {
        endpoint = `/recipes/?${params.toString()}`;
      }

      const response = await apiClient.get(endpoint);
      const data = response.data;

      // Transform recipes to add author field for RecipeCard compatibility
      const transformedRecipes = (data.recipes || []).map(recipe => ({
        ...recipe,
        author: recipe.user?.username || recipe.user?.full_name || 'Unknown Chef'
      }));

      setRecipes(transformedRecipes);
      setTotalResults(data.pagination?.total || data.recipes?.length || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError("Failed to load recipes. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadRecipes();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedDifficulty("");
    setSortBy("created_at");
    setCurrentPage(1);
    navigate("/search");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const difficultyOptions = ["Easy", "Medium", "Hard"];
  const sortOptions = [
    { value: "created_at", label: "Latest" },
    { value: "views", label: "Most Viewed" },
    { value: "likes", label: "Most Liked" },
    { value: "rating", label: "Highest Rated" },
  ];

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Hero Search Section */}
      <div className="relative bg-orange-50">
        <div className="absolute inset-0 bg-orange-50"></div>
        <div className="relative container mx-auto px-6 py-14 font-brand">
          <div className="max-w-4xl mx-auto text-center">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold bg-orange-700 bg-clip-text text-transparent leading-tight mb-3">
                Cook Something Amazing Today
              </h1>

              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Enjoy easy-to-make dishes shared by real cooks.
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <FaSearch className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for recipes, ingredients, cuisines..."
                  className="w-full pl-16 pr-32 py-5 text-lg border-2 border-gray-100 rounded-2xl focus:border-orange-800 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-orange-800 text-white font-medium rounded-xl hover:bg-orange-900 focus:ring-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin h-5 w-5" />
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Search Stats & Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto">
              <div className="text-gray-600">
                {totalResults > 0 ? (
                  <span>
                    Found{" "}
                    <span className="font-semibold text-orange-800">
                      {totalResults}
                    </span>{" "}
                    recipes
                    {searchTerm && ` for "${searchTerm}"`}
                  </span>
                ) : (
                  "Start your culinary journey with a search"
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    showFilters
                      ? "bg-orange-100 text-orange-700 shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaFilter className="h-4 w-4" />
                  Filters
                </button>

                {(searchTerm ||
                  selectedCategory ||
                  selectedDifficulty ||
                  sortBy !== "created_at") && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all duration-200 flex items-center gap-2"
                  >
                    <FaTimes className="h-4 w-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-orange-50 font-brand">
          <div className="container mx-auto px-6 py-6">
            <div className="max-w-4xl mx-auto">
              {/* Wrapper with border and rounded */}
              <div className="border border-gray-500 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-orange-800 mb-6 text-center">
                  Find Your Search
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-orange-800">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-900 bg-white text-black"
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-orange-800">
                      Difficulty Level
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-900 bg-white text-black"
                        value={selectedDifficulty}
                        onChange={(e) => {
                          setSelectedDifficulty(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Levels</option>
                        {difficultyOptions.map((difficulty) => (
                          <option key={difficulty} value={difficulty}>
                            {difficulty}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sort Filter */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-orange-800">
                      Sort By
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-900 bg-white text-black"
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>{" "}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Error State */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-xl">⚠️</span>
                  </div>
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
                <button
                  onClick={loadRecipes}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-800 border-t-orange-800 rounded-full animate-spin"></div>
                <p className="text-orange-800 text-lg">
                  Searching for delicious recipes...
                </p>
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && recipes.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No recipes found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We couldn't find any recipes matching your criteria. Try
                adjusting your search terms or filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Recipe Grid */}
          {!loading && recipes.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    showAuthor={true}
                    className="bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-16">
                  <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg p-2">
                    <button
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-semibold transition-colors disabled:opacity-30 hover:bg-gray-100"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      ‹
                    </button>

                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const page = i + 1;
                      const isActive = page === currentPage;

                      return (
                        <button
                          key={page}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold transition-colors ${
                            isActive
                              ? "bg-orange-500 text-white shadow-md"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="w-12 h-12 flex items-center justify-center text-gray-400">
                          ...
                        </span>
                        <button
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-semibold hover:bg-gray-100 text-gray-700 transition-colors"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-semibold transition-colors disabled:opacity-30 hover:bg-gray-100"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
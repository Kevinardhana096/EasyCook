import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaStar,
  FaClock,
  FaUsers,
  FaUtensils,
  FaFire,
  FaCoffee,
  FaCookie,
  FaCarrot,
} from "react-icons/fa";
import RecipeCard from "../components/recipe/RecipeCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import api from "../api/recipes";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    categorySlug || "all"
  );
  const [sortBy, setSortBy] = useState("popular");
  const [difficulty, setDifficulty] = useState("all");
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Only fetch recipes if categories have been loaded or if we're searching for all categories
    if (categories.length > 0 || selectedCategory === "all") {
      fetchRecipes();
    }
  }, [selectedCategory, sortBy, difficulty, searchTerm, categories]);

  const fetchCategories = async () => {
    try {
      const response = await api.categories.getAll();
      const categoriesData = response.data.categories;

      // Add "All Categories" option
      const allCategories = [
        {
          id: "all",
          name: "Semua Kategori",
          slug: "all",
          recipe_count: categoriesData.reduce(
            (sum, cat) => sum + (cat.recipe_count || 0),
            0
          ),
        },
        ...categoriesData,
      ];

      setCategories(allCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Gagal mengambil data kategori");
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state
      let response;

      if (searchTerm) {
        // Use search API
        const categoryId =
          selectedCategory !== "all"
            ? getCategoryIdBySlug(selectedCategory)
            : null;
        const searchParams = {
          q: searchTerm,
          ...(categoryId && { category_id: categoryId }),
          ...(difficulty !== "all" && { difficulty: difficulty }),
        };
        response = await api.recipes.search(searchParams);
      } else {
        // Use regular recipes API
        const categoryId =
          selectedCategory !== "all"
            ? getCategoryIdBySlug(selectedCategory)
            : null;
        const params = {
          sort_by: sortBy,
          ...(categoryId && { category_id: categoryId }),
          ...(difficulty !== "all" && { difficulty: difficulty }),
        };
        response = await api.recipes.getAll(params);
      }

      // Transform recipes to add author field for RecipeCard compatibility
      const transformedRecipes = (response.data.recipes || []).map(
        (recipe) => ({
          ...recipe,
          author:
            recipe.user?.username || recipe.user?.full_name || "Unknown Chef",
        })
      );

      setRecipes(transformedRecipes);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Gagal mengambil data resep");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIdBySlug = (slug) => {
    if (!slug || slug === "all" || categories.length === 0) {
      return null;
    }
    const category = categories.find((cat) => cat.slug === slug);
    if (!category) {
      console.warn(`Category with slug "${slug}" not found`);
      return null;
    }
    return category.id;
  };

  // Icon mapping for categories
  const iconMap = {
    all: FaUtensils,
    "main-course": FaUtensils,
    appetizer: FaFire,
    dessert: FaCookie,
    beverage: FaCoffee,
    snack: FaCarrot,
    traditional: FaStar,
  };

  // Color mapping for categories
  const colorMap = {
    all: "text-orange-500",
    "main-course": "text-red-500",
    appetizer: "text-yellow-500",
    dessert: "text-pink-500",
    beverage: "text-blue-500",
    snack: "text-green-500",
    traditional: "text-purple-500",
  };

  // Mock data untuk fallback
  const mockCategories = [
    {
      id: "all",
      name: "Semua Kategori",
      icon: FaUtensils,
      count: 150,
      color: "text-orange-500",
      slug: "all",
    },
    {
      id: "main-course",
      name: "Hidangan Utama",
      icon: FaUtensils,
      count: 45,
      color: "text-red-500",
      slug: "main-course",
    },
    {
      id: "appetizer",
      name: "Pembuka",
      icon: FaFire,
      count: 25,
      color: "text-yellow-500",
      slug: "appetizer",
    },
    {
      id: "dessert",
      name: "Penutup",
      icon: FaCookie,
      count: 30,
      color: "text-pink-500",
      slug: "dessert",
    },
    {
      id: "beverage",
      name: "Minuman",
      icon: FaCoffee,
      count: 20,
      color: "text-blue-500",
      slug: "beverage",
    },
    {
      id: "snack",
      name: "Camilan",
      icon: FaCarrot,
      count: 35,
      color: "text-green-500",
      slug: "snack",
    },
    {
      id: "traditional",
      name: "Tradisional",
      icon: FaStar,
      count: 40,
      color: "text-purple-500",
      slug: "traditional",
    },
  ];

  // Use API data if available, otherwise use mock data
  const displayCategories =
    categories.length > 0
      ? categories.map((cat) => ({
          ...cat,
          icon: iconMap[cat.slug] || FaUtensils,
          color: colorMap[cat.slug] || "text-gray-500",
          count: cat.recipe_count || 0,
        }))
      : mockCategories;

  // Filter dan sort resep (jika diperlukan untuk data lokal)
  const filteredRecipes = recipes;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (searchTerm) {
        prev.set("search", searchTerm);
      } else {
        prev.delete("search");
      }
      return prev;
    });
  };

  const getCurrentCategory = () => {
    return (
      displayCategories.find(
        (cat) => cat.id === selectedCategory || cat.slug === selectedCategory
      ) || displayCategories[0]
    );
  };

  return (
    <div className="min-h-screen bg-orange-50 font-brand">
      {/* Header Section */}
      <div className="bg-orange-50">
        <div className="px-4 py-24 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight underline text-orange-800">
              Recipe Category
            </h1>
            <p className="mb-10 text-base text-orange-700 max-w-2xl mx-auto">
              Find your favorite recipes based on the categories you like
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-lg mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for recipes in the category..."
                  className="w-full px-6 py-4 text-base text-gray-700 bg-white-50 border border-gray-200 rounded-full pr-14 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="absolute p-3 text-white transition-all -translate-y-1/2 bg-orange-800 rounded-full right-2 top-1/2 hover:bg-orange-900 focus:ring-2 focus:ring-orange-800 focus:ring-offset-2"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="px-2 py-8 mx-auto max-w-12xl sm:px-6 lg:px-8 font-brand">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <div className="lg:w-80 lg:flex-shrink-0 font-brand">
            <div className="sticky top-6">
              <div className="p-6 bg-orange-950 rounded-xl shadow-sm border border-orange-800">
                {/* Categories */}
                <div>
                  <h3 className="flex items-center gap-2 mb-6 text-lg font-semibold text-orange-50">
                    Kategori
                  </h3>
                  <div className="space-y-1">
                    {displayCategories.map((category) => {
                      const Icon = category.icon;
                      const isActive =
                        selectedCategory === category.id ||
                        selectedCategory === category.slug;
                      return (
                        <button
                          key={category.id}
                          onClick={() =>
                            setSelectedCategory(category.slug || category.id)
                          }
                          className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between group ${
                            isActive
                              ? "bg-orange-50 text-orange-700 border border-orange-200 shadow-sm"
                              : "hover:bg-orange-500 text-orange-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`text-lg ${
                                isActive
                                  ? "text-orange-500"
                                  : "text-gray-400 group-hover:text-gray-600"
                              }`}
                            />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <span
                            className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              isActive
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {category.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 font-brand">
            {/* Results Header */}
            <div className="flex flex-col items-start justify-between mb-8 sm:flex-row sm:items-center">
              <div className="mb-4 sm:mb-0">
                <h2 className="mb-2 text-2xl font-bold text-orange-900">
                  {getCurrentCategory().name}
                </h2>
                <p className="text-orange-800">
                  Showing {filteredRecipes.length} recipe
                  {searchTerm && (
                    <span className="inline-flex items-center ml-2 px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      "{searchTerm}"
                    </span>
                  )}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-800">
                    {filteredRecipes.length}
                  </div>
                  <div className="text-sm text-orange-700">Recipe</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-800">
                    {filteredRecipes.length > 0
                      ? (
                          filteredRecipes.reduce(
                            (avg, recipe) => avg + (recipe.average_rating || 0),
                            0
                          ) / filteredRecipes.length
                        ).toFixed(1)
                      : 0}
                  </div>
                  <div className="text-sm text-orange-700">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-16">
                <LoadingSpinner />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Terjadi Kesalahan
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Recipes Grid */}
            {!loading && !error && (
              <>
                {filteredRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        className="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-700">
                      Tidak ada resep ditemukan
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Coba ubah filter atau kata kunci pencarian Anda untuk
                      menemukan resep yang sesuai
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Pagination or Load More */}
            {!loading &&
              !error &&
              filteredRecipes.length > 0 &&
              pagination &&
              pagination.has_next && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => {
                      // Implement load more functionality
                      console.log("Load more clicked");
                    }}
                    className="inline-flex items-center px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors shadow-sm hover:shadow"
                  >
                    Muat Lebih Banyak
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;

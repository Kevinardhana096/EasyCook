import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaUtensils,
  FaFire,
  FaCoffee,
  FaCookie,
  FaCarrot,
  FaStar,
  FaArrowRight,
  FaSync,
} from "react-icons/fa";
import CategoryCard from "../components/recipe/CategoryCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import api from "../api/recipes";
import { useStats } from "../hooks/useStats";

const CategoriesOverviewPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use stats hook for real-time statistics
  const {
    stats,
    loading: statsLoading,
    refreshStats,
    lastUpdated,
  } = useStats(true, 180000); // Auto-refresh every 3 minutes

  // Icon mapping for categories
  const iconMap = {
    "main-course": FaUtensils,
    appetizer: FaFire,
    dessert: FaCookie,
    beverage: FaCoffee,
    snack: FaCarrot,
    traditional: FaStar,
    vegetarian: FaCarrot,
  };

  // Color mapping for categories
  const colorMap = {
    "main-course": "text-red-500",
    appetizer: "text-yellow-500",
    dessert: "text-pink-500",
    beverage: "text-blue-500",
    snack: "text-green-500",
    traditional: "text-purple-500",
    vegetarian: "text-green-600",
  };

  // Default images for categories
  const imageMap = {
    "main-course":
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
    appetizer:
      "https://images.unsplash.com/photo-1541795795328-f073b763494e?w=400&h=300&fit=crop",
    dessert:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
    beverage:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
    snack:
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop",
    traditional:
      "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop",
    vegetarian:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.categories.getAll();

      // Transform API data to match component format
      const transformedCategories = response.data.categories.map(
        (category) => ({
          id: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
          name: category.name,
          description:
            category.description ||
            `Resep ${category.name.toLowerCase()} yang lezat`,
          image:
            category.image_url ||
            imageMap[category.slug] ||
            imageMap["main-course"],
          count: category.recipe_count || 0,
          icon: iconMap[category.slug] || "utensils",
          color: colorMap[category.slug] || "text-gray-500",
          featured: category.is_featured || false,
          slug: category.slug,
        })
      );

      setCategories(transformedCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Gagal mengambil data kategori");
    } finally {
      setLoading(false);
    }
  };

  // Mock data untuk fallback jika API gagal
  const mockCategories = [
    {
      id: "main-course",
      name: "Hidangan Utama",
      description: "Resep makanan pokok untuk makan siang dan malam",
      image:
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
      count: 45,
      icon: "utensils",
      color: "text-red-500",
      featured: true,
    },
    {
      id: "appetizer",
      name: "Pembuka",
      description: "Makanan ringan untuk membuka selera makan",
      image:
        "https://images.unsplash.com/photo-1541795795328-f073b763494e?w=400&h=300&fit=crop",
      count: 25,
      icon: "fire",
      color: "text-yellow-500",
      featured: false,
    },
  ];

  // Use API data if available, otherwise use mock data
  const displayCategories =
    categories.length > 0 ? categories : error ? mockCategories : [];

  // Show loading spinner if loading
  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Filter categories berdasarkan search
  const filteredCategories = displayCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Split categories untuk featured dan regular
  const featuredCategories = filteredCategories.filter((cat) => cat.featured);
  const regularCategories = filteredCategories.filter((cat) => !cat.featured);

  const totalRecipes = displayCategories.reduce(
    (sum, cat) => sum + cat.count,
    0
  );

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Hero Section */}
      <div className="relative bg-orange-50 text-orange-800 overflow-hidden font-brand">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight underline">
              Explore the Recipe Category
            </h1>
            <p className="text-lg text-orange-700 mb-12 max-w-2xl mx-auto leading-relaxed">
              Explore recipes by category and cook what you love.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find Category ..."
                  className="w-full px-6 py-4 pr-14 rounded-full text-gray-600 text-base bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 border-0"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-800 hover:bg-orange-900 text-orange-50 p-3 rounded-full transition-colors cursor-pointer">
                  <FaSearch />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  {stats.total_categories}
                </div>
                <div className="text-sm text-orange-700">Category</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  {stats.total_recipes}
                </div>
                <div className="text-sm text-orange-700">Total Recipe</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  {stats.average_rating || 4.8}
                </div>
                <div className="text-sm text-orange-700">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Popular Categories
                </h2>
                <p className="text-gray-600">
                  Categories most favored by others
                </p>
              </div>

              <div className="hidden md:flex items-center text-orange-600 hover:text-orange-700 cursor-pointer transition-colors group">
                <span className="mr-2 font-medium">Lihat Semua</span>
                <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  className="transform hover:scale-[1.02] hover:shadow-lg transition-all duration-300 bg-white rounded-xl"
                />
              ))}
            </div>
          </section>
        )}

        {/* All Categories */}
        <section>
          <div className="flex items-center justify-between mb-8 mt-7 font-brand">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-orange-900 mb-2">
                Popular Categories
              </h2>
              <p className="text-orange-800 text-base">
                Browse all available recipe categories
                {searchTerm && (
                  <span className="inline-flex items-center ml-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    "{searchTerm}"
                  </span>
                )}
              </p>
            </div>

            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-orange-800 hover:text-orange-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Hapus Filter
              </button>
            )}
          </div>

          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {regularCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  className="transform hover:scale-[1.02] hover:shadow-md transition-all duration-300 bg-white rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 font-brand">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <FaSearch className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Category not found
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                There is no category that matches the search "{searchTerm}".
                Try other keywords or look at all categories.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center px-6 py-3 bg-orange-900 hover:bg-orange-800 text-white font-medium rounded-lg transition-colors"
              >
                See all categories
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CategoriesOverviewPage;

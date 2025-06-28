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

  // Icon mapping for categories (konsisten bahasa Indonesia)
  const iconMap = {
    "hidangan-utama": FaUtensils,
    "pembuka": FaFire,
    "penutup": FaCookie,
    "minuman": FaCoffee,
    "camilan": FaCarrot,
    "tradisional": FaStar,
  };

  // Color mapping for categories
  const colorMap = {
    "hidangan-utama": "text-red-500",
    "pembuka": "text-yellow-500",
    "penutup": "text-pink-500",
    "minuman": "text-blue-500",
    "camilan": "text-green-500",
    "tradisional": "text-purple-500",
  };

  // Default images for categories
  const imageMap = {
    "hidangan-utama":
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
    "pembuka":
      "https://images.unsplash.com/photo-1541795795328-f073b763494e?w=400&h=300&fit=crop",
    "penutup":
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
    "minuman":
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
    "camilan":
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop",
    "tradisional":
      "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop",
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
            imageMap["hidangan-utama"],
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

  // Mock data untuk fallback jika API gagal (kategori konsisten bahasa Indonesia)
  const mockCategories = [
    {
      id: "hidangan-utama",
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
      id: "penutup",
      name: "Penutup",
      description: "Dessert dan makanan manis untuk mengakhiri makan",
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
      count: 30,
      icon: "cookie",
      color: "text-pink-500",
      featured: true,
    },
    {
      id: "tradisional",
      name: "Tradisional",
      description: "Resep masakan tradisional Nusantara",
      image:
        "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop",
      count: 40,
      icon: "star",
      color: "text-purple-500",
      featured: true,
    },
    {
      id: "pembuka",
      name: "Pembuka",
      description: "Makanan ringan untuk membuka selera makan",
      image:
        "https://images.unsplash.com/photo-1541795795328-f073b763494e?w=400&h=300&fit=crop",
      count: 25,
      icon: "fire",
      color: "text-yellow-500",
      featured: false,
    },
    {
      id: "minuman",
      name: "Minuman",
      description: "Berbagai jenis minuman segar dan hangat",
      image:
        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
      count: 20,
      icon: "coffee",
      color: "text-blue-500",
      featured: false,
    },
    {
      id: "camilan",
      name: "Camilan",
      description: "Makanan ringan untuk menemani waktu santai",
      image:
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop",
      count: 35,
      icon: "carrot",
      color: "text-green-500",
      featured: false,
    },
  ];

  // Use API data if available, otherwise use mock data
  const displayCategories =
    categories.length > 0 ? categories : error ? mockCategories : [];

  // Show loading spinner if loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-orange-50">
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
      <div className="relative overflow-hidden text-orange-800 bg-orange-50 font-brand">
        <div className="relative max-w-5xl px-4 mx-auto mt-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-semibold tracking-tight underline md:text-5xl">
              Explore the Recipe Category
            </h1>
            <p className="max-w-2xl mx-auto mb-12 text-lg leading-relaxed text-orange-700">
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
                  className="w-full px-6 py-4 text-base text-gray-600 bg-white border-0 rounded-full shadow-lg pr-14 focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <div className="absolute p-3 transition-colors -translate-y-1/2 bg-orange-800 rounded-full cursor-pointer right-2 top-1/2 hover:bg-orange-900 text-orange-50">
                  <FaSearch />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid max-w-lg grid-cols-1 gap-6 mx-auto md:grid-cols-3">
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold md:text-3xl">
                  {stats.total_categories}
                </div>
                <div className="text-sm text-orange-700">Category</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold md:text-3xl">
                  {stats.total_recipes}
                </div>
                <div className="text-sm text-orange-700">Total Recipe</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold md:text-3xl">
                  {stats.average_rating || 4.8}
                </div>
                <div className="text-sm text-orange-700">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                  Popular Categories
                </h2>
                <p className="text-gray-600">
                  Categories most favored by others
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="flex items-center justify-between mt-7 font-brand">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 text-sm font-medium text-orange-800 transition-colors rounded-lg hover:text-orange-700 hover:bg-orange-50"
              >
                Hapus Filter
              </button>
            )}
          </div>

          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {regularCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  className="transform hover:scale-[1.02] hover:shadow-md transition-all duration-300 bg-white rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center font-brand">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full">
                <FaSearch className="text-3xl text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-700">
                Category not found
              </h3>
              <p className="max-w-md mx-auto mb-8 text-gray-500">
                There is no category that matches the search "{searchTerm}".
                Try other keywords or look at all categories.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors bg-orange-900 rounded-lg hover:bg-orange-800"
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

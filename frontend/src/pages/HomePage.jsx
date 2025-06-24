import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaArrowRight,
  FaStar,
  FaClock,
  FaUsers,
  FaFire,
  FaHeart,
  FaPlay,
} from "react-icons/fa";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredRecipes] = useState([
    {
      id: 1,
      title: "Nasi Goreng Spesial",
      description: "Nasi goreng dengan bumbu rahasia yang menggugah selera",
      image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
      rating: 4.8,
      cookTime: 25,
      difficulty: "Easy",
      author: "Chef Sari",
      likes: 245,
    },
    {
      id: 2,
      title: "Rendang Daging Sapi",
      description: "Rendang autentik dengan rempah-rempah pilihan",
      image:
        "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop",
      rating: 4.9,
      cookTime: 180,
      difficulty: "Hard",
      author: "Chef Budi",
      likes: 389,
    },
    {
      id: 3,
      title: "Gado-Gado Jakarta",
      description: "Salad sayuran segar dengan bumbu kacang yang nikmat",
      image:
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
      rating: 4.7,
      cookTime: 30,
      difficulty: "Medium",
      author: "Chef Ina",
      likes: 156,
    },
  ]);

  const [categories] = useState([
    {
      id: 1,
      name: "Main Dishes",
      icon: "🍽️",
      count: 120,
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: 2,
      name: "Appetizers",
      icon: "🥗",
      count: 85,
      color: "bg-green-100 text-green-600",
    },
    {
      id: 3,
      name: "Desserts",
      icon: "🍰",
      count: 95,
      color: "bg-pink-100 text-pink-600",
    },
    {
      id: 4,
      name: "Beverages",
      icon: "🥤",
      count: 45,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 5,
      name: "Breakfast",
      icon: "🥞",
      count: 65,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      id: 6,
      name: "Snacks",
      icon: "🍿",
      count: 75,
      color: "bg-purple-100 text-purple-600",
    },
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(
        searchTerm.trim()
      )}`;
    }
  };
  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section
        className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-end"
        style={{ backgroundImage: "url('/images/web.png')" }}
      >
        {/* <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div> */}
        <div className="relative z-10 text-right px-6 max-w-4xl mt-[-140px] mr-16">
          <h1 className="text-5xl md:text-9xl font-serif bg-gradient-to-r from-orange-700 to-orange-900 bg-clip-text text-transparent leading-tight mb-4 drop-shadow-sm">
            CookEasy
          </h1>
          <p className="text-sm md:text-lg font-brand text-orange-800 font-normal mt-3">
            Explore new flavors, create something amazing, and make it yours.
          </p>
          <p className="text-sm md:text-lg font-brand text-orange-800 font-normal mb-10">
            Join thousands of home cooks sharing delicious ideas every day.
          </p>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Link
              to="/search"
              className="bg-gradient-to-r from-orange-600 to-orange-800 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:from-orange-700 hover:to-orange-900 transition-all duration-200 shadow-sm"
            >
              <FaSearch className="inline mr-2" />
              Explore Recipes
            </Link>
            <Link
              to="/recipes/create"
              className="bg-white text-orange-700 border border-orange-300 px-6 py-2.5 rounded-md text-sm font-medium hover:bg-orange-50 transition-all duration-200 shadow-sm"
            >
              Share Your Recipe
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-orange-50">
        <div className="container mx-auto px-4">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-medium font-brand text-orange-800 mb-2">
              Browse by Category
            </h2>
            <p className="text-orange-700 font-brand font-normal md:text-base max-w-xl mx-auto">
              Find the perfect recipe by exploring your favorite categories.
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mx-auto mt-4"></div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/search?category=${category.name
                  .toLowerCase()
                  .replace(" ", "-")}`}
                className="bg-white rounded-xl shadow hover:shadow-md transition-shadow duration-200 p-5 text-center"
              >
                <div
                  className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl ${category.color}`}
                >
                  {category.icon}
                </div>
                <h3 className="font-medium text-gray-800 text-base">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {category.count} recipes
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Recipes Section */}
      <section className="py-6 bg-gradient-to-b from-orange-50 to-orange-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-orange-800 mb-4">
              Featured Recipes
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the most loved and highest-rated dishes from our amazing
              community.
            </p>
            <div className="h-1 w-20 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mx-auto mt-4"></div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredRecipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-transform duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {recipe.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        recipe.difficulty === "Easy"
                          ? "bg-green-100 text-green-700"
                          : recipe.difficulty === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {recipe.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {recipe.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" /> {recipe.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaHeart className="text-red-400" /> {recipe.likes}
                    </span>
                    <span>by {recipe.author}</span>
                  </div>
                  <Link
                    to={`/recipes/${recipe.id}`}
                    className="block text-center mt-5 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
                  >
                    View Recipe
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-14">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg text-base font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
            >
              Explore All Recipes <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

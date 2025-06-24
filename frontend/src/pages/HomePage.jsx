import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowRight, FaStar, FaClock, FaUsers, FaFire, FaHeart, FaPlay } from 'react-icons/fa';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredRecipes] = useState([
    {
      id: 1,
      title: "Nasi Goreng Spesial",
      description: "Nasi goreng dengan bumbu rahasia yang menggugah selera",
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
      rating: 4.8,
      cookTime: 25,
      difficulty: "Easy",
      author: "Chef Sari",
      likes: 245
    },
    {
      id: 2,
      title: "Rendang Daging Sapi",
      description: "Rendang autentik dengan rempah-rempah pilihan",
      image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop",
      rating: 4.9,
      cookTime: 180,
      difficulty: "Hard",
      author: "Chef Budi",
      likes: 389
    },
    {
      id: 3,
      title: "Gado-Gado Jakarta",
      description: "Salad sayuran segar dengan bumbu kacang yang nikmat",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
      rating: 4.7,
      cookTime: 30,
      difficulty: "Medium",
      author: "Chef Ina",
      likes: 156
    }
  ]);

  const [categories] = useState([
    { id: 1, name: "Main Dishes", icon: "🍽️", count: 120, color: "bg-orange-100 text-orange-600" },
    { id: 2, name: "Appetizers", icon: "🥗", count: 85, color: "bg-green-100 text-green-600" },
    { id: 3, name: "Desserts", icon: "🍰", count: 95, color: "bg-pink-100 text-pink-600" },
    { id: 4, name: "Beverages", icon: "🥤", count: 45, color: "bg-blue-100 text-blue-600" },
    { id: 5, name: "Breakfast", icon: "🥞", count: 65, color: "bg-yellow-100 text-yellow-600" },
    { id: 6, name: "Snacks", icon: "🍿", count: 75, color: "bg-purple-100 text-purple-600" }
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };
  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="hero min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 hero-pattern relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce">🍳</div>
        <div className="absolute top-40 right-20 text-4xl opacity-20 animate-pulse">🥘</div>
        <div className="absolute bottom-40 left-20 text-5xl opacity-20 animate-bounce delay-1000">🍽️</div>
        <div className="absolute bottom-20 right-10 text-3xl opacity-20 animate-pulse delay-500">👨‍🍳</div>

        <div className="hero-content text-center max-w-6xl mx-auto px-4 relative z-10">
          <div className="max-w-5xl">
            <div className="mb-12">
              <div className="flex justify-center items-center mb-6">
                <div className="text-8xl animate-bounce">🍳</div>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-8 animate-fade-in leading-tight">
                CookEasy
              </h1>
              <div className="flex justify-center items-center gap-4 mb-8">
                <span className="text-2xl animate-pulse">✨</span>
                <p className="text-2xl md:text-3xl text-gray-700 font-medium animate-slide-up">
                  Discover, Cook, and Share Amazing Recipes
                </p>
                <span className="text-2xl animate-pulse">✨</span>
              </div>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Join thousands of passionate home cooks and professional chefs in our vibrant culinary community.
                From quick weeknight dinners to elaborate weekend feasts, find your next favorite recipe here!
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="max-w-3xl mx-auto mb-16 animate-slide-up">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-2xl shadow-2xl p-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="What delicious recipe are you craving today? 🔍"
                      className="w-full pl-14 pr-4 py-4 text-lg rounded-xl border-2 border-transparent focus:border-orange-300 focus:outline-none transition-all duration-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-500 hover:to-red-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Find Recipes 🚀
                  </button>
                </div>
              </form>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="bg-white/80 text-gray-700 px-4 py-2 rounded-full text-sm">Popular: </span>
                <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-orange-200 transition-colors">Nasi Goreng</span>
                <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-yellow-200 transition-colors">Rendang</span>
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-green-200 transition-colors">Gado-gado</span>
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition-colors">Sate</span>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-bounce-in mb-16">
              <Link
                to="/search"
                className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-orange-500 hover:to-red-500 transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center gap-3"
              >
                <FaSearch className="text-xl" />
                Explore Recipes
              </Link>
              <Link
                to="/recipes/create"
                className="bg-white text-orange-600 border-2 border-orange-300 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center gap-3"
              >
                <FaArrowRight className="text-xl" />
                Share Your Recipe
              </Link>
            </div>

            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <FaUsers className="text-white text-xl" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">5K+</div>
                <div className="text-gray-600 font-medium">Active Cooks</div>
              </div>

              <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                    <FaFire className="text-white text-xl" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-1">12K+</div>
                <div className="text-gray-600 font-medium">Delicious Recipes</div>
              </div>

              <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <FaStar className="text-white text-xl" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-1">4.9★</div>
                <div className="text-gray-600 font-medium">Average Rating</div>
              </div>

              <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                    <FaHeart className="text-white text-xl" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-600 mb-1">45K+</div>
                <div className="text-gray-600 font-medium">Recipe Favorites</div>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Enhanced Featured Recipes Section */}
      <section className="py-24 bg-gradient-to-b from-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3">
                <span className="text-5xl">🏆</span>
                <h2 className="text-4xl md:text-5xl font-bold text-gradient">Featured Recipes</h2>
                <span className="text-5xl">🏆</span>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the most popular and highest-rated recipes from our amazing community of food lovers
            </p>
            <div className="flex justify-center mt-6">
              <div className="bg-gradient-to-r from-orange-400 to-red-400 h-1 w-24 rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {featuredRecipes.map((recipe, index) => (
              <div key={recipe.id} className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                {/* Recipe Image */}
                <figure className="relative overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* Overlay Elements */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                  {/* Heart Icon */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-3 transform scale-0 group-hover:scale-100 transition-all duration-300">
                    <FaHeart className="text-red-500 text-lg" />
                  </div>

                  {/* Cooking Time Badge */}
                  <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur">
                    <FaClock className="inline mr-2" />
                    {recipe.cookTime} min
                  </div>

                  {/* Recipe Number Badge */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-400 to-red-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                </figure>

                {/* Recipe Content */}
                <div className="p-6">
                  {/* Title and Difficulty */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-xl text-gray-800 leading-tight flex-1 group-hover:text-orange-600 transition-colors">
                      {recipe.title}
                    </h3>
                    <div className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {recipe.difficulty === 'Easy' ? '🟢' : recipe.difficulty === 'Medium' ? '🟡' : '🔴'} {recipe.difficulty}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{recipe.description}</p>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {/* Rating */}
                      <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                        <FaStar className="text-yellow-500 mr-1" />
                        <span className="font-semibold text-yellow-700">{recipe.rating}</span>
                      </div>

                      {/* Likes */}
                      <div className="flex items-center text-gray-500">
                        <FaHeart className="text-red-400 mr-1" />
                        <span className="text-sm font-medium">{recipe.likes}</span>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="text-sm text-gray-500">
                      by <span className="font-medium text-gray-700">{recipe.author}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/recipes/${recipe.id}`}
                    className="w-full bg-gradient-to-r from-orange-400 to-red-400 text-white py-3 rounded-xl font-semibold text-center hover:from-orange-500 hover:to-red-500 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <FaPlay className="group-hover:translate-x-1 transition-transform" />
                    View Recipe
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-16">
            <Link
              to="/search"
              className="inline-flex items-center gap-3 bg-white text-orange-600 border-2 border-orange-300 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 transform hover:scale-105 shadow-xl"
            >
              <span>Explore All Recipes</span>
              <FaArrowRight className="text-xl" />
              <span className="text-2xl">🍽️</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find recipes by your favorite food categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/search?category=${category.name.toLowerCase().replace(' ', '-')}`}
                className="card bg-base-100 shadow-lg card-hover text-center p-6"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl ${category.color}`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} recipes</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Cooking?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community of passionate cooks and start sharing your culinary creations today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-accent btn-lg px-8">
                Join CookEasy Today
              </Link>
              <Link to="/recipes/create" className="btn btn-outline btn-lg px-8 text-white border-white hover:bg-white hover:text-primary">
                Share Your First Recipe
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
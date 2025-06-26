import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaStar,
  FaClock,
  FaUsers,
  FaHeart,
  FaBookmark,
  FaShare,
  FaEye,
  FaThumbsUp,
  FaUser,
  FaCalendar,
  FaPrint,
  FaArrowLeft,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import apiClient from "../api/client";

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState("instructions");

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/recipes/${id}`);
      setRecipe(response.data.recipe);

      // Check if bookmarked (if user is logged in)
      if (isAuthenticated) {
        // This would be implemented when bookmark API is ready
        setIsBookmarked(false);
      }
    } catch (err) {
      setError("Recipe not found or failed to load");
      console.error("Recipe load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      // Placeholder for bookmark API call
      setIsBookmarked(!isBookmarked);
      // await apiClient.post(`/recipes/${id}/bookmark`);
      console.log("Bookmark toggled");
    } catch (err) {
      console.error("Bookmark error:", err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title,
        text: recipe?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Recipe link copied to clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading recipe..." />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold mb-2">Recipe Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate(-1)} className="btn btn-outline">
              <FaArrowLeft className="mr-2" />
              Go Back
            </button>
            <Link to="/search" className="btn btn-primary">
              Browse Recipes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-circle bg-orange-100 text-orange-700 border-0 hover:bg-orange-200 hover:text-orange-900"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="btn btn-circle bg-orange-100 shadow-md hover:shadow-lg text-orange-700 border-0 hover:bg-orange-200 hover:text-orange-900"
            >
              <FaShare className="text-lg" />
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-circle bg-orange-100 shadow-md hover:shadow-lg text-orange-700 border-0 hover:bg-orange-200 hover:text-orange-900"
            >
              <FaPrint className="text-lg" />
            </button>
            <button
              onClick={handleBookmark}
              className={`btn btn-circle shadow-md hover:shadow-lg border-0 ${
                isBookmarked
                  ? "bg-orange-700 text-white hover:bg-orange-200"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-900"
              }`}
            >
              <FaBookmark className="text-lg" />
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Gambar + Recipe by */}
          <div className="lg:col-span-5 space-y-4">
            {/* Image */}
            <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-lg">
              {recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-orange-100 to-orange-200">
                  🍳
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Recipe Info */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title + Description + Tags */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 mt-8">
              <h1 className="text-3xl lg:text-4xl font-semibold text-orange-800 font-brand text-gray-800 leading-tight">
                {recipe.title}
              </h1>

              <p className="text-gray-500 text-sm font-brand flex items-center mr-2">
                <FaCalendar className="mr-2" />
                {new Date(recipe.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <p className="text-orange-700 text-lg leading-relaxed">
              {recipe.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
              {/* Tags */}
              <div className="flex flex-wrap font-brand items-center gap-3">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    recipe.difficulty === "Easy"
                      ? "bg-green-100 text-green-700"
                      : recipe.difficulty === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {recipe.difficulty || "Medium"}
                </span>

                {recipe.category && (
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {recipe.category.icon} {recipe.category.name}
                  </span>
                )}
              </div>

              {/* Author - kanan */}
              <div className="flex items-center gap-2 mt-1 mr-2 sm:mt-0 ml-auto">
                <p className="text-sm text-gray-500 font-brand font-medium">
                  By:{" "}
                  <span className="text-gray-500 font-brand font-medium">
                    {recipe.user?.username || "Unknown Chef"}
                  </span>
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <h3 className="text-lg font-semibold font-brand text-gray-700 mb-4">
                Recipe Details
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 font-brand">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <FaClock className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Time
                    </p>
                    <p className="font-semibold text-gray-800">
                      {recipe.total_time || "N/A"}m
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUsers className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Serves
                    </p>
                    <p className="font-semibold text-gray-800">
                      {recipe.servings || 1}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FaStar className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Rating
                    </p>
                    <p className="font-semibold text-gray-800">
                      {recipe.average_rating || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FaEye className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Views
                    </p>
                    <p className="font-semibold text-gray-800">
                      {recipe.view_count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-4xl mx-auto mt-10">
        <div className="tabs tabs-boxed bg-orange-900 justify-center mb-6 space-x-2">
          <button
            className={`tab rounded-xl font-brand font-medium ${
              activeTab === "instructions"
                ? "bg-orange-50 text-orange-800"
                : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
            }`}
            onClick={() => setActiveTab("instructions")}
          >
            Instructions
          </button>
          <button
            className={`tab rounded-none font-brand font-medium ${
              activeTab === "ingredients"
                ? "bg-orange-50 text-orange-800"
                : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
            }`}
            onClick={() => setActiveTab("ingredients")}
          >
            Ingredients
          </button>
          <button
            className={`tab rounded-none font-brand font-medium ${
              activeTab === "nutrition"
                ? "bg-orange-50 text-orange-800"
                : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
            }`}
            onClick={() => setActiveTab("nutrition")}
          >
            Nutrition
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === "instructions" && (
            <>
              <h2 className="text-2xl font-semibold font-brand text-orange-800 mb-3">
                Cooking Instructions
              </h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {recipe.instructions}
              </div>
              {recipe.tips && (
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-1">
                    💡 Chef's Tips
                  </h3>
                  <p className="text-yellow-800">{recipe.tips}</p>
                </div>
              )}
            </>
          )}

          {activeTab === "ingredients" && (
            <>
              <h2 className="text-2xl font-semibold font-brand text-orange-800 mb-3">
                Ingredients
              </h2>
              {recipe.ingredients?.length > 0 ? (
                <ul className="space-y-2">
                  {recipe.ingredients.map((item, index) => (
                    <li
                      key={index}
                      className="bg-white flex items-center gap-3 bg-base-200 px-4 py-2 rounded-lg"
                    >
                      <div className="w-6 h-6 flex items-center font-brand justify-center bg-orange-800 text-white text-xs font-bold rounded-full">
                        {index + 1}
                      </div>
                      <span className="font-medium font-brand text-gray-700">
                        {item.quantity} {item.unit}
                      </span>
                      <span className="text-gray-700 font-medium font-brand">
                        {item.ingredient_name}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic font-semibold font-brand">
                  Ingredients list not available.
                </p>
              )}
            </>
          )}

          {activeTab === "nutrition" && (
            <>
              <h2 className="text-2xl font-semibold font-brand text-orange-800 mb-3">
                Nutritional Information
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-brand">
                <div>
                  <p className="text-sm text-gray-600">Calories</p>
                  <p className="text-lg text-orange-800 font-semibold">
                    {recipe.calories_per_serving || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Protein</p>
                  <p className="text-lg text-orange-800 font-semibold">
                    {recipe.protein || "N/A"}g
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Carbs</p>
                  <p className="text-lg text-orange-800 font-semibold">
                    {recipe.carbs || "N/A"}g
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fat</p>
                  <p className="text-lg text-orange-800 font-semibold">
                    {recipe.fat || "N/A"}g
                  </p>
                </div>
              </div>
              <p className="text-sm text-info bg-info/10 rounded-md p-3 mt-6">
                ℹ️ Nutritional values are estimated and may vary based on
                ingredients used.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;

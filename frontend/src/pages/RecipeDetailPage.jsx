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
  FaEdit,
  FaTrash,
  FaCrown,
  FaToggleOn,
  FaToggleOff,
  FaRedo, // Add refresh icon
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RatingStars from "../components/common/RatingStars";
import RatingModal from "../components/recipe/RatingModal";
import apiClient from "../api/client";
import {
  canEditRecipe,
  canDeleteRecipe,
  isAdmin,
  getRoleDisplayName,
  getRoleBadgeColor
} from "../utils/roleUtils";

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'notFound', 'network', 'unauthorized', 'server'
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [activeTab, setActiveTab] = useState("instructions");
  const [actionLoading, setActionLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    loadRecipe();

    // Update page title when recipe loads
    if (recipe?.title) {
      document.title = `${recipe.title} - CookEasy`;
    } else {
      document.title = 'Recipe - CookEasy';
    }

    // Cleanup title on unmount
    return () => {
      document.title = 'CookEasy';
    };
  }, [id, recipe?.title]);

  const loadRecipe = async () => {
    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      const response = await apiClient.get(`/recipes/${id}`);
      setRecipe(response.data.recipe);

      // Check if bookmarked/favorited (if user is logged in)
      if (isAuthenticated) {
        // TODO: Implement bookmark and favorite check API calls
        setIsBookmarked(false);
        setIsFavorited(false);
        setUserRating(0);
      }
    } catch (err) {
      console.error("Recipe load error:", err);

      // Determine error type based on response
      if (err.response?.status === 404) {
        setError("Recipe not found. It may have been removed or the link is incorrect.");
        setErrorType('notFound');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError("You don't have permission to view this recipe.");
        setErrorType('unauthorized');
      } else if (err.response?.status >= 500) {
        setError("Server error occurred. Please try again later.");
        setErrorType('server');
      } else if (!navigator.onLine) {
        setError("No internet connection. Please check your network and try again.");
        setErrorType('network');
      } else {
        setError("Failed to load recipe. Please try again.");
        setErrorType('network');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/recipes/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      return;
    }

    setActionLoading(true);
    try {
      await apiClient.delete(`/recipes/${id}`);
      alert("Recipe deleted successfully!");
      navigate("/");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete recipe. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async () => {
    if (!isAdmin(user)) return;

    setActionLoading(true);
    try {
      await apiClient.put(`/admin/recipes/${id}/toggle-featured`);

      setRecipe(prev => ({
        ...prev,
        is_featured: !prev.is_featured
      }));

      alert(`Recipe ${recipe.is_featured ? 'removed from' : 'added to'} featured list!`);
    } catch (err) {
      console.error("Toggle featured error:", err);
      if (err.response?.status === 403) {
        alert("You don't have permission to perform this action.");
      } else {
        alert("Failed to update featured status. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setActionLoading(true);
    try {
      // TODO: Implement bookmark API call
      setIsBookmarked(!isBookmarked);
      console.log("Bookmark toggled");
    } catch (err) {
      console.error("Bookmark error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setActionLoading(true);
    try {
      // TODO: Implement favorite API call
      setIsFavorited(!isFavorited);
      console.log("Favorite toggled");
    } catch (err) {
      console.error("Favorite error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitRating = async ({ rating, review }) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setRatingLoading(true);
    try {
      const response = await apiClient.post(`/recipes/${id}/ratings`, {
        rating,
        review
      });

      setUserRating(rating);
      setUserReview(review);
      setShowRatingModal(false);

      // Reload recipe to get updated average rating
      loadRecipe();

      alert("Rating submitted successfully!");
    } catch (err) {
      console.error("Rating error:", err);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setRatingLoading(false);
    }
  };

  const handleRating = async (rating) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setActionLoading(true);
    try {
      // TODO: Implement rating API call
      setUserRating(rating);
      console.log("Rating submitted:", rating);
    } catch (err) {
      console.error("Rating error:", err);
    } finally {
      setActionLoading(false);
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
      <div className="flex items-center justify-center min-h-screen bg-orange-50">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading recipe details..." />
          <p className="mt-4 text-sm text-gray-500">
            Preparing your culinary adventure...
          </p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    const getErrorConfig = () => {
      switch (errorType) {
        case 'notFound':
          return {
            icon: '🔍',
            title: 'Recipe Not Found',
            description: 'Sorry, we couldn\'t find the recipe you\'re looking for. It may have been removed or the link is incorrect.',
            suggestions: [
              { text: 'Browse All Recipes', link: '/search', primary: true },
              { text: 'Go to Homepage', link: '/', primary: false },
              { text: 'Popular Categories', link: '/categories', primary: false }
            ]
          };
        case 'unauthorized':
          return {
            icon: '🔒',
            title: 'Access Denied',
            description: 'You don\'t have permission to view this recipe. It might be a private recipe or require special access.',
            suggestions: [
              { text: 'Login to Account', link: '/login', primary: true },
              { text: 'Browse Public Recipes', link: '/search', primary: false }
            ]
          };
        case 'server':
          return {
            icon: '⚠️',
            title: 'Server Error',
            description: 'Something went wrong on our end. Our team has been notified and is working to fix this issue.',
            suggestions: [
              { text: 'Try Again', action: loadRecipe, primary: true },
              { text: 'Go Back', action: () => navigate(-1), primary: false }
            ]
          };
        case 'network':
          return {
            icon: '📡',
            title: 'Connection Problem',
            description: 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.',
            suggestions: [
              { text: 'Retry', action: loadRecipe, primary: true },
              { text: 'Go Back', action: () => navigate(-1), primary: false }
            ]
          };
        default:
          return {
            icon: '😔',
            title: 'Something Went Wrong',
            description: error || 'Unable to load the recipe. Please try again or contact support if the problem persists.',
            suggestions: [
              { text: 'Try Again', action: loadRecipe, primary: true },
              { text: 'Browse Recipes', link: '/search', primary: false }
            ]
          };
      }
    };

    const errorConfig = getErrorConfig();

    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-orange-50">
        <div className="w-full max-w-md text-center">
          {/* Error Icon */}
          <div className="mb-6 text-8xl animate-bounce">
            {errorConfig.icon}
          </div>

          {/* Error Title */}
          <h1 className="mb-4 text-3xl font-bold text-gray-800 font-brand">
            {errorConfig.title}
          </h1>

          {/* Error Description */}
          <p className="mb-8 leading-relaxed text-gray-600">
            {errorConfig.description}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {errorConfig.suggestions.map((suggestion, index) => {
              if (suggestion.link) {
                return (
                  <Link
                    key={index}
                    to={suggestion.link}
                    className={`btn w-full ${suggestion.primary
                      ? 'btn-primary bg-orange-600 hover:bg-orange-700 text-white border-0'
                      : 'btn-outline btn-primary text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white'
                      }`}
                  >
                    {suggestion.text}
                  </Link>
                );
              } else if (suggestion.action) {
                return (
                  <button
                    key={index}
                    onClick={suggestion.action}
                    disabled={loading}
                    className={`btn w-full ${suggestion.primary
                      ? 'btn-primary bg-orange-600 hover:bg-orange-700 text-white border-0'
                      : 'btn-outline btn-primary text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white'
                      } ${loading ? 'loading' : ''}`}
                  >
                    {loading ? 'Loading...' : suggestion.text}
                  </button>
                );
              }
              return null;
            })}
          </div>

          {/* Back Button */}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 btn btn-ghost hover:text-gray-700"
            >
              <FaArrowLeft className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-orange-50">
      <div className="mx-auto max-w-7xl">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-orange-700 bg-orange-100 border-0 btn btn-circle hover:bg-orange-200 hover:text-orange-900"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          <div className="flex gap-3">
            {/* Edit/Delete buttons for owners and admins */}
            {isAuthenticated && canEditRecipe(user, recipe) && (
              <>
                <button
                  onClick={handleEdit}
                  disabled={actionLoading}
                  className="text-blue-700 bg-blue-100 border-0 shadow-md btn btn-circle hover:shadow-lg hover:bg-blue-200 hover:text-blue-900"
                  title="Edit Recipe"
                >
                  <FaEdit className="text-lg" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="text-red-700 bg-red-100 border-0 shadow-md btn btn-circle hover:shadow-lg hover:bg-red-200 hover:text-red-900"
                  title="Delete Recipe"
                >
                  <FaTrash className="text-lg" />
                </button>
              </>
            )}

            {/* Admin toggle featured button */}
            {isAuthenticated && isAdmin(user) && (
              <button
                onClick={handleToggleFeatured}
                disabled={actionLoading}
                className={`btn btn-circle shadow-md hover:shadow-lg border-0 ${recipe?.is_featured
                  ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                title={recipe?.is_featured ? "Remove from Featured" : "Add to Featured"}
              >
                <FaCrown className="text-lg" />
              </button>
            )}

            {/* User action buttons */}
            {isAuthenticated && (
              <button
                onClick={handleFavorite}
                disabled={actionLoading}
                className={`btn btn-circle shadow-md hover:shadow-lg border-0 ${isFavorited
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-orange-100 text-red-500 hover:bg-red-100 hover:text-red-600"
                  }`}
                title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
              >
                <FaHeart className="text-lg" />
              </button>
            )}

            <button
              onClick={handleShare}
              className="text-orange-700 bg-orange-100 border-0 shadow-md btn btn-circle hover:shadow-lg hover:bg-orange-200 hover:text-orange-900"
              title="Share Recipe"
            >
              <FaShare className="text-lg" />
            </button>
            <button
              onClick={handlePrint}
              className="text-orange-700 bg-orange-100 border-0 shadow-md btn btn-circle hover:shadow-lg hover:bg-orange-200 hover:text-orange-900"
              title="Print Recipe"
            >
              <FaPrint className="text-lg" />
            </button>
            {isAuthenticated && (
              <button
                onClick={handleBookmark}
                disabled={actionLoading}
                className={`btn btn-circle shadow-md hover:shadow-lg border-0 ${isBookmarked
                  ? "bg-orange-700 text-white hover:bg-orange-800"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-900"
                  }`}
                title={isBookmarked ? "Remove Bookmark" : "Bookmark Recipe"}
              >
                <FaBookmark className="text-lg" />
              </button>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT: Gambar + Recipe by */}
          <div className="space-y-4 lg:col-span-5">
            {/* Image */}
            <div className="relative overflow-hidden shadow-lg h-80 lg:h-96 rounded-2xl">
              {recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="object-cover w-full h-full"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-8xl bg-gradient-to-br from-orange-100 to-orange-200">
                  🍳
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Recipe Info */}
          <div className="space-y-6 lg:col-span-7">
            {/* Title + Description + Tags */}
            <div className="flex flex-col gap-2 mt-8 mb-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-semibold leading-tight text-gray-800 lg:text-4xl font-brand">
                    {recipe.title}
                  </h1>
                  {recipe.is_featured && (
                    <span className="px-3 py-1 text-sm font-medium text-yellow-900 border border-yellow-300 rounded-full shadow-sm bg-gradient-to-r from-yellow-400 to-yellow-500">
                      ⭐ Featured
                    </span>
                  )}

                  {/* Recipe Status Indicators */}
                  <div className="flex items-center gap-2">
                    {recipe.is_public === false && (
                      <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border rounded-full">
                        🔒 Private
                      </span>
                    )}

                    {/* New Recipe Badge (within 7 days) */}
                    {new Date() - new Date(recipe.created_at) < 7 * 24 * 60 * 60 * 1000 && (
                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-full">
                        🆕 New
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 sm:items-end">
                <p className="flex items-center text-sm text-gray-500 font-brand">
                  <FaCalendar className="mr-2" />
                  {new Date(recipe.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                {/* Last Updated */}
                {recipe.updated_at && recipe.updated_at !== recipe.created_at && (
                  <p className="text-xs text-gray-400 font-brand">
                    Updated: {new Date(recipe.updated_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <p className="mb-4 text-lg leading-relaxed text-orange-700">
              {recipe.description}
            </p>

            <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-3 font-brand">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${recipe.difficulty === "Easy"
                    ? "bg-green-100 text-green-700"
                    : recipe.difficulty === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {recipe.difficulty || "Medium"}
                </span>

                {recipe.category && (
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-full">
                    {recipe.category.icon} {recipe.category.name}
                  </span>
                )}
              </div>

              {/* Author - kanan */}
              <div className="flex items-center gap-3 mt-1 ml-auto sm:mt-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-500 font-brand">
                    By:{" "}
                    <span className="font-semibold text-gray-700 font-brand">
                      {recipe.user?.username || "Unknown Chef"}
                    </span>
                  </p>
                  {recipe.user?.role && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleBadgeColor(recipe.user.role)}`}>
                      {getRoleDisplayName(recipe.user.role)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-5 bg-white border border-orange-100 shadow-lg rounded-2xl">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-700 font-brand">
                📊 Recipe Details
              </h3>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="flex items-center gap-3 font-brand">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                    <FaClock className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs tracking-wide text-gray-500 uppercase">
                      Total Time
                    </p>
                    <p className="font-semibold text-gray-800">
                      {recipe.total_time ? `${recipe.total_time} min` : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <FaUsers className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs tracking-wide text-gray-500 uppercase">
                      Servings
                    </p>
                    <p className="font-semibold text-gray-800">
                      {recipe.servings || 1} {recipe.servings === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
                    <FaStar className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs tracking-wide text-gray-500 uppercase">
                      Rating
                    </p>
                    <div className="flex items-center gap-2">
                      <RatingStars
                        rating={recipe.average_rating || 0}
                        size="sm"
                        interactive={false}
                        showText={true}
                      />
                      {recipe.rating_count > 0 && (
                        <span className="text-xs text-gray-500">
                          ({recipe.rating_count} reviews)
                        </span>
                      )}
                    </div>
                    {isAuthenticated && (
                      <button
                        onClick={() => setShowRatingModal(true)}
                        className="mt-1 text-xs btn btn-outline btn-xs"
                      >
                        {userRating > 0 ? 'Update Rating' : 'Rate This Recipe'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                    <FaEye className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs tracking-wide text-gray-500 uppercase">
                      Views
                    </p>
                    <p className="font-semibold text-gray-800">
                      {recipe.view_count ? (
                        recipe.view_count >= 1000
                          ? `${(recipe.view_count / 1000).toFixed(1)}k`
                          : recipe.view_count
                      ) : '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Recipe Meta */}
              {(recipe.prep_time || recipe.cook_time || recipe.calories_per_serving) && (
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {recipe.prep_time && (
                      <div>
                        <p className="text-xs tracking-wide text-gray-500 uppercase">Prep Time</p>
                        <p className="font-semibold text-gray-700">{recipe.prep_time}m</p>
                      </div>
                    )}
                    {recipe.cook_time && (
                      <div>
                        <p className="text-xs tracking-wide text-gray-500 uppercase">Cook Time</p>
                        <p className="font-semibold text-gray-700">{recipe.cook_time}m</p>
                      </div>
                    )}
                    {recipe.calories_per_serving && (
                      <div>
                        <p className="text-xs tracking-wide text-gray-500 uppercase">Calories</p>
                        <p className="font-semibold text-gray-700">{recipe.calories_per_serving} kcal</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Rating Section - Only for authenticated users */}
            {isAuthenticated && (
              <div className="p-5 bg-white border border-orange-100 shadow-lg rounded-2xl">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-700 font-brand">
                  ⭐ Rate this Recipe
                </h3>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <span className="mr-2 text-sm text-gray-600">Your rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        disabled={actionLoading}
                        className={`text-2xl transition-all duration-200 hover:scale-110 ${star <= userRating
                          ? "text-yellow-400 drop-shadow-sm"
                          : "text-gray-300 hover:text-yellow-300"
                          } ${actionLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    {userRating > 0 && (
                      <span className="px-3 py-1 text-sm text-gray-600 rounded-full bg-gray-50">
                        You rated: {userRating}/5 ⭐
                      </span>
                    )}

                    {userRating === 0 && (
                      <span className="text-xs italic text-gray-400">
                        Click a star to rate this recipe
                      </span>
                    )}
                  </div>
                </div>

                {actionLoading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-orange-600">
                    <div className="w-4 h-4 border-b-2 border-orange-600 rounded-full animate-spin"></div>
                    Saving your rating...
                  </div>
                )}
              </div>
            )}

            {/* Login Prompt for Rating - Non-authenticated users */}
            {!isAuthenticated && (
              <div className="p-5 border border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl">
                <div className="text-center">
                  <h3 className="mb-2 text-lg font-semibold text-gray-700 font-brand">
                    Love this recipe? ❤️
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Sign in to rate this recipe and save it to your favorites!
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link
                      to="/login"
                      className="text-white bg-orange-600 border-0 btn btn-primary hover:bg-orange-700"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="text-orange-600 border-orange-600 btn btn-outline btn-primary hover:bg-orange-600 hover:text-white"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-4xl mx-auto mt-10">
        <div className="justify-center mb-6 space-x-2 bg-orange-900 tabs tabs-boxed">
          <button
            className={`tab rounded-xl font-brand font-medium ${activeTab === "instructions"
              ? "bg-orange-50 text-orange-800"
              : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
              }`}
            onClick={() => setActiveTab("instructions")}
          >
            Instructions
          </button>
          <button
            className={`tab rounded-none font-brand font-medium ${activeTab === "ingredients"
              ? "bg-orange-50 text-orange-800"
              : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
              }`}
            onClick={() => setActiveTab("ingredients")}
          >
            Ingredients
          </button>
          <button
            className={`tab rounded-none font-brand font-medium ${activeTab === "nutrition"
              ? "bg-orange-50 text-orange-800"
              : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
              }`}
            onClick={() => setActiveTab("nutrition")}
          >
            Nutrition
          </button>
        </div>

        <div className="p-6 bg-white shadow-md rounded-xl">
          {activeTab === "instructions" && (
            <div className="space-y-6">
              <h2 className="flex items-center gap-2 mb-3 text-2xl font-semibold text-orange-800 font-brand">
                👨‍🍳 Cooking Instructions
              </h2>

              {recipe.instructions ? (
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-orange-400 rounded-lg bg-orange-50">
                    <p className="mb-1 text-sm font-medium text-orange-800">
                      📝 Before you start:
                    </p>
                    <p className="text-sm text-orange-700">
                      Read through all instructions first. Prep your ingredients and gather your tools.
                    </p>
                  </div>

                  <div className="p-6 leading-relaxed text-gray-700 whitespace-pre-line border rounded-lg bg-gray-50">
                    {recipe.instructions}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p className="mb-2 text-lg">📋</p>
                  <p>No instructions provided for this recipe.</p>
                </div>
              )}

              {recipe.tips && (
                <div className="p-6 mt-6 border-l-4 border-yellow-400 rounded-lg shadow-sm bg-gradient-to-r from-yellow-50 to-orange-50">
                  <h3 className="flex items-center gap-2 mb-2 font-semibold text-yellow-800">
                    💡 Chef's Tips & Tricks
                  </h3>
                  <p className="leading-relaxed text-yellow-800">{recipe.tips}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "ingredients" && (
            <div className="space-y-6">
              <h2 className="flex items-center gap-2 mb-3 text-2xl font-semibold text-orange-800 font-brand">
                🛒 Ingredients
              </h2>

              {recipe.ingredients?.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-blue-400 rounded-lg bg-blue-50">
                    <p className="mb-1 text-sm font-medium text-blue-800">
                      🧾 Shopping tip:
                    </p>
                    <p className="text-sm text-blue-700">
                      Check your pantry first! You might already have some of these ingredients.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {recipe.ingredients.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 px-6 py-4 transition-colors duration-200 bg-white border border-gray-100 rounded-lg shadow-sm hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-orange-600 rounded-full shadow-sm">
                          {index + 1}
                        </div>
                        <div className="flex items-center flex-1 gap-3">
                          <span className="px-3 py-1 font-semibold text-orange-700 border border-orange-200 rounded-full bg-orange-50">
                            {item.quantity} {item.unit}
                          </span>
                          <span className="font-medium text-gray-700">
                            {item.ingredient_name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm text-center text-gray-600">
                      📝 Total ingredients: <strong>{recipe.ingredients.length}</strong> items
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  <p className="mb-4 text-4xl">🥪</p>
                  <p className="mb-2 text-lg font-semibold">No ingredients listed</p>
                  <p>The ingredients list is not available for this recipe.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "nutrition" && (
            <div className="space-y-6">
              <h2 className="flex items-center gap-2 mb-3 text-2xl font-semibold text-orange-800 font-brand">
                🥗 Nutritional Information
              </h2>

              <div className="p-4 border-l-4 border-green-400 rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                <p className="mb-1 text-sm font-medium text-green-800">
                  ⚖️ Per serving information:
                </p>
                <p className="text-sm text-green-700">
                  Values are estimated based on {recipe.servings || 1} serving{recipe.servings > 1 ? 's' : ''}.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div className="p-6 text-center transition-shadow bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full">
                    <span className="text-xl text-red-600">🔥</span>
                  </div>
                  <p className="mb-1 text-sm text-gray-600">Calories</p>
                  <p className="text-2xl font-bold text-red-600">
                    {recipe.calories_per_serving || "N/A"}
                  </p>
                  {recipe.calories_per_serving && (
                    <p className="text-xs text-gray-500">kcal</p>
                  )}
                </div>

                <div className="p-6 text-center transition-shadow bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full">
                    <span className="text-xl text-blue-600">💪</span>
                  </div>
                  <p className="mb-1 text-sm text-gray-600">Protein</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {recipe.protein || "N/A"}
                  </p>
                  {recipe.protein && (
                    <p className="text-xs text-gray-500">grams</p>
                  )}
                </div>

                <div className="p-6 text-center transition-shadow bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full">
                    <span className="text-xl text-yellow-600">🌾</span>
                  </div>
                  <p className="mb-1 text-sm text-gray-600">Carbs</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {recipe.carbs || "N/A"}
                  </p>
                  {recipe.carbs && (
                    <p className="text-xs text-gray-500">grams</p>
                  )}
                </div>

                <div className="p-6 text-center transition-shadow bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full">
                    <span className="text-xl text-green-600">🥑</span>
                  </div>
                  <p className="mb-1 text-sm text-gray-600">Fat</p>
                  <p className="text-2xl font-bold text-green-600">
                    {recipe.fat || "N/A"}
                  </p>
                  {recipe.fat && (
                    <p className="text-xs text-gray-500">grams</p>
                  )}
                </div>
              </div>

              {/* Additional nutritional info if available */}
              {(recipe.fiber || recipe.sugar || recipe.sodium) && (
                <div className="p-6 border rounded-lg bg-gray-50">
                  <h3 className="mb-4 font-semibold text-center text-gray-700">Additional Information</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {recipe.fiber && (
                      <div>
                        <p className="text-xs tracking-wide text-gray-500 uppercase">Fiber</p>
                        <p className="font-semibold text-gray-700">{recipe.fiber}g</p>
                      </div>
                    )}
                    {recipe.sugar && (
                      <div>
                        <p className="text-xs tracking-wide text-gray-500 uppercase">Sugar</p>
                        <p className="font-semibold text-gray-700">{recipe.sugar}g</p>
                      </div>
                    )}
                    {recipe.sodium && (
                      <div>
                        <p className="text-xs tracking-wide text-gray-500 uppercase">Sodium</p>
                        <p className="font-semibold text-gray-700">{recipe.sodium}mg</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <p className="flex items-center justify-center gap-2 text-sm text-center text-blue-800">
                  <span>ℹ️</span>
                  <span>
                    Nutritional values are estimated and may vary based on ingredients used and preparation methods.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleSubmitRating}
        currentRating={userRating}
        currentReview={userReview}
        isLoading={ratingLoading}
      />
    </div>
  );
};

export default RecipeDetailPage;

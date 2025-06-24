import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaStar, FaClock, FaUsers, FaHeart, FaBookmark, FaShare, 
  FaEye, FaThumbsUp, FaUser, FaCalendar, FaPrint, FaArrowLeft 
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import apiClient from '../api/client';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('instructions');

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
      setError('Recipe not found or failed to load');
      console.error('Recipe load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      // Placeholder for bookmark API call
      setIsBookmarked(!isBookmarked);
      // await apiClient.post(`/recipes/${id}/bookmark`);
      console.log('Bookmark toggled');
    } catch (err) {
      console.error('Bookmark error:', err);
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
      alert('Recipe link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-base-100">
      {/* Recipe Header */}
      <div className="relative">
        {/* Hero Image */}
        <div className="h-96 bg-gradient-to-r from-primary/20 to-secondary/20 relative overflow-hidden">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🍳
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 btn btn-circle btn-ghost bg-white/20 backdrop-blur text-white hover:bg-white/30"
          >
            <FaArrowLeft />
          </button>
          
          {/* Action Buttons */}
          <div className="absolute top-6 right-6 flex gap-2">
            <button
              onClick={handleShare}
              className="btn btn-circle btn-ghost bg-white/20 backdrop-blur text-white hover:bg-white/30"
            >
              <FaShare />
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-circle btn-ghost bg-white/20 backdrop-blur text-white hover:bg-white/30"
            >
              <FaPrint />
            </button>
            <button
              onClick={handleBookmark}
              className={`btn btn-circle ${isBookmarked ? 'btn-primary' : 'btn-ghost bg-white/20 backdrop-blur text-white hover:bg-white/30'}`}
            >
              <FaBookmark />
            </button>
          </div>
        </div>

        {/* Recipe Info Card */}
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-grow">
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">{recipe.title}</h1>
                <p className="text-gray-600 text-lg mb-6">{recipe.description}</p>
                
                {/* Recipe Meta */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <FaClock />
                    </div>
                    <div className="stat-title">Total Time</div>
                    <div className="stat-value text-lg">{recipe.total_time || 'N/A'}m</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-figure text-secondary">
                      <FaUsers />
                    </div>
                    <div className="stat-title">Servings</div>
                    <div className="stat-value text-lg">{recipe.servings || 1}</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-figure text-accent">
                      <FaStar />
                    </div>
                    <div className="stat-title">Rating</div>
                    <div className="stat-value text-lg">{recipe.average_rating || 'N/A'}</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-figure text-info">
                      <FaEye />
                    </div>
                    <div className="stat-title">Views</div>
                    <div className="stat-value text-lg">{recipe.view_count || 0}</div>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`badge badge-lg ${
                    recipe.difficulty === 'Easy' ? 'badge-success' :
                    recipe.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {recipe.difficulty || 'Medium'}
                  </div>
                  
                  {recipe.category && (
                    <div className="badge badge-lg badge-outline">
                      {recipe.category.icon} {recipe.category.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Author Info */}
              <div className="lg:w-80">
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="card-title text-lg">Recipe by</h3>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img
                            src={recipe.user?.profile_image || `https://ui-avatars.com/api/?name=${recipe.user?.username}&background=FF6B35&color=ffffff`}
                            alt={recipe.user?.username}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">{recipe.user?.username || 'Unknown Chef'}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <FaCalendar className="mr-1" />
                          {new Date(recipe.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {recipe.user?.bio && (
                      <p className="text-sm text-gray-600 mt-2">{recipe.user.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="tabs tabs-boxed mb-8">
            <button
              className={`tab ${activeTab === 'instructions' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('instructions')}
            >
              Instructions
            </button>
            <button
              className={`tab ${activeTab === 'ingredients' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('ingredients')}
            >
              Ingredients
            </button>
            <button
              className={`tab ${activeTab === 'nutrition' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('nutrition')}
            >
              Nutrition
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {activeTab === 'instructions' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Cooking Instructions</h2>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {recipe.instructions}
                  </div>
                </div>
                
                {recipe.tips && (
                  <div className="mt-8 p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <h3 className="font-semibold text-yellow-800 mb-2">💡 Chef's Tips</h3>
                    <p className="text-yellow-700">{recipe.tips}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Ingredients</h2>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                        <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{ingredient.quantity} {ingredient.unit}</span>
                        <span className="text-gray-600">{ingredient.ingredient_name}</span>
                        {ingredient.notes && (
                          <span className="text-sm text-gray-500 italic">({ingredient.notes})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Ingredients list not available</p>
                )}
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Nutritional Information</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="stat">
                    <div className="stat-title">Calories</div>
                    <div className="stat-value text-primary">{recipe.calories_per_serving || 'N/A'}</div>
                    <div className="stat-desc">per serving</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Protein</div>
                    <div className="stat-value text-secondary">{recipe.protein || 'N/A'}g</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Carbs</div>
                    <div className="stat-value text-accent">{recipe.carbs || 'N/A'}g</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Fat</div>
                    <div className="stat-value text-warning">{recipe.fat || 'N/A'}g</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-info/10 rounded-lg">
                  <p className="text-sm text-info">
                    ℹ️ Nutritional values are approximate and may vary based on specific ingredients and preparation methods.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
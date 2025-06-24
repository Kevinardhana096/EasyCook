import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaUser, FaEdit, FaHeart, FaEye, FaCalendar, FaMapMarkerAlt, 
  FaGlobe, FaCog, FaPlus, FaTh, FaList, FaStar, FaUsers,
  FaTrophy, FaFire, FaBookOpen, FaCamera, FaSave, FaTimes
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RecipeCard from '../components/recipe/RecipeCard';
import apiClient from '../api/client';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();
  
  // State management
  const [profileUser, setProfileUser] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recipes');
  const [viewMode, setViewMode] = useState('grid');
  const [isEditing, setIsEditing] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
    cooking_level: 'beginner',
    favorite_cuisines: [],
    dietary_preferences: []
  });

  const isOwnProfile = !userId || (currentUser && currentUser.id === parseInt(userId));

  useEffect(() => {
    loadProfile();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'recipes') {
      loadUserRecipes();
    }
  }, [activeTab, currentPage, profileUser]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isOwnProfile) {
        // Load current user's profile
        const response = await apiClient.get('/auth/profile');
        setProfileUser(response.data.user);
        setEditForm({
          full_name: response.data.user.full_name || '',
          bio: response.data.user.bio || '',
          location: response.data.user.location || '',
          website: response.data.user.website || '',
          cooking_level: response.data.user.cooking_level || 'beginner',
          favorite_cuisines: response.data.user.favorite_cuisines || [],
          dietary_preferences: response.data.user.dietary_preferences || []
        });
      } else {
        // Load other user's profile
        const response = await apiClient.get(`/users/${userId}`);
        setProfileUser(response.data.user);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRecipes = async () => {
    if (!profileUser) return;
    
    setRecipesLoading(true);
    
    try {
      let endpoint;
      if (isOwnProfile) {
        endpoint = `/users/me/recipes?page=${currentPage}&per_page=12`;
      } else {
        endpoint = `/users/${profileUser.id}/recipes?page=${currentPage}&per_page=12`;
      }
      
      const response = await apiClient.get(endpoint);
      setUserRecipes(response.data.recipes || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to load user recipes:', err);
    } finally {
      setRecipesLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await apiClient.put('/auth/profile', editForm);
      setProfileUser(response.data.user);
      updateUser(response.data.user);
      setIsEditing(false);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed z-50 w-auto alert alert-success top-4 right-4';
      notification.innerHTML = '<span>✅ Profile updated successfully!</span>';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // In real app, upload to cloud storage
      // For now, use placeholder
      const imageUrl = `https://ui-avatars.com/api/?name=${profileUser?.username}&background=FF6B35&color=ffffff&size=200`;
      
      try {
        await apiClient.put('/auth/profile', { profile_image: imageUrl });
        setProfileUser({ ...profileUser, profile_image: imageUrl });
        updateUser({ ...currentUser, profile_image: imageUrl });
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }
  };

  const cuisineOptions = [
    'Indonesian', 'Italian', 'Chinese', 'Japanese', 'Thai', 'Indian', 
    'Mexican', 'French', 'Mediterranean', 'Korean', 'Vietnamese', 'American'
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 
    'Paleo', 'Low-Carb', 'Halal', 'Kosher'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 text-6xl">😔</div>
          <h2 className="mb-2 text-2xl font-bold">Profile Not Found</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container px-4 py-12 mx-auto">
          <div className="max-w-4xl mx-auto">
            {/* Profile Card */}
            <div className="p-8 bg-white shadow-xl rounded-2xl">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
                {/* Avatar Section */}
                <div className="relative">
                  <div className="avatar">
                    <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-2">
                      <img
                        src={profileUser.profile_image || `https://ui-avatars.com/api/?name=${profileUser.username}&background=FF6B35&color=ffffff&size=200`}
                        alt={profileUser.username}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${profileUser.username}&background=FF6B35&color=ffffff&size=200`;
                        }}
                      />
                    </div>
                  </div>
                  
                  {isOwnProfile && (
                    <label className="absolute bottom-0 right-0 cursor-pointer btn btn-circle btn-sm btn-primary">
                      <FaCamera />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-grow text-center lg:text-left">
                  <div className="flex flex-col mb-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h1 className="mb-2 text-3xl font-bold">
                        {profileUser.full_name || profileUser.username}
                      </h1>
                      <p className="mb-2 text-lg text-gray-600">@{profileUser.username}</p>
                      
                      {/* Role Badge */}
                      <div className="flex items-center justify-center gap-2 mb-4 lg:justify-start">
                        <div className={`badge badge-lg ${
                          profileUser.role === 'admin' ? 'badge-error' :
                          profileUser.role === 'chef' ? 'badge-warning' : 'badge-primary'
                        }`}>
                          {profileUser.role === 'admin' ? '👑 Admin' :
                           profileUser.role === 'chef' ? '👨‍🍳 Chef' : '🍳 Home Cook'}
                        </div>
                        
                        {profileUser.is_verified && (
                          <div className="badge badge-success">
                            ✓ Verified
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isOwnProfile && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="btn btn-outline btn-sm"
                        >
                          <FaEdit className="mr-2" />
                          {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                        
                        <Link to="/recipes/create" className="btn btn-primary btn-sm">
                          <FaPlus className="mr-2" />
                          New Recipe
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {profileUser.bio && (
                    <p className="max-w-2xl mb-4 text-gray-700">
                      {profileUser.bio}
                    </p>
                  )}

                  {/* Additional Info */}
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 lg:justify-start">
                    {profileUser.location && (
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-primary" />
                        {profileUser.location}
                      </span>
                    )}
                    
                    {profileUser.website && (
                      <a 
                        href={profileUser.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <FaGlobe />
                        Website
                      </a>
                    )}
                    
                    <span className="flex items-center gap-1">
                      <FaCalendar className="text-primary" />
                      Joined {new Date(profileUser.created_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                    
                    {profileUser.last_seen_at && (
                      <span className="flex items-center gap-1">
                        <FaEye className="text-primary" />
                        Last seen {new Date(profileUser.last_seen_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 gap-4 pt-8 mt-8 border-t lg:grid-cols-4">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <FaBookOpen />
                  </div>
                  <div className="stat-title">Recipes</div>
                  <div className="text-lg stat-value">{profileUser.recipe_count || 0}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <FaHeart />
                  </div>
                  <div className="stat-title">Total Likes</div>
                  <div className="text-lg stat-value">{profileUser.total_likes || 0}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-figure text-accent">
                    <FaUsers />
                  </div>
                  <div className="stat-title">Followers</div>
                  <div className="text-lg stat-value">{profileUser.follower_count || 0}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-figure text-warning">
                    <FaTrophy />
                  </div>
                  <div className="stat-title">Level</div>
                  <div className="text-lg capitalize stat-value">
                    {profileUser.cooking_level || 'Beginner'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal modal-open">
          <div className="max-w-2xl modal-box">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-circle btn-sm btn-ghost"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="form-control">
                  <label className="label">
                    <span className="font-medium label-text">Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    className="input input-bordered"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="font-medium label-text">Location</span>
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    className="input input-bordered"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="font-medium label-text">Bio</span>
                </label>
                <textarea
                  placeholder="Tell us about yourself and your cooking journey..."
                  className="h-24 textarea textarea-bordered"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="form-control">
                  <label className="label">
                    <span className="font-medium label-text">Website</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-website.com"
                    className="input input-bordered"
                    value={editForm.website}
                    onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="font-medium label-text">Cooking Level</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={editForm.cooking_level}
                    onChange={(e) => setEditForm({...editForm, cooking_level: e.target.value})}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="font-medium label-text">Favorite Cuisines</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {cuisineOptions.map((cuisine) => (
                    <label key={cuisine} className="justify-start cursor-pointer label">
                      <input
                        type="checkbox"
                        className="mr-2 checkbox checkbox-sm"
                        checked={editForm.favorite_cuisines.includes(cuisine)}
                        onChange={(e) => {
                          const cuisines = e.target.checked
                            ? [...editForm.favorite_cuisines, cuisine]
                            : editForm.favorite_cuisines.filter(c => c !== cuisine);
                          setEditForm({...editForm, favorite_cuisines: cuisines});
                        }}
                      />
                      <span className="text-sm label-text">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="font-medium label-text">Dietary Preferences</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {dietaryOptions.map((diet) => (
                    <label key={diet} className="justify-start cursor-pointer label">
                      <input
                        type="checkbox"
                        className="mr-2 checkbox checkbox-sm"
                        checked={editForm.dietary_preferences.includes(diet)}
                        onChange={(e) => {
                          const diets = e.target.checked
                            ? [...editForm.dietary_preferences, diet]
                            : editForm.dietary_preferences.filter(d => d !== diet);
                          setEditForm({...editForm, dietary_preferences: diets});
                        }}
                      />
                      <span className="text-sm label-text">{diet}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaSave className="mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="p-1 mb-8 bg-white tabs tabs-boxed">
            <button
              className={`tab ${activeTab === 'recipes' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('recipes')}
            >
              <FaBookOpen className="mr-2" />
              Recipes ({userRecipes.length})
            </button>
            <button
              className={`tab ${activeTab === 'favorites' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <FaHeart className="mr-2" />
              Favorites
            </button>
            <button
              className={`tab ${activeTab === 'about' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              <FaUser className="mr-2" />
              About
            </button>
          </div>

          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {isOwnProfile ? 'My Recipes' : `${profileUser.username}'s Recipes`}
                </h2>
                
                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="btn-group">
                    <button
                      className={`btn btn-sm ${viewMode === 'grid' ? 'btn-active' : 'btn-outline'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <FaTh />
                    </button>
                    <button
                      className={`btn btn-sm ${viewMode === 'list' ? 'btn-active' : 'btn-outline'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <FaList />
                    </button>
                  </div>

                  {isOwnProfile && (
                    <Link to="/recipes/create" className="btn btn-primary btn-sm">
                      <FaPlus className="mr-2" />
                      New Recipe
                    </Link>
                  )}
                </div>
              </div>

              {/* Recipes Grid/List */}
              {recipesLoading ? (
                <div className="flex justify-center py-20">
                  <LoadingSpinner size="lg" text="Loading recipes..." />
                </div>
              ) : userRecipes.length > 0 ? (
                <>
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1'
                  }`}>
                    {userRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        showAuthor={!isOwnProfile}
                        className={viewMode === 'list' ? 'recipe-card-list' : ''}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                      <div className="btn-group">
                        <button
                          className="btn"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          «
                        </button>
                        
                        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              className={`btn ${page === currentPage ? 'btn-active' : ''}`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          );
                        })}
                        
                        <button
                          className="btn"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-20 text-center">
                  <div className="mb-4 text-6xl">🍳</div>
                  <h3 className="mb-2 text-2xl font-bold">
                    {isOwnProfile ? 'No recipes yet' : 'No recipes found'}
                  </h3>
                  <p className="mb-6 text-gray-600">
                    {isOwnProfile 
                      ? 'Start sharing your delicious recipes with the community!'
                      : `${profileUser.username} hasn't shared any recipes yet.`
                    }
                  </p>
                  {isOwnProfile && (
                    <Link to="/recipes/create" className="btn btn-primary">
                      <FaPlus className="mr-2" />
                      Create Your First Recipe
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="py-20 text-center">
              <div className="mb-4 text-6xl">❤️</div>
              <h3 className="mb-2 text-2xl font-bold">Favorite Recipes</h3>
              <p className="mb-6 text-gray-600">
                {isOwnProfile 
                  ? 'Your favorite recipes will appear here'
                  : `${profileUser.username}'s favorite recipes`
                }
              </p>
              <div className="badge badge-warning">Coming Soon</div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Cooking Info */}
                <div className="bg-white shadow-lg card">
                  <div className="card-body">
                    <h3 className="mb-4 text-xl card-title">Cooking Profile</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="font-medium text-gray-700">Skill Level:</span>
                        <div className="mt-1">
                          <div className={`badge ${
                            profileUser.cooking_level === 'expert' ? 'badge-error' :
                            profileUser.cooking_level === 'intermediate' ? 'badge-warning' : 'badge-success'
                          }`}>
                            {profileUser.cooking_level ? profileUser.cooking_level.charAt(0).toUpperCase() + profileUser.cooking_level.slice(1) : 'Beginner'}
                          </div>
                        </div>
                      </div>

                      {profileUser.favorite_cuisines && profileUser.favorite_cuisines.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Favorite Cuisines:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {profileUser.favorite_cuisines.map((cuisine) => (
                              <div key={cuisine} className="badge badge-outline">
                                {cuisine}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {profileUser.dietary_preferences && profileUser.dietary_preferences.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Dietary Preferences:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {profileUser.dietary_preferences.map((diet) => (
                              <div key={diet} className="badge badge-primary badge-outline">
                                {diet}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="bg-white shadow-lg card">
                  <div className="card-body">
                    <h3 className="mb-4 text-xl card-title">Activity Overview</h3>
                    
                    <div className="space-y-4">
                      <div className="stat">
                        <div className="stat-figure text-primary">
                          <FaCalendar />
                        </div>
                        <div className="stat-title">Member Since</div>
                        <div className="text-base stat-value">
                          {new Date(profileUser.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>

                      <div className="stat">
                        <div className="stat-figure text-secondary">
                          <FaFire />
                        </div>
                        <div className="stat-title">Total Recipe Views</div>
                        <div className="text-base stat-value">
                          {userRecipes.reduce((total, recipe) => total + (recipe.view_count || 0), 0).toLocaleString()}
                        </div>
                      </div>

                      <div className="stat">
                        <div className="stat-figure text-accent">
                          <FaStar />
                        </div>
                        <div className="stat-title">Average Rating</div>
                        <div className="text-base stat-value">
                          {userRecipes.length > 0 ? (
                            (userRecipes.reduce((total, recipe) => total + (recipe.average_rating || 0), 0) / userRecipes.length).toFixed(1)
                          ) : '0.0'} ⭐
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Section */}
              <div className="mt-8 bg-white shadow-lg card">
                <div className="card-body">
                  <h3 className="mb-6 text-xl card-title">
                    <FaTrophy className="mr-2" />
                    Achievements
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="p-4 text-center border border-yellow-200 rounded-lg bg-yellow-50">
                      <div className="mb-2 text-3xl">🥇</div>
                      <p className="font-medium text-yellow-800">First Recipe</p>
                      <p className="text-sm text-yellow-600">Shared your first recipe</p>
                    </div>
                    
                    <div className="p-4 text-center border border-green-200 rounded-lg bg-green-50">
                      <div className="mb-2 text-3xl">⭐</div>
                      <p className="font-medium text-green-800">Rising Star</p>
                      <p className="text-sm text-green-600">Got 10+ total likes</p>
                    </div>
                    
                    <div className="p-4 text-center border border-blue-200 rounded-lg bg-blue-50">
                      <div className="mb-2 text-3xl">👨‍🍳</div>
                      <p className="font-medium text-blue-800">Active Cook</p>
                      <p className="text-sm text-blue-600">Member for 30+ days</p>
                    </div>
                    
                    <div className="p-4 text-center border border-purple-200 rounded-lg bg-purple-50">
                      <div className="mb-2 text-3xl">🔥</div>
                      <p className="font-medium text-purple-800">Trending</p>
                      <p className="text-sm text-purple-600">Recipe got 100+ views</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className="badge badge-warning">More achievements coming soon!</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
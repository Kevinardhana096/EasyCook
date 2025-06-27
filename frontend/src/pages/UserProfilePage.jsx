import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEdit,
  FaHeart,
  FaEye,
  FaCalendar,
  FaMapMarkerAlt,
  FaGlobe,
  FaPlus,
  FaTh,
  FaList,
  FaStar,
  FaFire,
  FaBookOpen,
  FaCamera,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import {
  getRoleDisplayName,
  getRoleBadgeColor,
  canCreateRecipes,
} from "../utils/roleUtils";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RecipeCard from "../components/recipe/RecipeCard";
import apiClient from "../api/client";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();

  // State management
  const [profileUser, setProfileUser] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("favorites"); // Default to favorites, will be updated based on user capabilities
  const [viewMode, setViewMode] = useState("grid");
  const [isEditing, setIsEditing] = useState(false);
  const [recipeStatus, setRecipeStatus] = useState("all"); // all, published, draft
  const [recipeCounts, setRecipeCounts] = useState({
    total: 0,
    published: 0,
    draft: 0,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: "",
    bio: "",
    location: "",
    website: "",
    favorite_cuisines: [],
    dietary_preferences: [],
  });

  const isOwnProfile =
    !userId || (currentUser && currentUser.id === parseInt(userId));

  // useEffect hooks - must be at the top level
  useEffect(() => {
    console.log(
      "Frontend: UserProfilePage loaded, userId:",
      userId,
      "isOwnProfile:",
      isOwnProfile
    );
    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isOwnProfile) {
          // Load current user's profile
          const response = await apiClient.get("/auth/profile");
          setProfileUser(response.data.user);
          setEditForm({
            full_name: response.data.user.full_name || "",
            bio: response.data.user.bio || "",
            location: response.data.user.location || "",
            website: response.data.user.website || "",
            favorite_cuisines: response.data.user.favorite_cuisines || [],
            dietary_preferences: response.data.user.dietary_preferences || [],
          });
        } else {
          // Load other user's profile
          const response = await apiClient.get(`/users/${userId}`);
          setProfileUser(response.data.user);
        }
      } catch (err) {
        setError("Failed to load profile");
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, isOwnProfile]);

  useEffect(() => {
    console.log("Frontend: activeTab changed to:", activeTab);
    if (activeTab === "recipes" && profileUser) {
      console.log("Frontend: Loading user recipes...");
      const loadUserRecipes = async () => {
        setRecipesLoading(true);

        try {
          let endpoint;
          if (isOwnProfile) {
            endpoint = `/auth/users/me/recipes?page=${currentPage}&per_page=12&status=${recipeStatus}`;
          } else {
            endpoint = `/auth/users/${profileUser.id}/recipes?page=${currentPage}&per_page=12`;
          }

          const response = await apiClient.get(endpoint);

          console.log("Frontend: Raw API response:", response.data);
          console.log("Frontend: recipes array:", response.data.recipes);
          console.log(
            "Frontend: recipes length:",
            response.data.recipes?.length || 0
          );

          // Transform recipes to add author field for RecipeCard compatibility
          const transformedRecipes = (response.data.recipes || []).map(
            (recipe) => ({
              ...recipe,
              author:
                recipe.user?.username ||
                recipe.user?.full_name ||
                profileUser?.username ||
                "Unknown Chef",
              rating: recipe.average_rating || 0,
              likes: recipe.like_count || 0,
              views: recipe.view_count || 0,
              image: recipe.image_url,
              cookTime: recipe.cook_time,
            })
          );

          console.log("Frontend: transformed recipes:", transformedRecipes);
          console.log(
            "Frontend: transformed recipes length:",
            transformedRecipes.length
          );

          setUserRecipes(transformedRecipes);
          setTotalPages(response.data.pagination?.pages || 1);

          // Load counts for own profile
          if (isOwnProfile) {
            const loadRecipeCounts = async () => {
              try {
                // Load all recipes to count them
                const [allResponse, publishedResponse, draftResponse] =
                  await Promise.all([
                    apiClient.get(
                      "/auth/users/me/recipes?status=all&per_page=1000"
                    ),
                    apiClient.get(
                      "/auth/users/me/recipes?status=published&per_page=1000"
                    ),
                    apiClient.get(
                      "/auth/users/me/recipes?status=draft&per_page=1000"
                    ),
                  ]);

                setRecipeCounts({
                  total: allResponse.data.pagination?.total || 0,
                  published: publishedResponse.data.pagination?.total || 0,
                  draft: draftResponse.data.pagination?.total || 0,
                });
              } catch (err) {
                console.error("Failed to load recipe counts:", err);
              }
            };

            loadRecipeCounts();
          }
        } catch (err) {
          console.error("Failed to load user recipes:", err);
        } finally {
          setRecipesLoading(false);
        }
      };

      loadUserRecipes();
    }
  }, [
    activeTab,
    currentPage,
    profileUser,
    recipeStatus,
    isOwnProfile,
    refreshTrigger,
  ]);

  // Set default tab based on user capabilities
  useEffect(() => {
    if (profileUser) {
      if (canCreateRecipes(profileUser) || userRecipes.length > 0) {
        // If user can create recipes or has recipes, default to recipes tab
        setActiveTab("recipes");
      } else {
        // If user can't create recipes and has no recipes, default to favorites
        setActiveTab("favorites");
      }
    }
  }, [profileUser, userRecipes]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiClient.put("/auth/profile", editForm);
      setProfileUser(response.data.user);
      updateUser(response.data.user);
      setIsEditing(false);

      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed z-50 w-auto alert alert-success top-4 right-4";
      notification.innerHTML = "<span>✅ Profile updated successfully!</span>";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // In real app, upload to cloud storage
      // For now, use placeholder
      const imageUrl = `https://ui-avatars.com/api/?name=${profileUser?.username}&background=FF6B35&color=ffffff&size=200`;

      try {
        await apiClient.put("/auth/profile", { profile_image: imageUrl });
        setProfileUser({ ...profileUser, profile_image: imageUrl });
        updateUser({ ...currentUser, profile_image: imageUrl });
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }
  };

  const cuisineOptions = [
    "Indonesian",
    "Italian",
    "Chinese",
    "Japanese",
    "Thai",
    "Indian",
    "Mexican",
    "French",
    "Mediterranean",
    "Korean",
    "Vietnamese",
    "American",
  ];

  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Keto",
    "Paleo",
    "Low-Carb",
    "Halal",
    "Kosher",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-orange-50">
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
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Reset page when recipe status filter changes
  const handleRecipeStatusChange = (newStatus) => {
    setRecipeStatus(newStatus);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  // Handle recipe status change from RecipeCard
  const handleRecipeToggle = (recipeId, newPublishStatus) => {
    // Update the recipe in the local state
    setUserRecipes((prevRecipes) =>
      prevRecipes.map((recipe) =>
        recipe.id === recipeId
          ? { ...recipe, is_published: newPublishStatus }
          : recipe
      )
    );

    // Reload recipes and counts to reflect changes
    setTimeout(() => {
      // Force refresh by updating trigger
      setRefreshTrigger((prev) => prev + 1);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Profile Header */}
      <div className="bg-orange-50">
        <div className="container px-4 py-12 mx-auto">
          <div className="max-w-4xl mx-auto">
            {/* Profile Card */}
            <div className="p-8 bg-white shadow-xl rounded-2xl">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
                {/* Avatar Section */}
                <div className="relative">
                  <div className="avatar">
                    <div className="ml-5 mt-7 w-32 h-32 rounded-full ring ring-orange-900 ring-offset-2">
                      <img
                        src={
                          profileUser.profile_image ||
                          `https://ui-avatars.com/api/?name=${profileUser.username}&background=431407&color=ffffff&size=200`
                        }
                        alt={profileUser.username}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${profileUser.username}&background=FF6B35&color=ffffff&size=200`;
                        }}
                      />
                    </div>
                  </div>

                  {isOwnProfile && (
                    <label className="absolute bottom-0 right-0 cursor-pointer btn btn-circle btn-sm bg-orange-50 text-orange-800">
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
                      <h1 className="mb-2 mt-5 text-3xl font-semibold text-orange-800">
                        {profileUser.full_name || profileUser.username}
                      </h1>
                      <p className="mb-2 text-lg text-orange-800">
                        @{profileUser.username}
                      </p>

                      {/* Role Badge */}
                      <div className="flex items-center justify-center gap-2 mb-4 lg:justify-start">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                            profileUser.role
                          )}`}
                        >
                          {getRoleDisplayName(profileUser.role)}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isOwnProfile && (
                      <div className="flex flex-wrap gap-3">
                        {/* Toggle Edit Profile Button */}
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-orange-800 bg-orange-50 border border-orange-300 rounded-full hover:bg-orange-100 transition-all duration-200 shadow-sm"
                        >
                          <FaEdit className="mr-2" />
                          {isEditing ? "Cancel" : "Edit Profile"}
                        </button>

                        {/* New Recipe Button */}
                        {canCreateRecipes(currentUser) && (
                          <Link
                            to="/recipes/create"
                            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 rounded-full shadow-md transition-all duration-200"
                          >
                            <FaPlus className="mr-2" />
                            New Recipe
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {profileUser.bio && (
                    <p className="max-w-2xl mb-4 text-orange-900">
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
                      <FaCalendar className="text-orange-900" />
                      Joined{" "}
                      {new Date(profileUser.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>

                    {profileUser.last_seen_at && (
                      <span className="flex items-center gap-1">
                        <FaEye className="text-orange-900" />
                        Last seen{" "}
                        {new Date(
                          profileUser.last_seen_at
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 gap-6 pt-10 mt-10 border-t border-gray-200 lg:grid-cols-2">
                {canCreateRecipes(profileUser) && (
                  <>
                    {/* Recipe Count */}
                    <div className="flex items-center p-5 bg-orange-50 rounded-xl shadow-sm hover:shadow-md transition">
                      <div className="p-4 mr-4 text-white bg-orange-600 rounded-full text-2xl">
                        <FaBookOpen />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-orange-800">
                          Recipes
                        </div>
                        <div className="text-xl font-bold text-orange-900">
                          {profileUser.recipe_count || 0}
                        </div>
                      </div>
                    </div>

                    {/* Total Likes */}
                    <div className="flex items-center p-5 bg-red-50 rounded-xl shadow-sm hover:shadow-md transition">
                      <div className="p-4 mr-4 text-white bg-red-500 rounded-full text-2xl">
                        <FaHeart />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-red-700">
                          Total Likes
                        </div>
                        <div className="text-xl font-bold text-red-800">
                          {profileUser.total_likes || 0}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal modal-open font-brand">
          <div className="max-w-2xl modal-box bg-orange-50 text-orange-900 font-brand">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 mt-5 ml-1">
              <h2 className="text-3xl font-semibold">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-circle btn-sm btn-ghost text-orange-800 hover:bg-orange-100"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Full Name & Location */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="form-control">
                  <label className="label text-orange-900 font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    className="input input-bordered bg-white text-base"
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, full_name: e.target.value })
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label text-orange-900 font-medium">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    className="input input-bordered bg-white text-base"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="form-control">
                <label className="label text-orange-900 font-medium">Bio</label>
                <textarea
                  className="textarea textarea-bordered h-24 text-base bg-white"
                  placeholder="Tell us about yourself and your cooking journey..."
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                />
              </div>

              {/* Website */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-orange-900 font-medium">
                    Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-website.com"
                    className="input input-bordered text-base bg-white"
                    value={editForm.website}
                    onChange={(e) =>
                      setEditForm({ ...editForm, website: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Favorite Cuisines */}
              <div className="form-control">
                <label className="label text-orange-900 font-medium">
                  Favorite Cuisines
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {cuisineOptions.map((cuisine) => (
                    <label
                      key={cuisine}
                      className="flex items-center gap-2 text-sm cursor-pointer text-orange-800"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={editForm.favorite_cuisines.includes(cuisine)}
                        onChange={(e) => {
                          const cuisines = e.target.checked
                            ? [...editForm.favorite_cuisines, cuisine]
                            : editForm.favorite_cuisines.filter(
                                (c) => c !== cuisine
                              );
                          setEditForm({
                            ...editForm,
                            favorite_cuisines: cuisines,
                          });
                        }}
                      />
                      {cuisine}
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Preferences */}
              <div className="form-control">
                <label className="label text-orange-900 font-medium">
                  Dietary Preferences
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {dietaryOptions.map((diet) => (
                    <label
                      key={diet}
                      className="flex items-center gap-2 text-sm cursor-pointer text-orange-800"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={editForm.dietary_preferences.includes(diet)}
                        onChange={(e) => {
                          const diets = e.target.checked
                            ? [...editForm.dietary_preferences, diet]
                            : editForm.dietary_preferences.filter(
                                (d) => d !== diet
                              );
                          setEditForm({
                            ...editForm,
                            dietary_preferences: diets,
                          });
                        }}
                      />
                      {diet}
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-action font-brand">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn text-red-800 bg-red-200 hover:bg-red-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-orange-900 hover:bg-orange-950 text-white"
                >
                  <FaSave className="mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="container px-4 py-8 mx-auto bg-orange-50">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="p-3 mb-8 bg-orange-950 rounded-xl flex gap-2">
            {(canCreateRecipes(profileUser) || userRecipes.length > 0) && (
              <button
                className={`tab px-4 rounded-md transition-all duration-200 flex items-center gap-2 ${
                  activeTab === "recipes"
                    ? "bg-orange-50 text-orange-800 shadow"
                    : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
                }`}
                onClick={() => setActiveTab("recipes")}
              >
                <FaBookOpen />
                <span>Recipes ({userRecipes.length})</span>
              </button>
            )}

            <button
              className={`tab px-4 rounded-md transition-all duration-200 flex items-center gap-2 ${
                activeTab === "favorites"
                  ? "bg-orange-50 text-orange-800 shadow"
                  : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
              }`}
              onClick={() => setActiveTab("favorites")}
            >
              <FaHeart />
              <span>Favorites</span>
            </button>

            <button
              className={`tab px-4 rounded-md transition-all duration-200 flex items-center gap-2 ${
                activeTab === "about"
                  ? "bg-orange-50 text-orange-800 shadow"
                  : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
              }`}
              onClick={() => setActiveTab("about")}
            >
              <FaUser />
              <span>About</span>
            </button>
          </div>

          {/* Recipes Tab */}
          {activeTab === "recipes" && (
            <div>
              <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-medium text-orange-800">
                  {isOwnProfile
                    ? "My Recipes"
                    : `${profileUser.username}'s Recipes`}
                </h2>

                <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                  {/* Recipe Status Filter */}
                  {isOwnProfile && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-orange-800">
                        Status:
                      </span>
                      <div className="flex gap-1 rounded-md overflow-hidden bg-white shadow-inner border border-orange-200">
                        <button
                          className={`px-3 py-1 text-sm font-medium transition ${
                            recipeStatus === "all"
                              ? "bg-orange-800 text-white"
                              : "text-orange-700 hover:bg-orange-100"
                          }`}
                          onClick={() => handleRecipeStatusChange("all")}
                        >
                          All ({recipeCounts.total})
                        </button>
                        <button
                          className={`px-3 py-1 text-sm font-medium transition ${
                            recipeStatus === "published"
                              ? "bg-green-600 text-white"
                              : "text-green-700 hover:bg-green-50"
                          }`}
                          onClick={() => handleRecipeStatusChange("published")}
                        >
                          Published ({recipeCounts.published})
                        </button>
                        <button
                          className={`px-3 py-1 text-sm font-medium transition ${
                            recipeStatus === "draft"
                              ? "bg-yellow-400 text-white"
                              : "text-yellow-700 hover:bg-yellow-100"
                          }`}
                          onClick={() => handleRecipeStatusChange("draft")}
                        >
                          Drafts ({recipeCounts.draft})
                        </button>
                      </div>
                    </div>
                  )}

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 rounded-md bg-white shadow-inner border border-orange-200">
                    <button
                      className={`px-3 py-1 text-sm transition ${
                        viewMode === "grid"
                          ? "bg-orange-800 text-white"
                          : "text-orange-700 hover:bg-orange-100"
                      }`}
                      onClick={() => setViewMode("grid")}
                      title="Grid View"
                    >
                      <FaTh />
                    </button>
                    <button
                      className={`px-3 py-1 text-sm transition ${
                        viewMode === "list"
                          ? "bg-orange-800 text-white"
                          : "text-orange-700 hover:bg-orange-100"
                      }`}
                      onClick={() => setViewMode("list")}
                      title="List View"
                    >
                      <FaList />
                    </button>
                  </div>

                  {/* New Recipe Button */}
                  {isOwnProfile && canCreateRecipes(currentUser) && (
                    <Link
                      to="/recipes/create"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-800 rounded-md shadow-md hover:bg-orange-900 transition"
                    >
                      <FaPlus className="mr-2" />
                      New Recipe
                    </Link>
                  )}
                </div>
              </div>

              {/* Recipes Grid/List */}
              {recipesLoading ? (
                <div className="flex justify-center py-20 bg-orange-50">
                  <LoadingSpinner size="lg" text="Loading recipes..." />
                </div>
              ) : userRecipes.length > 0 ? (
                <>
                  {console.log(
                    "Frontend: Rendering recipes, userRecipes state:",
                    userRecipes
                  )}
                  {console.log(
                    "Frontend: userRecipes.length:",
                    userRecipes.length
                  )}
                  <div
                    className={`grid gap-6 ${
                      viewMode === "grid"
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1"
                    }`}
                  >
                    {userRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        showAuthor={!isOwnProfile}
                        showOwnerActions={isOwnProfile}
                        onStatusChange={handleRecipeToggle}
                        className={
                          viewMode === "list" ? "recipe-card-list" : ""
                        }
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
                              className={`btn ${
                                page === currentPage ? "btn-active" : ""
                              }`}
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
                    {isOwnProfile ? "No recipes yet" : "No recipes found"}
                  </h3>
                  <p className="mb-6 text-gray-600">
                    {isOwnProfile
                      ? "Start sharing your delicious recipes with the community!"
                      : `${profileUser.username} hasn't shared any recipes yet.`}
                  </p>
                  {isOwnProfile && canCreateRecipes(currentUser) && (
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
          {activeTab === "favorites" && (
            <div className="py-20 text-center">
              <h3 className="mb-2 text-4xl font-semibold text-orange-800">
                Favorite Recipes
              </h3>
              <p className="mb-6 text-orange-700">
                {isOwnProfile
                  ? "Your favorite recipes will appear here"
                  : `${profileUser.username}'s favorite recipes`}
              </p>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm">
                Coming Soon
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="max-w-5xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Cooking Info */}
                <div className="bg-white border border-orange-100 rounded-2xl shadow-md p-6">
                  <h3 className="mb-4 text-2xl font-semibold text-orange-800">
                    Cooking Profile
                  </h3>

                  <div className="space-y-6 text-sm text-gray-700">
                    {profileUser.favorite_cuisines?.length > 0 && (
                      <div>
                        <p className="font-medium text-orange-900 mb-1">
                          Favorite Cuisines:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profileUser.favorite_cuisines.map((cuisine) => (
                            <span
                              key={cuisine}
                              className="px-3 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200 text-xs font-medium shadow-sm"
                            >
                              {cuisine}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profileUser.dietary_preferences?.length > 0 && (
                      <div>
                        <p className="font-medium text-orange-900 mb-1">
                          Dietary Preferences:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profileUser.dietary_preferences.map((diet) => (
                            <span
                              key={diet}
                              className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium shadow-sm"
                            >
                              {diet}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6">
                  <h3 className="mb-4 text-2xl font-semibold text-orange-800">
                    Activity Overview 
                  </h3>

                  <div className="space-y-6 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                      <FaCalendar className="text-orange-600 text-xl mt-1" />
                      <div>
                        <p className="font-medium text-gray-600">
                          Member Since
                        </p>
                        <p className="text-base font-semibold">
                          {new Date(profileUser.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaFire className="text-red-500 text-xl mt-1" />
                      <div>
                        <p className="font-medium text-gray-600">
                          Total Recipe Views
                        </p>
                        <p className="text-base font-semibold">
                          {userRecipes
                            .reduce(
                              (total, recipe) =>
                                total + (recipe.view_count || 0),
                              0
                            )
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaStar className="text-yellow-500 text-xl mt-1" />
                      <div>
                        <p className="font-medium text-gray-600">
                          Average Rating
                        </p>
                        <p className="text-base font-semibold">
                          {userRecipes.length > 0
                            ? (
                                userRecipes.reduce(
                                  (total, recipe) =>
                                    total + (recipe.rating || 0),
                                  0
                                ) / userRecipes.length
                              ).toFixed(1)
                            : "0.0"}{" "}
                        </p>
                      </div>
                    </div>
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
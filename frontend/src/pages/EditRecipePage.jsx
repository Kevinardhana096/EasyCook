import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import {
  FaPlus,
  FaMinus,
  FaUpload,
  FaSave,
  FaEye,
  FaTimes,
  FaClock,
  FaUsers,
  FaUtensils,
  FaImage,
  FaList,
  FaEdit,
  FaArrowLeft,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { canCreateRecipes } from "../utils/roleUtils";
import LoadingSpinner from "../components/common/LoadingSpinner";
import apiClient from "../api/client";

const EditRecipePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  // Form state management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);

  // Form setup with react-hook-form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      difficulty: "Medium",
      prep_time: "",
      cook_time: "",
      servings: 4,
      image_url: "",
      instructions: "",
      tips: "",
      ingredients: [{ name: "", quantity: "", unit: "gram", notes: "" }],
      nutrition: {
        calories_per_serving: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
      },
    },
  });

  // Field arrays for dynamic ingredients
  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "ingredients",
  });

  // Watch form values for calculations
  const watchPrepTime = watch("prep_time");
  const watchCookTime = watch("cook_time");

  // useEffect hooks - must be at the top level, before any returns

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: `/recipes/${id}/edit` } },
      });
    }
  }, [isAuthenticated, navigate, id]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiClient.get("/recipes/categories");
        setCategories(response.data.categories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Load recipe data
  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const loadRecipe = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(`/recipes/${id}`);
        const recipeData = response.data.recipe;

        // Check if user can edit this recipe
        if (recipeData.user_id !== user.id && user.role !== "admin") {
          setError("You do not have permission to edit this recipe.");
          return;
        }

        setRecipe(recipeData);

        // Reset form with recipe data
        reset({
          title: recipeData.title || "",
          description: recipeData.description || "",
          category_id: recipeData.category_id || "",
          difficulty: recipeData.difficulty || "Medium",
          prep_time: recipeData.prep_time || "",
          cook_time: recipeData.cook_time || "",
          servings: recipeData.servings || 4,
          image_url: recipeData.image_url || "",
          instructions: recipeData.instructions || "",
          tips: recipeData.tips || "",
          ingredients:
            recipeData.ingredients && recipeData.ingredients.length > 0
              ? recipeData.ingredients
              : [{ name: "", quantity: "", unit: "gram", notes: "" }],
          nutrition: {
            calories_per_serving:
              recipeData.nutrition?.calories_per_serving || "",
            protein: recipeData.nutrition?.protein || "",
            carbs: recipeData.nutrition?.carbs || "",
            fat: recipeData.nutrition?.fat || "",
            fiber: recipeData.nutrition?.fiber || "",
          },
        });

        // Set image preview if exists
        if (recipeData.image_url) {
          setImagePreview(recipeData.image_url);
        }
      } catch (err) {
        console.error("Failed to load recipe:", err);
        if (err.response?.status === 404) {
          setError("Recipe not found.");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to edit this recipe.");
        } else {
          setError("Failed to load recipe. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, user, navigate, reset]);

  // Calculate total time
  useEffect(() => {
    const prepTime = parseInt(watchPrepTime) || 0;
    const cookTime = parseInt(watchCookTime) || 0;
    setValue("total_time", prepTime + cookTime);
  }, [watchPrepTime, watchCookTime, setValue]);

  // Check if user can edit recipes
  if (!canCreateRecipes(user)) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Chef Access Required
            </h1>
            <p className="text-gray-600 mb-6">
              You need chef or admin privileges to edit recipes.
            </p>
            <button
              onClick={() => navigate("/")}
              className="btn btn-outline btn-orange"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center bg-orange-50 justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading recipe..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-4 text-6xl text-gray-400">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Error</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const loadCategories = async () => {
    try {
      const response = await apiClient.get("/recipes/categories");
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setImagePreview(dataUrl);
        // Use the actual uploaded image data URL
        setValue("image_url", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue("image_url", "");
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);

    try {
      // Prepare recipe data
      const recipeData = {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        prep_time: parseInt(data.prep_time) || 0,
        cook_time: parseInt(data.cook_time) || 0,
        total_time:
          (parseInt(data.prep_time) || 0) + (parseInt(data.cook_time) || 0),
        servings: parseInt(data.servings) || 4,
        difficulty: data.difficulty || "Medium",
        image_url: data.image_url || "",
        tips: data.tips || "",
        category_id: parseInt(data.category_id) || null,
        ingredients: data.ingredients.filter((ing) => ing.name.trim() !== ""),
        // Include nutrition data if provided
        nutrition: {
          calories_per_serving:
            parseFloat(data.nutrition?.calories_per_serving) || null,
          protein: parseFloat(data.nutrition?.protein) || null,
          carbs: parseFloat(data.nutrition?.carbs) || null,
          fat: parseFloat(data.nutrition?.fat) || null,
          fiber: parseFloat(data.nutrition?.fiber) || null,
        },
      };

      console.log("Updating recipe:", recipeData);

      // Make API call to update recipe
      const response = await apiClient.put(`/recipes/${id}`, recipeData);

      console.log("Recipe updated successfully:", response.data);
      setSubmitSuccess(true);

      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed z-50 w-auto alert alert-success top-4 right-4";
      notification.innerHTML = "<span>✅ Recipe updated successfully!</span>";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

      // Redirect to recipe detail page after success
      setTimeout(() => {
        navigate(`/recipes/${id}`);
      }, 2000);
    } catch (err) {
      console.error("Recipe update failed:", err);
      if (err.response?.data?.message) {
        alert(`Failed to update recipe: ${err.response.data.message}`);
      } else {
        alert("Failed to update recipe. Please try again.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const saveDraft = async () => {
    const formData = watch();
    localStorage.setItem(
      `recipe_edit_draft_${id}`,
      JSON.stringify({
        ...formData,
        saved_at: new Date().toISOString(),
      })
    );

    // Show success notification
    const notification = document.createElement("div");
    notification.className = "fixed z-50 w-auto alert alert-info top-4 right-4";
    notification.innerHTML = "<span>💾 Changes saved as draft!</span>";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const loadDraft = () => {
    const draft = localStorage.getItem(`recipe_edit_draft_${id}`);
    if (draft) {
      const draftData = JSON.parse(draft);
      reset(draftData);
      if (draftData.image_url) {
        setImagePreview(draftData.image_url);
      }

      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed z-50 w-auto alert alert-info top-4 right-4";
      notification.innerHTML = "<span>📄 Draft loaded!</span>";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } else {
      alert("No draft found for this recipe.");
    }
  };

  const difficultyOptions = ["Easy", "Medium", "Hard"];
  const unitOptions = [
    "gram",
    "kg",
    "ml",
    "liter",
    "cup",
    "tbsp",
    "tsp",
    "piece",
    "slice",
    "clove",
  ];

  if (!isAuthenticated) {
    return <LoadingSpinner size="lg" text="Checking authentication..." />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading recipe..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Cannot Edit Recipe
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => navigate("/")} className="btn btn-outline">
                Back to Home
              </button>
              <button
                onClick={() => navigate(`/recipes/${id}`)}
                className="btn btn-primary"
              >
                View Recipe
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Animated Header */}
      <div className="bg-orange-50 font-brand">
        <div className="container px-4 py-8 mx-auto font-brand">
          {/* Back Button - Posisi di atas sendiri */}
          <div className="mb-6">
            <button
              onClick={() => navigate(`/recipes/${id}`)}
              className="p-2 rounded-full bg-gradient-to-r from-orange-800 to-orange-900 text-white hover:shadow-lg transition-shadow"
              title="Back to Recipe"
            >
              <FaArrowLeft className="text-lg" />
            </button>
          </div>
          {/* Header & Action Buttons */}
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            {/* Title & Subtitle */}
            <div className="flex-1 ml-12">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-semibold text-transparent bg-orange-800 bg-clip-text">
                  Edit Recipe
                </h1>
              </div>
              <p className="text-sm text-orange-700">
                Update your culinary masterpiece
              </p>
            </div>

            {/* Draft Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mr-10">
              <button
                type="button"
                onClick={loadDraft}
                className="flex items-center justify-center px-5 py-2.5 rounded-full border border-orange-300 text-orange-700 bg-white hover:bg-orange-50 hover:border-orange-400 shadow-md transition-all duration-200"
              >
                <FaEdit className="mr-2" />
                Load Draft
              </button>
              <button
                type="button"
                onClick={saveDraft}
                className="flex items-center justify-center px-5 py-2.5 rounded-full text-white bg-gradient-to-r from-orange-700 to-orange-900 hover:from-orange-900 hover:to-orange-950 shadow-md transition-all duration-200"
              >
                <FaSave className="mr-2" />
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Success Message */}
          {submitSuccess && (
            <div className="p-4 mb-8 text-center border border-green-200 rounded-lg alert alert-success bg-green-50">
              <div>
                <svg
                  className="w-6 h-6 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-lg font-semibold">
                  Recipe updated successfully! 🎉
                </span>
              </div>
              <p className="mt-2 text-sm text-green-600">
                Redirecting to recipe page...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Tabs */}
            <div className="bg-white shadow-lg rounded-2xl">
              <div className="tabs tabs-boxed p-2 bg-orange-950 rounded-t-2xl flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("basic")}
                  className={`tab tab-lg flex-1 transition-all duration-200 rounded-md ${
                    activeTab === "basic"
                      ? "bg-orange-50 text-orange-800 shadow-md"
                      : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
                  }
                `}
                >
                  <FaEdit className="mr-2" />
                  Basic Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ingredients")}
                  className={`tab tab-lg flex-1 transition-all duration-200 rounded-md ${
                    activeTab === "ingredients"
                      ? "bg-orange-50 text-orange-800 shadow-md"
                      : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
                  }
                `}
                >
                  <FaList className="mr-2" />
                  Ingredients
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("instructions")}
                  className={`tab tab-lg flex-1 transition-all duration-200 rounded-md ${
                    activeTab === "instructions"
                      ? "bg-orange-50 text-orange-800 shadow-md"
                      : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
                  }
                `}
                >
                  <FaUtensils className="mr-2" />
                  Instructions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("nutrition")}
                  className={`tab tab-lg flex-1 transition-all duration-200 rounded-md ${
                    activeTab === "nutrition"
                      ? "bg-orange-50 text-orange-800 shadow-md"
                      : "text-orange-50 hover:bg-orange-50 hover:text-orange-800"
                  }`}
                >
                  <FaEye className="mr-2" />
                  Nutrition
                </button>
              </div>

              <div className="p-8 font-brand">
                {/* Basic Info Tab */}
                {activeTab === "basic" && (
                  <div className="space-y-6">
                    {/* Title */}
                    <div className="form-control">
                      <label className="label">
                        <span className="text-lg text-orange-800 font-medium label-text">
                          Recipe Title *
                        </span>
                      </label>
                      <input
                        {...register("title", {
                          required: "Recipe title is required",
                        })}
                        type="text"
                        placeholder="e.g., Grandma's Secret Chocolate Chip Cookies"
                        className={`input input-bordered input-lg w-full bg-orange-50 text-black ${
                          errors.title ? "input-error" : ""
                        }`}
                      />
                      {errors.title && (
                        <label className="label">
                          <span className="text-error label-text-alt">
                            {errors.title.message}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Description */}
                    <div className="form-control">
                      <label className="label">
                        <span className="text-lg font-medium text-orange-800 label-text">
                          Description *
                        </span>
                      </label>
                      <textarea
                        {...register("description", {
                          required: "Description is required",
                        })}
                        className={`textarea textarea-bordered h-32  bg-orange-50 text-black ${
                          errors.description ? "textarea-error" : ""
                        }`}
                        placeholder="Describe your recipe, its origin, what makes it unique, or why you love it..."
                      />
                      {errors.description && (
                        <label className="label">
                          <span className="text-error label-text-alt">
                            {errors.description.message}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div className="form-control">
                      <label className="label">
                        <span className="text-lg font-medium text-orange-800 label-text">
                          Recipe Image
                        </span>
                      </label>

                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Recipe preview"
                            className="object-cover w-full h-64 border-4 rounded-lg border-orange-900"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 btn btn-circle btn-sm btn-error"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-64 rounded-lg cursor-pointer hover:bg-orange-50">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FaUpload className="mb-3 text-4xl text-orange-900" />
                            <p className="mb-2 text-lg text-orange-800">
                              <span className="font-medium text-orange-800">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-sm text-orange-800">
                              PNG, JPG or JPEG (MAX. 5MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Category and Details Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 font-brand">
                      {/* Category */}
                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium text-orange-800 label-text">
                            Category
                          </span>
                        </label>
                        <select
                          {...register("category_id")}
                          className="select select-bordered  bg-orange-50 text-black"
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Difficulty */}
                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium text-orange-800 label-text">
                            Difficulty
                          </span>
                        </label>
                        <select
                          {...register("difficulty")}
                          className="select select-bordered  bg-orange-50 text-black"
                        >
                          {difficultyOptions.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                              {difficulty}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Prep Time */}
                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium text-orange-800 label-text">
                            Prep Time (min)
                          </span>
                        </label>
                        <input
                          {...register("prep_time", { min: 0 })}
                          type="number"
                          placeholder="30"
                          className="input input-bordered  bg-orange-50 text-black"
                        />
                      </div>

                      {/* Cook Time */}
                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium text-800 label-text">
                            Cook Time (min)
                          </span>
                        </label>
                        <input
                          {...register("cook_time", { min: 0 })}
                          type="number"
                          placeholder="45"
                          className="input input-bordered  bg-orange-50 text-black"
                        />
                      </div>
                    </div>

                    {/* Servings */}
                    <div className="form-control max-w-xs">
                      <label className="label">
                        <span className="font-medium text-orange-800 label-text">
                          Servings
                        </span>
                      </label>
                      <input
                        {...register("servings", { min: 1, max: 50 })}
                        type="number"
                        placeholder="4"
                        className="input input-bordered  bg-orange-50 text-black"
                      />
                    </div>
                  </div>
                )}

                {/* Ingredients Tab */}
                {activeTab === "ingredients" && (
                  <div className="space-y-6 font-brand">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-medium text-orange-800">Ingredients</h3>
                      <button
                        type="button"
                        onClick={() =>
                          appendIngredient({
                            name: "",
                            quantity: "",
                            unit: "gram",
                            notes: "",
                          })
                        }
                        className="btn bg-orange-50 text-orange-800 hover:bg-orange-100 btn-sm"
                      >
                        <FaPlus className="mr-2" />
                        Add Ingredient
                      </button>
                    </div>

                    <div className="space-y-4">
                      {ingredientFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="grid grid-cols-1 gap-4 p-4 border border-gray-200 rounded-lg md:grid-cols-12"
                        >
                          {/* Ingredient Name */}
                          <div className="form-control md:col-span-5">
                            <input
                              {...register(`ingredients.${index}.name`, {
                                required: "Ingredient name is required",
                              })}
                              type="text"
                              placeholder="e.g., All-purpose flour"
                              className="input input-bordered  bg-orange-50 text-black"
                            />
                          </div>

                          {/* Quantity */}
                          <div className="form-control md:col-span-2">
                            <input
                              {...register(`ingredients.${index}.quantity`)}
                              type="text"
                              placeholder="2"
                              className="input input-bordered  bg-orange-50 text-black"
                            />
                          </div>

                          {/* Unit */}
                          <div className="form-control md:col-span-2">
                            <select
                              {...register(`ingredients.${index}.unit`)}
                              className="select select-bordered  bg-orange-50 text-black"
                            >
                              {unitOptions.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Notes */}
                          <div className="form-control md:col-span-2">
                            <input
                              {...register(`ingredients.${index}.notes`)}
                              type="text"
                              placeholder="optional notes"
                              className="input input-bordered  bg-orange-50 text-black"
                            />
                          </div>

                          {/* Remove Button */}
                          <div className="form-control md:col-span-1">
                            <button
                              type="button"
                              onClick={() => removeIngredient(index)}
                              className="btn btn-circle btn-error btn-sm bg-red-300 text-red-500"
                              disabled={ingredientFields.length === 1}
                            >
                              <FaMinus />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions Tab */}
                {activeTab === "instructions" && (
                  <div className="space-y-6 font-brand">
                    <h3 className="text-2xl font-medium text-orange-800">Cooking Instructions</h3>

                    <div className="form-control">
                      <label className="label">
                        <span className="text-lg font-medium text-orange-800 label-text">
                          Step-by-Step Instructions *
                        </span>
                      </label>
                      <textarea
                        {...register("instructions", {
                          required: "Instructions are required",
                        })}
                        className={`textarea textarea-bordered h-64 ${
                          errors.instructions ? "textarea-error" : ""
                        }`}
                        placeholder="1. ... "
                      />
                      {errors.instructions && (
                        <label className="label">
                          <span className="text-error label-text-alt">
                            {errors.instructions.message}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="text-lg font-medium text-orange-800 label-text">
                          Tips & Tricks
                        </span>
                      </label>
                      <textarea
                        {...register("tips")}
                        className="textarea textarea-bordered h-32"
                        placeholder="Tell your tips and tricks"
                      />
                    </div>
                  </div>
                )}

                {/* Nutrition Tab */}
                {activeTab === "nutrition" && (
                  <div className="space-y-6 font-brand">
                    <h3 className="text-2xl font-medium text-orange-800">
                      Nutrition Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium text-orange-800 label-text">
                            Calories per serving
                          </span>
                        </label>
                        <input
                          {...register("nutrition.calories_per_serving")}
                          type="number"
                          placeholder="250"
                          className="input input-bordered  bg-orange-50 text-black"
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium text-orange-800 label-text">
                            Protein (g)
                          </span>
                        </label>
                        <input
                          {...register("nutrition.protein")}
                          type="number"
                          step="0.1"
                          placeholder="5.2"
                          className="input input-bordered  bg-orange-50 text-black"
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium text-orange-800 label-text">
                            Carbs (g)
                          </span>
                        </label>
                        <input
                          {...register("nutrition.carbs")}
                          type="number"
                          step="0.1"
                          placeholder="35.8"
                          className="input input-bordered  bg-orange-50 text-black"
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium text-orange-800 label-text">
                            Fat (g)
                          </span>
                        </label>
                        <input
                          {...register("nutrition.fat")}
                          type="number"
                          step="0.1"
                          placeholder="12.1"
                          className="input input-bordered  bg-orange-50 text-black"
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium text-orange-800 label-text">
                            Fiber (g)
                          </span>
                        </label>
                        <input
                          {...register("nutrition.fiber")}
                          type="number"
                          step="0.1"
                          placeholder="2.3"
                          className="input input-bordered  bg-orange-50 text-black"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}

            <div className="text-center">
              <button
                type="submit"
                disabled={submitLoading || submitSuccess}
                className={`btn btn-lg ${
                  submitLoading ? "loading" : ""
                } text-orange-900 border-none border-orange-900 bg-white hover:bg-orange-100 disabled:opacity-50`}
              >
                {submitLoading ? (
                  <span className="loading loading-spinner loading-md"></span>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Update Recipe
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRecipePage;
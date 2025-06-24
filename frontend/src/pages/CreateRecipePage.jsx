import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  FaPlus, FaMinus, FaUpload, FaSave, FaEye, FaTimes,
  FaClock, FaUsers, FaUtensils, FaImage, FaList, FaEdit
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import apiClient from '../api/client';

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Form state management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Form setup with react-hook-form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      difficulty: 'Medium',
      prep_time: '',
      cook_time: '',
      servings: 4,
      image_url: '',
      instructions: '',
      tips: '',
      ingredients: [
        { name: '', quantity: '', unit: 'gram', notes: '' }
      ],
      nutrition: {
        calories_per_serving: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: ''
      }
    }
  });

  // Field arrays for dynamic ingredients
  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients'
  });

  // Watch form values for calculations
  const watchPrepTime = watch('prep_time');
  const watchCookTime = watch('cook_time');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: { pathname: '/recipes/create' } }
      });
    }
  }, [isAuthenticated, navigate]);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Calculate total time
  useEffect(() => {
    const prepTime = parseInt(watchPrepTime) || 0;
    const cookTime = parseInt(watchCookTime) || 0;
    setValue('total_time', prepTime + cookTime);
  }, [watchPrepTime, watchCookTime, setValue]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/recipes/categories');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // In real app, upload to cloud storage
      // For now, use placeholder
      const imageUrl = `https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&auto=format&q=80`;
      setValue('image_url', imageUrl);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue('image_url', '');
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Prepare recipe data
      const recipeData = {
        ...data,
        slug: data.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        is_published: true,
        total_time: (parseInt(data.prep_time) || 0) + (parseInt(data.cook_time) || 0)
      };

      console.log('Submitting recipe:', recipeData);

      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitSuccess(true);

      // Reset form after success
      setTimeout(() => {
        reset();
        setImagePreview(null);
        setSubmitSuccess(false);
        navigate('/search');
      }, 3000);

    } catch (err) {
      console.error('Recipe creation failed:', err);
      alert('Failed to create recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    const formData = watch();
    localStorage.setItem('recipe_draft', JSON.stringify({
      ...formData,
      saved_at: new Date().toISOString()
    }));
    alert('Recipe saved as draft! 💾');
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('recipe_draft');
    if (draft) {
      const draftData = JSON.parse(draft);
      reset(draftData);
      if (draftData.image_url) {
        setImagePreview(draftData.image_url);
      }
      alert('Draft loaded! 📄');
    }
  };

  const difficultyOptions = ['Easy', 'Medium', 'Hard'];
  const unitOptions = ['gram', 'kg', 'ml', 'liter', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'clove'];

  if (!isAuthenticated) {
    return <LoadingSpinner size="lg" text="Checking authentication..." />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Animated Header */}
      <div className="bg-white border-b-4 shadow-lg border-gradient-to-r from-orange-400 to-red-400">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="p-3 mr-4 rounded-full bg-gradient-to-r from-orange-400 to-red-400">
                  <FaUtensils className="text-xl text-white" />
                </div>
                <h1 className="text-3xl font-bold text-transparent lg:text-4xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text">
                  Create New Recipe
                </h1>
                <span className="ml-2 text-3xl animate-bounce">👨‍🍳</span>
              </div>
              <p className="mb-2 text-lg text-gray-600">Share your culinary masterpiece with the CookEasy community</p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                <span className="px-3 py-1 text-orange-600 bg-orange-100 rounded-full">📝 Easy to use</span>
                <span className="px-3 py-1 text-yellow-600 bg-yellow-100 rounded-full">🎯 Step by step</span>
                <span className="px-3 py-1 text-red-600 bg-red-100 rounded-full">❤️ Share with love</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={loadDraft}
                className="text-orange-600 border-orange-300 btn btn-outline hover:bg-orange-50 hover:border-orange-400"
              >
                <FaEdit className="mr-2" />
                Load Draft
              </button>
              <button
                type="button"
                onClick={saveDraft}
                className="text-white border-none btn bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500"
              >
                <FaSave className="mr-2" />
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-8 border-green-300 shadow-lg alert bg-gradient-to-r from-green-100 to-emerald-100">
              <div className="flex items-center">
                <div className="p-2 mr-3 bg-green-500 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-green-800">Recipe created successfully! 🎉</span>
                  <p className="mt-1 text-sm text-green-700">Redirecting to recipes page...</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Enhanced Tab Navigation */}
            <div className="p-2 bg-white shadow-xl rounded-2xl">
              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                <button
                  type="button"
                  className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
                  onClick={() => setActiveTab('basic')}
                >
                  <FaEdit className="mr-2 text-lg" />
                  <span className="font-medium">Basic Info</span>
                  {activeTab === 'basic' && <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-orange-400 to-red-400"></div>}
                </button>
                <button
                  type="button"
                  className={`tab-button ${activeTab === 'ingredients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ingredients')}
                >
                  <FaList className="mr-2 text-lg" />
                  <span className="font-medium">Ingredients</span>
                  {activeTab === 'ingredients' && <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-orange-400 to-red-400"></div>}
                </button>
                <button
                  type="button"
                  className={`tab-button ${activeTab === 'instructions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('instructions')}
                >
                  <FaUtensils className="mr-2 text-lg" />
                  <span className="font-medium">Instructions</span>
                  {activeTab === 'instructions' && <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-orange-400 to-red-400"></div>}
                </button>
                <button
                  type="button"
                  className={`tab-button ${activeTab === 'nutrition' ? 'active' : ''}`}
                  onClick={() => setActiveTab('nutrition')}
                >
                  <FaUsers className="mr-2 text-lg" />
                  <span className="font-medium">Nutrition</span>
                  {activeTab === 'nutrition' && <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-orange-400 to-red-400"></div>}
                </button>
              </div>
            </div>            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="form-card animate-fade-in">
                <div className="form-card-header">
                  <h2 className="flex items-center text-2xl font-bold">
                    <span className="mr-3 text-3xl">📝</span>
                    Basic Recipe Information
                  </h2>
                  <p className="mt-2 text-orange-100">Tell us about your amazing recipe!</p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Recipe Title */}
                      <div className="form-control">
                        <label className="label">
                          <span className="flex items-center text-lg font-semibold text-gray-700">
                            <span className="mr-2">🍽️</span>
                            Recipe Title *
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Nasi Goreng Spesial Rumahan"
                          className={`recipe-input ${errors.title ? 'border-red-400' : ''}`}
                          {...register('title', {
                            required: 'Recipe title is required',
                            minLength: { value: 5, message: 'Title must be at least 5 characters' }
                          })}
                        />
                        {errors.title && (
                          <p className="flex items-center mt-1 text-sm text-red-500">
                            <span className="mr-1">⚠️</span>
                            {errors.title.message}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="form-control">
                        <label className="label">
                          <span className="flex items-center text-lg font-semibold text-gray-700">
                            <span className="mr-2">📄</span>
                            Description *
                          </span>
                        </label>
                        <textarea
                          placeholder="Describe your recipe in detail... What makes it special? What inspired you to create it?"
                          className={`recipe-textarea h-32 ${errors.description ? 'border-red-400' : ''}`}
                          {...register('description', {
                            required: 'Description is required',
                            minLength: { value: 20, message: 'Description must be at least 20 characters' }
                          })}
                        />
                        {errors.description && (
                          <p className="flex items-center mt-1 text-sm text-red-500">
                            <span className="mr-1">⚠️</span>
                            {errors.description.message}
                          </p>
                        )}
                      </div>

                      {/* Category & Difficulty */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="form-control">
                          <label className="label">
                            <span className="flex items-center text-lg font-semibold text-gray-700">
                              <span className="mr-2">🏷️</span>
                              Category *
                            </span>
                          </label>
                          <select
                            className={`recipe-select ${errors.category_id ? 'border-red-400' : ''}`}
                            {...register('category_id', { required: 'Category is required' })}
                          >
                            <option value="">Choose category</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.icon} {category.name}
                              </option>
                            ))}
                          </select>
                          {errors.category_id && (
                            <p className="flex items-center mt-1 text-sm text-red-500">
                              <span className="mr-1">⚠️</span>
                              {errors.category_id.message}
                            </p>
                          )}
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="flex items-center text-lg font-semibold text-gray-700">
                              <span className="mr-2">⭐</span>
                              Difficulty
                            </span>
                          </label>
                          <select
                            className="recipe-select"
                            {...register('difficulty')}
                          >
                            {difficultyOptions.map((difficulty) => (
                              <option key={difficulty} value={difficulty}>
                                {difficulty === 'Easy' ? '🟢 Easy' :
                                  difficulty === 'Medium' ? '🟡 Medium' : '🔴 Hard'} {difficulty}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Timing & Servings */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="form-control">
                          <label className="label">
                            <span className="flex items-center font-semibold text-gray-700">
                              <FaClock className="inline mr-2 text-orange-500" />
                              Prep Time (min)
                            </span>
                          </label>
                          <input
                            type="number"
                            placeholder="15"
                            className="recipe-input"
                            {...register('prep_time', { min: 0 })}
                          />
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="flex items-center font-semibold text-gray-700">
                              <FaClock className="inline mr-2 text-red-500" />
                              Cook Time (min)
                            </span>
                          </label>
                          <input
                            type="number"
                            placeholder="30"
                            className="recipe-input"
                            {...register('cook_time', { min: 0 })}
                          />
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="flex items-center font-semibold text-gray-700">
                              <FaUsers className="inline mr-2 text-green-500" />
                              Servings
                            </span>
                          </label>
                          <input
                            type="number"
                            placeholder="4"
                            className="recipe-input"
                            {...register('servings', { min: 1, max: 20 })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Enhanced Image Upload */}
                    <div>
                      <label className="label">
                        <span className="flex items-center text-lg font-semibold text-gray-700">
                          <span className="mr-2">📸</span>
                          Recipe Image
                        </span>
                      </label>

                      {imagePreview ? (
                        <div className="relative group">
                          <img
                            src={imagePreview}
                            alt="Recipe preview"
                            className="object-cover w-full transition-all duration-300 shadow-lg h-80 rounded-xl group-hover:shadow-xl"
                          />
                          <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-xl">
                            <button
                              type="button"
                              onClick={removeImage}
                              className="p-3 text-white transition-all duration-300 transform scale-75 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:scale-100"
                            >
                              <FaTimes className="text-lg" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="image-upload-area">
                          <div className="mb-4">
                            <FaImage className="mx-auto mb-4 text-6xl text-orange-400" />
                            <h3 className="mb-2 text-xl font-semibold text-gray-700">Upload Recipe Photo</h3>
                            <p className="text-gray-500">Show off your delicious creation!</p>
                          </div>
                          <label className="cursor-pointer recipe-btn-primary">
                            <FaUpload className="mr-2" />
                            Choose Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                          <p className="mt-3 text-sm text-gray-400">
                            💡 Tip: Good lighting makes your dish look amazing!
                          </p>
                        </div>
                      )}

                      <div className="mt-4 form-control">
                        <input
                          type="url"
                          placeholder="Or paste image URL..."
                          className="text-sm recipe-input"
                          {...register('image_url')}
                          onChange={(e) => {
                            if (e.target.value) {
                              setImagePreview(e.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}            {/* Enhanced Ingredients Tab */}
            {activeTab === 'ingredients' && (
              <div className="form-card animate-fade-in">
                <div className="form-card-header">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="flex items-center text-2xl font-bold">
                        <span className="mr-3 text-3xl">🥘</span>
                        Recipe Ingredients
                      </h2>
                      <p className="mt-2 text-orange-100">List all the ingredients needed for your recipe</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => appendIngredient({ name: '', quantity: '', unit: 'gram', notes: '' })}
                      className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-200 rounded-lg bg-white/20 hover:bg-white/30"
                    >
                      <FaPlus />
                      Add Ingredient
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  {ingredientFields.length > 0 ? (
                    <div className="space-y-4">
                      {/* Header for ingredient columns */}                      <div className="hidden grid-cols-12 gap-4 px-4 py-2 font-semibold text-gray-700 bg-gray-100 rounded-lg md:grid">
                        <div className="col-span-4">🥕 Ingredient Name</div>
                        <div className="col-span-2">📏 Quantity</div>
                        <div className="col-span-2">📦 Unit</div>
                        <div className="col-span-3">📝 Notes</div>
                        <div className="col-span-1">🗑️ Action</div>
                      </div>

                      {ingredientFields.map((field, index) => (
                        <div key={field.id} className="ingredient-card group">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                            {/* Ingredient Name */}
                            <div className="md:col-span-4">
                              <label className="block mb-2 font-semibold text-gray-700 md:hidden">
                                🥕 Ingredient Name
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., Chicken breast, Onion, Garlic..."
                                className={`recipe-input ${errors.ingredients?.[index]?.name ? 'border-red-400' : ''}`}
                                {...register(`ingredients.${index}.name`, { required: 'Ingredient name is required' })}
                              />
                              {errors.ingredients?.[index]?.name && (
                                <p className="flex items-center mt-1 text-xs text-red-500">
                                  <span className="mr-1">⚠️</span>
                                  {errors.ingredients[index].name.message}
                                </p>
                              )}
                            </div>

                            {/* Quantity */}
                            <div className="md:col-span-2">
                              <label className="block mb-2 font-semibold text-gray-700 md:hidden">
                                📏 Quantity
                              </label>
                              <input
                                type="number"
                                placeholder="250"
                                step="0.1"
                                className={`recipe-input ${errors.ingredients?.[index]?.quantity ? 'border-red-400' : ''}`}
                                {...register(`ingredients.${index}.quantity`, { required: 'Quantity is required' })}
                              />
                              {errors.ingredients?.[index]?.quantity && (
                                <p className="mt-1 text-xs text-red-500">Required</p>
                              )}
                            </div>

                            {/* Unit */}
                            <div className="md:col-span-2">
                              <label className="block mb-2 font-semibold text-gray-700 md:hidden">
                                📦 Unit
                              </label>
                              <select
                                className="recipe-select"
                                {...register(`ingredients.${index}.unit`)}
                              >
                                {unitOptions.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Notes */}
                            <div className="md:col-span-3">
                              <label className="block mb-2 font-semibold text-gray-700 md:hidden">
                                📝 Notes (Optional)
                              </label>
                              <input
                                type="text"
                                placeholder="finely chopped, boneless..."
                                className="recipe-input"
                                {...register(`ingredients.${index}.notes`)}
                              />
                            </div>

                            {/* Remove Button */}
                            <div className="flex items-end md:col-span-1">
                              {ingredientFields.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeIngredient(index)}
                                  className="w-full p-2 text-white transition-all duration-200 bg-red-500 rounded-lg opacity-0 md:w-auto hover:bg-red-600 group-hover:opacity-100 md:opacity-100"
                                  title="Remove ingredient"
                                >
                                  <FaMinus />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Another Ingredient Button */}
                      <div className="flex justify-center pt-4">
                        <button
                          type="button"
                          onClick={() => appendIngredient({ name: '', quantity: '', unit: 'gram', notes: '' })}
                          className="recipe-btn-secondary"
                        >
                          <FaPlus className="mr-2" />
                          Add Another Ingredient
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <div className="mb-6 text-8xl">🥘</div>
                      <h3 className="mb-4 text-2xl font-bold text-gray-700">No ingredients added yet</h3>
                      <p className="max-w-md mx-auto mb-8 text-gray-500">
                        Start building your recipe by adding the first ingredient. Don't worry, you can add as many as you need!
                      </p>
                      <button
                        type="button"
                        onClick={() => appendIngredient({ name: '', quantity: '', unit: 'gram', notes: '' })}
                        className="px-8 py-4 text-lg recipe-btn-primary"
                      >
                        <FaPlus className="mr-2" />
                        Add First Ingredient
                      </button>
                    </div>
                  )}

                  {/* Tips Section */}
                  <div className="p-6 mt-8 border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <h4 className="flex items-center mb-3 font-semibold text-blue-800">
                      <span className="mr-2 text-xl">💡</span>
                      Pro Tips for Better Ingredients List
                    </h4>
                    <div className="grid gap-4 text-sm text-blue-700 md:grid-cols-2">
                      <div className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Be specific with quantities for best results</span>
                      </div>
                      <div className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Add preparation notes (diced, minced, etc.)</span>
                      </div>
                      <div className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>List ingredients in order of use</span>
                      </div>
                      <div className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Include alternative ingredients if possible</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}            {/* Enhanced Instructions Tab */}
            {activeTab === 'instructions' && (
              <div className="form-card animate-fade-in">
                <div className="form-card-header">
                  <h2 className="flex items-center text-2xl font-bold">
                    <span className="mr-3 text-3xl">👩‍🍳</span>
                    Cooking Instructions
                  </h2>
                  <p className="mt-2 text-orange-100">Guide your readers through each step of your recipe</p>
                </div>

                <div className="p-8">
                  <div className="space-y-8">
                    {/* Main Instructions */}
                    <div className="form-control">
                      <label className="label">
                        <span className="flex items-center text-lg font-semibold text-gray-700">
                          <span className="mr-2">📋</span>
                          Step-by-step instructions *
                        </span>
                      </label>
                      <div className="relative">
                        <textarea
                          placeholder="1. Heat 2 tablespoons of oil in a large wok or frying pan over medium-high heat&#10;2. Add minced garlic and diced onions, stir-fry for 2-3 minutes until fragrant&#10;3. Add the cooked rice and break up any clumps with your spatula&#10;4. Push rice to one side of the pan, crack eggs into the empty space&#10;5. Scramble the eggs and then mix them into the rice&#10;6. Add soy sauce, salt, and pepper to taste&#10;7. Garnish with chopped green onions and serve hot&#10;&#10;💡 Pro tip: Use day-old rice for best texture!"
                          className={`recipe-textarea h-80 ${errors.instructions ? 'border-red-400' : ''}`}
                          {...register('instructions', {
                            required: 'Instructions are required',
                            minLength: { value: 50, message: 'Instructions must be at least 50 characters' }
                          })}
                        />
                        <div className="absolute px-3 py-1 text-sm text-gray-500 rounded-full bottom-4 right-4 bg-white/90">
                          📝 {watch('instructions')?.length || 0} characters
                        </div>
                      </div>
                      {errors.instructions && (
                        <p className="flex items-center mt-1 text-sm text-red-500">
                          <span className="mr-1">⚠️</span>
                          {errors.instructions.message}
                        </p>
                      )}
                      <div className="p-4 mt-2 border border-yellow-200 rounded-lg bg-yellow-50">
                        <p className="flex items-start text-sm text-yellow-800">
                          <span className="mr-2 text-lg">💡</span>
                          <span>
                            <strong>Writing great instructions:</strong> Number each step, use action words (heat, add, mix),
                            specify cooking times and temperatures, and include helpful tips throughout.
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Chef's Tips */}
                    <div className="form-control">
                      <label className="label">
                        <span className="flex items-center text-lg font-semibold text-gray-700">
                          <span className="mr-2">✨</span>
                          Chef's Tips & Secrets (Optional)
                        </span>
                      </label>
                      <textarea
                        placeholder="Share your secret tips and tricks to make this recipe even better...&#10;&#10;• For extra flavor, toast the rice in oil before adding liquid&#10;• Fresh ingredients make all the difference&#10;• Don't overcrowd the pan - cook in batches if needed&#10;• Taste and adjust seasoning at the end"
                        className="h-32 recipe-textarea"
                        {...register('tips')}
                      />
                      <div className="p-4 mt-2 border border-green-200 rounded-lg bg-green-50">
                        <p className="flex items-start text-sm text-green-800">
                          <span className="mr-2 text-lg">🎯</span>
                          <span>
                            Share your insider knowledge! What tricks do you use? What common mistakes should people avoid?
                            Your tips help other cooks succeed.
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Instruction Preview */}
                    <div className="p-6 border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                      <h4 className="flex items-center mb-4 font-semibold text-indigo-800">
                        <FaEye className="mr-2" />
                        Preview Your Instructions
                      </h4>
                      <div className="p-4 overflow-y-auto bg-white rounded-lg max-h-60">
                        {watch('instructions') ? (
                          <div className="prose-sm prose max-w-none">
                            {watch('instructions').split('\n').map((line, index) => (
                              <p key={index} className="mb-2 text-gray-700">
                                {line.trim() && line}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="py-8 italic text-center text-gray-400">
                            Your instructions will appear here as you type...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}            {/* Enhanced Nutrition Tab */}
            {activeTab === 'nutrition' && (
              <div className="form-card animate-fade-in">
                <div className="form-card-header">
                  <h2 className="flex items-center text-2xl font-bold">
                    <span className="mr-3 text-3xl">🥗</span>
                    Nutritional Information
                  </h2>
                  <p className="mt-2 text-orange-100">Help your readers make informed dietary choices (Optional but recommended)</p>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 gap-8">
                    {/* Nutrition Input Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <div className="form-control">
                        <label className="label">
                          <span className="flex items-center font-semibold text-gray-700">
                            <span className="mr-2">🔥</span>
                            Calories per serving
                          </span>
                        </label>
                        <input
                          type="number"
                          placeholder="350"
                          className="recipe-input"
                          {...register('nutrition.calories_per_serving', { min: 0 })}
                        />
                        <p className="mt-1 text-xs text-gray-500">Average serving calories</p>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="flex items-center font-semibold text-gray-700">
                            <span className="mr-2">💪</span>
                            Protein (g)
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="25.5"
                          className="recipe-input"
                          {...register('nutrition.protein', { min: 0 })}
                        />
                        <p className="mt-1 text-xs text-gray-500">Grams of protein</p>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="flex items-center font-semibold text-gray-700">
                            <span className="mr-2">🍞</span>
                            Carbohydrates (g)
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="45.0"
                          className="recipe-input"
                          {...register('nutrition.carbs', { min: 0 })}
                        />
                        <p className="mt-1 text-xs text-gray-500">Grams of carbs</p>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="flex items-center font-semibold text-gray-700">
                            <span className="mr-2">🥑</span>
                            Fat (g)
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="12.3"
                          className="recipe-input"
                          {...register('nutrition.fat', { min: 0 })}
                        />
                        <p className="mt-1 text-xs text-gray-500">Grams of fat</p>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="flex items-center font-semibold text-gray-700">
                            <span className="mr-2">🌾</span>
                            Fiber (g)
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="5.0"
                          className="recipe-input"
                          {...register('nutrition.fiber', { min: 0 })}
                        />
                        <p className="mt-1 text-xs text-gray-500">Grams of fiber</p>
                      </div>
                    </div>

                    {/* Nutrition Preview Card */}
                    <div className="p-6 border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <h4 className="flex items-center mb-4 font-semibold text-green-800">
                        <span className="mr-2 text-xl">📊</span>
                        Nutrition Facts Preview
                      </h4>
                      <div className="p-4 bg-white rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-5">
                          <div className="p-3 rounded-lg bg-orange-50">
                            <div className="text-2xl font-bold text-orange-600">
                              {watch('nutrition.calories_per_serving') || '-'}
                            </div>
                            <div className="text-xs text-gray-600">Calories</div>
                          </div>
                          <div className="p-3 rounded-lg bg-blue-50">
                            <div className="text-2xl font-bold text-blue-600">
                              {watch('nutrition.protein') || '-'}g
                            </div>
                            <div className="text-xs text-gray-600">Protein</div>
                          </div>
                          <div className="p-3 rounded-lg bg-yellow-50">
                            <div className="text-2xl font-bold text-yellow-600">
                              {watch('nutrition.carbs') || '-'}g
                            </div>
                            <div className="text-xs text-gray-600">Carbs</div>
                          </div>
                          <div className="p-3 rounded-lg bg-green-50">
                            <div className="text-2xl font-bold text-green-600">
                              {watch('nutrition.fat') || '-'}g
                            </div>
                            <div className="text-xs text-gray-600">Fat</div>
                          </div>
                          <div className="p-3 rounded-lg bg-purple-50">
                            <div className="text-2xl font-bold text-purple-600">
                              {watch('nutrition.fiber') || '-'}g
                            </div>
                            <div className="text-xs text-gray-600">Fiber</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-6 border border-blue-200 bg-blue-50 rounded-xl">
                      <div className="flex items-start">
                        <span className="mr-3 text-2xl">ℹ️</span>
                        <div>
                          <h4 className="mb-2 font-semibold text-blue-800">About Nutritional Information</h4>
                          <p className="text-sm leading-relaxed text-blue-700">
                            While nutritional information is optional, it helps your readers make informed dietary choices.
                            Values should be calculated per serving based on the ingredients you've listed. You can use online
                            nutrition calculators or consult nutrition labels for accuracy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}            {/* Enhanced Action Buttons */}
            <div className="form-card">
              <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
                  {/* Recipe Summary */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-400">
                          <span className="font-bold text-white">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            Creating as: <span className="text-orange-600">{user?.username || 'User'}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date().toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 text-sm font-medium text-orange-600 bg-orange-100 rounded-full">
                          📝 {activeTab === 'basic' ? 'Basic Info' :
                            activeTab === 'ingredients' ? 'Ingredients' :
                              activeTab === 'instructions' ? 'Instructions' : 'Nutrition'}
                        </span>
                        {watch('title') && (
                          <span className="px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full">
                            ✅ Title Added
                          </span>
                        )}
                        {ingredientFields.length > 0 && (
                          <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                            🥘 {ingredientFields.length} Ingredient{ingredientFields.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 sm:flex-row min-w-fit">
                    <button
                      type="button"
                      onClick={() => navigate('/search')}
                      className="recipe-btn-secondary"
                      disabled={isSubmitting}
                    >
                      <FaTimes className="mr-2" />
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={saveDraft}
                      className="recipe-btn-secondary"
                      disabled={isSubmitting}
                    >
                      <FaSave className="mr-2" />
                      Save Draft
                    </button>

                    <button
                      type="submit"
                      className="px-8 py-3 text-lg recipe-btn-primary"
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting || loading ? (
                        <>
                          <LoadingSpinner size="sm" text="" />
                          <span className="ml-2">Publishing Recipe...</span>
                        </>
                      ) : (
                        <>
                          <FaEye className="mr-2" />
                          Publish Recipe 🚀
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="pt-6 mt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                    <span>Recipe Completion</span>
                    <span>
                      {(() => {
                        let completed = 0;
                        if (watch('title')) completed += 25;
                        if (watch('description')) completed += 25;
                        if (ingredientFields.length > 0) completed += 25;
                        if (watch('instructions')) completed += 25;
                        return completed;
                      })()}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div
                      className="h-3 transition-all duration-500 rounded-full bg-gradient-to-r from-orange-400 to-red-400"
                      style={{
                        width: `${(() => {
                          let completed = 0;
                          if (watch('title')) completed += 25;
                          if (watch('description')) completed += 25;
                          if (ingredientFields.length > 0) completed += 25;
                          if (watch('instructions')) completed += 25;
                          return completed;
                        })()}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span className={watch('title') ? 'text-green-600 font-medium' : ''}>Title</span>
                    <span className={watch('description') ? 'text-green-600 font-medium' : ''}>Description</span>
                    <span className={ingredientFields.length > 0 ? 'text-green-600 font-medium' : ''}>Ingredients</span>
                    <span className={watch('instructions') ? 'text-green-600 font-medium' : ''}>Instructions</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipePage;
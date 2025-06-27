import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    FaPlus, FaMinus, FaUpload, FaSave, FaEye, FaTimes,
    FaClock, FaUsers, FaUtensils, FaImage, FaList, FaEdit, FaArrowLeft
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { canCreateRecipes } from '../utils/roleUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import apiClient from '../api/client';

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
    const [activeTab, setActiveTab] = useState('basic');
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
        formState: { errors, isSubmitting }
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
                state: { from: { pathname: `/recipes/${id}/edit` } }
            });
        }
    }, [isAuthenticated, navigate, id]);

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await apiClient.get('/recipes/categories');
                setCategories(response.data.categories || []);
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        };
        loadCategories();
    }, []);

    // Load recipe data
    useEffect(() => {
        if (!id) {
            navigate('/');
            return;
        }

        const loadRecipe = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiClient.get(`/recipes/${id}`);
                const recipeData = response.data.recipe;

                // Check if user can edit this recipe
                if (recipeData.user_id !== user.id && user.role !== 'admin') {
                    setError('You do not have permission to edit this recipe.');
                    return;
                }

                setRecipe(recipeData);

                // Reset form with recipe data
                reset({
                    title: recipeData.title || '',
                    description: recipeData.description || '',
                    category_id: recipeData.category_id || '',
                    difficulty: recipeData.difficulty || 'Medium',
                    prep_time: recipeData.prep_time || '',
                    cook_time: recipeData.cook_time || '',
                    servings: recipeData.servings || 4,
                    image_url: recipeData.image_url || '',
                    instructions: recipeData.instructions || '',
                    tips: recipeData.tips || '',
                    ingredients: recipeData.ingredients && recipeData.ingredients.length > 0
                        ? recipeData.ingredients
                        : [{ name: '', quantity: '', unit: 'gram', notes: '' }],
                    nutrition: {
                        calories_per_serving: recipeData.nutrition?.calories_per_serving || '',
                        protein: recipeData.nutrition?.protein || '',
                        carbs: recipeData.nutrition?.carbs || '',
                        fat: recipeData.nutrition?.fat || '',
                        fiber: recipeData.nutrition?.fiber || ''
                    }
                });

                // Set image preview if exists
                if (recipeData.image_url) {
                    setImagePreview(recipeData.image_url);
                }

            } catch (err) {
                console.error('Failed to load recipe:', err);
                if (err.response?.status === 404) {
                    setError('Recipe not found.');
                } else if (err.response?.status === 403) {
                    setError('You do not have permission to edit this recipe.');
                } else {
                    setError('Failed to load recipe. Please try again.');
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
        setValue('total_time', prepTime + cookTime);
    }, [watchPrepTime, watchCookTime, setValue]);

    // Check if user can edit recipes
    if (!canCreateRecipes(user)) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="text-6xl mb-4">👨‍🍳</div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Chef Access Required</h1>
                        <p className="text-gray-600 mb-6">
                            You need chef or admin privileges to edit recipes.
                        </p>
                        <button
                            onClick={() => navigate('/')}
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
            <div className="flex items-center justify-center min-h-screen">
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
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                setImagePreview(dataUrl);
                // Use the actual uploaded image data URL
                setValue('image_url', dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setValue('image_url', '');
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
                total_time: (parseInt(data.prep_time) || 0) + (parseInt(data.cook_time) || 0),
                servings: parseInt(data.servings) || 4,
                difficulty: data.difficulty || 'Medium',
                image_url: data.image_url || '',
                tips: data.tips || '',
                category_id: parseInt(data.category_id) || null,
                ingredients: data.ingredients.filter(ing => ing.name.trim() !== ''),
                // Include nutrition data if provided
                nutrition: {
                    calories_per_serving: parseFloat(data.nutrition?.calories_per_serving) || null,
                    protein: parseFloat(data.nutrition?.protein) || null,
                    carbs: parseFloat(data.nutrition?.carbs) || null,
                    fat: parseFloat(data.nutrition?.fat) || null,
                    fiber: parseFloat(data.nutrition?.fiber) || null
                }
            };

            console.log('Updating recipe:', recipeData);

            // Make API call to update recipe
            const response = await apiClient.put(`/recipes/${id}`, recipeData);

            console.log('Recipe updated successfully:', response.data);
            setSubmitSuccess(true);

            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'fixed z-50 w-auto alert alert-success top-4 right-4';
            notification.innerHTML = '<span>✅ Recipe updated successfully!</span>';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);

            // Redirect to recipe detail page after success
            setTimeout(() => {
                navigate(`/recipes/${id}`);
            }, 2000);

        } catch (err) {
            console.error('Recipe update failed:', err);
            if (err.response?.data?.message) {
                alert(`Failed to update recipe: ${err.response.data.message}`);
            } else {
                alert('Failed to update recipe. Please try again.');
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    const saveDraft = async () => {
        const formData = watch();
        localStorage.setItem(`recipe_edit_draft_${id}`, JSON.stringify({
            ...formData,
            saved_at: new Date().toISOString()
        }));

        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed z-50 w-auto alert alert-info top-4 right-4';
        notification.innerHTML = '<span>💾 Changes saved as draft!</span>';
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
            const notification = document.createElement('div');
            notification.className = 'fixed z-50 w-auto alert alert-info top-4 right-4';
            notification.innerHTML = '<span>📄 Draft loaded!</span>';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        } else {
            alert('No draft found for this recipe.');
        }
    };

    const difficultyOptions = ['Easy', 'Medium', 'Hard'];
    const unitOptions = ['gram', 'kg', 'ml', 'liter', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'clove'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
            {/* Header */}
            <div className="bg-white border-b-4 shadow-lg border-gradient-to-r from-orange-400 to-red-400">
                <div className="container px-4 py-8 mx-auto">
                    <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                        <div className="flex-1">
                            <div className="flex items-center mb-2">
                                <button
                                    onClick={() => navigate(`/recipes/${id}`)}
                                    className="p-2 mr-4 rounded-full bg-gradient-to-r from-orange-400 to-red-400 text-white hover:shadow-lg transition-shadow"
                                >
                                    <FaArrowLeft className="text-lg" />
                                </button>
                                <div className="p-3 mr-4 rounded-full bg-gradient-to-r from-orange-400 to-red-400">
                                    <FaEdit className="text-xl text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-transparent lg:text-4xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text">
                                    Edit Recipe
                                </h1>
                                <span className="ml-2 text-3xl animate-bounce">✏️</span>
                            </div>
                            <p className="mb-2 text-lg text-gray-600">Update your culinary masterpiece</p>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                <span className="px-3 py-1 text-orange-600 bg-orange-100 rounded-full">📝 Easy to edit</span>
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
            </div>

            <div className="container px-4 py-8 mx-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Success Message */}
                    {submitSuccess && (
                        <div className="p-4 mb-8 text-center border border-green-200 rounded-lg alert alert-success bg-green-50">
                            <div>
                                <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-lg font-semibold">Recipe updated successfully! 🎉</span>
                            </div>
                            <p className="mt-2 text-sm text-green-600">Redirecting to recipe page...</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Tabs */}
                        <div className="bg-white shadow-lg rounded-2xl">
                            <div className="tabs tabs-boxed p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-t-2xl">
                                <button
                                    type="button"
                                    className={`tab tab-lg flex-1 ${activeTab === 'basic' ? 'tab-active bg-white shadow-md' : 'text-gray-600'}`}
                                    onClick={() => setActiveTab('basic')}
                                >
                                    <FaEdit className="mr-2" />
                                    Basic Info
                                </button>
                                <button
                                    type="button"
                                    className={`tab tab-lg flex-1 ${activeTab === 'ingredients' ? 'tab-active bg-white shadow-md' : 'text-gray-600'}`}
                                    onClick={() => setActiveTab('ingredients')}
                                >
                                    <FaList className="mr-2" />
                                    Ingredients
                                </button>
                                <button
                                    type="button"
                                    className={`tab tab-lg flex-1 ${activeTab === 'instructions' ? 'tab-active bg-white shadow-md' : 'text-gray-600'}`}
                                    onClick={() => setActiveTab('instructions')}
                                >
                                    <FaUtensils className="mr-2" />
                                    Instructions
                                </button>
                                <button
                                    type="button"
                                    className={`tab tab-lg flex-1 ${activeTab === 'nutrition' ? 'tab-active bg-white shadow-md' : 'text-gray-600'}`}
                                    onClick={() => setActiveTab('nutrition')}
                                >
                                    <FaEye className="mr-2" />
                                    Nutrition
                                </button>
                            </div>

                            <div className="p-8">
                                {/* Basic Info Tab */}
                                {activeTab === 'basic' && (
                                    <div className="space-y-6">
                                        {/* Title */}
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="text-lg font-semibold label-text">Recipe Title *</span>
                                                <span className="label-text-alt">Make it catchy! 🌟</span>
                                            </label>
                                            <input
                                                {...register('title', { required: 'Recipe title is required' })}
                                                type="text"
                                                placeholder="e.g., Grandma's Secret Chocolate Chip Cookies"
                                                className={`input input-bordered input-lg w-full ${errors.title ? 'input-error' : ''}`}
                                            />
                                            {errors.title && (
                                                <label className="label">
                                                    <span className="text-error label-text-alt">{errors.title.message}</span>
                                                </label>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="text-lg font-semibold label-text">Description *</span>
                                                <span className="label-text-alt">What makes this recipe special? ✨</span>
                                            </label>
                                            <textarea
                                                {...register('description', { required: 'Description is required' })}
                                                className={`textarea textarea-bordered h-32 ${errors.description ? 'textarea-error' : ''}`}
                                                placeholder="Describe your recipe, its origin, what makes it unique, or why you love it..."
                                            />
                                            {errors.description && (
                                                <label className="label">
                                                    <span className="text-error label-text-alt">{errors.description.message}</span>
                                                </label>
                                            )}
                                        </div>

                                        {/* Image Upload */}
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="text-lg font-semibold label-text">Recipe Image</span>
                                                <span className="label-text-alt">A picture is worth a thousand words! 📸</span>
                                            </label>

                                            {imagePreview ? (
                                                <div className="relative">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Recipe preview"
                                                        className="object-cover w-full h-64 border-4 border-dashed rounded-lg border-orange-200"
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
                                                <label className="flex flex-col items-center justify-center h-64 border-4 border-dashed rounded-lg cursor-pointer border-orange-200 hover:border-orange-400 hover:bg-orange-50">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <FaUpload className="mb-3 text-4xl text-orange-400" />
                                                        <p className="mb-2 text-lg text-gray-500">
                                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                                        </p>
                                                        <p className="text-sm text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
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
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            {/* Category */}
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="font-semibold label-text">Category</span>
                                                </label>
                                                <select
                                                    {...register('category_id')}
                                                    className="select select-bordered"
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
                                                    <span className="font-semibold label-text">Difficulty</span>
                                                </label>
                                                <select
                                                    {...register('difficulty')}
                                                    className="select select-bordered"
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
                                                    <span className="font-semibold label-text">Prep Time (min)</span>
                                                </label>
                                                <input
                                                    {...register('prep_time', { min: 0 })}
                                                    type="number"
                                                    placeholder="30"
                                                    className="input input-bordered"
                                                />
                                            </div>

                                            {/* Cook Time */}
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="font-semibold label-text">Cook Time (min)</span>
                                                </label>
                                                <input
                                                    {...register('cook_time', { min: 0 })}
                                                    type="number"
                                                    placeholder="45"
                                                    className="input input-bordered"
                                                />
                                            </div>
                                        </div>

                                        {/* Servings */}
                                        <div className="form-control max-w-xs">
                                            <label className="label">
                                                <span className="font-semibold label-text">Servings</span>
                                                <span className="label-text-alt">How many people does this serve? 👥</span>
                                            </label>
                                            <input
                                                {...register('servings', { min: 1, max: 50 })}
                                                type="number"
                                                placeholder="4"
                                                className="input input-bordered"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Ingredients Tab */}
                                {activeTab === 'ingredients' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-bold">Ingredients</h3>
                                            <button
                                                type="button"
                                                onClick={() => appendIngredient({ name: '', quantity: '', unit: 'gram', notes: '' })}
                                                className="btn btn-primary btn-sm"
                                            >
                                                <FaPlus className="mr-2" />
                                                Add Ingredient
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {ingredientFields.map((field, index) => (
                                                <div key={field.id} className="grid grid-cols-1 gap-4 p-4 border border-gray-200 rounded-lg md:grid-cols-12">
                                                    {/* Ingredient Name */}
                                                    <div className="form-control md:col-span-5">
                                                        <input
                                                            {...register(`ingredients.${index}.name`, { required: 'Ingredient name is required' })}
                                                            type="text"
                                                            placeholder="e.g., All-purpose flour"
                                                            className="input input-bordered"
                                                        />
                                                    </div>

                                                    {/* Quantity */}
                                                    <div className="form-control md:col-span-2">
                                                        <input
                                                            {...register(`ingredients.${index}.quantity`)}
                                                            type="text"
                                                            placeholder="2"
                                                            className="input input-bordered"
                                                        />
                                                    </div>

                                                    {/* Unit */}
                                                    <div className="form-control md:col-span-2">
                                                        <select
                                                            {...register(`ingredients.${index}.unit`)}
                                                            className="select select-bordered"
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
                                                            className="input input-bordered"
                                                        />
                                                    </div>

                                                    {/* Remove Button */}
                                                    <div className="form-control md:col-span-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeIngredient(index)}
                                                            className="btn btn-circle btn-error btn-sm"
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
                                {activeTab === 'instructions' && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-bold">Cooking Instructions</h3>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="text-lg font-semibold label-text">Step-by-Step Instructions *</span>
                                                <span className="label-text-alt">Be detailed and clear! 👨‍🍳</span>
                                            </label>
                                            <textarea
                                                {...register('instructions', { required: 'Instructions are required' })}
                                                className={`textarea textarea-bordered h-64 ${errors.instructions ? 'textarea-error' : ''}`}
                                                placeholder="1. Preheat your oven to 350°F (175°C) and line a baking sheet with parchment paper.&#10;2. In a large bowl, cream together the butter and sugars until light and fluffy.&#10;3. Beat in the eggs one at a time, then stir in the vanilla.&#10;4. ..."
                                            />
                                            {errors.instructions && (
                                                <label className="label">
                                                    <span className="text-error label-text-alt">{errors.instructions.message}</span>
                                                </label>
                                            )}
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="text-lg font-semibold label-text">Tips & Tricks</span>
                                                <span className="label-text-alt">Share your secrets! 🤫</span>
                                            </label>
                                            <textarea
                                                {...register('tips')}
                                                className="textarea textarea-bordered h-32"
                                                placeholder="• For extra fluffy cookies, chill the dough for 30 minutes before baking&#10;• Don't overbake - cookies will continue cooking on the hot pan&#10;• Store in an airtight container for up to 1 week"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Nutrition Tab */}
                                {activeTab === 'nutrition' && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-bold">Nutrition Information</h3>
                                        <p className="text-gray-600">Optional - Add nutritional values per serving</p>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="font-semibold label-text">Calories per serving</span>
                                                </label>
                                                <input
                                                    {...register('nutrition.calories_per_serving')}
                                                    type="number"
                                                    placeholder="250"
                                                    className="input input-bordered"
                                                />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="font-semibold label-text">Protein (g)</span>
                                                </label>
                                                <input
                                                    {...register('nutrition.protein')}
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="5.2"
                                                    className="input input-bordered"
                                                />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="font-semibold label-text">Carbs (g)</span>
                                                </label>
                                                <input
                                                    {...register('nutrition.carbs')}
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="35.8"
                                                    className="input input-bordered"
                                                />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="font-semibold label-text">Fat (g)</span>
                                                </label>
                                                <input
                                                    {...register('nutrition.fat')}
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="12.1"
                                                    className="input input-bordered"
                                                />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="font-semibold label-text">Fiber (g)</span>
                                                </label>
                                                <input
                                                    {...register('nutrition.fiber')}
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="2.3"
                                                    className="input input-bordered"
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
                                className={`btn btn-lg ${submitLoading ? 'loading' : ''} text-white border-none bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 disabled:opacity-50`}
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

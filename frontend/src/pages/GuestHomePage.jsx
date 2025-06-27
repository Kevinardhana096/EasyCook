import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaUserPlus, FaSignInAlt, FaHeart, FaUsers, FaStar } from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RecipeCard from '../components/recipe/RecipeCard';
import apiClient from '../api/client';

const GuestHomePage = () => {
    const [featuredRecipes, setFeaturedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRecipes: 0,
        totalUsers: 0,
        totalCategories: 0
    });

    useEffect(() => {
        loadFeaturedRecipes();
        loadStats();
    }, []);

    const loadFeaturedRecipes = async () => {
        try {
            // Load public recipes for guests
            const response = await apiClient.get('/recipes?page=1&per_page=6&sort=rating');
            setFeaturedRecipes(response.data.recipes || []);
        } catch (err) {
            console.error('Failed to load featured recipes:', err);
        }
    };

    const loadStats = async () => {
        try {
            // You can implement actual stats endpoints later
            setStats({
                totalRecipes: 120,
                totalUsers: 45,
                totalCategories: 12
            });
        } catch (err) {
            console.error('Failed to load stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100">
            {/* Hero Section for Guests */}
            <div className="hero min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
                <div className="hero-content text-center">
                    <div className="max-w-lg">
                        <h1 className="text-6xl font-bold text-gray-800">
                            Welcome to <span className="text-orange-500">CookEasy</span>
                        </h1>
                        <p className="py-6 text-lg text-gray-600">
                            Discover amazing recipes, connect with fellow food lovers, and start your culinary journey today.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                <FaUserPlus className="mr-2" />
                                Join Now
                            </Link>
                            <Link to="/login" className="btn btn-outline btn-lg">
                                <FaSignInAlt className="mr-2" />
                                Sign In
                            </Link>
                        </div>
                        <div className="mt-6">
                            <Link to="/search" className="btn btn-ghost">
                                <FaSearch className="mr-2" />
                                Browse Recipes
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                {/* Stats Section */}
                <div className="stats shadow w-full mb-16">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <FaHeart className="text-3xl" />
                        </div>
                        <div className="stat-title">Recipes</div>
                        <div className="stat-value text-primary">{stats.totalRecipes}+</div>
                        <div className="stat-desc">Delicious dishes waiting for you</div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-secondary">
                            <FaUsers className="text-3xl" />
                        </div>
                        <div className="stat-title">Community</div>
                        <div className="stat-value text-secondary">{stats.totalUsers}+</div>
                        <div className="stat-desc">Home chefs sharing their passion</div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-accent">
                            <FaStar className="text-3xl" />
                        </div>
                        <div className="stat-title">Categories</div>
                        <div className="stat-value text-accent">{stats.totalCategories}+</div>
                        <div className="stat-desc">Different cuisine types</div>
                    </div>
                </div>

                {/* Featured Recipes Preview */}
                <div className="mb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Recipes</h2>
                        <p className="text-gray-600 text-lg">Get a taste of what's cooking in our community</p>
                    </div>

                    {featuredRecipes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredRecipes.slice(0, 3).map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} showAuthor={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Loading amazing recipes...</p>
                        </div>
                    )}

                    <div className="text-center mt-8">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Join to See More Recipes
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Join CookEasy?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card bg-base-200 shadow-lg">
                            <div className="card-body text-center">
                                <div className="text-4xl text-primary mb-4">📚</div>
                                <h3 className="card-title justify-center text-xl">Vast Recipe Collection</h3>
                                <p>Access thousands of recipes from various cuisines and dietary preferences.</p>
                            </div>
                        </div>

                        <div className="card bg-base-200 shadow-lg">
                            <div className="card-body text-center">
                                <div className="text-4xl text-secondary mb-4">👥</div>
                                <h3 className="card-title justify-center text-xl">Vibrant Community</h3>
                                <p>Connect with fellow food lovers, share tips, and learn from experienced chefs.</p>
                            </div>
                        </div>

                        <div className="card bg-base-200 shadow-lg">
                            <div className="card-body text-center">
                                <div className="text-4xl text-accent mb-4">⭐</div>
                                <h3 className="card-title justify-center text-xl">Rate & Review</h3>
                                <p>Help others discover great recipes by sharing your cooking experience.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center bg-gradient-to-r from-primary to-secondary text-white py-16 px-8 rounded-2xl">
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Cooking?</h2>
                    <p className="text-lg mb-8 opacity-90">Join thousands of food enthusiasts and discover your next favorite recipe!</p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link to="/register" className="btn btn-warning btn-lg">
                            <FaUserPlus className="mr-2" />
                            Create Account
                        </Link>
                        <Link to="/login" className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary">
                            <FaSignInAlt className="mr-2" />
                            I Already Have Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestHomePage;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaHeart, FaUsers, FaStar, FaPlus, FaEye, FaFire } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useStatsContext } from '../contexts/StatsContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RecipeCard from '../components/recipe/RecipeCard';
import { RealTimeStats } from '../components/common/StatCard';
import apiClient from '../api/client';
import { useStats } from '../hooks/useStats';

const HomePage = () => {
    const { user } = useAuth();
    const { stats, loading: statsLoading, lastUpdated, refreshStats } = useStatsContext();
    const [featuredRecipes, setFeaturedRecipes] = useState([]);
    const [recipesLoading, setRecipesLoading] = useState(true);

    useEffect(() => {
        loadFeaturedRecipes();
    }, []);

    const loadFeaturedRecipes = async () => {
        try {
            setRecipesLoading(true);
            const response = await apiClient.get('/recipes?page=1&per_page=6&sort_by=rating');
            setFeaturedRecipes(response.data.recipes || []);
        } catch (err) {
            console.error('Failed to load featured recipes:', err);
        } finally {
            setRecipesLoading(false);
        }
    };

    // Prepare stats for display
    const displayStats = [
        {
            key: 'recipes',
            icon: FaHeart,
            title: 'Total Recipes',
            value: stats.total_recipes,
            description: 'Delicious dishes to try',
            color: 'text-red-600',
            bgColor: 'bg-red-100'
        },
        {
            key: 'users',
            icon: FaUsers,
            title: 'Community',
            value: stats.total_users,
            description: 'Active home chefs',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            key: 'categories',
            icon: FaStar,
            title: 'Categories',
            value: stats.total_categories,
            description: 'Recipe varieties',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        },
        {
            key: 'views',
            icon: FaEye,
            title: 'Total Views',
            value: stats.total_views,
            description: 'Recipe engagements',
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            key: 'likes',
            icon: FaFire,
            title: 'Total Likes',
            value: stats.total_likes,
            description: 'Community love',
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
        },
        {
            key: 'rating',
            icon: FaStar,
            title: 'Avg Rating',
            value: `${stats.average_rating}⭐`,
            description: 'Quality score',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        }
    ];

    if (statsLoading || recipesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100">
            {/* Hero Section */}
            <div className="hero min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <h1 className="text-5xl font-bold text-gray-800">
                            Welcome to <span className="text-orange-500">CookEasy</span>
                        </h1>
                        <p className="py-6 text-gray-600">
                            Discover, create, and share amazing recipes with our community of food lovers.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link to="/search" className="btn btn-primary">
                                <FaSearch className="mr-2" />
                                Explore Recipes
                            </Link>
                            <Link to="/recipes/create" className="btn btn-outline">
                                <FaPlus className="mr-2" />
                                Create Recipe
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                {/* Real-time Statistics Section */}
                <RealTimeStats
                    stats={displayStats}
                    loading={statsLoading}
                    lastUpdated={lastUpdated}
                    onRefresh={refreshStats}
                    autoRefresh={true}
                    className="mb-16"
                />

                {/* Featured Recipes */}
                <div className="mb-16">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Featured Recipes</h2>
                        <Link to="/search" className="btn btn-outline">
                            View All
                        </Link>
                    </div>

                    {featuredRecipes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredRecipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No featured recipes available yet.</p>
                            <Link to="/recipes/create" className="btn btn-primary mt-4">
                                <FaPlus className="mr-2" />
                                Create First Recipe
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/categories" className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="card-body text-center">
                            <h3 className="card-title justify-center">Browse Categories</h3>
                            <p>Explore recipes by cuisine type</p>
                        </div>
                    </Link>

                    <Link to="/favorites" className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="card-body text-center">
                            <h3 className="card-title justify-center">My Favorites</h3>
                            <p>Quick access to saved recipes</p>
                        </div>
                    </Link>

                    <Link to="/profile" className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="card-body text-center">
                            <h3 className="card-title justify-center">My Profile</h3>
                            <p>Manage your recipes and settings</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;

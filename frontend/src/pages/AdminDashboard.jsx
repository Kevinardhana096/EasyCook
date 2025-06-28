import { useState, useEffect } from 'react';
import {
    FaUsers,
    FaUtensils,
    FaTags,
    FaStar,
    FaEye,
    FaUserCog,
    FaChartBar,
    FaSearch,
    FaPlus,
    FaTrash,
    FaEdit
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { getRoleDisplayName, getRoleBadgeColor } from '../utils/roleUtils';
import client from '../api/client';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch dashboard stats
            const statsResponse = await client.get('/admin/dashboard');
            setStats(statsResponse.data.stats);

            // Fetch users
            const usersResponse = await client.get('/admin/users');
            setUsers(usersResponse.data.users);

            // Fetch recipes
            const recipesResponse = await client.get('/admin/recipes');
            setRecipes(recipesResponse.data.recipes);

        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            await client.put(`/admin/users/${userId}/role`, { role: newRole });
            await fetchDashboardData();
        } catch (error) {
            console.error('Failed to update user role:', error);
        }
    };

    const toggleUserStatus = async (userId) => {
        try {
            await client.put(`/admin/users/${userId}/toggle-status`);
            await fetchDashboardData();
        } catch (error) {
            console.error('Failed to toggle user status:', error);
        }
    };

    const toggleRecipeFeatured = async (recipeId) => {
        try {
            await client.put(`/admin/recipes/${recipeId}/toggle-featured`);
            await fetchDashboardData();
        } catch (error) {
            console.error('Failed to toggle recipe featured status:', error);
        }
    };

    const deleteRecipe = async (recipeId, recipeTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${recipeTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await client.delete(`/recipes/${recipeId}`);
            await fetchDashboardData();
        } catch (error) {
            console.error('Failed to delete recipe:', error);
            alert('Failed to delete recipe. Please try again.');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = !roleFilter || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-orange-300 border-t-orange-600 rounded-full mb-4"></div>
                    <p className="text-orange-700">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-orange-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {user.username}!</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Logged in as</p>
                                <p className="font-semibold text-purple-700">{getRoleDisplayName(user.role)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-lg mb-8">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-6 py-4 font-medium ${activeTab === 'dashboard'
                                ? 'text-orange-600 border-b-2 border-orange-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FaChartBar className="inline mr-2" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-4 font-medium ${activeTab === 'users'
                                ? 'text-orange-600 border-b-2 border-orange-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FaUsers className="inline mr-2" />
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('recipes')}
                            className={`px-6 py-4 font-medium ${activeTab === 'recipes'
                                ? 'text-orange-600 border-b-2 border-orange-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FaUtensils className="inline mr-2" />
                            Recipes
                        </button>
                    </div>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Users</p>
                                        <p className="text-2xl font-bold text-gray-800">{stats.total_users}</p>
                                        <p className="text-xs text-green-600 mt-1">+{stats.recent_users || 0} this month</p>
                                    </div>
                                    <FaUsers className="text-3xl text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Recipes</p>
                                        <p className="text-2xl font-bold text-gray-800">{stats.total_recipes}</p>
                                        <p className="text-xs text-blue-600 mt-1">{stats.published_recipes} published</p>
                                    </div>
                                    <FaUtensils className="text-3xl text-green-500" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Ratings</p>
                                        <p className="text-2xl font-bold text-gray-800">{stats.total_ratings}</p>
                                        <p className="text-xs text-orange-600 mt-1">Community feedback</p>
                                    </div>
                                    <FaStar className="text-3xl text-yellow-500" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Avg Rating</p>
                                        <p className="text-2xl font-bold text-gray-800">{stats.average_rating?.toFixed(1) || '0.0'}</p>
                                        <p className="text-xs text-purple-600 mt-1">Overall quality</p>
                                    </div>
                                    <FaStar className="text-3xl text-yellow-500" />
                                </div>
                            </div>
                        </div>

                        {/* Role Distribution */}
                        {stats.role_distribution && (
                            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">User Role Distribution</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Object.entries(stats.role_distribution).map(([role, count]) => (
                                        <div key={role} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600 capitalize">{getRoleDisplayName(role)}</p>
                                                    <p className="text-xl font-bold text-gray-800">{count}</p>
                                                </div>
                                                <div className={`p-2 rounded-full ${getRoleBadgeColor(role)}`}>
                                                    <FaUserCog className="text-lg" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-left"
                                >
                                    <FaUsers className="text-2xl text-blue-600 mb-2" />
                                    <p className="font-medium text-blue-800">Manage Users</p>
                                    <p className="text-sm text-blue-600">View and edit user accounts</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab('recipes')}
                                    className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors text-left"
                                >
                                    <FaUtensils className="text-2xl text-green-600 mb-2" />
                                    <p className="font-medium text-green-800">Manage Recipes</p>
                                    <p className="text-sm text-green-600">Review and feature recipes</p>
                                </button>

                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-left">
                                    <FaTags className="text-2xl text-purple-600 mb-2" />
                                    <p className="font-medium text-purple-800">Categories</p>
                                    <p className="text-sm text-purple-600">{stats.total_categories || 0} active categories</p>
                                </div>

                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-left">
                                    <FaChartBar className="text-2xl text-orange-600 mb-2" />
                                    <p className="font-medium text-orange-800">Analytics</p>
                                    <p className="text-sm text-orange-600">Platform insights</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="">All Roles</option>
                                    <option value="user">Users</option>
                                    <option value="chef">Chefs</option>
                                    <option value="admin">Admins</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Joined</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((userItem) => (
                                        <tr key={userItem.id} className="border-b">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-gray-800">{userItem.username}</p>
                                                    <p className="text-sm text-gray-500">{userItem.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={userItem.role}
                                                    onChange={(e) => updateUserRole(userItem.id, e.target.value)}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getRoleBadgeColor(userItem.role)}`}
                                                    disabled={userItem.id === user.id}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="chef">Chef</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${userItem.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {userItem.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {new Date(userItem.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => toggleUserStatus(userItem.id)}
                                                    disabled={userItem.id === user.id}
                                                    className={`px-3 py-1 rounded text-sm ${userItem.is_active
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        } ${userItem.id === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {userItem.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recipes Tab */}
                {activeTab === 'recipes' && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Recipe Management</h2>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search recipes..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                    <option value="featured">Featured</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recipes.filter(recipe => {
                                const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    recipe.author?.username?.toLowerCase().includes(searchTerm.toLowerCase());
                                const matchesFilter = !statusFilter ||
                                    (statusFilter === 'published' && recipe.is_published) ||
                                    (statusFilter === 'draft' && !recipe.is_published) ||
                                    (statusFilter === 'featured' && recipe.is_featured);
                                return matchesSearch && matchesFilter;
                            }).map((recipe) => (
                                <div key={recipe.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    {recipe.image_url && (
                                        <img
                                            src={recipe.image_url}
                                            alt={recipe.title}
                                            className="w-full h-32 object-cover rounded-lg mb-3"
                                        />
                                    )}
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-800 truncate flex-1 mr-2">{recipe.title}</h3>
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${recipe.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {recipe.is_published ? 'Published' : 'Draft'}
                                            </span>
                                            {recipe.is_featured && (
                                                <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 whitespace-nowrap">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>

                                    {/* Recipe Stats */}
                                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                                        <span className="flex items-center gap-1">
                                            <FaStar className="text-yellow-400" />
                                            {recipe.average_rating?.toFixed(1) || '0.0'} ({recipe.rating_count || 0})
                                        </span>
                                        <span>{recipe.servings || 0} servings</span>
                                        <span>{recipe.total_time || 0}min</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">
                                            by <span className="font-medium text-gray-700">
                                                {recipe.author?.username || 'Unknown Author'}
                                            </span>
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleRecipeFeatured(recipe.id)}
                                                className={`px-3 py-1 rounded text-sm transition-colors ${recipe.is_featured
                                                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {recipe.is_featured ? 'Unfeature' : 'Feature'}
                                            </button>
                                            <button
                                                onClick={() => deleteRecipe(recipe.id, recipe.title)}
                                                className="px-3 py-1 rounded text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                                title="Delete recipe"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {recipes.filter(recipe => {
                            const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                recipe.author?.username?.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchesFilter = !statusFilter ||
                                (statusFilter === 'published' && recipe.is_published) ||
                                (statusFilter === 'draft' && !recipe.is_published) ||
                                (statusFilter === 'featured' && recipe.is_featured);
                            return matchesSearch && matchesFilter;
                        }).length === 0 && (
                                <div className="text-center py-8">
                                    <FaUtensils className="mx-auto text-4xl text-gray-300 mb-4" />
                                    <p className="text-gray-500">No recipes found matching your criteria.</p>
                                </div>
                            )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

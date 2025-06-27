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
    FaPlus
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.total_users}</p>
                                </div>
                                <FaUsers className="text-3xl text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Recipes</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.total_recipes}</p>
                                </div>
                                <FaUtensils className="text-3xl text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Published Recipes</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.published_recipes}</p>
                                </div>
                                <FaEye className="text-3xl text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Avg Rating</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.average_rating.toFixed(1)}</p>
                                </div>
                                <FaStar className="text-3xl text-yellow-500" />
                            </div>
                        </div>
                    </div>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recipes.map((recipe) => (
                                <div key={recipe.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-800 truncate">{recipe.title}</h3>
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 rounded text-xs ${recipe.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {recipe.is_published ? 'Published' : 'Draft'}
                                            </span>
                                            {recipe.is_featured && (
                                                <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">
                                            by {recipe.author?.username || 'Unknown'}
                                        </span>
                                        <button
                                            onClick={() => toggleRecipeFeatured(recipe.id)}
                                            className={`px-3 py-1 rounded text-sm ${recipe.is_featured
                                                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {recipe.is_featured ? 'Unfeature' : 'Feature'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

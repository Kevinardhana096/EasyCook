import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaSearch, FaFilter, FaStar, FaClock, FaUsers, FaBookmark, FaShare, FaTrash, FaEdit } from "react-icons/fa";
import RecipeCard from "../components/recipe/RecipeCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import api from "../api/recipes";
import { useAuth } from "../contexts/AuthContext";

const FavoritePage = () => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [filterBy, setFilterBy] = useState("all");
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchFavoriteRecipes();
        }
    }, [user]);

    const fetchFavoriteRecipes = async () => {
        try {
            setLoading(true);
            const response = await api.recipes.getFavorites();
            
            // Transform recipes to add author field for RecipeCard compatibility
            const transformedRecipes = (response.data.recipes || []).map(recipe => ({
                ...recipe,
                author: recipe.user?.username || recipe.user?.full_name || 'Unknown Chef'
            }));
            
            setFavoriteRecipes(transformedRecipes);
        } catch (err) {
            console.error('Error fetching favorite recipes:', err);
            setError('Gagal mengambil data resep favorit');
            // Use mock data as fallback
            setFavoriteRecipes(mockFavoriteRecipes);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async (recipeId) => {
        try {
            await api.recipes.toggleFavorite(recipeId);
            // Refresh favorite recipes
            fetchFavoriteRecipes();
        } catch (err) {
            console.error('Error toggling favorite:', err);
        }
    };

    // Mock data untuk fallback
    const mockFavoriteRecipes = [
        {
            id: 1,
            title: "Nasi Goreng Kampung",
            description: "Nasi goreng dengan cita rasa tradisional Indonesia yang autentik",
            image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
            average_rating: 4.8,
            cook_time: 25,
            difficulty: "Easy",
            user: { name: "Chef Sari" },
            view_count: 1200,
            category: { name: "Hidangan Utama" },
            is_favorited: true,
            created_at: "2024-01-15",
            notes: "Resep favorit untuk sarapan keluarga"
        },
        {
            id: 2,
            title: "Rendang Daging Sapi",
            description: "Rendang autentik dengan rempah-rempah pilihan dan bumbu yang meresap",
            image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop",
            average_rating: 4.9,
            cook_time: 180,
            difficulty: "Hard",
            user: { name: "Chef Budi" },
            view_count: 2100,
            category: { name: "Hidangan Utama" },
            is_favorited: true,
            created_at: "2024-01-10",
            notes: "Sempurna untuk acara spesial"
        }
    ];

    // Filter dan sort resep favorit
    const filteredRecipes = favoriteRecipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterBy === "all" ||
            (filterBy === "easy" && recipe.difficulty === "Easy") ||
            (filterBy === "medium" && recipe.difficulty === "Medium") ||
            (filterBy === "hard" && recipe.difficulty === "Hard");

        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return new Date(b.created_at) - new Date(a.created_at);
            case "oldest":
                return new Date(a.created_at) - new Date(b.created_at);
            case "rating":
                return (b.average_rating || 0) - (a.average_rating || 0);
            case "name":
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    const handleRemoveFromFavorites = async (recipeId) => {
        try {
            await handleToggleFavorite(recipeId);
        } catch (err) {
            console.error('Error removing from favorites:', err);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-base-200">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="mb-4 text-6xl text-gray-300">🔒</div>
                        <h2 className="mb-4 text-2xl font-bold text-gray-700">Login Diperlukan</h2>
                        <p className="mb-6 text-gray-600">Silakan login untuk melihat resep favorit Anda</p>
                        <Link to="/login" className="btn btn-primary">
                            Login Sekarang
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header Section */}
            <div className="text-white bg-gradient-to-r from-pink-500 to-red-500">
                <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <FaHeart className="mr-3 text-4xl" />
                            <h1 className="text-4xl font-bold">Resep Favorit</h1>
                        </div>
                        <p className="mb-8 text-xl opacity-90">
                            Koleksi resep pilihan yang telah Anda simpan
                        </p>

                        {/* Quick Stats */}
                        <div className="flex justify-center gap-8 mt-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold">{favoriteRecipes.length}</div>
                                <div className="text-sm opacity-75">Total Favorit</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">
                                    {favoriteRecipes.length > 0 ?
                                        (favoriteRecipes.reduce((avg, recipe) => avg + (recipe.average_rating || 0), 0) / favoriteRecipes.length).toFixed(1)
                                        : 0}
                                </div>
                                <div className="text-sm opacity-75">Rating Rata-rata</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Controls */}
                <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari resep favorit..."
                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filters and View Mode */}
                    <div className="flex gap-4">
                        {/* Filter */}
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                            <option value="all">Semua Tingkat</option>
                            <option value="easy">Mudah</option>
                            <option value="medium">Sedang</option>
                            <option value="hard">Sulit</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                            <option value="newest">Terbaru Ditambahkan</option>
                            <option value="oldest">Terlama Ditambahkan</option>
                            <option value="rating">Rating Tertinggi</option>
                            <option value="name">Nama A-Z</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex border border-gray-300 rounded-lg">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-3 py-2 rounded-l-lg ${viewMode === "grid" ? "bg-pink-500 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`px-3 py-2 rounded-r-lg ${viewMode === "list" ? "bg-pink-500 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                            >
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="py-12 text-center">
                        <div className="mb-4 text-6xl text-red-300">⚠️</div>
                        <h3 className="mb-2 text-xl font-semibold text-red-600">
                            Terjadi Kesalahan
                        </h3>
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={fetchFavoriteRecipes}
                            className="mt-4 btn btn-primary"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Recipes Content */}
                {!loading && !error && (
                    <>
                        {filteredRecipes.length > 0 ? (
                            <div className={`${viewMode === "grid"
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                : "space-y-4"}`}
                            >
                                {filteredRecipes.map((recipe) => (
                                    <div key={recipe.id} className="relative group">
                                        <RecipeCard
                                            recipe={recipe}
                                            className={`${viewMode === "list" ? "flex flex-row" : ""} transition-transform duration-200 hover:scale-105`}
                                        />

                                        {/* Favorite Actions */}
                                        <div className="absolute top-2 right-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRemoveFromFavorites(recipe.id)}
                                                    className="p-2 text-white transition-colors bg-red-500 rounded-full shadow-lg hover:bg-red-600"
                                                    title="Hapus dari favorit"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigator.share?.({
                                                            title: recipe.title,
                                                            text: recipe.description,
                                                            url: window.location.origin + `/recipes/${recipe.id}`
                                                        }) || console.log('Share not supported');
                                                    }}
                                                    className="p-2 text-white transition-colors bg-blue-500 rounded-full shadow-lg hover:bg-blue-600"
                                                    title="Bagikan resep"
                                                >
                                                    <FaShare className="text-sm" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Favorite Notes (if any) */}
                                        {recipe.notes && (
                                            <div className="absolute inset-x-0 bottom-0 p-3 text-sm text-white transition-opacity bg-black bg-opacity-75 rounded-b-lg opacity-0 group-hover:opacity-100">
                                                <FaBookmark className="inline mr-1" />
                                                {recipe.notes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="mb-4 text-6xl text-gray-300">💔</div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-600">
                                    Belum Ada Resep Favorit
                                </h3>
                                <p className="mb-6 text-gray-500">
                                    {searchTerm ?
                                        `Tidak ada resep favorit yang cocok dengan "${searchTerm}"` :
                                        "Mulai jelajahi resep dan tambahkan ke favorit Anda"
                                    }
                                </p>
                                <Link
                                    to="/recipes"
                                    className="btn btn-primary"
                                >
                                    Jelajahi Resep
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FavoritePage;

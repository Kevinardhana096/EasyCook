import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaSearch, FaFilter, FaStar, FaClock, FaUsers, FaBookmark, FaShare, FaTrash, FaEdit } from "react-icons/fa";
import RecipeCard from "../components/recipe/RecipeCard";
import LoadingSpinner from "../components/common/LoadingSpinner";

const FavoritePage = () => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [filterBy, setFilterBy] = useState("all");
    const [viewMode, setViewMode] = useState("grid"); // grid or list

    // Mock data untuk resep favorit
    const [favoriteRecipes, setFavoriteRecipes] = useState([
        {
            id: 1,
            title: "Nasi Goreng Kampung",
            description: "Nasi goreng dengan cita rasa tradisional Indonesia yang autentik",
            image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
            rating: 4.8,
            cookTime: 25,
            difficulty: "Easy",
            author: "Chef Sari",
            likes: 245,
            views: 1200,
            category: "main-course",
            isFavorited: true,
            favoritedAt: "2024-01-15",
            notes: "Resep favorit untuk sarapan keluarga"
        },
        {
            id: 2,
            title: "Rendang Daging Sapi",
            description: "Rendang autentik dengan rempah-rempah pilihan dan bumbu yang meresap",
            image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop",
            rating: 4.9,
            cookTime: 180,
            difficulty: "Hard",
            author: "Chef Budi",
            likes: 389,
            views: 2100,
            category: "main-course",
            isFavorited: true,
            favoritedAt: "2024-01-10",
            notes: "Sempurna untuk acara spesial"
        },
        {
            id: 4,
            title: "Klepon",
            description: "Kue tradisional dengan isian gula merah yang manis",
            image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
            rating: 4.7,
            cookTime: 45,
            difficulty: "Medium",
            author: "Chef Maya",
            likes: 203,
            views: 950,
            category: "dessert",
            isFavorited: true,
            favoritedAt: "2024-01-08",
            notes: "Anak-anak suka sekali"
        },
        {
            id: 7,
            title: "Soto Ayam Lamongan",
            description: "Soto ayam khas Lamongan dengan kuah yang gurih dan segar",
            image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
            rating: 4.6,
            cookTime: 60,
            difficulty: "Medium",
            author: "Chef Agus",
            likes: 167,
            views: 890,
            category: "main-course",
            isFavorited: true,
            favoritedAt: "2024-01-05",
            notes: "Cocok untuk cuaca dingin"
        },
        {
            id: 8,
            title: "Es Cendol Dawet",
            description: "Minuman tradisional yang menyegarkan dengan santan dan gula merah",
            image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
            rating: 4.5,
            cookTime: 30,
            difficulty: "Easy",
            author: "Chef Lisa",
            likes: 198,
            views: 1050,
            category: "beverage",
            isFavorited: true,
            favoritedAt: "2024-01-03",
            notes: "Favorit saat cuaca panas"
        }
    ]);

    // Categories untuk filter
    const categories = [
        { id: "all", name: "Semua Kategori" },
        { id: "main-course", name: "Hidangan Utama" },
        { id: "appetizer", name: "Pembuka" },
        { id: "dessert", name: "Penutup" },
        { id: "beverage", name: "Minuman" },
        { id: "snack", name: "Camilan" },
    ];

    // Filter dan sort resep favorit
    const filteredRecipes = favoriteRecipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterBy === "all" || recipe.category === filterBy;

        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return new Date(b.favoritedAt) - new Date(a.favoritedAt);
            case "oldest":
                return new Date(a.favoritedAt) - new Date(b.favoritedAt);
            case "rating":
                return b.rating - a.rating;
            case "alphabetical":
                return a.title.localeCompare(b.title);
            case "cookTime":
                return a.cookTime - b.cookTime;
            default:
                return 0;
        }
    });

    const handleRemoveFromFavorites = (recipeId) => {
        setFavoriteRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
    };

    const handleAddNote = (recipeId, note) => {
        setFavoriteRecipes(prev =>
            prev.map(recipe =>
                recipe.id === recipeId ? { ...recipe, notes: note } : recipe
            )
        );
    };

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <FaHeart className="text-6xl" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">
                            Resep Favorit Saya
                        </h1>
                        <p className="text-xl opacity-90 mb-8">
                            Koleksi resep pilihan yang sudah Anda simpan
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-3xl font-bold">{favoriteRecipes.length}</div>
                                <div className="text-sm opacity-80">Total Favorit</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-3xl font-bold">
                                    {Math.round(favoriteRecipes.reduce((sum, recipe) => sum + recipe.rating, 0) / favoriteRecipes.length * 10) / 10}
                                </div>
                                <div className="text-sm opacity-80">Rating Rata-rata</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-3xl font-bold">
                                    {Math.round(favoriteRecipes.reduce((sum, recipe) => sum + recipe.cookTime, 0) / favoriteRecipes.length)}
                                </div>
                                <div className="text-sm opacity-80">Waktu Masak Rata-rata (menit)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {favoriteRecipes.length === 0 ? (
                    // Empty State
                    <div className="text-center py-16">
                        <div className="text-8xl text-gray-300 mb-6">💝</div>
                        <h2 className="text-3xl font-bold text-gray-600 mb-4">
                            Belum Ada Resep Favorit
                        </h2>
                        <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
                            Mulai jelajahi resep-resep menarik dan simpan yang paling Anda sukai
                        </p>
                        <Link
                            to="/categories"
                            className="btn btn-primary btn-lg"
                        >
                            <FaSearch className="mr-2" />
                            Jelajahi Resep
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Controls */}
                        <div className="bg-base-100 rounded-lg shadow-md p-6 mb-8">
                            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                                {/* Search */}
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Cari resep favorit..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        />
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="flex gap-4 items-center">
                                    <select
                                        value={filterBy}
                                        onChange={(e) => setFilterBy(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    >
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    >
                                        <option value="newest">Terbaru Disimpan</option>
                                        <option value="oldest">Terlama Disimpan</option>
                                        <option value="rating">Rating Tertinggi</option>
                                        <option value="alphabetical">A-Z</option>
                                        <option value="cookTime">Tercepat</option>
                                    </select>

                                    {/* View Mode Toggle */}
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode("grid")}
                                            className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow" : ""}`}
                                        >
                                            <div className="grid grid-cols-2 gap-1 w-4 h-4">
                                                <div className="bg-gray-400 rounded-sm"></div>
                                                <div className="bg-gray-400 rounded-sm"></div>
                                                <div className="bg-gray-400 rounded-sm"></div>
                                                <div className="bg-gray-400 rounded-sm"></div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setViewMode("list")}
                                            className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow" : ""}`}
                                        >
                                            <div className="space-y-1 w-4 h-4">
                                                <div className="bg-gray-400 h-1 rounded"></div>
                                                <div className="bg-gray-400 h-1 rounded"></div>
                                                <div className="bg-gray-400 h-1 rounded"></div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Results count */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-gray-600">
                                    Menampilkan {filteredRecipes.length} dari {favoriteRecipes.length} resep favorit
                                    {searchTerm && ` untuk "${searchTerm}"`}
                                </p>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center py-12">
                                <LoadingSpinner />
                            </div>
                        )}

                        {/* Results */}
                        {!loading && (
                            <>
                                {filteredRecipes.length > 0 ? (
                                    <div className={viewMode === "grid" ?
                                        "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" :
                                        "space-y-4"
                                    }>
                                        {filteredRecipes.map((recipe) => (
                                            viewMode === "grid" ? (
                                                <div key={recipe.id} className="relative group">
                                                    <RecipeCard
                                                        recipe={recipe}
                                                        className="hover:scale-105 transition-transform duration-200"
                                                    />

                                                    {/* Favorite Actions Overlay */}
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={() => handleRemoveFromFavorites(recipe.id)}
                                                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                                                title="Hapus dari favorit"
                                                            >
                                                                <FaTrash className="text-sm" />
                                                            </button>
                                                            <button
                                                                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                                                title="Share resep"
                                                            >
                                                                <FaShare className="text-sm" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Notes Section */}
                                                    {recipe.notes && (
                                                        <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white p-2 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <FaBookmark className="inline mr-1" />
                                                            {recipe.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                // List View
                                                <div key={recipe.id} className="bg-base-100 rounded-lg shadow-md p-4 flex gap-4">
                                                    <img
                                                        src={recipe.image}
                                                        alt={recipe.title}
                                                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="font-semibold text-lg">{recipe.title}</h3>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleRemoveFromFavorites(recipe.id)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                    title="Hapus dari favorit"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                                <button
                                                                    className="text-blue-500 hover:text-blue-700"
                                                                    title="Share resep"
                                                                >
                                                                    <FaShare />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{recipe.description}</p>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <FaStar className="text-yellow-400" />
                                                                {recipe.rating}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FaClock />
                                                                {recipe.cookTime} menit
                                                            </span>
                                                            <span>oleh {recipe.author}</span>
                                                        </div>
                                                        {recipe.notes && (
                                                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                                                <FaBookmark className="inline mr-1 text-pink-500" />
                                                                {recipe.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl text-gray-300 mb-4">🔍</div>
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                            Tidak ada resep ditemukan
                                        </h3>
                                        <p className="text-gray-500">
                                            Coba ubah kata kunci pencarian atau filter Anda
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FavoritePage;

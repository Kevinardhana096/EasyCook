import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { FaSearch, FaFilter, FaStar, FaClock, FaUsers, FaUtensils, FaFire, FaCoffee, FaCookie, FaCarrot } from "react-icons/fa";
import RecipeCard from "../components/recipe/RecipeCard";
import LoadingSpinner from "../components/common/LoadingSpinner";

const CategoryPage = () => {
    const { categorySlug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [selectedCategory, setSelectedCategory] = useState(categorySlug || "all");
    const [sortBy, setSortBy] = useState("popular");
    const [difficulty, setDifficulty] = useState("all");

    // Mock data untuk kategori
    const categories = [
        { id: "all", name: "Semua Kategori", icon: FaUtensils, count: 150, color: "text-orange-500" },
        { id: "main-course", name: "Hidangan Utama", icon: FaUtensils, count: 45, color: "text-red-500" },
        { id: "appetizer", name: "Pembuka", icon: FaFire, count: 25, color: "text-yellow-500" },
        { id: "dessert", name: "Penutup", icon: FaCookie, count: 30, color: "text-pink-500" },
        { id: "beverage", name: "Minuman", icon: FaCoffee, count: 20, color: "text-blue-500" },
        { id: "snack", name: "Camilan", icon: FaCarrot, count: 35, color: "text-green-500" },
        { id: "traditional", name: "Tradisional", icon: FaStar, count: 40, color: "text-purple-500" },
    ];

    // Mock data untuk resep
    const [recipes] = useState([
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
            isFavorited: false
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
            isFavorited: true
        },
        {
            id: 3,
            title: "Es Teh Manis",
            description: "Minuman segar yang cocok untuk cuaca panas",
            image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
            rating: 4.5,
            cookTime: 5,
            difficulty: "Easy",
            author: "Chef Ina",
            likes: 156,
            views: 800,
            category: "beverage",
            isFavorited: false
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
            isFavorited: true
        },
        {
            id: 5,
            title: "Gado-Gado Jakarta",
            description: "Salad sayuran segar dengan bumbu kacang yang nikmat",
            image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
            rating: 4.6,
            cookTime: 30,
            difficulty: "Medium",
            author: "Chef Rini",
            likes: 178,
            views: 750,
            category: "appetizer",
            isFavorited: false
        },
        {
            id: 6,
            title: "Keripik Singkong",
            description: "Camilan renyah yang cocok untuk teman ngemil",
            image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop",
            rating: 4.4,
            cookTime: 60,
            difficulty: "Easy",
            author: "Chef Dedi",
            likes: 134,
            views: 600,
            category: "snack",
            isFavorited: false
        }
    ]);

    // Filter dan sort resep
    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory;
        const matchesDifficulty = difficulty === "all" || recipe.difficulty.toLowerCase() === difficulty;

        return matchesSearch && matchesCategory && matchesDifficulty;
    }).sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return b.id - a.id;
            case "rating":
                return b.rating - a.rating;
            case "fastest":
                return a.cookTime - b.cookTime;
            case "popular":
            default:
                return b.likes - a.likes;
        }
    });

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams(prev => {
            if (searchTerm) {
                prev.set("search", searchTerm);
            } else {
                prev.delete("search");
            }
            return prev;
        });
    };

    const getCurrentCategory = () => {
        return categories.find(cat => cat.id === selectedCategory) || categories[0];
    };

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header Section */}
            <div className="text-white bg-gradient-to-r from-orange-500 to-red-500">
                <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="mb-4 text-4xl font-bold">
                            Kategori Resep
                        </h1>
                        <p className="mb-8 text-xl opacity-90">
                            Temukan resep favorit berdasarkan kategori yang Anda sukai
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari resep dalam kategori..."
                                    className="w-full px-6 py-4 text-lg text-gray-800 rounded-full pr-14 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                                <button
                                    type="submit"
                                    className="absolute p-3 text-white transition-colors -translate-y-1/2 bg-orange-500 rounded-full right-2 top-1/2 hover:bg-orange-600"
                                >
                                    <FaSearch />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="sticky p-6 rounded-lg shadow-md bg-base-100 top-4">
                            {/* Categories */}
                            <div className="mb-6">
                                <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold">
                                    <FaUtensils className="text-orange-500" />
                                    Kategori
                                </h3>
                                <div className="space-y-2">
                                    {categories.map((category) => {
                                        const Icon = category.icon;
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => setSelectedCategory(category.id)}
                                                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between group ${selectedCategory === category.id
                                                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                                                        : "hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`${category.color} ${selectedCategory === category.id ? 'text-orange-500' : ''}`} />
                                                    <span className="font-medium">{category.name}</span>
                                                </div>
                                                <span className="px-2 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">
                                                    {category.count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="mb-6">
                                <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold">
                                    <FaFilter className="text-orange-500" />
                                    Filter
                                </h3>

                                {/* Difficulty Filter */}
                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium">Tingkat Kesulitan</label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="all">Semua Tingkat</option>
                                        <option value="easy">Mudah</option>
                                        <option value="medium">Sedang</option>
                                        <option value="hard">Sulit</option>
                                    </select>
                                </div>

                                {/* Sort Filter */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium">Urutkan</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="popular">Paling Populer</option>
                                        <option value="newest">Terbaru</option>
                                        <option value="rating">Rating Tertinggi</option>
                                        <option value="fastest">Tercepat</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {/* Results Header */}
                        <div className="flex flex-col items-start justify-between mb-6 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="mb-2 text-2xl font-bold text-gray-800">
                                    {getCurrentCategory().name}
                                </h2>
                                <p className="text-gray-600">
                                    Menampilkan {filteredRecipes.length} resep
                                    {searchTerm && ` untuk "${searchTerm}"`}
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex gap-4 mt-4 sm:mt-0">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-500">{filteredRecipes.length}</div>
                                    <div className="text-sm text-gray-500">Resep</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-500">
                                        {filteredRecipes.reduce((avg, recipe) => avg + recipe.rating, 0) / filteredRecipes.length || 0}
                                    </div>
                                    <div className="text-sm text-gray-500">Rating Rata-rata</div>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center py-12">
                                <LoadingSpinner />
                            </div>
                        )}

                        {/* Recipes Grid */}
                        {!loading && (
                            <>
                                {filteredRecipes.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {filteredRecipes.map((recipe) => (
                                            <RecipeCard
                                                key={recipe.id}
                                                recipe={recipe}
                                                className="transition-transform duration-200 hover:scale-105"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <div className="mb-4 text-6xl text-gray-300">🍽️</div>
                                        <h3 className="mb-2 text-xl font-semibold text-gray-600">
                                            Tidak ada resep ditemukan
                                        </h3>
                                        <p className="text-gray-500">
                                            Coba ubah filter atau kata kunci pencarian Anda
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Load More Button */}
                        {!loading && filteredRecipes.length > 0 && filteredRecipes.length >= 9 && (
                            <div className="mt-8 text-center">
                                <button className="btn btn-outline btn-primary btn-lg">
                                    Muat Lebih Banyak
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { FaSearch, FaFilter, FaStar, FaClock, FaUsers, FaUtensils, FaFire, FaCoffee, FaCookie, FaCarrot } from "react-icons/fa";
import RecipeCard from "../components/recipe/RecipeCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import api from "../api/recipes";

const CategoryPage = () => {
    const { categorySlug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [selectedCategory, setSelectedCategory] = useState(categorySlug || "all");
    const [sortBy, setSortBy] = useState("popular");
    const [difficulty, setDifficulty] = useState("all");
    const [categories, setCategories] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        // Only fetch recipes if categories have been loaded or if we're searching for all categories
        if (categories.length > 0 || selectedCategory === "all") {
            fetchRecipes();
        }
    }, [selectedCategory, sortBy, difficulty, searchTerm, categories]);

    const fetchCategories = async () => {
        try {
            const response = await api.categories.getAll();
            const categoriesData = response.data.categories;

            // Add "All Categories" option
            const allCategories = [
                {
                    id: "all",
                    name: "Semua Kategori",
                    slug: "all",
                    recipe_count: categoriesData.reduce((sum, cat) => sum + (cat.recipe_count || 0), 0)
                },
                ...categoriesData
            ];

            setCategories(allCategories);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Gagal mengambil data kategori');
        }
    };

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            setError(null); // Reset error state
            let response;

            if (searchTerm) {
                // Use search API
                const categoryId = selectedCategory !== "all" ? getCategoryIdBySlug(selectedCategory) : null;
                const searchParams = {
                    q: searchTerm,
                    ...(categoryId && { category_id: categoryId }),
                    ...(difficulty !== "all" && { difficulty: difficulty })
                };
                response = await api.recipes.search(searchParams);
            } else {
                // Use regular recipes API
                const categoryId = selectedCategory !== "all" ? getCategoryIdBySlug(selectedCategory) : null;
                const params = {
                    sort_by: sortBy,
                    ...(categoryId && { category_id: categoryId }),
                    ...(difficulty !== "all" && { difficulty: difficulty })
                };
                response = await api.recipes.getAll(params);
            }

            // Transform recipes to add author field for RecipeCard compatibility
            const transformedRecipes = (response.data.recipes || []).map(recipe => ({
                ...recipe,
                author: recipe.user?.username || recipe.user?.full_name || 'Unknown Chef'
            }));

            setRecipes(transformedRecipes);
            if (response.data.pagination) {
                setPagination(response.data.pagination);
            }
        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError('Gagal mengambil data resep');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIdBySlug = (slug) => {
        if (!slug || slug === "all" || categories.length === 0) {
            return null;
        }
        const category = categories.find(cat => cat.slug === slug);
        if (!category) {
            console.warn(`Category with slug "${slug}" not found`);
            return null;
        }
        return category.id;
    };

    // Icon mapping for categories
    const iconMap = {
        'all': FaUtensils,
        'main-course': FaUtensils,
        'appetizer': FaFire,
        'dessert': FaCookie,
        'beverage': FaCoffee,
        'snack': FaCarrot,
        'traditional': FaStar,
    };

    // Color mapping for categories
    const colorMap = {
        'all': 'text-orange-500',
        'main-course': 'text-red-500',
        'appetizer': 'text-yellow-500',
        'dessert': 'text-pink-500',
        'beverage': 'text-blue-500',
        'snack': 'text-green-500',
        'traditional': 'text-purple-500',
    };

    // Mock data untuk fallback
    const mockCategories = [
        { id: "all", name: "Semua Kategori", icon: FaUtensils, count: 150, color: "text-orange-500", slug: "all" },
        { id: "main-course", name: "Hidangan Utama", icon: FaUtensils, count: 45, color: "text-red-500", slug: "main-course" },
        { id: "appetizer", name: "Pembuka", icon: FaFire, count: 25, color: "text-yellow-500", slug: "appetizer" },
        { id: "dessert", name: "Penutup", icon: FaCookie, count: 30, color: "text-pink-500", slug: "dessert" },
        { id: "beverage", name: "Minuman", icon: FaCoffee, count: 20, color: "text-blue-500", slug: "beverage" },
        { id: "snack", name: "Camilan", icon: FaCarrot, count: 35, color: "text-green-500", slug: "snack" },
        { id: "traditional", name: "Tradisional", icon: FaStar, count: 40, color: "text-purple-500", slug: "traditional" },
    ];

    // Use API data if available, otherwise use mock data
    const displayCategories = categories.length > 0 ? categories.map(cat => ({
        ...cat,
        icon: iconMap[cat.slug] || FaUtensils,
        color: colorMap[cat.slug] || 'text-gray-500',
        count: cat.recipe_count || 0
    })) : mockCategories;

    // Filter dan sort resep (jika diperlukan untuk data lokal)
    const filteredRecipes = recipes;

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
        return displayCategories.find(cat => cat.id === selectedCategory || cat.slug === selectedCategory) || displayCategories[0];
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
                                    {displayCategories.map((category) => {
                                        const Icon = category.icon;
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => setSelectedCategory(category.slug || category.id)}
                                                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between group ${(selectedCategory === category.id || selectedCategory === category.slug)
                                                    ? "bg-orange-100 text-orange-700 border border-orange-200"
                                                    : "hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`${category.color} ${(selectedCategory === category.id || selectedCategory === category.slug) ? 'text-orange-500' : ''}`} />
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
                                        <option value="Easy">Mudah</option>
                                        <option value="Medium">Sedang</option>
                                        <option value="Hard">Sulit</option>
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
                                        {filteredRecipes.length > 0 ?
                                            (filteredRecipes.reduce((avg, recipe) => avg + (recipe.average_rating || 0), 0) / filteredRecipes.length).toFixed(1)
                                            : 0}
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

                        {/* Error State */}
                        {error && (
                            <div className="py-12 text-center">
                                <div className="mb-4 text-6xl text-red-300">⚠️</div>
                                <h3 className="mb-2 text-xl font-semibold text-red-600">
                                    Terjadi Kesalahan
                                </h3>
                                <p className="text-red-500">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 btn btn-primary"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        )}

                        {/* Recipes Grid */}
                        {!loading && !error && (
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

                        {/* Pagination or Load More */}
                        {!loading && !error && filteredRecipes.length > 0 && pagination && pagination.has_next && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => {
                                        // Implement load more functionality
                                        console.log('Load more clicked');
                                    }}
                                    className="btn btn-outline btn-primary btn-lg"
                                >
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

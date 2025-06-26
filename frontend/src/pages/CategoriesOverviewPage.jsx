import { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaUtensils, FaFire, FaCoffee, FaCookie, FaCarrot, FaStar, FaArrowRight } from "react-icons/fa";
import CategoryCard from "../components/recipe/CategoryCard";

const CategoriesOverviewPage = () => {
    const [searchTerm, setSearchTerm] = useState("");

    // Mock data untuk kategori dengan gambar
    const categories = [
        {
            id: "main-course",
            name: "Hidangan Utama",
            description: "Resep makanan pokok untuk makan siang dan malam",
            image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
            count: 45,
            icon: "utensils",
            color: "text-red-500",
            featured: true
        },
        {
            id: "appetizer",
            name: "Pembuka",
            description: "Makanan ringan untuk membuka selera makan",
            image: "https://images.unsplash.com/photo-1541795795328-f073b763494e?w=400&h=300&fit=crop",
            count: 25,
            icon: "fire",
            color: "text-yellow-500",
            featured: false
        },
        {
            id: "dessert",
            name: "Penutup",
            description: "Makanan manis untuk menutup hidangan",
            image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
            count: 30,
            icon: "cookie",
            color: "text-pink-500",
            featured: true
        },
        {
            id: "beverage",
            name: "Minuman",
            description: "Minuman segar dan hangat untuk berbagai ocasion",
            image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
            count: 20,
            icon: "coffee",
            color: "text-blue-500",
            featured: false
        },
        {
            id: "snack",
            name: "Camilan",
            description: "Makanan ringan untuk menemani waktu santai",
            image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop",
            count: 35,
            icon: "carrot",
            color: "text-green-500",
            featured: false
        },
        {
            id: "traditional",
            name: "Makanan Tradisional",
            description: "Resep-resep warisan nenek moyang yang autentik",
            image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop",
            count: 40,
            icon: "star",
            color: "text-purple-500",
            featured: true
        },
        {
            id: "vegetarian",
            name: "Vegetarian",
            description: "Hidangan sehat tanpa daging untuk gaya hidup vegetarian",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
            count: 28,
            icon: "carrot",
            color: "text-green-600",
            featured: false
        },
        {
            id: "seafood",
            name: "Makanan Laut",
            description: "Olahan ikan dan seafood yang lezat dan bergizi",
            image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop",
            count: 22,
            icon: "utensils",
            color: "text-blue-600",
            featured: false
        }
    ];

    // Filter categories berdasarkan search
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Split categories untuk featured dan regular
    const featuredCategories = filteredCategories.filter(cat => cat.featured);
    const regularCategories = filteredCategories.filter(cat => !cat.featured);

    const totalRecipes = categories.reduce((sum, cat) => sum + cat.count, 0);

    return (
        <div className="min-h-screen bg-base-200">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-6">
                            Jelajahi Kategori Resep
                        </h1>
                        <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
                            Temukan ribuan resep yang tersusun rapi dalam berbagai kategori.
                            Dari hidangan tradisional hingga masakan modern, semuanya ada di sini.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-3xl font-bold">{categories.length}</div>
                                <div className="text-sm opacity-80">Kategori</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-3xl font-bold">{totalRecipes}</div>
                                <div className="text-sm opacity-80">Total Resep</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-3xl font-bold">4.8</div>
                                <div className="text-sm opacity-80">Rating Rata-rata</div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari kategori resep..."
                                    className="w-full px-6 py-4 pr-14 rounded-full text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full">
                                    <FaSearch />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Featured Categories */}
                {featuredCategories.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                    Kategori Populer
                                </h2>
                                <p className="text-gray-600">
                                    Kategori yang paling disukai oleh para pengguna
                                </p>
                            </div>

                            <div className="hidden md:flex items-center text-orange-500 hover:text-orange-600 cursor-pointer">
                                <span className="mr-2">Lihat Semua</span>
                                <FaArrowRight />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredCategories.map((category) => (
                                <CategoryCard
                                    key={category.id}
                                    category={category}
                                    className="transform hover:scale-105 transition-all duration-300"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* All Categories */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                Semua Kategori
                            </h2>
                            <p className="text-gray-600">
                                Jelajahi semua kategori resep yang tersedia
                                {searchTerm && ` untuk "${searchTerm}"`}
                            </p>
                        </div>

                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="text-orange-500 hover:text-orange-600 text-sm"
                            >
                                Hapus Filter
                            </button>
                        )}
                    </div>

                    {filteredCategories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {regularCategories.map((category) => (
                                <CategoryCard
                                    key={category.id}
                                    category={category}
                                    className="transform hover:scale-105 transition-all duration-300"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-6xl text-gray-300 mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                Kategori tidak ditemukan
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Tidak ada kategori yang cocok dengan pencarian "{searchTerm}"
                            </p>
                            <button
                                onClick={() => setSearchTerm("")}
                                className="btn btn-primary"
                            >
                                Lihat Semua Kategori
                            </button>
                        </div>
                    )}
                </section>

                {/* Call to Action */}
                <section className="mt-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        Tidak Menemukan Kategori yang Anda Cari?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Bergabunglah dengan komunitas kami dan bagikan resep favorit Anda.
                        Bantu kami menambah koleksi resep dengan kategori baru.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/recipes/create" className="btn btn-primary btn-lg">
                            <FaUtensils className="mr-2" />
                            Bagikan Resep
                        </Link>
                        <Link to="/search" className="btn btn-outline btn-lg">
                            <FaSearch className="mr-2" />
                            Cari Resep Spesifik
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CategoriesOverviewPage;

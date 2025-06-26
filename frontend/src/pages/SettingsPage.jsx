import { useState } from "react";
import { FaUser, FaBell, FaShieldAlt, FaPalette, FaLanguage, FaQuestionCircle, FaSignOutAlt, FaEdit, FaCamera, FaEye, FaEyeSlash, FaSave, FaTrash } from "react-icons/fa";

const SettingsPage = () => {
    // State untuk form data
    const [profileData, setProfileData] = useState({
        name: "John Doe",
        email: "john.doe@email.com",
        bio: "Seorang chef yang passionate dengan masakan Indonesia",
        phone: "+62 812 3456 7890",
        location: "Jakarta, Indonesia"
    });

    const [preferences, setPreferences] = useState({
        language: "id",
        theme: "light",
        currency: "IDR",
        measurementUnit: "metric"
    });

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        recipeReminders: false,
        followNotifications: true,
        commentNotifications: true
    });

    const [privacy, setPrivacy] = useState({
        profileVisibility: "public",
        showEmail: false,
        showPhone: false,
        allowMessages: true
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [activeTab, setActiveTab] = useState("profile");
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Mock data untuk statistik pengguna
    const userStats = {
        recipesCreated: 15,
        favoritesCount: 42,
        followersCount: 127,
        followingCount: 89,
        totalLikes: 356
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        // Simulate API call
        alert("Profil berhasil diperbarui!");
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("Password baru dan konfirmasi password tidak cocok!");
            return;
        }
        // Simulate API call
        alert("Password berhasil diubah!");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    };

    const handleDeleteAccount = () => {
        if (window.confirm("Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.")) {
            alert("Akun akan dihapus. Anda akan diarahkan ke halaman login.");
        }
    };

    const tabs = [
        { id: "profile", label: "Profil", icon: FaUser },
        { id: "preferences", label: "Preferensi", icon: FaPalette },
        { id: "notifications", label: "Notifikasi", icon: FaBell },
        { id: "privacy", label: "Privasi", icon: FaShieldAlt },
        { id: "help", label: "Bantuan", icon: FaQuestionCircle }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
                            <p className="text-gray-600 mt-1">Kelola profil dan preferensi akun Anda</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                            <FaSignOutAlt />
                            Keluar
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            {/* User Info Card */}
                            <div className="text-center mb-6 pb-6 border-b">
                                <div className="relative inline-block mb-4">
                                    <img
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover border-4 border-orange-200"
                                    />
                                    <button className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors">
                                        <FaCamera className="w-3 h-3" />
                                    </button>
                                </div>
                                <h3 className="font-semibold text-lg">{profileData.name}</h3>
                                <p className="text-gray-500 text-sm">{profileData.email}</p>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-orange-500">{userStats.recipesCreated}</div>
                                        <div className="text-xs text-gray-500">Resep</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-orange-500">{userStats.favoritesCount}</div>
                                        <div className="text-xs text-gray-500">Favorit</div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${activeTab === tab.id
                                                    ? "bg-orange-100 text-orange-700 border border-orange-200"
                                                    : "hover:bg-gray-50 text-gray-700"
                                                }`}
                                        >
                                            <Icon className={activeTab === tab.id ? "text-orange-500" : "text-gray-400"} />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white rounded-lg shadow-md">
                            {/* Profile Tab */}
                            {activeTab === "profile" && (
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold mb-6">Informasi Profil</h2>

                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Nomor Telepon</label>
                                                <input
                                                    type="tel"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Lokasi</label>
                                                <input
                                                    type="text"
                                                    value={profileData.location}
                                                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Bio</label>
                                            <textarea
                                                value={profileData.bio}
                                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                rows={4}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                placeholder="Ceritakan tentang diri Anda..."
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                            >
                                                <FaSave />
                                                Simpan Perubahan
                                            </button>
                                        </div>
                                    </form>

                                    {/* Password Change Section */}
                                    <div className="mt-8 pt-8 border-t">
                                        <h3 className="text-xl font-semibold mb-4">Ubah Password</h3>
                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Password Saat Ini</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.current ? "text" : "password"}
                                                        value={passwords.currentPassword}
                                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Password Baru</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords.new ? "text" : "password"}
                                                            value={passwords.newPassword}
                                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                                            className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Konfirmasi Password Baru</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords.confirm ? "text" : "password"}
                                                            value={passwords.confirmPassword}
                                                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                                            className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                >
                                                    Ubah Password
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === "preferences" && (
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold mb-6">Preferensi</h2>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Bahasa</label>
                                                <select
                                                    value={preferences.language}
                                                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                >
                                                    <option value="id">Bahasa Indonesia</option>
                                                    <option value="en">English</option>
                                                    <option value="ms">Bahasa Melayu</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Tema</label>
                                                <select
                                                    value={preferences.theme}
                                                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                >
                                                    <option value="light">Terang</option>
                                                    <option value="dark">Gelap</option>
                                                    <option value="auto">Otomatis</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Mata Uang</label>
                                                <select
                                                    value={preferences.currency}
                                                    onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                >
                                                    <option value="IDR">Rupiah (IDR)</option>
                                                    <option value="USD">US Dollar (USD)</option>
                                                    <option value="EUR">Euro (EUR)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Satuan Pengukuran</label>
                                                <select
                                                    value={preferences.measurementUnit}
                                                    onChange={(e) => setPreferences({ ...preferences, measurementUnit: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                >
                                                    <option value="metric">Metrik (kg, gram, liter)</option>
                                                    <option value="imperial">Imperial (pound, ounce, gallon)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                                                Simpan Preferensi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === "notifications" && (
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold mb-6">Pengaturan Notifikasi</h2>

                                    <div className="space-y-6">
                                        {Object.entries(notifications).map(([key, value]) => {
                                            const labels = {
                                                emailNotifications: "Notifikasi Email",
                                                pushNotifications: "Notifikasi Push",
                                                recipeReminders: "Pengingat Resep",
                                                followNotifications: "Notifikasi Pengikut Baru",
                                                commentNotifications: "Notifikasi Komentar"
                                            };

                                            const descriptions = {
                                                emailNotifications: "Terima notifikasi melalui email",
                                                pushNotifications: "Terima notifikasi push di browser",
                                                recipeReminders: "Pengingat untuk resep yang disimpan",
                                                followNotifications: "Notifikasi ketika ada yang mengikuti Anda",
                                                commentNotifications: "Notifikasi ketika ada komentar di resep Anda"
                                            };

                                            return (
                                                <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                    <div>
                                                        <h3 className="font-medium">{labels[key]}</h3>
                                                        <p className="text-sm text-gray-500">{descriptions[key]}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={value}
                                                            onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === "privacy" && (
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold mb-6">Pengaturan Privasi</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Visibilitas Profil</label>
                                            <select
                                                value={privacy.profileVisibility}
                                                onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            >
                                                <option value="public">Publik - Semua orang dapat melihat</option>
                                                <option value="followers">Pengikut - Hanya pengikut yang dapat melihat</option>
                                                <option value="private">Privat - Hanya Anda yang dapat melihat</option>
                                            </select>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div>
                                                    <h3 className="font-medium">Tampilkan Email</h3>
                                                    <p className="text-sm text-gray-500">Email akan terlihat di profil publik</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={privacy.showEmail}
                                                        onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div>
                                                    <h3 className="font-medium">Tampilkan Nomor Telepon</h3>
                                                    <p className="text-sm text-gray-500">Nomor telepon akan terlihat di profil publik</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={privacy.showPhone}
                                                        onChange={(e) => setPrivacy({ ...privacy, showPhone: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div>
                                                    <h3 className="font-medium">Izinkan Pesan</h3>
                                                    <p className="text-sm text-gray-500">Pengguna lain dapat mengirim pesan kepada Anda</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={privacy.allowMessages}
                                                        onChange={(e) => setPrivacy({ ...privacy, allowMessages: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Help Tab */}
                            {activeTab === "help" && (
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold mb-6">Bantuan & Dukungan</h2>

                                    <div className="space-y-6">
                                        {/* FAQ Section */}
                                        <div className="border border-gray-200 rounded-lg p-6">
                                            <h3 className="text-lg font-semibold mb-4">Pertanyaan yang Sering Diajukan</h3>
                                            <div className="space-y-4">
                                                <details className="border-b pb-4">
                                                    <summary className="cursor-pointer font-medium">Bagaimana cara menambahkan resep?</summary>
                                                    <p className="mt-2 text-gray-600">Klik tombol "Tambah Resep" di halaman utama, kemudian isi form dengan detail resep Anda.</p>
                                                </details>
                                                <details className="border-b pb-4">
                                                    <summary className="cursor-pointer font-medium">Bagaimana cara mengedit profil?</summary>
                                                    <p className="mt-2 text-gray-600">Masuk ke halaman Pengaturan dan pilih tab Profil untuk mengedit informasi Anda.</p>
                                                </details>
                                                <details className="border-b pb-4">
                                                    <summary className="cursor-pointer font-medium">Bagaimana cara menghapus resep?</summary>
                                                    <p className="mt-2 text-gray-600">Buka detail resep yang ingin dihapus, kemudian klik ikon hapus di bagian atas.</p>
                                                </details>
                                            </div>
                                        </div>

                                        {/* Contact Support */}
                                        <div className="border border-gray-200 rounded-lg p-6">
                                            <h3 className="text-lg font-semibold mb-4">Hubungi Dukungan</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                                                    <h4 className="font-medium">Email Support</h4>
                                                    <p className="text-sm text-gray-500">support@cookeasy.com</p>
                                                </button>
                                                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                                                    <h4 className="font-medium">Live Chat</h4>
                                                    <p className="text-sm text-gray-500">Chat dengan tim support</p>
                                                </button>
                                            </div>
                                        </div>

                                        {/* App Info */}
                                        <div className="border border-gray-200 rounded-lg p-6">
                                            <h3 className="text-lg font-semibold mb-4">Informasi Aplikasi</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Versi Aplikasi:</span>
                                                    <span className="font-medium">1.0.0</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Terakhir Diperbarui:</span>
                                                    <span className="font-medium">26 Juni 2025</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Platform:</span>
                                                    <span className="font-medium">Web</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t">
                                                <button className="text-red-500 hover:text-red-700 font-medium flex items-center gap-2">
                                                    <FaTrash />
                                                    Hapus Akun
                                                </button>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Tindakan ini akan menghapus semua data Anda secara permanen
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

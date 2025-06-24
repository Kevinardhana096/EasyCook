import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaHeart, FaUtensils, FaUsers, FaClock, FaStar } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (<footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden footer-bg-pattern">
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-10 left-10 text-6xl animate-pulse">🍳</div>
      <div className="absolute top-20 right-20 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🥘</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-pulse" style={{ animationDelay: '1s' }}>🍽️</div>
      <div className="absolute bottom-10 right-10 text-3xl animate-bounce" style={{ animationDelay: '1.5s' }}>👨‍🍳</div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-7xl animate-pulse" style={{ animationDelay: '2s' }}>🥗</div>
    </div>

    <div className="container mx-auto px-4 py-16 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Enhanced Logo and description */}
        <div className="md:col-span-1">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mr-4">
              <FaUtensils className="text-white text-xl" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              CookEasy
            </h3>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6">
            Your ultimate destination for discovering and sharing amazing recipes
            from around the world. Cook, learn, and connect with fellow food lovers.
          </p>            <div className="flex space-x-4">
            <a href="#" className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-110 social-icon-bounce">
              <FaFacebook size={18} />
            </a>
            <a href="#" className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center hover:from-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-110 social-icon-bounce">
              <FaInstagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center hover:from-sky-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-110 social-icon-bounce">
              <FaTwitter size={18} />
            </a>
            <a href="#" className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 social-icon-bounce">
              <FaYoutube size={18} />
            </a>
          </div>
        </div>          {/* Enhanced Quick Links */}
        <div>
          <h4 className="text-xl font-bold mb-6 flex items-center">
            <span className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mr-3"></span>
            Quick Links
          </h4>
          <ul className="space-y-3">
            <li>
              <Link to="/" className="text-gray-300 hover:text-orange-400 transition-all duration-300 flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-400 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                🏠 Home
              </Link>
            </li>
            <li>
              <Link to="/search" className="text-gray-300 hover:text-orange-400 transition-all duration-300 flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-400 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                🔍 Browse Recipes
              </Link>
            </li>
            <li>
              <Link to="/categories" className="text-gray-300 hover:text-orange-400 transition-all duration-300 flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-400 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                🏷️ Categories
              </Link>
            </li>
            <li>
              <Link to="/recipes/create" className="text-gray-300 hover:text-orange-400 transition-all duration-300 flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-400 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                ➕ Add Recipe
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-gray-300 hover:text-orange-400 transition-all duration-300 flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-400 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                ℹ️ About Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Enhanced Popular Categories */}
        <div>
          <h4 className="text-xl font-bold mb-6 flex items-center">
            <span className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mr-3"></span>
            Popular Categories
          </h4>
          <ul className="space-y-3">
            <li>
              <Link to="/search?category=main-dishes" className="text-gray-300 hover:text-green-400 transition-all duration-300 flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                🍽️ Main Dishes
              </Link>
            </li>
            <li>
              <Link to="/search?category=desserts" className="text-gray-300 hover:text-green-400 transition-all duration-300 flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                🍰 Desserts
              </Link>
            </li>
            <li>
              <Link to="/search?category=appetizers" className="text-gray-300 hover:text-green-400 transition-all duration-300 flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                🥗 Appetizers
              </Link>
            </li>
            <li>
              <Link to="/search?category=breakfast" className="text-gray-300 hover:text-green-400 transition-all duration-300 flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                🌅 Breakfast
              </Link>
            </li>
            <li>
              <Link to="/search?category=beverages" className="text-gray-300 hover:text-green-400 transition-all duration-300 flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                🥤 Beverages
              </Link>
            </li>
          </ul>
        </div>          {/* Enhanced Contact & Newsletter */}
        <div>
          <h4 className="text-xl font-bold mb-6 flex items-center">
            <span className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3"></span>
            Get In Touch
          </h4>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center group">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="text-white text-sm" />
              </div>
              <a href="mailto:hello@cookeasy.com" className="text-gray-300 hover:text-orange-400 transition-colors">
                hello@cookeasy.com
              </a>
            </li>
            <li className="flex items-center group">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <FaPhone className="text-white text-sm" />
              </div>
              <a href="tel:+1234567890" className="text-gray-300 hover:text-green-400 transition-colors">
                +1 (234) 567-890
              </a>
            </li>
          </ul>
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-600 newsletter-glow">
            <h5 className="font-bold mb-3 text-orange-400">📧 Newsletter</h5>
            <p className="text-gray-300 text-sm mb-4">Get the latest recipes and cooking tips!</p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300"
              />
              <button className="w-full bg-gradient-to-r from-orange-400 to-red-400 text-white py-3 rounded-lg font-semibold hover:from-orange-500 hover:to-red-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                Subscribe 🚀
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}        <div className="my-16 py-8 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600 footer-bg-pattern">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center footer-stat-card">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mb-3">
              <FaUtensils className="text-white text-2xl" />
            </div>
            <div className="text-2xl font-bold text-white">10K+</div>
            <div className="text-gray-400 text-sm">Recipes</div>
          </div>
          <div className="flex flex-col items-center footer-stat-card">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center mb-3">
              <FaUsers className="text-white text-2xl" />
            </div>
            <div className="text-2xl font-bold text-white">50K+</div>
            <div className="text-gray-400 text-sm">Members</div>
          </div>
          <div className="flex flex-col items-center footer-stat-card">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-3">
              <FaClock className="text-white text-2xl" />
            </div>
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-gray-400 text-sm">Support</div>
          </div>
          <div className="flex flex-col items-center footer-stat-card">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mb-3">
              <FaStar className="text-white text-2xl" />
            </div>
            <div className="text-2xl font-bold text-white">4.9</div>
            <div className="text-gray-400 text-sm">Rating</div>
          </div>
        </div>
      </div>

      {/* Enhanced Bottom section */}
      <div className="border-t border-gray-600 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <p className="flex items-center text-gray-300">
              &copy; {currentYear} CookEasy. Made with <FaHeart className="mx-2 text-red-500 animate-pulse" /> by
              <span className="ml-1 font-semibold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                nowriafisda
              </span>
            </p>
          </div>            <div className="flex flex-wrap gap-6 text-sm">
            <Link to="/privacy" className="text-gray-300 hover:text-orange-400 transition-colors relative group footer-link-hover">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-300 hover:text-orange-400 transition-colors relative group footer-link-hover">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-orange-400 transition-colors relative group footer-link-hover">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
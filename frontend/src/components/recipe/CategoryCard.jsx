import { Link } from "react-router-dom";
import {
  FaUtensils,
  FaFire,
  FaCoffee,
  FaCookie,
  FaCarrot,
  FaStar,
} from "react-icons/fa";

const CategoryCard = ({ category, className = "" }) => {
  const {
    id,
    name,
    description,
    image,
    count,
    icon: iconName,
    color = "text-orange-500",
    featured = false,
  } = category;

  // Icon mapping
  const iconMap = {
    utensils: FaUtensils,
    fire: FaFire,
    coffee: FaCoffee,
    cookie: FaCookie,
    carrot: FaCarrot,
    star: FaStar,
  };

  const Icon = iconMap[iconName] || FaUtensils;

  return (
    <Link
      to={`/categories/${id}`}
      className={`group block ${className} bg-orange-50`} // pastikan link punya bg
    >
      <div className="bg-orange-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105 font-brand">
        {/* Image Section */}
        {image && (
          <div className="relative h-32 overflow-hidden">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/300x128/FF6B35/ffffff?text=CookEasy";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

            {featured && (
              <div className="absolute top-3 right-3">
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Populer
                </span>
              </div>
            )}

            <div className="absolute bottom-3 right-3">
              <span className="bg-black/70 text-white text-sm px-2 py-1 rounded-full">
                {count} resep
              </span>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="p-4 min-h-[160px] flex flex-col justify-between">
          {!image && (
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-full bg-gray-100 ${color}`}>
                <Icon className="text-xl" />
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-700">
                  {count}
                </span>
                <p className="text-sm text-gray-500">resep</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-lg text-orange-800 mb-2 group-hover:text-orange-900 transition-colors">
              {name}
            </h3>
            {description && (
              <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                {description}
              </p>
            )}
          </div>

          {image && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-700">
                {count} resep tersedia
              </span>
              <div className="text-orange-500 group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;

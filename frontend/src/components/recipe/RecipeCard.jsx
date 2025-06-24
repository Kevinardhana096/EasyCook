import { Link } from 'react-router-dom';
import { FaStar, FaClock, FaHeart, FaUser, FaEye } from 'react-icons/fa';

const RecipeCard = ({ recipe, showAuthor = true, className = "" }) => {
  const {
    id,
    title,
    description,
    image,
    rating = 0,
    cookTime,
    difficulty = "Medium",
    author,
    likes = 0,
    views = 0,
    isFavorited = false
  } = recipe;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'badge-success';
      case 'medium':
        return 'badge-warning';
      case 'hard':
        return 'badge-error';
      default:
        return 'badge-secondary';
    }
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement favorite functionality
    console.log('Toggle favorite for recipe:', id);
  };

  return (
    <div className={`card bg-base-100 shadow-xl card-hover ${className}`}>
      <figure className="relative">
        <img
          src={image || 'https://via.placeholder.com/400x300/FF6B35/ffffff?text=No+Image'}
          alt={title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300/FF6B35/ffffff?text=CookEasy';
          }}
        />
        
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-4 right-4 btn btn-circle btn-sm ${
            isFavorited ? 'btn-primary' : 'btn-ghost bg-white/90 hover:btn-primary'
          }`}
        >
          <FaHeart className={isFavorited ? 'text-white' : 'text-gray-600'} />
        </button>

        {/* Cook time badge */}
        {cookTime && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            <FaClock className="inline mr-1" />
            {cookTime}m
          </div>
        )}

        {/* Difficulty badge */}
        <div className={`absolute top-4 left-4 badge ${getDifficultyColor(difficulty)}`}>
          {difficulty}
        </div>
      </figure>

      <div className="card-body">
        <h3 className="card-title text-lg line-clamp-2">
          {title}
        </h3>
        
        <p className="text-gray-600 line-clamp-2 text-sm">{description}</p>
        
        {/* Rating and author */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            {rating > 0 && (
              <div className="flex items-center text-yellow-500">
                <FaStar className="mr-1" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
            
            {showAuthor && author && (
              <div className="flex items-center text-gray-500">
                <FaUser className="mr-1 text-xs" />
                <span className="text-sm">{author}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-3 text-gray-500 text-sm">
            {likes > 0 && (
              <div className="flex items-center">
                <FaHeart className="mr-1" />
                <span>{likes}</span>
              </div>
            )}
            {views > 0 && (
              <div className="flex items-center">
                <FaEye className="mr-1" />
                <span>{views}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="card-actions justify-end mt-4">
          <Link to={`/recipes/${id}`} className="btn btn-primary btn-sm">
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
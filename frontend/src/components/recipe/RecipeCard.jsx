import { Link } from 'react-router-dom';
import { FaClock, FaHeart, FaUser, FaEye, FaToggleOn, FaToggleOff, FaEdit } from 'react-icons/fa';
import { useState } from 'react';
import FavoriteButton from './FavoriteButton';
import PlaceholderImage from '../common/PlaceholderImage';
import RatingStars from '../common/RatingStars';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';

const RecipeCard = ({ recipe, showAuthor = true, className = "", showOwnerActions = false, onStatusChange }) => {
  const [imageError, setImageError] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const { user } = useAuth();

  const {
    id,
    title,
    description,
    image,
    image_url,
    rating = 0,
    cookTime,
    difficulty = "Medium",
    author,
    likes = 0,
    views = 0,
    isFavorited = false,
    is_published = true, // Default to true for backward compatibility
    user_id
  } = recipe;

  const imageSource = image || image_url;
  const isOwner = user && user.id === user_id;

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

  const handleImageError = () => {
    setImageError(true);
  };

  const handleTogglePublish = async () => {
    if (!isOwner || isToggling) return;

    setIsToggling(true);
    try {
      const response = await apiClient.put(`/recipes/${id}/toggle-publish`);

      // Update recipe status in parent component
      if (onStatusChange) {
        onStatusChange(id, response.data.is_published);
      }

      // Show success message
      const status = response.data.is_published ? 'published' : 'unpublished';
      console.log(`Recipe ${status} successfully`);

    } catch (err) {
      console.error('Failed to toggle recipe status:', err);
      alert('Failed to update recipe status. Please try again.');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className={`card bg-base-100 shadow-xl card-hover ${className}`}>
      <figure className="relative">
        {!imageError && imageSource ? (
          <img
            src={imageSource}
            alt={title}
            className="w-full h-48 object-cover"
            onError={handleImageError}
          />
        ) : (
          <PlaceholderImage
            width="100%"
            height={192}
            text={title.length > 15 ? "CookEasy" : title}
            className="w-full h-48"
          />
        )}

        {/* Favorite button */}
        <div className="absolute top-4 right-4">
          <FavoriteButton
            recipeId={id}
            initialFavorited={isFavorited}
            size="md"
            onToggle={(recipeId, newFavoritedState) => {
              console.log('Toggle favorite for recipe:', recipeId, newFavoritedState);
              // TODO: Update parent state or call API
            }}
          />
        </div>

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

        {/* Published/Draft status badge */}
        {!is_published && (
          <div className="absolute top-4 left-20 badge badge-warning">
            📝 Draft
          </div>
        )}
      </figure>

      <div className="card-body">
        <h3 className="card-title text-lg line-clamp-2">
          {title}
        </h3>

        <p className="text-gray-600 line-clamp-2 text-sm">{description}</p>

        {/* Rating and author */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <RatingStars
              rating={rating}
              size="sm"
              interactive={false}
              showText={rating > 0}
            />

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

        <div className="card-actions justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            {/* Status info for drafts */}
            {!is_published && (
              <div className="flex items-center text-xs text-orange-600">
                <span className="mr-1">📝</span>
                <span>Draft - Only visible to you</span>
              </div>
            )}

            {/* Owner actions */}
            {isOwner && showOwnerActions && (
              <div className="flex gap-1">
                <Link
                  to={`/recipes/${id}/edit`}
                  className="btn btn-xs btn-outline"
                  title="Edit recipe"
                >
                  <FaEdit className="mr-1" />
                  Edit
                </Link>
                <button
                  onClick={handleTogglePublish}
                  disabled={isToggling}
                  className={`btn btn-xs ${is_published ? 'btn-warning' : 'btn-success'}`}
                  title={is_published ? 'Unpublish recipe' : 'Publish recipe'}
                >
                  {isToggling ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <>
                      {is_published ? <FaToggleOff className="mr-1" /> : <FaToggleOn className="mr-1" />}
                      {is_published ? 'Unpublish' : 'Publish'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <Link to={`/recipes/${id}`} className="btn btn-primary btn-sm">
            {is_published ? 'View Recipe' : 'Edit Draft'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
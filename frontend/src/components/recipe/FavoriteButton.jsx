import { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

const FavoriteButton = ({
    recipeId,
    initialFavorited = false,
    size = "md",
    className = "",
    showTooltip = true,
    onToggle = null
}) => {
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const [isAnimating, setIsAnimating] = useState(false);

    const sizeClasses = {
        sm: "p-1.5 text-sm",
        md: "p-2 text-base",
        lg: "p-3 text-lg"
    };

    const handleToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsAnimating(true);
        setIsFavorited(!isFavorited);

        // Callback untuk parent component
        if (onToggle) {
            onToggle(recipeId, !isFavorited);
        }

        // TODO: Implement API call to backend
        console.log(`${!isFavorited ? 'Added to' : 'Removed from'} favorites:`, recipeId);

        // Reset animation
        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <div className="relative group">
            <button
                onClick={handleToggle}
                className={`
          relative rounded-full transition-all duration-200 
          ${isFavorited
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                    }
          ${sizeClasses[size]}
          ${isAnimating ? 'scale-125' : 'hover:scale-110'}
          ${className}
        `}
                aria-label={isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            >
                <FaHeart
                    className={`
            transition-all duration-200
            ${isAnimating ? 'animate-pulse' : ''}
          `}
                />

                {/* Ripple effect */}
                {isAnimating && (
                    <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"></div>
                )}
            </button>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                </div>
            )}
        </div>
    );
};

export default FavoriteButton;

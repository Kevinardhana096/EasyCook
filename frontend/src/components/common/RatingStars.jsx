import { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const RatingStars = ({
    rating = 0,
    size = 'md',
    interactive = false,
    onRatingChange = null,
    showText = true
}) => {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(rating);

    const handleClick = (value) => {
        if (!interactive) return;
        setCurrentRating(value);
        if (onRatingChange) {
            onRatingChange(value);
        }
    };

    const handleMouseEnter = (value) => {
        if (!interactive) return;
        setHoveredRating(value);
    };

    const handleMouseLeave = () => {
        if (!interactive) return;
        setHoveredRating(0);
    };

    const getSizeClass = () => {
        switch (size) {
            case 'sm': return 'text-sm';
            case 'lg': return 'text-lg';
            case 'xl': return 'text-xl';
            default: return 'text-base';
        }
    };

    const displayRating = hoveredRating || currentRating;

    return (
        <div className="flex items-center gap-1">
            <div className={`flex items-center ${getSizeClass()}`}>
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= displayRating;
                    const StarIcon = isFilled ? FaStar : FaRegStar;

                    return (
                        <button
                            key={star}
                            type="button"
                            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} 
                         transition-all duration-150 ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
                            onClick={() => handleClick(star)}
                            onMouseEnter={() => handleMouseEnter(star)}
                            onMouseLeave={handleMouseLeave}
                            disabled={!interactive}
                        >
                            <StarIcon />
                        </button>
                    );
                })}
            </div>

            {showText && (
                <span className={`${getSizeClass()} text-gray-600 ml-1`}>
                    {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
                </span>
            )}
        </div>
    );
};

export default RatingStars;

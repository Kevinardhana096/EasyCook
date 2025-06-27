import React from 'react';

const PlaceholderImage = ({ width = 400, height = 300, text = "CookEasy", className = "" }) => {
    return (
        <div
            className={`flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold text-lg ${className}`}
            style={{ width: width, height: height, minHeight: height }}
        >
            <div className="text-center">
                <div className="text-4xl mb-2">🍽️</div>
                <div>{text}</div>
            </div>
        </div>
    );
};

export default PlaceholderImage;

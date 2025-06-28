import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

const RatingsContext = createContext();

export const useRatings = () => {
    const context = useContext(RatingsContext);
    if (!context) {
        throw new Error('useRatings must be used within a RatingsProvider');
    }
    return context;
};

export const RatingsProvider = ({ children }) => {
    const { user } = useAuth();
    const [userRatings, setUserRatings] = useState(new Map()); // recipeId -> {rating, review}
    const [recipeRatings, setRecipeRatings] = useState(new Map()); // recipeId -> {average_rating, rating_count}
    const [isLoading, setIsLoading] = useState(false);

    // Load user ratings when user changes
    useEffect(() => {
        if (user) {
            loadUserRatings();
        } else {
            setUserRatings(new Map());
        }
    }, [user]);

    const loadUserRatings = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            // Load user's ratings (you might need to create this endpoint)
            // For now, we'll manage ratings locally
        } catch (error) {
            console.error('Failed to load user ratings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const submitRating = async (recipeId, rating, review = '') => {
        if (!user) throw new Error('User must be authenticated');

        try {
            const response = await apiClient.post(`/recipes/${recipeId}/ratings`, {
                rating,
                review
            });

            // Update local state with user's rating
            setUserRatings(prev => {
                const newMap = new Map(prev);
                newMap.set(recipeId, { rating, review });
                return newMap;
            });

            // Update recipe's overall rating stats if provided in response
            if (response.data.recipe_stats) {
                setRecipeRatings(prev => {
                    const newMap = new Map(prev);
                    newMap.set(recipeId, {
                        average_rating: response.data.recipe_stats.average_rating,
                        rating_count: response.data.recipe_stats.rating_count
                    });
                    return newMap;
                });
            }

            return response.data;
        } catch (error) {
            console.error('Failed to submit rating:', error);
            throw error;
        }
    };

    const getUserRating = (recipeId) => {
        return userRatings.get(recipeId) || { rating: 0, review: '' };
    };

    const getRecipeStats = (recipeId) => {
        return recipeRatings.get(recipeId) || null;
    };

    const updateRecipeStats = (recipeId, stats) => {
        setRecipeRatings(prev => {
            const newMap = new Map(prev);
            newMap.set(recipeId, stats);
            return newMap;
        });
    };

    const value = {
        userRatings,
        recipeRatings,
        isLoading,
        submitRating,
        getUserRating,
        getRecipeStats,
        updateRecipeStats,
        loadUserRatings
    };

    return (
        <RatingsContext.Provider value={value}>
            {children}
        </RatingsContext.Provider>
    );
};

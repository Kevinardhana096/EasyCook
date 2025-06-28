import { createContext, useContext, useState, useEffect } from 'react';
import { recipesAPI } from '../api/recipes';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

export const FavoritesProvider = ({ children }) => {
    const { user } = useAuth();
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);

    // Load user favorites when user changes
    useEffect(() => {
        if (user) {
            loadFavorites();
        } else {
            setFavoriteIds(new Set());
        }
    }, [user]);

    const loadFavorites = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const response = await recipesAPI.getFavorites();
            const favoriteRecipeIds = new Set(
                response.data.recipes.map(recipe => recipe.id)
            );
            setFavoriteIds(favoriteRecipeIds);
        } catch (error) {
            console.error('Failed to load favorites:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFavorite = async (recipeId) => {
        if (!user) return false;

        try {
            const response = await recipesAPI.toggleFavorite(recipeId);
            const newFavoritedState = response.data.is_favorited;

            setFavoriteIds(prev => {
                const newSet = new Set(prev);
                if (newFavoritedState) {
                    newSet.add(recipeId);
                } else {
                    newSet.delete(recipeId);
                }
                return newSet;
            });

            return newFavoritedState;
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            throw error;
        }
    };

    const isFavorited = (recipeId) => {
        return favoriteIds.has(recipeId);
    };

    const value = {
        favoriteIds,
        isLoading,
        toggleFavorite,
        isFavorited,
        loadFavorites,
        favoriteCount: favoriteIds.size
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

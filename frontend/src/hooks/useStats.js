import { useState, useEffect, useCallback } from 'react';
import api from '../api/recipes';

/**
 * Custom hook for managing platform statistics
 * Provides real-time stats with auto-refresh capabilities
 */
export const useStats = (autoRefresh = false, refreshInterval = 60000) => {
    const [stats, setStats] = useState({
        total_recipes: 0,
        total_users: 0,
        total_categories: 0,
        total_views: 0,
        total_likes: 0,
        average_rating: 0,
        featured_recipes: 0,
        total_ratings: 0,
        top_categories: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchStats = useCallback(async () => {
        try {
            setError(null);
            const response = await api.stats.getPlatformStats();

            if (response.data && response.data.stats) {
                setStats(response.data.stats);
                setLastUpdated(new Date());
                console.log('📊 Platform stats updated:', response.data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch platform stats:', err);
            setError(err.message || 'Failed to load statistics');

            // Set fallback stats
            setStats({
                total_recipes: 0,
                total_users: 0,
                total_categories: 0,
                total_views: 0,
                total_likes: 0,
                average_rating: 0,
                featured_recipes: 0,
                total_ratings: 0,
                top_categories: []
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Manual refresh function
    const refreshStats = useCallback(() => {
        setLoading(true);
        return fetchStats();
    }, [fetchStats]);

    // Initial load
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Auto-refresh setup
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            console.log('🔄 Auto-refreshing platform stats...');
            fetchStats();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchStats]);

    return {
        stats,
        loading,
        error,
        lastUpdated,
        refreshStats,
        // Individual stat getters for convenience
        totalRecipes: stats.total_recipes,
        totalUsers: stats.total_users,
        totalCategories: stats.total_categories,
        totalViews: stats.total_views,
        totalLikes: stats.total_likes,
        averageRating: stats.average_rating,
        featuredRecipes: stats.featured_recipes,
        totalRatings: stats.total_ratings,
        topCategories: stats.top_categories
    };
};

/**
 * Custom hook for user-specific statistics
 */
export const useUserStats = (userId, autoRefresh = false) => {
    const [userStats, setUserStats] = useState({
        recipe_count: 0,
        total_likes: 0,
        total_views: 0,
        average_rating: 0,
        follower_count: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserStats = useCallback(async () => {
        if (!userId) return;

        try {
            setError(null);
            // This would be a separate API endpoint for user stats
            // For now, we'll use the profile data
            console.log('📈 User stats would be fetched here for user:', userId);
            setUserStats({
                recipe_count: 0,
                total_likes: 0,
                total_views: 0,
                average_rating: 0,
                follower_count: 0
            });
        } catch (err) {
            console.error('Failed to fetch user stats:', err);
            setError(err.message || 'Failed to load user statistics');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserStats();
    }, [fetchUserStats]);

    return {
        userStats,
        loading,
        error,
        refreshUserStats: fetchUserStats
    };
};

export default useStats;

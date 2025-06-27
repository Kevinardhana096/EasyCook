import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/recipes';

const StatsContext = createContext();

export const useStatsContext = () => {
    const context = useContext(StatsContext);
    if (!context) {
        throw new Error('useStatsContext must be used within a StatsProvider');
    }
    return context;
};

export const StatsProvider = ({ children }) => {
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

    const fetchStats = async () => {
        try {
            setError(null);
            const response = await api.stats.getPlatformStats();

            if (response.data && response.data.stats) {
                setStats(response.data.stats);
                setLastUpdated(new Date());
                console.log('📊 Global stats updated:', response.data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch platform stats:', err);
            setError(err.message || 'Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = () => {
        setLoading(true);
        return fetchStats();
    };

    // Initial load
    useEffect(() => {
        fetchStats();
    }, []);

    // Auto refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('🔄 Auto-refreshing global stats...');
            fetchStats();
        }, 300000); // 5 minutes

        return () => clearInterval(interval);
    }, []);

    const value = {
        stats,
        loading,
        error,
        lastUpdated,
        refreshStats,
        // Convenience getters
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

    return (
        <StatsContext.Provider value={value}>
            {children}
        </StatsContext.Provider>
    );
};

export default StatsContext;

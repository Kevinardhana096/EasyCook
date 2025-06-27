import apiClient from './client';

// Statistics API
export const statsAPI = {
    getPlatformStats: () => apiClient.get('/recipes/stats'),
};

// Categories API
export const categoriesAPI = {
    getAll: () => apiClient.get('/recipes/categories'),
    getById: (id) => apiClient.get(`/recipes/categories/${id}`),
};

// Recipes API
export const recipesAPI = {
    getAll: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page);
        if (params.per_page) queryParams.append('per_page', params.per_page);
        if (params.category_id) queryParams.append('category_id', params.category_id);
        if (params.difficulty) queryParams.append('difficulty', params.difficulty);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);

        const queryString = queryParams.toString();
        return apiClient.get(`/recipes/${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id) => apiClient.get(`/recipes/${id}`),

    getFeatured: () => apiClient.get('/recipes/featured'),

    getPopular: (limit = 6) => apiClient.get(`/recipes/popular?limit=${limit}`),

    search: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.q) queryParams.append('q', params.q);
        if (params.category_id) queryParams.append('category_id', params.category_id);
        if (params.difficulty) queryParams.append('difficulty', params.difficulty);

        return apiClient.get(`/recipes/search?${queryParams.toString()}`);
    },

    create: (data) => apiClient.post('/recipes', data),

    update: (id, data) => apiClient.put(`/recipes/${id}`, data),

    delete: (id) => apiClient.delete(`/recipes/${id}`),

    // Favorites
    getFavorites: () => apiClient.get('/recipes/favorites'),

    toggleFavorite: (id) => apiClient.post(`/recipes/${id}/favorite`),

    // Ratings
    rateRecipe: (id, data) => apiClient.post(`/recipes/${id}/rate`, data),

    getRatings: (id) => apiClient.get(`/recipes/${id}/ratings`),
};

// Ingredients API
export const ingredientsAPI = {
    getAll: () => apiClient.get('/recipes/ingredients'),
    getById: (id) => apiClient.get(`/recipes/ingredients/${id}`),
};

// Users API
export const usersAPI = {
    getUserRecipes: (userId) => apiClient.get(`/recipes/user/${userId}`),
};

// Export default object with all APIs
const api = {
    stats: statsAPI,
    categories: categoriesAPI,
    recipes: recipesAPI,
    ingredients: ingredientsAPI,
    users: usersAPI,
    stats: statsAPI,
};

export default api;

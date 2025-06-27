/**
 * Role-based utility functions
 */

export const ROLES = {
    USER: 'user',
    CHEF: 'chef',
    ADMIN: 'admin'
};

/**
 * Check if user has specific role
 */
export const hasRole = (user, role) => {
    return user?.role === role;
};

/**
 * Check if user is admin
 */
export const isAdmin = (user) => {
    return hasRole(user, ROLES.ADMIN);
};

/**
 * Check if user is chef
 */
export const isChef = (user) => {
    return hasRole(user, ROLES.CHEF);
};

/**
 * Check if user is regular user
 */
export const isUser = (user) => {
    return hasRole(user, ROLES.USER);
};

/**
 * Check if user can create recipes (chef or admin)
 */
export const canCreateRecipes = (user) => {
    return isChef(user) || isAdmin(user);
};

/**
 * Check if user can edit specific recipe
 */
export const canEditRecipe = (user, recipe) => {
    if (!user || !recipe) return false;
    return isAdmin(user) || recipe.user_id === user.id;
};

/**
 * Check if user can delete specific recipe
 */
export const canDeleteRecipe = (user, recipe) => {
    if (!user || !recipe) return false;
    return isAdmin(user) || recipe.user_id === user.id;
};

/**
 * Check if user can access admin panel
 */
export const canAccessAdmin = (user) => {
    return isAdmin(user);
};

/**
 * Check if user has any elevated permissions (chef or admin)
 */
export const hasElevatedPermissions = (user) => {
    return isChef(user) || isAdmin(user);
};

/**
 * Get role display name with emoji
 */
export const getRoleDisplayName = (role) => {
    switch (role) {
        case ROLES.ADMIN:
            return '👑 Admin';
        case ROLES.CHEF:
            return '👨‍🍳 Chef';
        case ROLES.USER:
        default:
            return '👤 User';
    }
};

/**
 * Get role badge color class
 */
export const getRoleBadgeColor = (role) => {
    switch (role) {
        case ROLES.ADMIN:
            return 'bg-red-100 text-red-800';
        case ROLES.CHEF:
            return 'bg-yellow-100 text-yellow-800';
        case ROLES.USER:
        default:
            return 'bg-blue-100 text-blue-800';
    }
};

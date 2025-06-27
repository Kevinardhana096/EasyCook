import React from 'react';
import { FaSync } from 'react-icons/fa';

/**
 * Reusable Statistics Card Component
 * Displays a statistic with icon, value, title, and description
 */
const StatCard = ({
    icon: Icon,
    title,
    value,
    description,
    color = 'text-gray-600',
    bgColor = 'bg-gray-100',
    size = 'md',
    animated = false,
    loading = false,
    onClick = null,
    className = '',
    format = 'number' // 'number', 'currency', 'percentage'
}) => {
    // Format value based on type
    const formatValue = (val) => {
        if (loading) return '...';
        if (val === null || val === undefined) return '0';

        switch (format) {
            case 'currency':
                return val.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                });
            case 'percentage':
                return `${val}%`;
            case 'number':
            default:
                return typeof val === 'number' ? val.toLocaleString() : val;
        }
    };

    const sizeClasses = {
        sm: {
            container: 'p-4',
            icon: 'text-2xl',
            value: 'text-xl',
            title: 'text-sm',
            description: 'text-xs'
        },
        md: {
            container: 'p-6',
            icon: 'text-3xl',
            value: 'text-2xl',
            title: 'text-sm',
            description: 'text-xs'
        },
        lg: {
            container: 'p-8',
            icon: 'text-4xl',
            value: 'text-3xl',
            title: 'text-base',
            description: 'text-sm'
        }
    };

    const currentSize = sizeClasses[size];

    return (
        <div
            className={`
        bg-white rounded-lg shadow-sm border border-gray-100 
        transition-all duration-200 hover:shadow-md
        ${onClick ? 'cursor-pointer hover:border-orange-200' : ''}
        ${animated ? 'animate-pulse' : ''}
        ${className}
      `}
            onClick={onClick}
        >
            <div className={`${currentSize.container} text-center`}>
                {/* Icon */}
                <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full ${bgColor}`}>
                    {loading ? (
                        <FaSync className={`${currentSize.icon} ${color} animate-spin`} />
                    ) : (
                        <Icon className={`${currentSize.icon} ${color}`} />
                    )}
                </div>

                {/* Title */}
                <p className={`${currentSize.title} font-medium text-gray-600 uppercase tracking-wide mb-1`}>
                    {title}
                </p>

                {/* Value */}
                <p className={`${currentSize.value} font-bold ${color} mb-1`}>
                    {formatValue(value)}
                </p>

                {/* Description */}
                {description && (
                    <p className={`${currentSize.description} text-gray-500`}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

/**
 * Statistics Grid Component
 * Displays multiple stat cards in a responsive grid
 */
export const StatsGrid = ({
    stats = [],
    loading = false,
    columns = 'auto',
    size = 'md',
    className = ''
}) => {
    const gridClasses = {
        auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
        6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
    };

    return (
        <div className={`grid gap-4 ${gridClasses[columns]} ${className}`}>
            {stats.map((stat, index) => (
                <StatCard
                    key={stat.key || index}
                    {...stat}
                    loading={loading}
                    size={size}
                />
            ))}
        </div>
    );
};

/**
 * Real-time Stats Display Component
 */
export const RealTimeStats = ({
    stats,
    loading,
    lastUpdated,
    onRefresh,
    autoRefresh = true,
    className = ''
}) => {
    return (
        <div className={`space-y-4 ${className}`}>
            {/* Stats Grid */}
            <StatsGrid stats={stats} loading={loading} />

            {/* Update Info */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                {lastUpdated && (
                    <span>
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                )}

                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="btn btn-ghost btn-xs"
                        disabled={loading}
                    >
                        <FaSync className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                )}

                {autoRefresh && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Auto-updating
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatCard;

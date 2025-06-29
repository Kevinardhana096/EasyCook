import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import client from '../../api/client';

const RoleTestingPanel = () => {
    const { updateUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // Toggle to temporarily disable the panel
    const PANEL_ENABLED = false; // Set to true to re-enable

    const testLogin = async (role) => {
        try {
            setLoading(true);
            const response = await client.post('/auth/debug/test-login', { role });

            // Update localStorage
            localStorage.setItem('cookeasy_token', response.data.access_token);
            localStorage.setItem('cookeasy_user', JSON.stringify(response.data.user));

            // Update auth context
            updateUser(response.data.user);

            alert(`Logged in as ${role}: ${response.data.user.username}`);
            window.location.reload();

        } catch (error) {
            console.error('Test login failed:', error);
            alert(`Failed to login as ${role}`);
        } finally {
            setLoading(false);
        }
    };

    // Temporarily disabled
    if (!PANEL_ENABLED) {
        return null;
    }

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed z-50 p-4 bg-white border rounded-lg shadow-lg bottom-4 right-4">
            <h3 className="mb-3 text-sm font-bold text-gray-700">🧪 Role Testing</h3>
            <div className="space-y-2">
                <button
                    onClick={() => testLogin('admin')}
                    disabled={loading}
                    className="block w-full px-3 py-2 text-xs text-left text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50"
                >
                    👑 Login as Admin
                </button>
                <button
                    onClick={() => testLogin('chef')}
                    disabled={loading}
                    className="block w-full px-3 py-2 text-xs text-left text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 disabled:opacity-50"
                >
                    👨‍🍳 Login as Chef
                </button>
                <button
                    onClick={() => testLogin('user')}
                    disabled={loading}
                    className="block w-full px-3 py-2 text-xs text-left text-blue-700 bg-blue-100 rounded hover:bg-blue-200 disabled:opacity-50"
                >
                    👤 Login as User
                </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
                Dev only - will not appear in production
            </div>
        </div>
    );
};

export default RoleTestingPanel;

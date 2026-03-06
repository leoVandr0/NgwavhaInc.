import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';

const AdminLayout = () => {
    const location = useLocation();

    // Determine title based on path
    const getPageTitle = (path) => {
        const parts = path.split('/');
        const lastPart = parts[parts.length - 1];
        if (!lastPart || lastPart === 'admin' || lastPart === 'dashboard') return 'Admin Dashboard';
        return `Admin ${lastPart.charAt(0).toUpperCase() + lastPart.slice(1)}`;
    };

    return (
        <ResponsiveLayout title={getPageTitle(location.pathname)}>
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 min-h-screen">
                <Outlet />
            </div>
        </ResponsiveLayout>
    );
};

export default AdminLayout;

import React from 'react';
import { Outlet } from 'react-router-dom';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';

const AdminLayout = () => {
    return (
        <ResponsiveLayout title="Admin Dashboard">
            <Outlet />
        </ResponsiveLayout>
    );
};

export default AdminLayout;

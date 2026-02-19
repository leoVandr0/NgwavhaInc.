import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';

const AdminLayout = () => {
    return (
        <ResponsiveLayout title="Admin Dashboard">
            <nav style={{ display: 'flex', gap: '12px', marginBottom: 16 }}>
                <Link to="/admin/dashboard">Dashboard</Link>
                <Link to="/admin/users">Users</Link>
                <Link to="/admin/course-previews">Course Previews</Link>
            </nav>
            <Outlet />
        </ResponsiveLayout>
    );
};

export default AdminLayout;

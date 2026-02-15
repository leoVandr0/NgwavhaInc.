// src/layouts/StudentLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';

const StudentLayout = () => {
  return (
    <ResponsiveLayout title="Student Dashboard">
      <Outlet />
    </ResponsiveLayout>
  );
};

export default StudentLayout;

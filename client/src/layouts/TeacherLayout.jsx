// src/layouts/TeacherLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';

const TeacherLayout = () => {
  return (
    <ResponsiveLayout title="Teacher Dashboard">
      <Outlet />
    </ResponsiveLayout>
  );
};

export default TeacherLayout;

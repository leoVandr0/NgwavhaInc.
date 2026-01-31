// src/layouts/TeacherLayout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  HomeOutlined,
  LogoutOutlined,
  TeamOutlined,
  FileDoneOutlined,
  DashboardOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';

import logo from '../assets/logo.jpg';

const { Header, Content, Sider } = Layout;

const TeacherLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} style={{ background: '#1A1A1A', borderRight: '1px solid #333' }}>
        <div className="logo" style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #333' }}>
          <Link to="/" className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity" style={{ textDecoration: 'none' }}>
            <img src={logo} alt="Ngwavha" className="h-8 w-8 rounded-full object-cover" />
            <span>Ngwavha</span>
          </Link>
        </div>
        <Menu
          mode="inline"
          theme="dark"
          defaultSelectedKeys={['1']}
          style={{ height: '100%', borderRight: 0, background: '#1A1A1A' }}
          items={[
            { key: '1', icon: <DashboardOutlined />, label: <Link to="/teacher/dashboard">Dashboard</Link> },
            { key: '2', icon: <BookOutlined />, label: <Link to="/teacher/courses">My Courses</Link> },
            { key: 'live', icon: <VideoCameraOutlined />, label: <Link to="/teacher/live">Live Lessons</Link> },
            { key: '3', icon: <TeamOutlined />, label: <Link to="/teacher/students">Students</Link> },
            { key: '4', icon: <FileDoneOutlined />, label: <Link to="/teacher/assignments">Assignments</Link> },
            { key: '5', icon: <UserOutlined />, label: <Link to="/teacher/profile">Profile</Link> },
            { key: '6', icon: <LogoutOutlined />, label: <Link to="/login">Logout</Link>, danger: true },
          ]}
        />
      </Sider>
      <Layout style={{ background: '#000000' }}>
        <Header style={{ padding: 0, background: '#1A1A1A', borderBottom: '1px solid #333' }} />
        <Content style={{ padding: '24px', minHeight: 280, background: '#000000', color: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherLayout;

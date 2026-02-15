import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Settings,
    LogOut,
    Shield,
    Activity,
    DollarSign,
    X,
    Menu
} from 'lucide-react';
import { Badge, Avatar } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.jpg';

const ResponsiveSidebar = ({ isOpen, onToggle, isMobile, onMobileClose }) => {
    const location = useLocation();
    const { currentUser, logout } = useAuth();

    const menuItems = [
        {
            path: '/admin/dashboard',
            icon: <LayoutDashboard size={20} />,
            label: 'Dashboard',
            badge: null
        },
        {
            path: '/admin/users',
            icon: <Users size={20} />,
            label: 'Users',
            badge: null
        },
        {
            path: '/admin/teachers',
            icon: <GraduationCap size={20} />,
            label: 'Teachers',
            badge: 5
        },
        {
            path: '/admin/courses',
            icon: <BookOpen size={20} />,
            label: 'Courses',
            badge: null
        },
        {
            path: '/admin/analytics',
            icon: <Activity size={20} />,
            label: 'Analytics',
            badge: null
        },
        {
            path: '/admin/finance',
            icon: <DollarSign size={20} />,
            label: 'Finance',
            badge: null
        },
        {
            path: '/admin/settings',
            icon: <Settings size={20} />,
            label: 'Settings',
            badge: null
        }
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    // Mobile overlay
    if (isMobile) {
        return (
            <>
                {/* Overlay */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={onMobileClose}
                    />
                )}
                
                {/* Mobile Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-800 transform transition-transform duration-300 ease-in-out lg:hidden ${
                        isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    {/* Mobile Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-dark-800">
                        <Link to="/admin/dashboard" className="flex items-center gap-3">
                            <img src={logo} alt="Ngwavha" className="h-8 w-8 rounded-full object-cover" />
                            <div>
                                <span className="text-lg font-bold text-white">Ngwavha</span>
                                <span className="text-xs text-primary-500 block">Admin Panel</span>
                            </div>
                        </Link>
                        <button
                            onClick={onMobileClose}
                            className="text-dark-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Admin Badge */}
                    <div className="px-6 py-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                            <Shield size={14} className="text-primary-500" />
                            <span className="text-xs font-medium text-primary-400">Administrator Access</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="px-4 pb-4 flex-1 overflow-y-auto">
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={onMobileClose}
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            isActive(item.path)
                                                ? 'bg-primary-500 text-dark-950'
                                                : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={isActive(item.path) ? 'text-dark-950' : ''}>
                                                {item.icon}
                                            </span>
                                            <span>{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <Badge
                                                count={item.badge}
                                                className="bg-primary-500 text-dark-950"
                                                style={{ backgroundColor: '#FFA500', color: '#000' }}
                                            />
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Mobile User Section */}
                    <div className="border-t border-dark-800 p-4">
                        <div className="flex items-center gap-3 px-4 py-3 mb-3">
                            <Avatar
                                src={currentUser?.avatar}
                                className="bg-primary-500"
                            >
                                {currentUser?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {currentUser?.name}
                                </p>
                                <p className="text-xs text-dark-400 truncate">
                                    {currentUser?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>
            </>
        );
    }

    // Desktop Sidebar
    return (
        <aside
            className={`hidden lg:flex flex-col bg-dark-900 border-r border-dark-800 transition-all duration-300 ease-in-out ${
                isOpen ? 'w-64' : 'w-20'
            }`}
        >
            {/* Desktop Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-dark-800">
                <Link to="/admin/dashboard" className="flex items-center gap-3">
                    <img src={logo} alt="Ngwavha" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                    {isOpen && (
                        <div className="overflow-hidden">
                            <span className="text-lg font-bold text-white block">Ngwavha</span>
                            <span className="text-xs text-primary-500 block">Admin Panel</span>
                        </div>
                    )}
                </Link>
                <button
                    onClick={onToggle}
                    className="text-dark-400 hover:text-white p-1 rounded hover:bg-dark-800 transition-colors"
                >
                    <Menu size={18} />
                </button>
            </div>

            {/* Admin Badge */}
            {isOpen && (
                <div className="px-4 py-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                        <Shield size={14} className="text-primary-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-primary-400 whitespace-nowrap">Administrator Access</span>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive(item.path)
                                        ? 'bg-primary-500 text-dark-950'
                                        : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                                }`}
                                title={!isOpen ? item.label : undefined}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`flex-shrink-0 ${isActive(item.path) ? 'text-dark-950' : ''}`}>
                                        {item.icon}
                                    </span>
                                    {isOpen && (
                                        <span className="truncate">{item.label}</span>
                                    )}
                                </div>
                                {isOpen && item.badge && (
                                    <Badge
                                        count={item.badge}
                                        className="bg-primary-500 text-dark-950 flex-shrink-0"
                                        style={{ backgroundColor: '#FFA500', color: '#000' }}
                                    />
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Desktop User Section */}
            {isOpen && (
                <div className="border-t border-dark-800 p-3">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <Avatar
                            src={currentUser?.avatar}
                            className="bg-primary-500 flex-shrink-0"
                        >
                            {currentUser?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {currentUser?.name}
                            </p>
                            <p className="text-xs text-dark-400 truncate">
                                {currentUser?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut size={16} className="flex-shrink-0" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </aside>
    );
};

export default ResponsiveSidebar;

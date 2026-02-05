import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Settings,
    LogOut,
    Bell,
    Menu,
    X,
    Shield,
    Activity,
    DollarSign,
    ChevronRight
} from 'lucide-react';
import { Badge, Avatar } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.jpg';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState(3);
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

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
            badge: 5 // Pending approvals
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

    return (
        <div className="min-h-screen bg-dark-950 flex">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-800 transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen || isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-dark-800">
                    <Link to="/admin/dashboard" className="flex items-center gap-3">
                        <img src={logo} alt="Ngwavha" className="h-8 w-8 rounded-full object-cover" />
                        <div>
                            <span className="text-lg font-bold text-white">Ngwavha</span>
                            <span className="text-xs text-primary-500 block">Admin Panel</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden text-dark-400 hover:text-white"
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
                <nav className="px-4 pb-4">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
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

                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-800">
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setIsMobileMenuOpen(true);
                                } else {
                                    setIsSidebarOpen(!isSidebarOpen);
                                }
                            }}
                            className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg font-semibold text-white hidden sm:block">
                            Admin Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="relative p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
                            <Bell size={20} />
                            {notifications > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-dark-950 text-xs font-bold flex items-center justify-center rounded-full">
                                    {notifications}
                                </span>
                            )}
                        </button>

                        {/* Quick Actions */}
                        <Link
                            to="/admin/teachers"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-500 text-dark-950 text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            <Shield size={16} />
                            Review Teachers
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

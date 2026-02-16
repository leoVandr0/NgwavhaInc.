import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    Menu,
    Home,
    User,
    Calendar,
    FileText,
    Video,
    ShoppingCart,
    Heart
} from 'lucide-react';
import { Badge, Avatar } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.jpg';

const ResponsiveSidebar = ({ isOpen, onToggle, isMobile, onMobileClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    // Get menu items based on user role
    const getMenuItems = () => {
        const path = location.pathname;

        if (path.startsWith('/admin')) {
            return [
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
        }

        if (path.startsWith('/teacher')) {
            return [
                {
                    path: '/teacher/dashboard',
                    icon: <LayoutDashboard size={20} />,
                    label: 'Dashboard',
                    badge: null
                },
                {
                    path: '/teacher/courses',
                    icon: <BookOpen size={20} />,
                    label: 'My Courses',
                    badge: null
                },
                {
                    path: '/teacher/live',
                    icon: <Video size={20} />,
                    label: 'Live Lessons',
                    badge: null
                },
                {
                    path: '/teacher/students',
                    icon: <Users size={20} />,
                    label: 'Students',
                    badge: null
                },
                {
                    path: '/teacher/assignments',
                    icon: <FileText size={20} />,
                    label: 'Assignments',
                    badge: null
                },
                {
                    path: '/teacher/profile',
                    icon: <User size={20} />,
                    label: 'Profile',
                    badge: null
                }
            ];
        }

        if (path.startsWith('/student')) {
            return [
                {
                    path: '/student/dashboard',
                    icon: <Home size={20} />,
                    label: 'Dashboard',
                    badge: null
                },
                {
                    path: '/student/courses',
                    icon: <BookOpen size={20} />,
                    label: 'My Courses',
                    badge: null
                },
                {
                    path: '/student/cart',
                    icon: <ShoppingCart size={20} />,
                    label: 'Cart',
                    badge: null
                },
                {
                    path: '/student/wishlist',
                    icon: <Heart size={20} />,
                    label: 'Wishlist',
                    badge: null
                },
                {
                    path: '/student/assignments',
                    icon: <FileText size={20} />,
                    label: 'Assignments',
                    badge: null
                },
                {
                    path: '/student/live',
                    icon: <Video size={20} />,
                    label: 'Live Classes',
                    badge: null
                },
                {
                    path: '/student/schedule',
                    icon: <Calendar size={20} />,
                    label: 'Schedule',
                    badge: null
                },
                {
                    path: '/student/profile',
                    icon: <User size={20} />,
                    label: 'Profile',
                    badge: null
                }
            ];
        }

        return [];
    };

    const menuItems = getMenuItems();
    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getLayoutInfo = () => {
        const path = location.pathname;
        if (path.startsWith('/admin')) {
            return { title: 'Ngwavha', subtitle: 'Admin Panel', showShield: true };
        }
        if (path.startsWith('/teacher')) {
            return { title: 'Ngwavha', subtitle: 'Teacher Portal', showShield: false };
        }
        if (path.startsWith('/student')) {
            return { title: 'Ngwavha', subtitle: 'Student Portal', showShield: false };
        }
        return { title: 'Ngwavha', subtitle: 'Learning Platform', showShield: false };
    };

    const layoutInfo = getLayoutInfo();

    // ═══════════════════════════════════════════════════════════════
    //  MOBILE — Full-screen sliding menu (Udemy-style)
    // ═══════════════════════════════════════════════════════════════
    if (isMobile) {
        return (
            <>
                {/* ── Backdrop overlay ── */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        style={{ zIndex: 9998 }}
                        onClick={onMobileClose}
                        aria-hidden="true"
                    />
                )}

                {/* ── Slide-in panel ── */}
                <aside
                    className={`fixed inset-y-0 left-0 w-[85vw] max-w-[320px] bg-dark-950 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    style={{ zIndex: 9999, willChange: 'transform' }}
                >
                    <div className="flex flex-col h-full">

                        {/* ─── Header ─── */}
                        <div className="flex items-center justify-between px-5 h-16 border-b border-dark-800 flex-shrink-0">
                            <Link to="/" onClick={onMobileClose} className="flex items-center gap-3">
                                <img
                                    src={logo}
                                    alt="Ngwavha"
                                    className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="leading-tight">
                                    <span className="text-lg font-bold text-white block">
                                        {layoutInfo.title}
                                    </span>
                                    <span className="text-[11px] text-primary-500 font-medium block">
                                        {layoutInfo.subtitle}
                                    </span>
                                </div>
                            </Link>
                            <button
                                onClick={onMobileClose}
                                className="p-2.5 -mr-2 text-dark-400 hover:text-white rounded-full hover:bg-dark-800 active:bg-dark-700 transition-colors"
                                aria-label="Close menu"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* ─── User card ─── */}
                        <div className="px-5 py-4 border-b border-dark-800 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    size={48}
                                    src={currentUser?.avatar}
                                    className="bg-primary-500 flex-shrink-0"
                                    style={{ fontSize: '18px' }}
                                >
                                    {currentUser?.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-semibold text-white truncate">
                                        {currentUser?.name || 'Student'}
                                    </p>
                                    <p className="text-xs text-dark-400 truncate">
                                        {currentUser?.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ─── Admin badge ─── */}
                        {layoutInfo.showShield && (
                            <div className="px-5 py-2.5 border-b border-dark-800 flex-shrink-0">
                                <div className="flex items-center gap-2 px-3 py-2 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                                    <Shield size={14} className="text-primary-500" />
                                    <span className="text-xs font-medium text-primary-400">
                                        Administrator Access
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ─── Navigation (scrollable) ─── */}
                        <nav className="flex-1 overflow-y-auto overscroll-contain">
                            <div className="px-4 pt-4 pb-1">
                                <p className="px-3 pb-2 text-[10px] font-bold text-dark-500 uppercase tracking-widest">
                                    Menu
                                </p>
                            </div>
                            <ul className="px-3 pb-4 space-y-0.5">
                                {menuItems.map((item) => {
                                    const active = isActive(item.path);
                                    return (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                onClick={onMobileClose}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-150 ${active
                                                        ? 'bg-primary-500 text-dark-950 shadow-lg shadow-primary-500/25'
                                                        : 'text-dark-200 active:bg-dark-800/80'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3.5">
                                                    <span className={active ? 'text-dark-950' : 'text-dark-400'}>
                                                        {item.icon}
                                                    </span>
                                                    <span>{item.label}</span>
                                                </div>
                                                {item.badge ? (
                                                    <Badge
                                                        count={item.badge}
                                                        style={{
                                                            backgroundColor: '#FFA500',
                                                            color: '#000',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                ) : (
                                                    !active && (
                                                        <svg
                                                            width="7"
                                                            height="12"
                                                            viewBox="0 0 7 12"
                                                            fill="none"
                                                            className="text-dark-600 flex-shrink-0"
                                                        >
                                                            <path
                                                                d="M1 1L6 6L1 11"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    )
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        {/* ─── Bottom logout ─── */}
                        <div className="border-t border-dark-800 px-4 py-3 flex-shrink-0">
                            <button
                                onClick={() => {
                                    handleLogout();
                                    onMobileClose();
                                }}
                                className="flex items-center gap-3.5 px-4 py-3 w-full text-[15px] font-medium text-red-400 active:bg-red-500/10 rounded-xl transition-colors"
                            >
                                <LogOut size={20} />
                                <span>Log Out</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </>
        );
    }

    // Desktop Sidebar
    return (
        <aside
            className={`hidden lg:flex flex-col bg-dark-900 border-r border-dark-800 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'
                }`}
        >
            {/* Desktop Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-dark-800">
                <Link to="/" className="flex items-center gap-3">
                    <img src={logo} alt="Ngwavha" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                    {isOpen && (
                        <div className="overflow-hidden">
                            <span className="text-lg font-bold text-white block">{layoutInfo.title}</span>
                            <span className="text-xs text-primary-500 block">{layoutInfo.subtitle}</span>
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

            {/* Badge */}
            {isOpen && layoutInfo.showShield && (
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
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path)
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

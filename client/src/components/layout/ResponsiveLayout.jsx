import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import ResponsiveSidebar from './ResponsiveSidebar';
import { useAuth } from '../../contexts/AuthContext';
import useNotifications from '../../hooks/useNotifications';
import notificationService from '../../services/notificationService';
import NotificationDropdown from '../notifications/NotificationDropdown';

const MOBILE_BREAKPOINT = 1024; // matches Tailwind 'lg'

const ResponsiveLayout = ({ title = "Dashboard" }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
    );
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { unreadCount, markAllAsRead } = useNotifications();

    // ── Responsive detection ──
    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

        const onChange = (e) => {
            setIsMobile(e.matches);
            if (!e.matches) setIsMobileMenuOpen(false);   // closing resize → desktop
        };

        // Set initial state from media query (handles SSR mismatch)
        setIsMobile(mql.matches);

        // Modern browsers
        if (mql.addEventListener) {
            mql.addEventListener('change', onChange);
            return () => mql.removeEventListener('change', onChange);
        }
        // Safari < 14 fallback
        mql.addListener(onChange);
        return () => mql.removeListener(onChange);
    }, []);

    // ── Lock body scroll when mobile menu is open ──
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    // ── Notification service ──
    useEffect(() => {
        if (currentUser) notificationService.connect(currentUser.id);
        return () => notificationService.disconnect();
    }, [currentUser]);

    // ── Handlers ──
    const handleSidebarToggle = useCallback(() => {
        if (isMobile) {
            setIsMobileMenuOpen(prev => !prev);
        } else {
            setIsSidebarOpen(prev => !prev);
        }
    }, [isMobile]);

    const handleMobileClose = useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    return (
        <div className="min-h-screen bg-dark-950 flex overflow-x-hidden">
            {/* Sidebar */}
            <ResponsiveSidebar
                isOpen={isMobile ? isMobileMenuOpen : isSidebarOpen}
                onToggle={handleSidebarToggle}
                isMobile={isMobile}
                onMobileClose={handleMobileClose}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 w-full">
                {/* Header */}
                <header className="h-16 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 sticky top-0 z-30">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        <button
                            onClick={handleSidebarToggle}
                            className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors flex-shrink-0"
                            aria-label="Toggle menu"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg font-semibold text-white truncate">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Notifications */}
                        <NotificationDropdown />

                        {/* User Avatar */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white truncate max-w-32">
                                    {currentUser?.name}
                                </p>
                                <p className="text-xs text-dark-400 truncate max-w-32">
                                    {currentUser?.email}
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-dark-950 text-sm font-bold">
                                {currentUser?.name?.charAt(0)?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6 min-w-0">
                    <div className="w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ResponsiveLayout;

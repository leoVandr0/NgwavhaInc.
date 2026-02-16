import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Search, ShoppingCart, Heart } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import Logo from '../Logo';
import NotificationDropdown from '../notifications/NotificationDropdown';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout, isAuthenticated } = useAuthStore();
    const { cart, wishlist, fetchCart, fetchWishlist } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
            fetchWishlist();
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-dark-900 border-b border-dark-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0">
                            <Logo />
                        </Link>

                        {/* Desktop Search */}
                        <div className="hidden md:block ml-10">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-dark-400" />
                                </div>
                                <input
                                    className="block w-full pl-10 pr-3 py-2 border border-dark-700 rounded-full leading-5 bg-dark-800 text-dark-100 placeholder-dark-400 focus:outline-none focus:bg-dark-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm transition-colors w-64 lg:w-96"
                                    placeholder="Search for anything..."
                                    type="search"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center space-x-4">
                            <Link to="/courses" className="text-dark-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                Categories
                            </Link>

                            {/* Notifications dropdown – shows current user's notifications when logged in */}
                            {isAuthenticated ? (
                                <NotificationDropdown />
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-dark-300 hover:text-white p-2 relative cursor-pointer"
                                    title="Sign in to see notifications"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </Link>
                            )}

                            {isAuthenticated ? (
                                <>
                                    <Link to="/my-courses" className="text-dark-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                        My Learning
                                    </Link>

                                    <Link to="/wishlist" className="text-dark-300 hover:text-white p-2 relative">
                                        <Heart className="h-6 w-6" />
                                        {wishlist.length > 0 && (
                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary-600 rounded-full">
                                                {wishlist.length}
                                            </span>
                                        )}
                                    </Link>

                                    <Link to="/cart" className="text-dark-300 hover:text-white p-2 relative">
                                        <ShoppingCart className="h-6 w-6" />
                                        {cart.length > 0 && (
                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary-600 rounded-full">
                                                {cart.length}
                                            </span>
                                        )}
                                    </Link>

                                    {user?.role === 'instructor' && (
                                        <Link to="/instructor/dashboard" className="text-dark-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                            Instructor
                                        </Link>
                                    )}
                                    
                                    <div className="relative group">
                                        <button className="flex items-center max-w-xs bg-dark-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800 focus:ring-white">
                                            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        </button>
                                        {/* Dropdown */}
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-dark-800 ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                                            <div className="px-4 py-2 border-b border-dark-700">
                                                <p className="text-sm text-white font-bold">{user.name}</p>
                                                <p className="text-xs text-dark-400 truncate">{user.email}</p>
                                            </div>
                                            <Link to={user.role === 'instructor' ? "/teacher/profile" : "/student/profile"} className="block px-4 py-2 text-sm text-dark-300 hover:bg-dark-700">Profile</Link>
                                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-dark-300 hover:bg-dark-700">
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-dark-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                        Log in
                                    </Link>
                                    <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800 focus:ring-white"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-dark-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/courses" className="text-dark-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                            Browse Courses
                        </Link>
                        
                        {/* Mobile: Notifications (dropdown when logged in, else link to login) */}
                        {isAuthenticated ? (
                            <div className="px-3 py-2">
                                <NotificationDropdown />
                            </div>
                        ) : (
                            <Link to="/login" className="text-dark-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                Notifications (sign in)
                            </Link>
                        )}
                        
                        {isAuthenticated ? (
                            <>
                                <Link to="/my-courses" className="text-dark-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                    My Learning
                                </Link>
                                <Link to="/cart" className="text-dark-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                    Cart ({cart.length})
                                </Link>
                                <Link to="/wishlist" className="text-dark-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                    Wishlist ({wishlist.length})
                                </Link>
                                <button onClick={handleLogout} className="text-dark-300 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium">
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-dark-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                    Log in
                                </Link>
                                <Link to="/register" className="text-primary-500 block px-3 py-2 rounded-md text-base font-medium">
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

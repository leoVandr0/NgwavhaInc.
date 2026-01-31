import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Heart, ShoppingCart } from 'lucide-react';
import useCartStore from '../../store/cartStore';

const WishlistPage = () => {
    const { wishlist, fetchWishlist, removeFromWishlist, addToCart, isInCart } = useCartStore();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleMoveToCart = async (courseId) => {
        await addToCart(courseId);
        removeFromWishlist(courseId);
    };

    return (
        <div className="min-h-screen bg-dark-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-white mb-8">My Wishlist</h1>

                {wishlist.length === 0 ? (
                    <div className="text-center py-20 bg-dark-950 border border-dark-800 rounded-lg">
                        <Heart className="h-16 w-16 text-dark-700 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Your wishlist is empty</h2>
                        <p className="text-dark-400 mb-6">Save courses you want to take later.</p>
                        <Link
                            to="/courses"
                            className="inline-flex items-center px-6 py-3 bg-primary-500 text-dark-950 font-bold rounded-md hover:bg-primary-600 transition-colors"
                        >
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((item) => (
                            <div key={item.id} className="card group flex flex-col h-full">
                                <Link to={`/course/${item.course.slug}`} className="block relative aspect-video bg-dark-800 overflow-hidden">
                                    <img
                                        src={item.course.thumbnail || '/default-course.jpg'}
                                        alt={item.course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </Link>
                                <div className="p-5 flex-1 flex flex-col">
                                    <Link to={`/course/${item.course.slug}`} className="text-lg font-bold text-white mb-2 hover:text-primary-500 transition-colors line-clamp-2">
                                        {item.course.title}
                                    </Link>
                                    <p className="text-sm text-dark-400 mb-4">By {item.course.instructor?.name}</p>

                                    <div className="mt-auto pt-4 border-t border-dark-800 flex items-center justify-between gap-4">
                                        <div className="text-xl font-bold text-white">${item.course.price}</div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => removeFromWishlist(item.courseId)}
                                                className="p-2 text-dark-400 hover:text-red-500 bg-dark-800 hover:bg-dark-700 rounded-md transition-colors"
                                                title="Remove from wishlist"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveToCart(item.courseId)}
                                                className="p-2 text-primary-500 hover:text-white bg-dark-800 hover:bg-primary-600 rounded-md transition-colors"
                                                title="Move to cart"
                                            >
                                                <ShoppingCart className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;

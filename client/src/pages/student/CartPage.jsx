import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import useCartStore from '../../store/cartStore';

const CartPage = () => {
    const { cart, fetchCart, removeFromCart, loading } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const total = cart.reduce((acc, item) => acc + Number(item.course.price), 0);

    if (loading && cart.length === 0) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-20 bg-dark-950 border border-dark-800 rounded-lg">
                        <ShoppingCart className="h-16 w-16 text-dark-700 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
                        <p className="text-dark-400 mb-6">Looks like you haven't added any courses yet.</p>
                        <Link
                            to="/courses"
                            className="inline-flex items-center px-6 py-3 bg-primary-500 text-dark-950 font-bold rounded-md hover:bg-primary-600 transition-colors"
                        >
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="bg-dark-950 border border-dark-800 p-4 rounded-lg flex flex-col sm:flex-row gap-4">
                                    <div className="w-full sm:w-48 aspect-video bg-dark-800 rounded-md overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.course.thumbnail || '/default-course.jpg'}
                                            alt={item.course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <Link to={`/course/${item.course.slug}`} className="text-lg font-bold text-white hover:text-primary-500 transition-colors line-clamp-2">
                                                {item.course.title}
                                            </Link>
                                            <p className="text-sm text-dark-400 mt-1">By {item.course.instructor?.name}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <button
                                                onClick={() => removeFromCart(item.courseId)}
                                                className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" /> Remove
                                            </button>
                                            <span className="text-xl font-bold text-white">${item.course.price}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Checkout Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-dark-950 border border-dark-800 p-6 rounded-lg sticky top-24">
                                <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-dark-300">
                                        <span>Subtotal</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-dark-800 pt-3 flex justify-between text-white font-bold text-lg">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button className="w-full bg-primary-500 text-dark-950 font-bold py-3 rounded-md hover:bg-primary-600 transition-colors flex items-center justify-center gap-2">
                                    Checkout <ArrowRight className="h-5 w-5" />
                                </button>
                                <p className="text-xs text-dark-500 mt-4 text-center">
                                    30-Day Money-Back Guarantee
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;

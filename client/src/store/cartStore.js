import { create } from 'zustand';
import api from '../services/api';

const useCartStore = create((set, get) => ({
    cart: [],
    wishlist: [],
    loading: false,

    fetchCart: async () => {
        try {
            set({ loading: true });
            const { data } = await api.get('/cart');
            set({ cart: data, loading: false });
        } catch (error) {
            console.error('Failed to fetch cart', error);
            set({ loading: false });
        }
    },

    addToCart: async (courseId) => {
        try {
            const { data } = await api.post('/cart', { courseId });
            set((state) => ({ cart: [...state.cart, data] }));
            return true;
        } catch (error) {
            console.error('Failed to add to cart', error);
            return false;
        }
    },

    removeFromCart: async (courseId) => {
        try {
            await api.delete(`/cart/${courseId}`);
            set((state) => ({ cart: state.cart.filter((item) => item.courseId !== courseId) }));
        } catch (error) {
            console.error('Failed to remove from cart', error);
        }
    },

    fetchWishlist: async () => {
        try {
            const { data } = await api.get('/wishlist');
            set({ wishlist: data });
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
        }
    },

    addToWishlist: async (courseId) => {
        try {
            const { data } = await api.post('/wishlist', { courseId });
            set((state) => ({ wishlist: [...state.wishlist, data] }));
            return true;
        } catch (error) {
            console.error('Failed to add to wishlist', error);
            return false;
        }
    },

    removeFromWishlist: async (courseId) => {
        try {
            await api.delete(`/wishlist/${courseId}`);
            set((state) => ({ wishlist: state.wishlist.filter((item) => item.courseId !== courseId) }));
        } catch (error) {
            console.error('Failed to remove from wishlist', error);
        }
    },

    isInCart: (courseId) => {
        return get().cart.some(item => item.courseId === courseId);
    },

    isInWishlist: (courseId) => {
        return get().wishlist.some(item => item.courseId === courseId);
    }
}));

export default useCartStore;

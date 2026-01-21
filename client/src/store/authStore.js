import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (userData, token) => {
                set({ user: userData, token, isAuthenticated: true });
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
            },

            updateUser: (userData) => {
                set((state) => ({ user: { ...state.user, ...userData } }));
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);

export default useAuthStore;

// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const authStore = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const verifyToken = async () => {
        try {
          const response = await api.get('/auth/profile');
          setCurrentUser(response.data);
          authStore.login(response.data, token); // Sync to store
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          authStore.logout(); // Sync to store
        } finally {
          setLoading(false);
        }
      };
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(userData);
      authStore.login(userData, token); // Sync to store
      message.success('Login successful!');
      return userData;
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    authStore.logout(); // Sync to store
    navigate('/login');
  };

  const updateUser = (userData) => {
    setCurrentUser(userData);
    authStore.login(userData, localStorage.getItem('token'));
  };

  const value = {
    currentUser,
    login,
    logout,
    updateUser,
    loading,
    // Expose a simple boolean for components that check auth state
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

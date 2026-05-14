// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const navigate = useNavigate();
  const storeLogin = useAuthStore(state => state.login);
  const storeLogout = useAuthStore(state => state.logout);

  // Function to verify and refresh token
  const verifyAndRefreshToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setIsTokenValid(false);
      return false;
    }

    // Decode stored token to know who we expect (without verifying signature)
    const decodePayload = (t) => {
      try { return JSON.parse(atob(t.split('.')[1])); } catch { return null; }
    };
    const storedPayload = decodePayload(token);

    try {
      // First try to get profile with current token
      const response = await api.get('/auth/profile');
      setCurrentUser(response.data);
      storeLogin(response.data, token);
      setIsTokenValid(true);
      setLoading(false);
      return true;
    } catch (error) {
      // If 401, try to refresh the token
      if (error.response?.status === 401) {
        try {
          const refreshResponse = await api.post('/auth/refresh-token');
          const { token: newToken, user } = refreshResponse.data;

          // Guard: ensure the refreshed user is the same person we started with
          if (storedPayload && user?.id && String(user.id) !== String(storedPayload.id)) {
            console.error('Token refresh returned a different user — logging out for safety');
            localStorage.removeItem('token');
            storeLogout();
            setIsTokenValid(false);
            setLoading(false);
            return false;
          }

          localStorage.setItem('token', newToken);
          setCurrentUser(user);
          storeLogin(user, newToken);
          setIsTokenValid(true);
          setLoading(false);
          return true;
        } catch (refreshError) {
          console.error('Token refresh failed on load:', refreshError);
          localStorage.removeItem('token');
          storeLogout();
          setIsTokenValid(false);
          setLoading(false);
          return false;
        }
      } else {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        storeLogout();
        setIsTokenValid(false);
        setLoading(false);
        return false;
      }
    }
  }, [storeLogin, storeLogout]);

  useEffect(() => {
    verifyAndRefreshToken();
  }, [verifyAndRefreshToken]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(userData);
      storeLogin(userData, token);
      setIsTokenValid(true);
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
    setIsTokenValid(false);
    storeLogout();
    navigate('/login');
  };

  const updateUser = (userData) => {
    setCurrentUser(userData);
    storeLogin(userData, localStorage.getItem('token'));
  };

  // Function to manually refresh token
  const refreshUserToken = async () => {
    try {
      const existingToken = localStorage.getItem('token');
      const decodePayload = (t) => {
        try { return JSON.parse(atob(t.split('.')[1])); } catch { return null; }
      };
      const storedPayload = existingToken ? decodePayload(existingToken) : null;

      const response = await api.post('/auth/refresh-token');
      const { token, user } = response.data;

      if (storedPayload && user?.id && String(user.id) !== String(storedPayload.id)) {
        console.error('Manual token refresh returned a different user — rejecting');
        return { success: false, error: new Error('Identity mismatch') };
      }

      localStorage.setItem('token', token);
      setCurrentUser(user);
      storeLogin(user, token);
      return { success: true, user };
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      return { success: false, error };
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    updateUser,
    refreshUserToken,
    loading,
    isTokenValid,
    isAuthenticated: !!currentUser && isTokenValid
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

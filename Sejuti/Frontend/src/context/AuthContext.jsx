import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('deadlinesos_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('deadlinesos_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const data = await authService.getMe();
          setUser(data.user);
          localStorage.setItem('deadlinesos_user', JSON.stringify(data.user));
        } catch (error) {
          console.error('[Auth] Verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('deadlinesos_token', data.token);
    localStorage.setItem('deadlinesos_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (name, email, password, dailyCapacityHours, peakHours) => {
    const data = await authService.register({ name, email, password, dailyCapacityHours, peakHours });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('deadlinesos_token', data.token);
    localStorage.setItem('deadlinesos_user', JSON.stringify(data.user));
    return data;
  };

  const quickDemoLogin = async () => {
    return await login('alex.dev@university.edu', 'password123');
  };

  const updateProfile = async (updates) => {
    const data = await authService.updateProfile(updates);
    setUser(data.user);
    localStorage.setItem('deadlinesos_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('deadlinesos_token');
    localStorage.removeItem('deadlinesos_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        quickDemoLogin,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

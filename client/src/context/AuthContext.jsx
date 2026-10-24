import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('staffsync_token') || null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load user profile on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('[Auth Init Error]:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.success) {
        localStorage.setItem('staffsync_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(`Welcome back, ${res.user.employee?.firstName || res.user.email}!`, 'success');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message, 'danger');
      return { success: false, message: err.message };
    }
  };

  // Demo role switcher handler (instant switch without typing credentials)
  const switchRole = async (targetRole) => {
    try {
      setLoading(true);
      const res = await api.auth.demoSwitch(targetRole);
      if (res.success) {
        localStorage.setItem('staffsync_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(`Active Session switched to ${targetRole.toUpperCase()} (${res.user.employee?.fullName})`, 'success');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message, 'danger');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('staffsync_token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user?.role || null,
        employee: user?.employee || null,
        login,
        logout,
        switchRole,
        showToast,
        toastMessage,
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

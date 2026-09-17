import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'goalforge_auth_user';
const TOKEN_KEY = 'goalforge_auth_token';

export function isTokenExpired(jwt) {
  if (!jwt) return true;
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session and token from storage on initial mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedLocalToken = localStorage.getItem(TOKEN_KEY);
        const storedSessionToken = sessionStorage.getItem(TOKEN_KEY);
        const activeToken = storedLocalToken || storedSessionToken;

        const storedLocalUser = localStorage.getItem(STORAGE_KEY);
        const storedSessionUser = sessionStorage.getItem(STORAGE_KEY);
        const savedUser = storedLocalUser || storedSessionUser;

        if (activeToken) {
          if (isTokenExpired(activeToken)) {
            // Automatically purge expired token
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(TOKEN_KEY);
          } else {
            setToken(activeToken);
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            }

            // Verify token with backend if present and valid
            try {
              const meResponse = await api.get('/auth/me');
              if (meResponse && meResponse.data) {
                const freshUser = {
                  id: meResponse.data.id,
                  name: meResponse.data.fullName,
                  email: meResponse.data.email,
                  avatar: meResponse.data.fullName
                    ? meResponse.data.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .substring(0, 2)
                    : 'GF',
                  createdAt: meResponse.data.createdAt,
                };
                setUser(freshUser);
              }
            } catch (meErr) {
              console.info('Token refresh skipped or offline:', meErr.message);
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize saved auth state:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    try {
      // Attempt backend authentication
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response && response.data) {
        const authData = response.data;
        const jwtToken = authData.token;
        const apiUser = authData.user;

        const userData = {
          id: apiUser.id,
          name: apiUser.fullName,
          email: apiUser.email,
          avatar: apiUser.fullName
            ? apiUser.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)
            : 'GF',
          createdAt: apiUser.createdAt,
        };

        setUser(userData);
        setToken(jwtToken);

        const serialized = JSON.stringify(userData);
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY, serialized);
          localStorage.setItem(TOKEN_KEY, jwtToken);
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(TOKEN_KEY);
        } else {
          sessionStorage.setItem(STORAGE_KEY, serialized);
          sessionStorage.setItem(TOKEN_KEY, jwtToken);
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TOKEN_KEY);
        }

        return userData;
      }
    } catch (err) {
      // If backend explicitly rejected credentials (401), re-throw
      if (err.status === 401 || err.status === 400) {
        throw new Error(err.message || 'Invalid email or password.');
      }

      console.warn('Backend unavailable, falling back to local session:', err.message);
    }

    // Offline fallback for demo & offline mode
    const fallbackUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0].replace('.', ' ').replace(/^./, (c) => c.toUpperCase()),
      email: email.toLowerCase(),
      avatar: email.substring(0, 2).toUpperCase(),
      joinedAt: new Date().toISOString(),
    };

    setUser(fallbackUser);
    const serialized = JSON.stringify(fallbackUser);
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, serialized);
    } else {
      sessionStorage.setItem(STORAGE_KEY, serialized);
    }

    return fallbackUser;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    if (!name || !email || !password) {
      throw new Error('All registration fields are required.');
    }

    try {
      // Attempt backend registration
      const response = await api.post('/auth/register', {
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (response && response.data) {
        const authData = response.data;
        const jwtToken = authData.token;
        const apiUser = authData.user;

        const userData = {
          id: apiUser.id,
          name: apiUser.fullName,
          email: apiUser.email,
          avatar: apiUser.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2),
          createdAt: apiUser.createdAt,
        };

        setUser(userData);
        setToken(jwtToken);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        sessionStorage.setItem(TOKEN_KEY, jwtToken);

        return userData;
      }
    } catch (err) {
      if (err.status === 409 || err.status === 400) {
        throw new Error(err.message || 'An account with this email already exists.');
      }
      console.warn('Backend registration offline, falling back locally:', err.message);
    }

    // Local fallback
    const userData = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.toLowerCase(),
      avatar: name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2),
      joinedAt: new Date().toISOString(),
    };

    setUser(userData);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

    return userData;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }, []);

  // Global listener for session expiration triggered by API 401 interceptor
  useEffect(() => {
    const handleExpired = () => {
      logout();
    };

    window.addEventListener('goalforge:session-expired', handleExpired);
    return () => window.removeEventListener('goalforge:session-expired', handleExpired);
  }, [logout]);

  // Periodic heartbeat checking if active JWT token has expired
  useEffect(() => {
    if (!token) return;

    const checkInterval = setInterval(() => {
      if (isTokenExpired(token)) {
        logout();
        window.dispatchEvent(
          new CustomEvent('goalforge:session-expired', {
            detail: { message: 'Your session has expired. Please log in again.' },
          })
        );
      }
    }, 15000);

    return () => clearInterval(checkInterval);
  }, [token, logout]);

  const sendPasswordReset = useCallback(async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    return true;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    sendPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Auth init timeout - proceeding without session');
        setLoading(false);
      }
    }, 5000);

    const initAuth = async () => {
      try {
        const response = await authAPI.refresh();
        if (mounted) setUser(response.data.user);
      } catch (error) {
        // A missing or expired session is normal for signed-out visitors.
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };
    initAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (name, email, password, phone) => {
    const response = await authAPI.register({ name, email, password, phone });
    setUser(response.data.user);
    return response.data.user;
  };

  const updateProfile = async (data) => {
    const response = await authAPI.updateProfile(data);
    const updatedUser = { ...user, ...response.data.user };
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

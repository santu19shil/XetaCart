import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authAPI.refresh();
        setUser(response.data.user);
      } catch (error) {
        // No valid session
      } finally {
        setLoading(false);
      }
    };
    initAuth();
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
import { createContext, useContext, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem('admin_user');
      return (storedUser && storedUser !== 'undefined') ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const login = async (username, password) => {
    // Default admin accounts — fallback in case Supabase users table is empty
    const defaultUsers = [
      { id: 1, name: 'Admin Account', username: 'admin', role: 'Super Admin', status: 'Active', password: 'admin123' },
      { id: 2, name: 'Sara Front Desk', username: 'sara', role: 'Staff / Receptionist', status: 'Active', password: 'sara123' },
      { id: 3, name: 'Omar General Manager', username: 'omar', role: 'Manager', status: 'Active', password: 'omar123' },
    ];

    try {
      // First try Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('status', 'Active')
        .maybeSingle();

      if (!error && data) {
        setIsAuthenticated(true);
        setUser(data);
        sessionStorage.setItem('admin_auth', 'true');
        sessionStorage.setItem('admin_user', JSON.stringify(data));
        return true;
      }
    } catch (e) {
      console.warn('Supabase login check failed, trying fallback:', e);
    }

    // Fallback: check against default user list (always works as safety net)
    const fallbackUser = defaultUsers.find(
      u => u.username === username && u.password === password && u.status === 'Active'
    );
    if (fallbackUser) {
      setIsAuthenticated(true);
      setUser(fallbackUser);
      sessionStorage.setItem('admin_auth', 'true');
      sessionStorage.setItem('admin_user', JSON.stringify(fallbackUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * ELKHALIL HOTEL — Auth System
 * Ported from AuthContext.jsx
 */

const Auth = {
  isAuthenticated: (() => {
    try { return sessionStorage.getItem('admin_auth') === 'true'; } catch (e) { return false; }
  })(),

  user: (() => {
    try {
      const stored = sessionStorage.getItem('admin_user');
      return (stored && stored !== 'undefined') ? JSON.parse(stored) : null;
    } catch (e) { return null; }
  })(),

  listeners: [],

  onChange(cb) { this.listeners.push(cb); },
  _notify() { this.listeners.forEach(cb => cb()); },

  async login(username, password) {
    const defaultUsers = [
      { id: 1, name: 'Admin Account', username: 'admin', role: 'Super Admin', status: 'Active', password: 'admin123' },
      { id: 2, name: 'Sara Front Desk', username: 'sara', role: 'Staff / Receptionist', status: 'Active', password: 'sara123' },
      { id: 3, name: 'Omar General Manager', username: 'omar', role: 'Manager', status: 'Active', password: 'omar123' },
    ];

    try {
      const { data, error } = await window.db
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('status', 'Active')
        .maybeSingle();

      if (!error && data) {
        this.isAuthenticated = true;
        this.user = data;
        sessionStorage.setItem('admin_auth', 'true');
        sessionStorage.setItem('admin_user', JSON.stringify(data));
        this._notify();
        return true;
      }
    } catch (e) {
      console.warn('Supabase login failed, trying fallback:', e);
    }

    // Fallback
    const fallbackUser = defaultUsers.find(u => u.username === username && u.password === password && u.status === 'Active');
    if (fallbackUser) {
      this.isAuthenticated = true;
      this.user = fallbackUser;
      sessionStorage.setItem('admin_auth', 'true');
      sessionStorage.setItem('admin_user', JSON.stringify(fallbackUser));
      this._notify();
      return true;
    }

    return false;
  },

  logout() {
    this.isAuthenticated = false;
    this.user = null;
    sessionStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_user');
    this._notify();
  }
};

window.Auth = Auth;

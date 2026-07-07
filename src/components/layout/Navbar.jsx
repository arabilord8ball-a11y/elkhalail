import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStoredSettings } from '../../utils/storage';
import { FiBell, FiUser, FiMenu, FiX, FiChevronDown, FiPhone, FiGlobe, FiLock, FiSettings, FiSearch } from 'react-icons/fi';
import './Navbar.css';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/rooms', label: 'Rooms' },
  { path: '/tours', label: 'Tours' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/offers', label: 'Offers' },
  { path: '/faq', label: 'FAQ' },
  { path: '/about', label: 'About Us' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [activeGuest, setActiveGuest] = useState(null);

  useEffect(() => {
    const handleStorage = () => {
      setSettings(getStoredSettings());
      const g = localStorage.getItem('elkhalil_active_guest');
      let parsedGuest = null;
      try {
        parsedGuest = (g && g !== 'undefined') ? JSON.parse(g) : null;
      } catch (e) {
        parsedGuest = null;
      }
      setActiveGuest(parsedGuest);
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('guest-auth-change', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('guest-auth-change', handleStorage);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          {settings.logoType === 'url' ? (
            <img src={settings.logoValue} alt={settings.hotelName} className="navbar-logo-img" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          ) : (
            <span className="logo-icon">{settings.logoValue || '⚜'}</span>
          )}
          <div className="logo-text">
            <span className="logo-name">{settings.hotelName}</span>
            <span className="logo-sub">Premium Stay</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <ul className="navbar-links hide-mobile">
          {navLinks.map(link => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="navbar-right">
          <a href={`tel:${settings.phone}`} className="navbar-phone hide-mobile">
            <FiPhone size={14} />
            {settings.phone}
          </a>
          <Link 
            to="/search" 
            className="lang-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'inherit', marginRight: '8px', border: 'none', background: 'none' }}
            title="Search rooms & tours"
          >
            <FiSearch size={16} />
          </Link>
          <button className="lang-btn hide-mobile">
            <FiGlobe size={14} />
            EN
            <FiChevronDown size={12} />
          </button>
          <Link
            to={activeGuest ? "/guest/dashboard" : "/guest/portal"}
            className="navbar-phone hide-mobile"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'var(--gold)', fontWeight: 600, fontSize: '13px' }}
            title={activeGuest ? "Guest Portal" : "Guest Sign In"}
          >
            <FiUser size={14} />
            {activeGuest && activeGuest.name ? activeGuest.name.split(' ')[0] : "Guest Portal"}
          </Link>
          {isAuthenticated && (
            <Link
              to="/admin"
              className="navbar-phone hide-mobile"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'var(--gold)', fontWeight: 600, fontSize: '13px' }}
              title="Admin Dashboard"
            >
              <FiSettings size={14} />
              Dashboard
            </Link>
          )}
          <Link to="/rooms" className="btn btn-primary btn-sm">
            BOOK NOW
          </Link>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          <Link
            to={activeGuest ? "/guest/dashboard" : "/guest/portal"}
            className="mobile-nav-link"
            style={{ color: 'var(--gold)', fontWeight: 600 }}
            onClick={() => setMenuOpen(false)}
          >
            {activeGuest && activeGuest.name ? `👤 ${activeGuest.name.split(' ')[0]}` : "👤 Guest Portal"}
          </Link>

          {isAuthenticated && (
            <Link
              to="/admin"
              className="mobile-nav-link"
              style={{ color: 'var(--gold)', fontWeight: 600 }}
              onClick={() => setMenuOpen(false)}
            >
              ⚙ Dashboard
            </Link>
          )}

          <div className="mobile-menu-footer">
            <a href={`tel:${settings.phone}`}>{settings.phone}</a>
          </div>
        </div>
      )}
    </nav>
  );
}

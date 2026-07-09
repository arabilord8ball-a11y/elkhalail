import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiSearch, FiCompass, FiUser } from 'react-icons/fi';
import './BottomNav.css';

const navItems = [
  { path: '/', icon: FiHome, label: 'Home' },
  { path: '/rooms', icon: FiGrid, label: 'Rooms' },
  { path: '/search', icon: FiSearch, label: 'Search' },
  { path: '/tours', icon: FiCompass, label: 'Tours' },
  { path: '/guest/portal', icon: FiUser, label: 'My Account' },
];

export default function BottomNav() {
  const location = useLocation();

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="bottom-nav" id="bottom-nav">
      {navItems.map(item => {
        const isActive = location.pathname === item.path ||
          (item.path === '/guest/portal' && location.pathname.startsWith('/guest'));
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="bottom-nav-icon-wrap">
              <item.icon className="bottom-nav-icon" />
              {isActive && <span className="bottom-nav-dot" />}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

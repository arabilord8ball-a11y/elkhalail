import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { FiHome, FiBook, FiMap, FiPhone, FiArrowLeft } from 'react-icons/fi';
import { useEffect } from 'react';
import './NotFound.css';

const quickLinks = [
  { icon: '🛏️', label: 'Our Rooms', to: '/rooms' },
  { icon: '🗺️', label: 'Tours', to: '/tours' },
  { icon: '🎁', label: 'Offers', to: '/offers' },
  { icon: '📞', label: 'Contact', to: '/contact' },
];

export default function NotFound() {
  useEffect(() => {
    document.title = '404 — Page Not Found | Elkhalil Hotel';
  }, []);

  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <div className="notfound-page">
        <div className="notfound-bg-text">404</div>
        <div className="notfound-content">
          <div className="notfound-icon">🏨</div>
          <div className="notfound-code">404</div>
          <h1 className="notfound-title">Page Not Found</h1>
          <p className="notfound-sub">
            Sorry, the page you're looking for doesn't exist or has been moved.
            Let us help you find what you need.
          </p>

          <div className="notfound-actions">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <FiArrowLeft /> Go Back
            </button>
            <Link to="/" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiHome /> Back to Home
            </Link>
          </div>

          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16, fontWeight: 600 }}>
            OR EXPLORE
          </p>
          <div className="notfound-links">
            {quickLinks.map((l, i) => (
              <Link key={i} to={l.to} className="notfound-link-card">
                <span className="notfound-link-icon">{l.icon}</span>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

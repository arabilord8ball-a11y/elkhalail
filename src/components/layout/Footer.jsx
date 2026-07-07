import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getStoredSettings } from '../../utils/storage';
import { FiPhone, FiMail, FiMapPin, FiClock, FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import BackToTop from './BackToTop';
import WhatsAppButton from './WhatsAppButton';
import './Footer.css';

export default function Footer() {
  const [settings, setSettings] = useState(() => getStoredSettings());

  useEffect(() => {
    const handleStorage = () => setSettings(getStoredSettings());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                {settings.logoType === 'url' ? (
                  <img src={settings.logoValue} alt={settings.hotelName} className="footer-logo-img" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                ) : (
                  <span className="logo-icon">{settings.logoValue || '⚜'}</span>
                )}
                <span className="footer-logo-text">{settings.hotelName}</span>
              </Link>
              <p className="footer-desc">
                Your home away from home in Egypt. Comfort, hospitality and unforgettable experiences.
              </p>
              <div className="footer-social">
                {settings.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="social-btn"><FiFacebook /></a>}
                {settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-btn"><FiInstagram /></a>}
                {settings.twitterUrl && <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="social-btn"><FiTwitter /></a>}
                {settings.youtubeUrl && <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="social-btn"><FiYoutube /></a>}
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/rooms">Rooms</Link></li>
                <li><Link to="/tours">Tours</Link></li>
                <li><Link to="/gallery">Gallery</Link></li>
                <li><Link to="/offers">Offers</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div className="footer-col">
              <h4 className="footer-heading">Our Services</h4>
              <ul className="footer-links">
                {['Airport Transfer', 'Laundry Service', 'Room Service', 'Wake-up Call', 'Tour Assistance', 'Free Wi-Fi'].map(s => (
                  <li key={s}><span>{s}</span></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h4 className="footer-heading">Contact Us</h4>
              <ul className="footer-contact-list">
                <li><FiMapPin className="contact-icon" /><span>{settings.address}</span></li>
                <li><FiPhone className="contact-icon" /><a href={`tel:${settings.phone}`}>{settings.phone}</a></li>
                <li><FiMail className="contact-icon" /><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
                <li><FiClock className="contact-icon" /><span>Check-in: {settings.checkIn}</span></li>
                <li><FiClock className="contact-icon" /><span>Check-out: {settings.checkOut}</span></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="footer-col">
              <h4 className="footer-heading">Newsletter</h4>
              <p className="footer-newsletter-text">Subscribe to get special offers and hotel updates.</p>
              <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="Enter your email" className="newsletter-input" />
                <button type="submit" className="btn btn-primary">SUBSCRIBE</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 Elkhalil Hotel. All rights reserved.</p>
          <p style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
            Designed by <a href="https://www.facebook.com/ElAraby360D" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>El Araby 360 Digital Agency</a>
          </p>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-conditions">Terms & Conditions</Link>
          </div>
        </div>
      </div>

      {/* Floating Utilities */}
      <BackToTop />
      <WhatsAppButton />
    </footer>
  );
}

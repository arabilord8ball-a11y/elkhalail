import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiTag, FiCopy, FiCheck } from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { getStoredOffers } from '../../utils/storage';
import './Offers.css';

export default function Offers() {
  const [copiedCode, setCopiedCode] = useState(null);
  const [allOffers, setAllOffers] = useState(() => getStoredOffers());

  // Sync when Supabase data loads in background
  const syncOffers = useCallback(() => {
    setAllOffers(getStoredOffers());
  }, []);

  useEffect(() => {
    syncOffers();
    window.addEventListener('storage', syncOffers);
    return () => window.removeEventListener('storage', syncOffers);
  }, [syncOffers]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeOffers = allOffers.filter(o => o.status === 'Active');

  return (
    <div>
      <Navbar />
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80" alt="Offers" />
          <div className="page-hero-overlay" />
        </div>
        <div className="container page-hero-content">
          <nav className="breadcrumb white-breadcrumb">
            <Link to="/">Home</Link><span>›</span><span>Offers</span>
          </nav>
          <h1>Special Offers & Deals</h1>
          <p>Save more on your next stay with our exclusive offers</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="offers-grid">
            {activeOffers.map(offer => (
              <div key={offer.id} className="offer-card card">
                <div className="offer-card-header">
                  <div className="offer-icon-wrap">
                    <FiTag size={28} />
                  </div>
                  <div className="offer-discount-badge">{offer.discount} OFF</div>
                </div>
                <div className="offer-card-body">
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                  <div className="offer-details">
                    <div className="offer-detail">
                      <span className="offer-detail-label">Min. Nights</span>
                      <span className="offer-detail-value">{offer.minNights} nights</span>
                    </div>
                    <div className="offer-detail">
                      <span className="offer-detail-label">Valid Until</span>
                      <span className="offer-detail-value">{offer.validTo}</span>
                    </div>
                    <div className="offer-detail">
                      <span className="offer-detail-label">Used</span>
                      <span className="offer-detail-value">{offer.usages} times</span>
                    </div>
                  </div>
                  <div className="offer-code-row">
                    <div className="offer-code-box">
                      <span className="offer-code-label">Promo Code</span>
                      <span className="offer-code">{offer.code}</span>
                    </div>
                    <button
                      className={`copy-btn ${copiedCode === offer.code ? 'copied' : ''}`}
                      onClick={() => copyCode(offer.code)}
                    >
                      {copiedCode === offer.code ? <FiCheck /> : <FiCopy />}
                      {copiedCode === offer.code ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="offer-card-footer">
                  <Link to={`/rooms?promo=${offer.code}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    BOOK NOW & SAVE
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms Banner */}
      <section className="section-sm">
        <div className="container">
          <div className="offer-terms-banner">
            <h3>Terms & Conditions</h3>
            <ul>
              <li>• Offers cannot be combined with other promotions</li>
              <li>• Discount applies to room rate only, not taxes or fees</li>
              <li>• Must be booked directly through our website or front desk</li>
              <li>• Subject to availability</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

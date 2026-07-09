import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStoredTours, getStoredReviews } from '../../utils/storage';
import { FiChevronLeft, FiChevronRight, FiStar, FiCheckCircle, FiShield, FiPhone, FiCalendar, FiUsers, FiX } from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { tourReviews as fallbackTourReviews } from '../../data/tours';
import './TourDetail.css';

export default function TourDetail() {
  const { slug } = useParams();
  const [tours, setTours] = useState(() => getStoredTours());
  const tour = tours.find(t => t.slug === slug);
  const [mainImg, setMainImg] = useState(0);
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState('');

  const [allReviews, setAllReviews] = useState(() => getStoredReviews() || []);

  const syncReviews = useCallback(() => {
    setAllReviews(getStoredReviews() || []);
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      setTours(getStoredTours());
      syncReviews();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [syncReviews]);

  if (!tour) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
          <h2>Tour not found</h2>
          <Link to="/tours" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>Back to Tours</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Merge live reviews with static fallback for this tour
  const liveReviews = allReviews.filter(r => r.status === 'Published' && r.room === tour.name);
  const reviews = liveReviews.length > 0
    ? liveReviews.map(r => ({ ...r, name: r.guest || r.name, country: r.country || 'Guest', comment: r.review || r.comment }))
    : (fallbackTourReviews || []).filter(r => r.tourId === tour.id);
  const avgRating = reviews.length
    ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
    : tour.rating;
  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    stars: n,
    pct: Math.round((reviews.filter(r => r.rating === n).length / Math.max(reviews.length, 1)) * 100),
  }));
  const totalPrice = tour.price * guests;

  return (
    <div className="tour-detail-page">
      <Navbar />
      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link><span>›</span>
            <Link to="/tours">Tours</Link><span>›</span>
            <span>{tour.name}</span>
          </nav>

          {/* Title & Header */}
          {tour.badge && <span className="tour-badge-lg">{tour.badge}</span>}
          <h1 className="tour-detail-title" style={{ marginBottom: '8px' }}>{tour.name}</h1>
          <div className="tour-meta-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '15px' }}>
            <div className="tour-detail-meta" style={{ margin: 0 }}>
              <div className="stars-row">
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} className={s <= Math.round(parseFloat(avgRating)) ? 'star filled' : 'star'} />
                ))}
                <span className="rating-num">{avgRating}</span>
                <span className="rating-count">({tour.reviewCount} reviews)</span>
              </div>
            </div>
            <div className="tour-header-price" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gold)' }}>${tour.price}</span>
              <span style={{ fontSize: '14px', color: 'var(--gray-500)' }}>/ person</span>
            </div>
          </div>

          <div className="tour-detail-layout" style={{ paddingTop: 0 }}>
            {/* LEFT */}
            <div className="tour-detail-left">
              <p className="tour-detail-desc">{tour.description}</p>

              {/* Quick Facts */}
              <div className="tour-quick-facts">
                {[
                  { label: 'Duration', value: tour.duration, icon: '⏱' },
                  { label: 'Guide', value: tour.guide, icon: '👤' },
                  { label: 'Pickup', value: tour.pickup, icon: '🚗' },
                  { label: 'Language', value: tour.language, icon: '🌍' },
                ].map(f => (
                  <div key={f.label} className="tour-fact">
                    <span className="tour-fact-icon">{f.icon}</span>
                    <div>
                      <div className="tour-fact-value">{f.value}</div>
                      <div className="tour-fact-label">{f.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overview */}
              <div className="tour-section">
                <h2>Overview</h2>
                <p>{tour.longDescription}</p>
              </div>

              {/* Highlights */}
              <div className="tour-section">
                <h2>Tour Highlights</h2>
                <div className="highlights-2col">
                  {(tour.highlights || ['Visit Ancient Monuments', 'Scenic Photos', 'Expert Local Guide']).map((h, i) => (
                    <div key={i} className="highlight-item">
                      <FiCheckCircle className="highlight-icon" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itinerary */}
              <div className="tour-section">
                <h2>Itinerary</h2>
                <div className="itinerary-list">
                  {(tour.itinerary || [
                    { time: '08:00 AM', title: 'Pickup', desc: 'Pickup from hotel.' },
                    { time: '12:00 PM', title: 'Return', desc: 'Return back to hotel.' }
                  ]).map((step, i) => (
                    <div key={i} className="itinerary-item">
                      <div className="itinerary-time">{step.time}</div>
                      <div className="itinerary-dot" />
                      <div className="itinerary-content">
                        <div className="itinerary-title">{step.title}</div>
                        <div className="itinerary-desc">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included / Not Included */}
              <div className="tour-section">
                <div className="included-grid">
                  <div>
                    <h3>What's Included</h3>
                    <ul className="included-list green">
                      {(tour.included || ['Hotel transfer', 'Guide', 'Water']).map((item, i) => (
                        <li key={i}><FiCheckCircle /> {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>What's Not Included</h3>
                    <ul className="included-list red">
                      {(tour.excluded || ['Personal expenses', 'Tips']).map((item, i) => (
                        <li key={i}><FiX /> {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="tour-section">
                <div className="flex-between" style={{ marginBottom: '20px' }}>
                  <h2 style={{ margin: 0 }}>Guest Reviews</h2>
                  <a href="#" className="view-all-link">View all reviews →</a>
                </div>
                <div className="reviews-summary">
                  <div className="rating-big">
                    <div className="rating-big-num">{avgRating}</div>
                    <div className="rating-big-label">Excellent</div>
                    <div className="rating-big-count">Based on {tour.reviewCount} reviews</div>
                  </div>
                  <div className="rating-bars">
                    {ratingDist.map(d => (
                      <div key={d.stars} className="rating-bar-row">
                        <span>{d.stars}★</span>
                        <div className="rating-bar-track">
                          <div className="rating-bar-fill" style={{ width: `${d.pct}%` }} />
                        </div>
                        <span>{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="tour-reviews-grid">
                  {(reviews.length > 0 ? reviews : fallbackTourReviews.slice(0, 3)).map(rev => (
                    <div key={rev.id} className="tour-review-card">
                      <div className="review-item-header">
                        <div className="review-avatar-sm">{rev.avatar}</div>
                        <div>
                          <div className="review-item-name">{rev.name}</div>
                          <div className="review-item-meta">{rev.country} · {rev.date}</div>
                        </div>
                      </div>
                      <div className="stars-row">
                        {[1,2,3,4,5].map(s => (
                          <FiStar key={s} className={s <= rev.rating ? 'star filled' : 'star'} />
                        ))}
                      </div>
                      <p>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="tour-detail-right">
              {/* Gallery */}
              <div className="tour-gallery">
                {(() => {
                  const imgs = tour.images && tour.images.length > 0 
                    ? tour.images 
                    : ['https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80'];
                  const safeImgIdx = mainImg < imgs.length ? mainImg : 0;
                  return (
                    <>
                      <div className="gallery-main">
                        <button className="gallery-nav prev" onClick={() => setMainImg(i => (i - 1 + imgs.length) % imgs.length)}>
                          <FiChevronLeft />
                        </button>
                        <img src={imgs[safeImgIdx]} alt={tour.name} />
                        <button className="gallery-nav next" onClick={() => setMainImg(i => (i + 1) % imgs.length)}>
                          <FiChevronRight />
                        </button>
                      </div>
                      <div className="gallery-thumbs">
                        {imgs.slice(0, 4).map((img, i) => (
                          <button key={i} className={`gallery-thumb ${safeImgIdx === i ? 'active' : ''}`} onClick={() => setMainImg(i)}>
                            <img src={img} alt={`View ${i + 1}`} />
                          </button>
                        ))}
                        {imgs.length > 4 && (
                          <div className="gallery-more">+{imgs.length - 4}</div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Booking Widget */}
              <div className="tour-booking-widget">
                <div className="tbw-price">
                  <span className="tbw-amount">${tour.price}</span>
                  <span className="tbw-unit">/ person</span>
                </div>
                <div className="tbw-guarantee">
                  <FiShield /> Best Price Guarantee
                </div>

                <button className="btn btn-primary tbw-main-btn">CHECK AVAILABILITY</button>

                <div className="tbw-field">
                  <label><FiCalendar /> Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} placeholder="Select date" />
                </div>

                <div className="tbw-field">
                  <label><FiUsers /> Guests</label>
                  <div className="guest-stepper">
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => setGuests(g => Math.max(1, g - 1))}
                      disabled={guests <= 1}
                      aria-label="Decrease guests"
                    >−</button>
                    <span className="stepper-value">
                      {guests} {guests === 1 ? 'Adult' : 'Adults'}
                    </span>
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => setGuests(g => Math.min(20, g + 1))}
                      disabled={guests >= 20}
                      aria-label="Increase guests"
                    >+</button>
                  </div>
                </div>

                {guests > 1 && (
                  <div className="tbw-total">
                    Total: <strong>${totalPrice}</strong> ({guests} × ${tour.price})
                  </div>
                )}

                <div className="tbw-features">
                  {[
                    { icon: FiCheckCircle, label: 'Free Cancellation', sub: 'Cancel up to 24 hours in advance for a full refund.' },
                    { icon: FiCheckCircle, label: 'Instant Confirmation', sub: 'Receive your booking confirmation instantly.' },
                    { icon: FiShield, label: 'Secure Payment', sub: 'Your information is safe with us.' },
                  ].map((f, i) => (
                    <div key={i} className="tbw-feature">
                      <f.icon className="tbw-feature-icon" />
                      <div>
                        <div className="tbw-feature-title">{f.label}</div>
                        <div className="tbw-feature-sub">{f.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="tbw-help">
                  <div className="tbw-help-title">Need Help?</div>
                  <div className="tbw-help-sub">Our travel experts are here for you.</div>
                  <a href="tel:+201234567890" className="bw-phone"><FiPhone /> +20 123 456 7890</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

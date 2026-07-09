import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FiWifi, FiClock, FiMapPin, FiStar, FiChevronLeft, FiChevronRight,
  FiArrowRight, FiShield, FiCheckCircle, FiHome, FiUsers, FiSmile, FiMaximize
} from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BookingForm from '../../components/home/BookingForm';
import { getStoredRooms, getStoredSettings, getStoredTours, getStoredReviews, getRoomCalendar } from '../../utils/storage';
import { tours as fallbackTours } from '../../data/tours';
import { roomReviews as fallbackReviews } from '../../data/rooms';
import './Home.css';

const stats = [
  { icon: FiHome, value: '10', label: 'Rooms' },
  { icon: FiClock, value: '24/7', label: 'Reception' },
  { icon: FiWifi, value: 'Free', label: 'Wi-Fi' },
  { icon: FiCheckCircle, value: 'Daily', label: 'Housekeeping' },
  { icon: FiShield, value: 'Best Rate', label: 'Guarantee' },
  { icon: FiCheckCircle, value: 'Secure', label: 'Book Now' },
];

const whyUs = [
  { icon: FiMapPin, title: 'Prime Location', desc: 'Close to main attractions' },
  { icon: FiHome, title: 'Comfort & Clean', desc: 'Well-maintained rooms' },
  { icon: FiSmile, title: 'Friendly Staff', desc: 'Always here for you' },
  { icon: FiShield, title: 'Best Price', desc: 'Guarantee' },
];

export default function Home() {
  const [rooms, setRooms] = useState(() => getStoredRooms());

  const getTodayPrice = (roomId, basePrice) => {
    const calendar = getRoomCalendar(roomId) || {};
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (calendar[dateStr] && calendar[dateStr].price !== undefined) {
      return calendar[dateStr].price;
    }
    return basePrice;
  };

  const [settings, setSettings] = useState(() => getStoredSettings());
  const [tours, setTours] = useState(() => getStoredTours());
  const [reviews, setReviews] = useState(() => {
    const live = getStoredReviews() || [];
    const published = live.filter(r => r.status === 'Published');
    const normalized = published.map(r => ({
      ...r,
      name: r.name || r.guest,
      comment: r.comment || r.review,
      country: r.country || 'Guest',
      avatar: r.avatar || (r.guest || 'G').slice(0, 2).toUpperCase(),
    }));
    return normalized.length > 0 ? normalized : fallbackReviews;
  });
  const [roomIndex, setRoomIndex] = useState(0);
  const [tourIndex, setTourIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const visibleRooms = 4;
  const visibleTours = 4;

  const roomsCarouselRef = useRef(null);
  const toursCarouselRef = useRef(null);

  useEffect(() => {
    const handleStorage = () => {
      setRooms(getStoredRooms());
      setSettings(getStoredSettings());
      setTours(getStoredTours());
      const live = getStoredReviews() || [];
      const published = live.filter(r => r.status === 'Published');
      const normalized = published.map(r => ({
        ...r,
        name: r.name || r.guest,
        comment: r.comment || r.review,
        country: r.country || 'Guest',
        avatar: r.avatar || (r.guest || 'G').slice(0, 2).toUpperCase(),
      }));
      if (normalized.length > 0) setReviews(normalized);
    };
    handleStorage();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const nextRoom = () => {
    if (isMobile && roomsCarouselRef.current) {
      roomsCarouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    } else {
      setRoomIndex(i => Math.min(i + 1, Math.max(0, rooms.length - visibleRooms)));
    }
  };

  const prevRoom = () => {
    if (isMobile && roomsCarouselRef.current) {
      roomsCarouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    } else {
      setRoomIndex(i => Math.max(i - 1, 0));
    }
  };

  const nextTour = () => {
    if (isMobile && toursCarouselRef.current) {
      toursCarouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    } else {
      setTourIndex(i => Math.min(i + 1, Math.max(0, tours.length - visibleTours)));
    }
  };

  const prevTour = () => {
    if (isMobile && toursCarouselRef.current) {
      toursCarouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    } else {
      setTourIndex(i => Math.max(i - 1, 0));
    }
  };

  const nextReview = () => setReviewIndex(i => (i + 1) % reviews.length);
  const prevReview = () => setReviewIndex(i => (i - 1 + reviews.length) % reviews.length);

  const visibleReviews = reviews.length > 0 ? [
    reviews[reviewIndex % reviews.length],
    reviews[(reviewIndex + 1) % reviews.length],
    reviews[(reviewIndex + 2) % reviews.length],
  ] : [];

  return (
    <div className="home-page">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src={settings.imgHeroBg || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80"}
            alt={settings.hotelName}
            className="hero-img"
          />
          <div className="hero-overlay" />
        </div>
        <div className="container hero-content">
          <p className="hero-eyebrow">Welcome to</p>
          <h1 className="hero-title">{settings.hotelName}</h1>
          <p className="hero-subtitle">
            {settings.heroSubtitle}
          </p>
          <div className="hero-features">
            {[
              { icon: FiHome, label: '10 Cozy Rooms' },
              { icon: FiWifi, label: 'Free Wi-Fi' },
              { icon: FiClock, label: '24/7 Reception' },
              { icon: FiMapPin, label: 'Airport Transfer' },
            ].map(f => (
              <div key={f.label} className="hero-feature">
                <f.icon />
                <span>{f.label}</span>
              </div>
            ))}
          </div>
          <div className="hero-booking-inline">
            <BookingForm />
          </div>
        </div>
      </section>

      {/* ===== ROOMS SECTION ===== */}
      <section className="section first-section">
        <div className="container">
          <div className="flex-between mb-section-header">
            <div>
              <div className="section-tag">OUR ROOMS</div>
              <h2 className="section-title">Stay in Comfort</h2>
              <p className="section-subtitle">
                Choose from our 10 comfortable and well-equipped rooms.
              </p>
            </div>
            <Link to="/rooms" className="btn btn-outline hide-mobile">VIEW ALL ROOMS</Link>
          </div>

          <div className="carousel-wrapper">
            <button className="carousel-btn prev" onClick={prevRoom} disabled={roomIndex === 0}>
              <FiChevronLeft />
            </button>
            <div className="rooms-carousel" ref={roomsCarouselRef}>
              {(isMobile ? rooms : rooms.slice(roomIndex, roomIndex + visibleRooms)).map(room => (
                <div key={room.id} className="room-card card">
                  <div className="room-card-img">
                    <img src={(room.images && room.images.length > 0) ? room.images[0] : "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&q=70"} alt={room.name} />
                    <div className="room-card-type">{room.type}</div>
                  </div>
                  <div className="room-card-body">
                    <h3>{room.name}</h3>
                    <div className="room-card-meta">
                      <span><FiUsers size={13} /> {room.capacity}</span>
                      <span><FiHome size={13} /> {room.beds}</span>
                      <span><FiMaximize size={13} /> {room.size}m²</span>
                    </div>
                    <div className="room-card-footer">
                      <div className="room-price">
                        <span className="price-amount">${getTodayPrice(room.id, room.price)}</span>
                        <span className="price-unit">/night</span>
                      </div>
                      <Link to={`/rooms/${room.slug}`} className="btn btn-outline btn-sm">
                        VIEW DETAILS
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-btn next" onClick={nextRoom} disabled={roomIndex >= rooms.length - visibleRooms}>
              <FiChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <s.icon className="stat-icon" />
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TOURS SECTION ===== */}
      <section className="section tours-section">
        <div className="container">
          <div className="flex-between mb-section-header">
            <div>
              <div className="section-tag">EXPLORE WITH US</div>
              <h2 className="section-title">Tours & Experiences</h2>
              <p className="section-subtitle">
                Discover the beauty and history of Egypt with our carefully selected tours.
              </p>
            </div>
            <Link to="/tours" className="btn btn-outline hide-mobile">VIEW ALL TOURS</Link>
          </div>

          <div className="carousel-wrapper">
            <button className="carousel-btn prev" onClick={prevTour} disabled={tourIndex === 0}>
              <FiChevronLeft />
            </button>
            <div className="tours-carousel" ref={toursCarouselRef}>
              {(isMobile ? tours : tours.slice(tourIndex, tourIndex + visibleTours)).map(tour => (
                <Link key={tour.id} to={`/tours/${tour.slug}`} className="tour-card card">
                  <div className="tour-card-img">
                    <img src={(tour.images && tour.images.length > 0) ? tour.images[0] : "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=500&q=70"} alt={tour.name} />
                    {tour.badge && <span className="tour-badge">{tour.badge}</span>}
                  </div>
                  <div className="tour-card-body">
                    <h3>{tour.name}</h3>
                    <div className="tour-card-meta">
                      <span>⏱ {tour.durationType}</span>
                      <span>👤 {tour.guide && typeof tour.guide === 'string' ? tour.guide.split(' ').slice(0, 2).join(' ') : 'Local Expert'}</span>
                    </div>
                    <div className="tour-card-footer">
                      <div className="tour-price">
                        <span className="price-amount">${tour.price}</span>
                        <span className="price-unit">/person</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <button className="carousel-btn next" onClick={nextTour} disabled={tourIndex >= tours.length - visibleTours}>
              <FiChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* ===== SPECIAL OFFER BANNER ===== */}
      <section className="offer-banner">
        <div className="container">
          <div className="offer-banner-inner">
            <div className="offer-banner-icon">🎁</div>
            <div className="offer-banner-text">
              <span className="offer-label">SPECIAL OFFER</span>
              <h3>Book Direct & Save More</h3>
              <p>Get up to 15% off when you book directly through our website.</p>
            </div>
            <Link to="/offers" className="btn btn-primary offer-cta">
              BOOK NOW & SAVE
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="section why-section">
        <div className="container">
          <div className="why-header">
            <div className="section-tag">WHY CHOOSE US</div>
            <h2 className="section-title">Experience Egyptian Hospitality</h2>
            <p className="section-subtitle">
              We are dedicated to making your stay comfortable and memorable.
            </p>
          </div>
          <div className="why-grid">
            {whyUs.map((item, i) => (
              <div key={i} className="why-card">
                <div className="why-icon">
                  <item.icon size={24} />
                </div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section className="section reviews-section">
        <div className="container">
          <div className="flex-between mb-section-header">
            <div>
              <div className="section-tag">GUESTS LOVE US</div>
              <h2 className="section-title">What Our Guests Say</h2>
            </div>
            <div className="carousel-controls">
              <button className="carousel-ctrl-btn" onClick={prevReview}><FiChevronLeft /></button>
              <button className="carousel-ctrl-btn" onClick={nextReview}><FiChevronRight /></button>
            </div>
          </div>
          <div className="reviews-grid">
            {visibleReviews.map((review, i) => (
              <div key={i} className="review-card card">
                <div className="review-header">
                  <div className="review-avatar">{review.avatar}</div>
                  <div>
                    <div className="review-name">{review.name}</div>
                    <div className="review-country">📍 {review.country}</div>
                  </div>
                </div>
                <div className="stars">{'⭐'.repeat(review.rating)}</div>
                <p className="review-text">"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

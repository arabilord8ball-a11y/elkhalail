import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStoredSettings, getStoredTours } from '../../utils/storage';
import { FiSearch, FiClock, FiUsers } from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './Tours.css';

const categories = ['All Tours', 'Cultural', 'Adventure'];
const durations = ['All Durations', 'Half Day', 'Full Day', 'Evening'];

export default function Tours() {
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [tours, setTours] = useState(() => getStoredTours());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Tours');
  const [duration, setDuration] = useState('All Durations');

  useEffect(() => {
    const handleStorage = () => {
      setSettings(getStoredSettings());
      setTours(getStoredTours());
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const filtered = tours.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All Tours' || t.category === category;
    const matchDur = duration === 'All Durations' || t.durationType === duration;
    return matchSearch && matchCat && matchDur;
  });

  return (
    <div>
      <Navbar />
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src={settings.imgToursHero || "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&q=80"} alt="Tours" />
          <div className="page-hero-overlay" />
        </div>
        <div className="container page-hero-content">
          <nav className="breadcrumb white-breadcrumb">
            <Link to="/">Home</Link><span>›</span><span>Tours</span>
          </nav>
          <h1>Tours & Experiences</h1>
          <p>Discover the beauty and history of Egypt</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Filters */}
          <div className="tours-filters">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search tours..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-group">
              <span className="filter-label">Category:</span>
              <div className="filter-tabs">
                {categories.map(c => (
                  <button key={c} className={`filter-tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <span className="filter-label">Duration:</span>
              <div className="filter-tabs">
                {durations.map(d => (
                  <button key={d} className={`filter-tab ${duration === d ? 'active' : ''}`} onClick={() => setDuration(d)}>{d}</button>
                ))}
              </div>
            </div>
          </div>

          <p className="results-count">Showing <strong>{filtered.length}</strong> tours</p>

          {/* Tours Grid */}
          <div className="tours-list-grid">
            {filtered.map(tour => (
              <Link key={tour.id} to={`/tours/${tour.slug}`} className="tour-list-card card">
                <div className="tour-list-img">
                  <img src={tour.images[0]} alt={tour.name} />
                  {tour.badge && <span className="tour-badge">{tour.badge}</span>}
                  <div className="tour-category-badge">{tour.category}</div>
                </div>
                <div className="tour-list-body">
                  <div className="tour-list-header">
                    <h3>{tour.name}</h3>
                    <div className="tour-list-rating">
                      ⭐ {tour.rating}
                      <span>({tour.reviewCount})</span>
                    </div>
                  </div>
                  <p className="tour-list-desc">{tour.description}</p>
                  <div className="tour-list-facts">
                    <span><FiClock size={13} /> {tour.duration}</span>
                    <span>⏱ {tour.durationType}</span>
                    <span>👤 {tour.guide}</span>
                    <span>🌍 {tour.language}</span>
                  </div>
                  <div className="tour-list-footer">
                    <div>
                      <div className="tour-price-big">${tour.price}<span>/person</span></div>
                      <div className="tour-bookings">{tour.bookings} Bookings</div>
                    </div>
                    <span className="btn btn-primary btn-sm">BOOK NOW</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="no-results">
              <p>No tours found.</p>
              <button onClick={() => { setSearch(''); setCategory('All Tours'); setDuration('All Durations'); }} className="btn btn-outline">Clear Filters</button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}

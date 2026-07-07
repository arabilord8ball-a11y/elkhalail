import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiSearch, FiChevronDown, FiWifi, FiUsers, FiHome, FiStar, FiMaximize, FiEye } from 'react-icons/fi';
import { FaBed } from 'react-icons/fa';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BookingForm from '../../components/home/BookingForm';
import { getStoredRooms, getStoredSettings, getRoomCalendar } from '../../utils/storage';
import './Rooms.css';

const roomTypes = ['All Room Types', 'Standard', 'Deluxe', 'Superior', 'Family'];

export default function Rooms() {
  const [rooms, setRooms] = useState(() => getStoredRooms());
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Room Types');
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const checkInParam = queryParams.get('checkIn');
  const checkOutParam = queryParams.get('checkOut');

  useEffect(() => {
    const handleStorage = () => {
      setRooms(getStoredRooms());
      setSettings(getStoredSettings());
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const getLocalYYYYMMDD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNightlyPrice = (roomId, basePrice) => {
    if (!checkInParam) return basePrice;
    const calendar = getRoomCalendar(roomId) || {};
    
    let dateStr = checkInParam;
    if (/[a-zA-Z]/.test(checkInParam)) {
      const d = new Date(checkInParam);
      dateStr = getLocalYYYYMMDD(d);
    }
    
    if (calendar[dateStr] && calendar[dateStr].price !== undefined) {
      return calendar[dateStr].price;
    }
    return basePrice;
  };

  const isRoomUnavailable = (roomId) => {
    if (!checkInParam || !checkOutParam) return false;
    const start = new Date(checkInParam + 'T00:00:00');
    const end = new Date(checkOutParam + 'T00:00:00');
    if (end <= start) return false;

    const calendar = getRoomCalendar(roomId) || {};
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const dateStr = getLocalYYYYMMDD(current);
      if (calendar[dateStr]?.closed) {
        return true;
      }
    }
    return false;
  };

  const filtered = rooms.filter(r => {
    const matchSearch = (r.name || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All Room Types' || r.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="rooms-page">
      <Navbar />

      {/* Header */}
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src={settings.imgRoomsHero || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80"} alt="Rooms" />
          <div className="page-hero-overlay" />
        </div>
        <div className="container page-hero-content">
          <nav className="breadcrumb white-breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Rooms</span>
          </nav>
          <h1>Our Rooms</h1>
          <p>Choose from our comfortable and well-equipped rooms</p>
        </div>
      </div>

      {/* Booking Bar */}
      <div className="rooms-booking-bar">
        <div className="container">
          <BookingForm compact />
        </div>
      </div>

      {/* Filters */}
      <section className="section">
        <div className="container">
          <div className="rooms-filters">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-tabs">
              {roomTypes.map(type => (
                <button
                  key={type}
                  className={`filter-tab ${filter === type ? 'active' : ''}`}
                  onClick={() => setFilter(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <p className="results-count">
            Showing <strong>{filtered.length}</strong> rooms
          </p>

          {/* Rooms Grid */}
          <div className="rooms-grid">
            {filtered.map(room => {
              const isUnavailable = isRoomUnavailable(room.id);
              const statusText = isUnavailable ? 'Currently Unavailable' : (room.status || 'Available');
              const statusClass = isUnavailable ? 'occupied' : (room.status || 'Available').toLowerCase();

              return (
                <div key={room.id} className={`room-list-card card ${isUnavailable ? 'room-card-unavailable' : ''}`}>
                  {/* Image */}
                  <div className="room-list-img">
                    <img src={(room.images && room.images.length > 0) ? room.images[0] : "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&q=70"} alt={room.name} />
                    <div className={`room-status-badge ${statusClass}`} style={isUnavailable ? { background: '#ef4444', color: '#ffffff' } : {}}>
                      {statusText}
                    </div>
                    <div className="room-number">#{room.number}</div>
                  </div>

                  {/* Info */}
                  <div className="room-list-body">
                    <div className="room-list-header">
                      <div>
                        <span className="room-type-tag">{room.type}</span>
                        <h3>{room.name}</h3>
                      </div>
                      <div className="room-rating">
                        <FiStar className="star-icon" />
                        {room.rating}
                        <span>({room.reviewCount})</span>
                      </div>
                    </div>

                    <p className="room-desc">{room.description}</p>

                    <div className="room-details-row">
                      <div className="room-detail-item">
                        <FiMaximize className="detail-icon" />
                        <span>{room.size}m² Room Size</span>
                      </div>
                      <div className="room-detail-item">
                        <FaBed className="detail-icon" />
                        <span>{room.beds}</span>
                      </div>
                      <div className="room-detail-item">
                        <FiUsers className="detail-icon" />
                        <span>{room.capacity} Guests Max</span>
                      </div>
                      <div className="room-detail-item">
                        <FiEye className="detail-icon" />
                        <span>{room.view}</span>
                      </div>
                    </div>

                    <div className="room-amenities-row">
                      {(room.amenities || []).slice(0, 4).map((a, i) => (
                        <span key={i} className="amenity-tag">{a}</span>
                      ))}
                      {(room.amenities || []).length > 4 && (
                        <span className="amenity-tag more">+{(room.amenities || []).length - 4} more</span>
                      )}
                    </div>

                    <div className="room-list-footer">
                      <div>
                        <div className="room-price-main">
                          ${getNightlyPrice(room.id, room.price)}<span>/night</span>
                        </div>
                        <div className="room-price-note">Includes taxes & breakfast</div>
                      </div>
                      <Link
                        to={`/rooms/${room.slug}${location.search}`}
                        className="btn btn-primary"
                      >
                        VIEW DETAILS
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="no-results">
              <p>No rooms found matching your search.</p>
              <button onClick={() => { setSearch(''); setFilter('All Room Types'); }} className="btn btn-outline">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

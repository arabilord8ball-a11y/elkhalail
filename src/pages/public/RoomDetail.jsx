import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiChevronLeft, FiChevronRight, FiStar, FiCheck, FiX,
  FiWifi, FiUsers, FiHome, FiShield, FiPhone, FiCheckCircle,
  FiMaximize, FiEye, FiTv, FiLock, FiWind, FiCoffee, FiCalendar, FiGrid
} from 'react-icons/fi';
import { FaBed, FaShower, FaWineGlass, FaIceCream, FaTshirt } from 'react-icons/fa';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { getStoredRooms, getRoomCalendar, getStoredSettings, getStoredReviews, saveStoredReviews, getStoredBookings } from '../../utils/storage';
import './RoomDetail.css';

const TABS = ['Overview', 'Amenities', 'Room Details', 'Policies', 'Reviews'];

const AmenityIcon = ({ name }) => {
  const iconMap = {
    'Free Wi-Fi': FiWifi,
    'Air Conditioning': FiWind,
    'Flat-screen TV': FiTv,
    'Minibar': FaWineGlass,
    'Coffee & Tea': FiCoffee,
    'In-room Safe': FiLock,
    'Hair Dryer': FiWind,
    'Bathroom Amenities': FaShower,
    'Slippers': FaIceCream,
    'Washrobe': FaTshirt,
    'Private Bathroom': FaShower,
    'Daily Housekeeping': FiHome,
    'Mini Fridge': FiGrid,
    'Extra Bed Available': FaBed,
    'Pool View': FiEye,
  };
  const Icon = iconMap[name] || FiCheckCircle;
  return <Icon className="amenity-icon-svg" />;
};

export default function RoomDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState(() => getStoredRooms());
  const [settings, setSettings] = useState(() => getStoredSettings());
  const room = rooms.find(r => r.slug === slug);

   const [activeTab, setActiveTab] = useState('Overview');
  const [mainImg, setMainImg] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [guests, setGuests] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const guestsParam = params.get('guests');
    if (guestsParam) {
      const match = guestsParam.match(/\d+/);
      if (match) return Math.max(1, parseInt(match[0], 10));
    }
    return 2;
  });
  const [form, setForm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      checkIn: params.get('checkIn') || '',
      checkOut: params.get('checkOut') || '',
      name: '',
      email: '',
      review: '',
      bookingCode: ''
    };
  });
  const [customRates, setCustomRates] = useState({});
  const [allReviews, setAllReviews] = useState(() => getStoredReviews() || []);

  useEffect(() => {
    if (room) {
      setCustomRates(getRoomCalendar(room.id));
    }
  }, [room]);

  useEffect(() => {
    const handleStorage = () => {
      setRooms(getStoredRooms());
      setSettings(getStoredSettings());
      const updatedReviews = getStoredReviews();
      if (updatedReviews) setAllReviews(updatedReviews);
      if (room) {
        setCustomRates(getRoomCalendar(room.id));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [room]);

  // Dynamic Price calculation based on date range selected
  const getNightlyPrice = (dateStr) => {
    if (customRates && customRates[dateStr]) {
      return customRates[dateStr].price;
    }
    return room ? room.price : 0;
  };

  const isRoomClosed = (dateStr) => {
    if (customRates && customRates[dateStr]) {
      return customRates[dateStr].closed;
    }
    return false;
  };

  const parseSafeDate = (str) => {
    if (!str) return new Date();
    if (/[a-zA-Z]/.test(str)) {
      const d = new Date(str);
      d.setHours(0,0,0,0);
      return d;
    }
    return new Date(str + 'T00:00:00');
  };

  const isDateBookedOrClosed = (dateStr) => {
    if (isRoomClosed(dateStr)) return true;
    
    // Check bookings database
    const bookings = getStoredBookings() || [];
    const dateToCheck = new Date(dateStr + 'T00:00:00');
    
    return bookings.some(b => {
      if (b.status === 'Cancelled') return false;
      
      const matchesRoom = b.roomId 
        ? (Number(b.roomId) === Number(room.id) && b.room === room.name)
        : (b.room === room.name);
        
      if (!matchesRoom) return false;
      
      const checkInDate = parseSafeDate(b.checkIn);
      const checkOutDate = parseSafeDate(b.checkOut);
      
      return dateToCheck >= checkInDate && dateToCheck < checkOutDate;
    });
  };

  const handleCalendarDateClick = (formattedDate) => {
    if (isDateBookedOrClosed(formattedDate)) {
      alert('This date is already booked or blocked.');
      return;
    }
    
    setForm(p => {
      // 1. Both checkIn and checkOut selected, or none selected: start fresh
      if ((p.checkIn && p.checkOut) || (!p.checkIn && !p.checkOut)) {
        return { ...p, checkIn: formattedDate, checkOut: '' };
      }
      
      // 2. checkIn selected, checkOut not selected
      if (p.checkIn && !p.checkOut) {
        const start = new Date(p.checkIn + 'T00:00:00');
        const end = new Date(formattedDate + 'T00:00:00');
        
        // If clicked date is before or same as checkIn, set it as checkIn
        if (end <= start) {
          return { ...p, checkIn: formattedDate, checkOut: '' };
        }
        
        // Check if there are any blocked or booked dates in the selected range
        let hasBlocked = false;
        const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
        for (let i = 0; i < days; i++) {
          const current = new Date(start);
          current.setDate(start.getDate() + i);
          const dateStr = getLocalYYYYMMDD(current);
          if (isDateBookedOrClosed(dateStr)) {
            hasBlocked = true;
          }
        }
        
        if (hasBlocked) {
          alert('Verification Failed: The selected range contains dates that are booked or blocked. Please select another check-out date.');
          return { ...p, checkIn: formattedDate, checkOut: '' };
        }
        
        return { ...p, checkOut: formattedDate };
      }
      
      return p;
    });
  };

  const renderMiniAvailabilityCalendar = () => {
    const dates = [];
    const temp = new Date();
    const todayDayOfWeek = temp.getDay(); // 0 for Sunday, 6 for Saturday
    
    // Generate dates for the next 28 days starting from today
    for (let i = 0; i < 28; i++) {
      dates.push(new Date(temp));
      temp.setDate(temp.getDate() + 1);
    }

    return (
      <div className="mini-availability-calendar">
        <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-h)' }}>
          <FiCalendar style={{ color: 'var(--gold)' }} />
          Room Availability & Booking (Next 28 Days)
        </h4>
        <p style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '15px' }}>
          Click on calendar dates directly to select your Check-in and Check-out.
        </p>
        <div className="mac-grid">
          {['S','M','T','W','T','F','S'].map((day, idx) => (
            <div key={idx} className="mac-day-header">{day}</div>
          ))}
          
          {/* Pad the grid so today aligns with its actual day of the week column */}
          {Array.from({ length: todayDayOfWeek }).map((_, idx) => (
            <div key={`pad-${idx}`} />
          ))}

          {dates.map((d, idx) => {
            const formatted = getLocalYYYYMMDD(d);
            const isClosed = isDateBookedOrClosed(formatted);
            const isToday = formatted === today;
            
            const isCheckIn = form.checkIn === formatted;
            const isCheckOut = form.checkOut === formatted;
            let isBetween = false;
            
            if (form.checkIn && form.checkOut) {
              const start = new Date(form.checkIn + 'T00:00:00');
              const end = new Date(form.checkOut + 'T00:00:00');
              isBetween = d > start && d < end;
            }

            let cellClass = 'mac-day-cell';
            if (isClosed) {
              cellClass += ' blocked';
            } else {
              cellClass += ' available';
            }
            
            if (isToday) cellClass += ' today';
            if (isCheckIn) cellClass += ' selected-checkin';
            if (isCheckOut) cellClass += ' selected-checkout';
            if (isBetween) cellClass += ' selected-between';

            let title = 'Available';
            if (isClosed) title = 'Booked / Blocked';
            if (isCheckIn) title = 'Your Check-in Date';
            if (isCheckOut) title = 'Your Check-out Date';

            return (
              <div 
                key={idx} 
                className={cellClass}
                onClick={() => handleCalendarDateClick(formatted)}
                title={`${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${title} - $${getNightlyPrice(formatted)}`}
              >
                <span>{d.getDate()}</span>
                <span className="mac-day-price">${getNightlyPrice(formatted)}</span>
              </div>
            );
          })}
        </div>
        <div className="mac-legend">
          <span className="mac-legend-item">
            <span className="mac-legend-color" style={{ background: '#e6fcf5', border: '1px solid #0ca678' }} /> Available
          </span>
          <span className="mac-legend-item">
            <span className="mac-legend-color" style={{ background: '#fff5f5', border: '1px solid #fa5252' }} /> Blocked
          </span>
          <span className="mac-legend-item">
            <span className="mac-legend-color" style={{ background: 'var(--gold)' }} /> Selected
          </span>
        </div>
      </div>
    );
  };


  const reviews = allReviews.filter(r => r.roomId === room?.id && r.status === 'Published');
  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : room?.rating;

  const getLocalYYYYMMDD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalYYYYMMDD(new Date());
  
  const getNextDayStr = (dateStr) => {
    if (!dateStr) return today;
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return getLocalYYYYMMDD(d);
  };

  const minCheckOutDate = form.checkIn ? getNextDayStr(form.checkIn) : today;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!rating) {
      alert('Please select a rating (stars).');
      return;
    }
    if (!form.bookingCode || !form.email || !form.review) {
      alert('Please fill out all fields.');
      return;
    }

    const bookingsList = getStoredBookings() || [];

    const enteredCode = form.bookingCode.trim().toUpperCase().replace('#', '');
    const foundBooking = bookingsList.find(b => b.id.toUpperCase().replace('#', '') === enteredCode);

    if (!foundBooking) {
      alert('Verification Failed: Booking code is not found in our records. Please enter a valid booking code (e.g. BKG-1020).');
      return;
    }

    if (foundBooking.status !== 'Checked-out') {
      alert(`Verification Failed: Booking ${foundBooking.id} is currently "${foundBooking.status}". You can only write a review after your stay has ended and you have Checked-out.`);
      return;
    }

    if (foundBooking.room.toLowerCase() !== room.name.toLowerCase()) {
      alert(`Verification Failed: This booking code belongs to a different room type (${foundBooking.room}). Please write reviews from the correct room details page.`);
      return;
    }

    const newReview = {
      id: Date.now(),
      roomId: room.id,
      guest: foundBooking.guest,
      name: foundBooking.guest,
      email: form.email,
      rating: rating,
      review: form.review,
      comment: form.review,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      avatar: foundBooking.avatar || foundBooking.guest[0].toUpperCase(),
      country: 'Guest',
      booking: '#' + foundBooking.id,
      status: 'Pending',
      room: room.name,
    };

    const updatedReviews = [newReview, ...allReviews];
    setAllReviews(updatedReviews);
    saveStoredReviews(updatedReviews);

    setForm(p => ({
      ...p,
      name: '',
      email: '',
      review: '',
      bookingCode: ''
    }));
    setRating(0);
    alert('Thank you! Your review has been submitted successfully for verification and is pending admin approval.');
  };

  if (!room) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
          <h2>Room not found</h2>
          <Link to="/rooms" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
            Back to Rooms
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    stars: n,
    pct: Math.round((reviews.filter(r => r.rating === n).length / (reviews.length || 1)) * 100),
  }));

  return (
    <div className="room-detail-page">
      <Navbar />

      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link to="/">Home</Link><span>›</span>
            <Link to="/rooms">Rooms</Link><span>›</span>
            <span>{room.name}</span>
          </nav>

          {/* Title & Header */}
          <h1 className="room-detail-title" style={{ marginBottom: '8px' }}>{room.name}</h1>
          <div className="room-meta-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '15px' }}>
            <div className="room-detail-meta-row" style={{ margin: 0 }}>
              <div className="stars-row">
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} className={s <= Math.round(parseFloat(avgRating)) ? 'star filled' : 'star'} />
                ))}
                <span className="rating-num">{avgRating}</span>
                <span className="rating-count">({reviews.length > 0 ? reviews.length : room.reviewCount} reviews)</span>
              </div>
              <span className="room-view-badge">📍 {room.view}</span>
            </div>
            <div className="room-header-price" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gold)' }}>${getNightlyPrice(form.checkIn || today)}</span>
              <span style={{ fontSize: '14px', color: 'var(--gray-500)' }}>/ night</span>
            </div>
          </div>

          <div className="room-detail-layout" style={{ paddingTop: 0 }}>
            {/* LEFT */}
            <div className="room-detail-left">
              <p className="room-detail-desc">{room.description}</p>

              {/* Quick Facts */}
              <div className="room-quick-facts">
                {[
                  { label: 'Room Size', value: `${room.size}m²` },
                  { label: 'Bed Type', value: room.beds },
                  { label: 'Capacity', value: `${room.capacity} Guests Max` },
                  { label: 'View', value: room.view },
                ].map(f => (
                  <div key={f.label} className="quick-fact">
                    <div className="quick-fact-value">{f.value}</div>
                    <div className="quick-fact-label">{f.label}</div>
                  </div>
                ))}
              </div>

              {/* Price (mobile) */}
              <div className="room-mobile-price">
                <div className="room-price-big">
                  ${getNightlyPrice(form.checkIn || today)}<span>/night</span>
                </div>
                <p className="price-note-small">Includes taxes & breakfast</p>
              </div>

              {/* Tabs */}
              <div className="detail-tabs">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    className={`detail-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'Overview' && (
                <div className="tab-content">
                  <h3>About This Room</h3>
                  <p>{room.longDescription || room.description}</p>
                  <h4 style={{ marginTop: '20px', marginBottom: '12px' }}>Room Highlights</h4>
                  <div className="highlights-grid">
                    {(room.highlights || ['Premium Linen', 'Scenic View', 'Private Entrance']).map((h, i) => (
                      <div key={i} className="highlight-item">
                        <FiCheckCircle className="highlight-icon" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Amenities' && (
                <div className="tab-content">
                  <h3>Amenities</h3>
                  <div className="amenities-big-grid">
                    {(room.amenities || ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV']).map((a, i) => (
                      <div key={i} className="amenity-big-item">
                        <AmenityIcon name={a} />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Room Details' && (
                <div className="tab-content">
                  <h3>Room Details</h3>
                  <div className="room-details-grid">
                    {[
                      { label: 'Room Size', value: `${room.size}m²`, IconCmp: FiMaximize },
                      { label: 'Bed Type', value: room.beds, IconCmp: FaBed },
                      { label: 'Capacity', value: `Up to ${room.capacity} Guests`, IconCmp: FiUsers },
                      { label: 'View', value: room.view, IconCmp: FiEye },
                    ].map(d => (
                      <div key={d.label} className="room-detail-card">
                        <d.IconCmp className="detail-emoji" />
                        <div>
                          <div className="detail-card-label">{d.label}</div>
                          <div className="detail-card-value">{d.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Policies' && (
                <div className="tab-content">
                  <h3>Room Policies</h3>
                  <div className="policies-grid">
                    <div className="policy-card">
                      <h4>Check-in / Check-out</h4>
                      <p>• Check-in from {room.checkIn}</p>
                      <p>• Check-out until {room.checkOut}</p>
                    </div>
                    <div className="policy-card">
                      <h4>Cancellation Policy</h4>
                      <p>• {room.cancellation}.</p>
                      <p>• After that, one night will be charged.</p>
                    </div>
                    <div className="policy-card">
                      <h4>Children & Extra Beds</h4>
                      <p>• Children of all ages are welcome.</p>
                      <p>• Extra bed available upon request ($15 / night).</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Reviews' && (
                <div className="tab-content">
                  <div className="reviews-summary">
                    <div className="rating-big">
                      <div className="rating-big-num">{avgRating}</div>
                      <div className="rating-big-label">Excellent</div>
                      <div className="rating-big-count">Based on {reviews.length > 0 ? reviews.length : room.reviewCount} reviews</div>
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

                  <div className="reviews-list">
                    {reviews.length > 0 ? (
                      reviews.map(rev => (
                        <div key={rev.id} className="review-item">
                          <div className="review-item-header">
                            <div className="review-avatar-sm">{rev.avatar || rev.name[0]}</div>
                            <div>
                              <div className="review-item-name">{rev.name}</div>
                              <div className="review-item-meta">{rev.country || 'Guest'} · {rev.date}</div>
                            </div>
                          </div>
                          <div className="stars-row">
                            {[1,2,3,4,5].map(s => (
                              <FiStar key={s} className={s <= rev.rating ? 'star filled' : 'star'} />
                            ))}
                          </div>
                          <p>{rev.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--gray-500)', fontStyle: 'italic', padding: '10px 0' }}>No reviews yet for this room. Be the first to leave one below!</p>
                    )}
                  </div>

                  {/* Leave a Review */}
                  <div className="leave-review-section">
                    <div className="leave-review-note">
                      <FiCheckCircle className="note-icon" />
                      Thank you for staying with us! Share your experience to help other guests.
                    </div>
                    <form onSubmit={handleSubmitReview} className="leave-review-form">
                      <div className="review-form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Your Rating</label>
                          <div className="star-picker">
                            {[1,2,3,4,5].map(s => (
                              <button
                                key={s}
                                type="button"
                                className={`star-pick ${s <= (hoverRating || rating) ? 'active' : ''}`}
                                onMouseEnter={() => setHoverRating(s)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(s)}
                              >★</button>
                            ))}
                          </div>
                          <div className="click-to-rate">Click to rate</div>
                        </div>
                        <div className="form-group" style={{ flex: 2 }}>
                          <label className="form-label">Your Review</label>
                          <textarea
                            className="form-input"
                            placeholder="Tell us about your experience..."
                            rows={4}
                            required
                            value={form.review}
                            onChange={e => setForm(p => ({ ...p, review: e.target.value }))}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Booking Verification</label>
                          <input className="form-input" placeholder="Booking Code (e.g. BKG-1020)" required style={{ marginBottom: '8px' }}
                            value={form.bookingCode} onChange={e => setForm(p => ({ ...p, bookingCode: e.target.value }))} />
                          <input className="form-input" type="email" placeholder="Confirm your email" required
                            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary">SUBMIT REVIEW</button>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="room-detail-right">
              {/* Gallery */}
              <div className="room-gallery">
                {(() => {
                  const imgs = room.images && room.images.length > 0 
                    ? room.images 
                    : ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'];
                  const safeImgIdx = mainImg < imgs.length ? mainImg : 0;
                  return (
                    <>
                      <div className="gallery-main">
                        <button className="gallery-nav prev" onClick={() => setMainImg(i => (i - 1 + imgs.length) % imgs.length)}>
                          <FiChevronLeft />
                        </button>
                        <img src={imgs[safeImgIdx]} alt={room.name} />
                        <button className="gallery-nav next" onClick={() => setMainImg(i => (i + 1) % imgs.length)}>
                          <FiChevronRight />
                        </button>
                        <div className="view-photos-btn">
                          📷 View Photos ({imgs.length})
                        </div>
                      </div>
                      <div className="gallery-thumbs">
                        {imgs.map((img, i) => (
                          <button
                            key={i}
                            className={`gallery-thumb ${safeImgIdx === i ? 'active' : ''}`}
                            onClick={() => setMainImg(i)}
                          >
                            <img src={img} alt={`View ${i + 1}`} />
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Booking Widget */}
              <div className="booking-widget">
                <div className="booking-widget-price">
                  <span className="bw-price">${
                    getNightlyPrice(form.checkIn || today)
                  }</span>
                  <span className="bw-unit">/ night</span>
                </div>
                <div className="bw-guarantee">
                  <FiShield className="guarantee-icon" />
                  Best Price Guarantee
                </div>

                <div className="bw-fields" style={{ marginTop: '12px', marginBottom: '16px' }}>
                  <div className="bw-field">
                    <label>Check-in</label>
                    <input 
                      type="date" 
                      value={form.checkIn} 
                      min={today}
                      onChange={e => {
                        const val = e.target.value;
                        setForm(p => {
                          const updated = { ...p, checkIn: val };
                          if (val && (!updated.checkOut || new Date(updated.checkOut + 'T00:00:00') <= new Date(val + 'T00:00:00'))) {
                            updated.checkOut = getNextDayStr(val);
                          }
                          return updated;
                        });
                      }} 
                    />
                  </div>
                  <div className="bw-field">
                    <label>Check-out</label>
                    <input 
                      type="date" 
                      value={form.checkOut} 
                      min={minCheckOutDate}
                      onChange={e => setForm(p => ({ ...p, checkOut: e.target.value }))} 
                    />
                  </div>
                  <div className="bw-field full">
                    <label>Guests</label>
                    <div className="guest-stepper">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => setGuests(g => Math.max(1, Number(g) - 1))}
                        disabled={Number(guests) <= 1}
                        aria-label="Decrease guests"
                      >−</button>
                      <span className="stepper-value">
                        {guests} {Number(guests) === 1 ? 'Adult' : 'Adults'}
                      </span>
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => setGuests(g => Math.min(room.capacity || 10, Number(g) + 1))}
                        disabled={Number(guests) >= (room.capacity || 10)}
                        aria-label="Increase guests"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Date range details */}
                {(() => {
                  if (!form.checkIn || !form.checkOut) return null;
                  const start = new Date(form.checkIn + 'T00:00:00');
                  const end = new Date(form.checkOut + 'T00:00:00');
                  if (end <= start) {
                    return <div className="bw-error" style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '12px' }}>Check-out date must be after check-in.</div>;
                  }

                  let total = 0;
                  let isClosed = false;
                  const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
                  
                  for (let i = 0; i < days; i++) {
                    const current = new Date(start);
                    current.setDate(start.getDate() + i);
                    const dateStr = getLocalYYYYMMDD(current);
                    if (isDateBookedOrClosed(dateStr)) {
                      isClosed = true;
                    }
                    total += getNightlyPrice(dateStr);
                  }

                  if (isClosed) {
                    return (
                      <div className="bw-error" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                        ⚠️ Room is Booked or Blocked for some of the selected dates.
                      </div>
                    );
                  }

                  return (
                    <div className="bw-total-summary" style={{ background: 'var(--gold-bg)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gold)' }}>
                        <span>Total for {days} {days === 1 ? 'night' : 'nights'}:</span>
                        <strong style={{ fontSize: '18px', fontWeight: 800 }}>${total}</strong>
                      </div>
                    </div>
                  );
                })()}

                <button 
                  className="btn btn-primary" 
                  disabled={(() => {
                    if (!form.checkIn || !form.checkOut) return true;
                    const start = new Date(form.checkIn + 'T00:00:00');
                    const end = new Date(form.checkOut + 'T00:00:00');
                    if (end <= start) return true;
                    
                    let isClosed = false;
                    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
                    for (let i = 0; i < days; i++) {
                      const current = new Date(start);
                      current.setDate(start.getDate() + i);
                      const dateStr = getLocalYYYYMMDD(current);
                      if (isDateBookedOrClosed(dateStr)) isClosed = true;
                    }
                    return isClosed;
                  })()}
                  style={(() => {
                    const start = form.checkIn ? new Date(form.checkIn + 'T00:00:00') : null;
                    const end = form.checkOut ? new Date(form.checkOut + 'T00:00:00') : null;
                    let isClosed = false;
                    if (start && end && end > start) {
                      const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
                      for (let i = 0; i < days; i++) {
                        const current = new Date(start);
                        current.setDate(start.getDate() + i);
                        const dateStr = getLocalYYYYMMDD(current);
                        if (isDateBookedOrClosed(dateStr)) isClosed = true;
                      }
                    }
                    return {
                      width: '100%',
                      padding: '14px',
                      fontSize: '15px',
                      letterSpacing: '0.5px',
                      marginBottom: '16px',
                      background: isClosed ? '#ef4444' : '',
                      borderColor: isClosed ? '#ef4444' : '',
                      cursor: isClosed ? 'not-allowed' : 'pointer'
                    };
                  })()}
                  onClick={() => {
                    if (!form.checkIn || !form.checkOut) {
                      alert('Please select check-in and check-out dates first.');
                      return;
                    }
                    const start = new Date(form.checkIn + 'T00:00:00');
                    const end = new Date(form.checkOut + 'T00:00:00');
                    const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
                    let total = 0;
                    for (let i = 0; i < nights; i++) {
                      const d = new Date(start);
                      d.setDate(start.getDate() + i);
                      total += getNightlyPrice(getLocalYYYYMMDD(d));
                    }
                    const pending = {
                      roomId: room.id,
                      roomName: room.name,
                      roomSlug: room.slug,
                      roomImage: (room.images && room.images[0]) || '',
                      roomType: room.type,
                      checkIn: form.checkIn,
                      checkOut: form.checkOut,
                      nights,
                      guests,
                      pricePerNight: getNightlyPrice(form.checkIn),
                      total,
                    };
                    localStorage.setItem('elkhalil_pending_booking', JSON.stringify(pending));
                    navigate(`/checkout${location.search}`);
                  }}
                >
                  {(() => {
                    if (!form.checkIn || !form.checkOut) return 'CHECK AVAILABILITY';
                    const start = new Date(form.checkIn + 'T00:00:00');
                    const end = new Date(form.checkOut + 'T00:00:00');
                    if (end <= start) return 'CHECK AVAILABILITY';
                    
                    let isClosed = false;
                    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
                    for (let i = 0; i < days; i++) {
                      const current = new Date(start);
                      current.setDate(start.getDate() + i);
                      const dateStr = getLocalYYYYMMDD(current);
                      if (isDateBookedOrClosed(dateStr)) isClosed = true;
                    }
                    return isClosed ? 'NOT AVAILABLE ON THESE DATES' : 'BOOK NOW';
                  })()}
                </button>

                <div className="bw-features">
                  {[
                    { icon: FiCheckCircle, label: 'Free Cancellation', sub: 'Cancel up to 24 hours in advance' },
                    { icon: FiCheckCircle, label: 'Instant Confirmation', sub: 'Receive your booking confirmation instantly' },
                    { icon: FiShield, label: 'Secure Payment', sub: 'Your information is safe with us' },
                  ].map((f, i) => (
                    <div key={i} className="bw-feature">
                      <f.icon className="bw-feature-icon" />
                      <div>
                        <div className="bw-feature-title">{f.label}</div>
                        <div className="bw-feature-sub">{f.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bw-help">
                  <div className="bw-help-title">Need Help?</div>
                  <div className="bw-help-sub">Our travel experts are here for you.</div>
                  <a href={`tel:${settings.phone}`} className="bw-phone">
                    <FiPhone /> {settings.phone}
                  </a>
                </div>

                {renderMiniAvailabilityCalendar()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

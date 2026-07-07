import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCalendar, FiUsers, FiHome } from 'react-icons/fi';
import './BookingForm.css';

export default function BookingForm({ compact = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: '1 Guest',
    rooms: '1 Room',
  });

  // Pre-fill form from URL query parameters if they exist
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkIn = params.get('checkIn');
    const checkOut = params.get('checkOut');
    const guests = params.get('guests');
    const rooms = params.get('rooms');

    setForm(prev => ({
      checkIn: checkIn || prev.checkIn,
      checkOut: checkOut || prev.checkOut,
      guests: guests || prev.guests,
      rooms: rooms || prev.rooms,
    }));
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-update checkout date if check-in changes and is after current checkout
      if (name === 'checkIn' && value) {
        if (!updated.checkOut || new Date(updated.checkOut) <= new Date(value)) {
          const nextDay = new Date(new Date(value).getTime() + 86400000);
          updated.checkOut = nextDay.toISOString().split('T')[0];
        }
      }
      return updated;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.checkIn || !form.checkOut) {
      alert('Please select both Check-In and Check-Out dates.');
      return;
    }
    const start = new Date(form.checkIn);
    const end = new Date(form.checkOut);
    if (end <= start) {
      alert('Check-out date must be after Check-in date.');
      return;
    }
    navigate(`/rooms?checkIn=${form.checkIn}&checkOut=${form.checkOut}&guests=${form.guests}`);
  };

  const minCheckOutDate = form.checkIn 
    ? new Date(new Date(form.checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : today;

  return (
    <form
      className={`booking-form ${compact ? 'compact' : ''}`}
      onSubmit={handleSearch}
    >
      <div className="booking-field">
        <label><FiCalendar className="field-icon" /> Check-In</label>
        <input
          type="date"
          name="checkIn"
          value={form.checkIn}
          onChange={handleChange}
          placeholder="Select date"
          min={today}
        />
      </div>
      <div className="booking-divider" />
      <div className="booking-field">
        <label><FiCalendar className="field-icon" /> Check-out</label>
        <input
          type="date"
          name="checkOut"
          value={form.checkOut}
          onChange={handleChange}
          placeholder="Select date"
          min={minCheckOutDate}
        />
      </div>
      <div className="booking-divider" />
      <div className="booking-field">
        <label><FiUsers className="field-icon" /> Guests</label>
        <select name="guests" value={form.guests} onChange={handleChange}>
          {[1,2,3,4,5,6].map(n => (
            <option key={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
          ))}
        </select>
      </div>
      <div className="booking-divider" />
      <div className="booking-field">
        <label><FiHome className="field-icon" /> Rooms</label>
        <select name="rooms" value={form.rooms} onChange={handleChange}>
          {[1,2,3,4].map(n => (
            <option key={n}>{n} {n === 1 ? 'Room' : 'Rooms'}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary booking-submit">
        CHECK AVAILABILITY
      </button>
    </form>
  );
}

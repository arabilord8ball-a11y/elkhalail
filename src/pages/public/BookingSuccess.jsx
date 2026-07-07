import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { FiPrinter, FiHome, FiCalendar, FiUser, FiClock, FiCheckCircle } from 'react-icons/fi';
import './BookingSuccess.css';

// Simple confetti particles
function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#C9973A', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#F43F5E'];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 100,
      w: 8 + Math.random() * 10,
      h: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      angle: Math.random() * 360,
      angularV: (Math.random() - 0.5) * 6,
      opacity: 1,
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.angularV;
        p.opacity -= 0.006;
        if (p.opacity <= 0) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
          p.opacity = 1;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    const timer = setTimeout(() => cancelAnimationFrame(frame), 5000);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); };
  }, []);

  return <canvas ref={canvasRef} className="success-confetti" />;
}

export default function BookingSuccess() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    document.title = 'Booking Confirmed! | Elkhalil Hotel';
    const raw = localStorage.getItem('elkhalil_last_booking');
    let parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch(e) {}
    }
    if (parsed) {
      setBooking(parsed);
    } else {
      navigate('/rooms');
    }
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handlePrint = () => window.print();

  if (!booking) return null;

  const nights = booking.nights || 1;
  const totalAmount = booking.totalPrice || booking.amount || 0;

  return (
    <div>
      <Navbar />
      {showConfetti && <Confetti />}

      <div className="success-page">
        <div className="success-card">
          {/* Checkmark */}
          <div className="success-checkmark">✓</div>

          <h1 className="success-title">Booking Confirmed! 🎉</h1>
          <p className="success-sub">
            Thank you for choosing Elkhalil Hotel. Your reservation has been confirmed and a summary is below.
          </p>

          {/* Booking ID */}
          <div className="success-booking-id">
            <div className="success-booking-id-label">Booking Reference</div>
            <div className="success-booking-id-value">{booking.id}</div>
          </div>

          {/* Progress Steps */}
          <div className="success-steps">
            {['Booked', 'Confirmed', 'Check-in'].map((s, i) => (
              <div key={i} className="success-step">
                <div className="success-step-dot">{i < 2 ? '✓' : i + 1}</div>
                <div className="success-step-label">{s}</div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="success-details-grid">
            <div className="success-detail-item">
              <div className="success-detail-label">🛏️ Room</div>
              <div className="success-detail-value">{booking.room || booking.roomName || 'Room'}</div>
            </div>
            <div className="success-detail-item">
              <div className="success-detail-label">👤 Guest</div>
              <div className="success-detail-value">{booking.guest || booking.guestName}</div>
            </div>
            <div className="success-detail-item">
              <div className="success-detail-label">📅 Check-in</div>
              <div className="success-detail-value">{booking.checkIn}</div>
            </div>
            <div className="success-detail-item">
              <div className="success-detail-label">📅 Check-out</div>
              <div className="success-detail-value">{booking.checkOut}</div>
            </div>
            <div className="success-detail-item">
              <div className="success-detail-label">🌙 Nights</div>
              <div className="success-detail-value">{nights}</div>
            </div>
            <div className="success-detail-item">
              <div className="success-detail-label">💳 Total Paid</div>
              <div className="success-detail-value price">${totalAmount}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="success-actions">
            <button onClick={handlePrint} className="btn btn-outline">
              <FiPrinter /> Print Receipt
            </button>
            <Link to="/guest/dashboard" className="btn btn-primary">
              <FiCalendar /> My Bookings
            </Link>
            <Link to="/" className="btn btn-outline">
              <FiHome /> Home
            </Link>
          </div>

          <p className="success-note">
            📧 A confirmation has been saved to your guest profile.<br />
            For any questions, please contact us at{' '}
            <a href="/contact" style={{ color: 'var(--gold)' }}>our support page</a>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

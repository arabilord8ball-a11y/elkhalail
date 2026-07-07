import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiCalendar, FiDollarSign, FiUsers, FiStar, FiHome, FiArrowUp, FiSmile, FiLogIn, FiLogOut, FiMap, FiKey } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  getStoredBookings,
  getStoredPayments,
  getStoredGuests,
  getStoredRooms,
  getStoredTours,
  getStoredSettings,
  getStoredReviews
} from '../../utils/storage';
import './Dashboard.css';

const COLORS = ['#C9973A', '#F59E0B', '#10B981'];

const statusColor = {
  Confirmed: 'badge badge-green',
  Pending: 'badge badge-orange',
  Cancelled: 'badge badge-red',
  'Checked-in': 'badge badge-blue',
  'Checked-out': 'badge badge-gray',
};

export default function Dashboard() {
  const [data, setData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalGuests: 0,
    avgRating: '4.7 / 5',
    recentBookings: [],
    recentReviews: [],
    occupancyData: [],
    statCards: [],
    bottomStats: [],
    revenueOverview: [],
    topTours: [],
    bookingChartData: [],
  });

  useEffect(() => {
    const calculateDashboard = () => {
      document.title = 'Admin Dashboard | Elkhalil Hotel';

      // 1. Fetch real synced data
      const bookings = getStoredBookings() || [];
      const payments = getStoredPayments() || [];
      const guests = getStoredGuests() || [];
      const rooms = getStoredRooms() || [];
      const tours = getStoredTours() || [];
      
      let reviews = [];
      try {
        reviews = getStoredReviews() || [];
      } catch (err) {
        reviews = [];
      }
      if (!Array.isArray(reviews)) reviews = [];

      // 2. Calculations
      const totalBookings = bookings.length;
      
      // Calculate total revenue from PAID payments
      const totalRevenue = payments
        .filter(p => p && p.status === 'Paid')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const totalGuests = guests.length;

      // Calculate average rating
      const publishedReviews = reviews.filter(r => r && r.status === 'Published');
      const avgRatingVal = publishedReviews.length
        ? (publishedReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / publishedReviews.length).toFixed(1)
        : '4.7';

      // Occupancy
      const occupiedCount = bookings.filter(b => b && b.status === 'Checked-in').length;
      const reservedCount = bookings.filter(b => b && (b.status === 'Confirmed' || b.status === 'Pending')).length;
      const totalRoomsCount = rooms.length || 10;
      const availableCount = Math.max(0, totalRoomsCount - occupiedCount - reservedCount);

      const occupiedPct = Math.round((occupiedCount / totalRoomsCount) * 100);
      const reservedPct = Math.round((reservedCount / totalRoomsCount) * 100);
      const availablePct = Math.round((availableCount / totalRoomsCount) * 100);

      const occupancyData = [
        { name: 'Occupied', value: occupiedPct || 0, count: occupiedCount, color: 'var(--primary)' },
        { name: 'Reserved', value: reservedPct || 0, count: reservedCount, color: '#F59E0B' },
        { name: 'Available', value: availablePct || 0, count: availableCount, color: '#10B981' },
      ];

      // Stats configuration
      const statCards = [
        { icon: FiCalendar, label: 'Total Bookings', value: totalBookings, change: '+12.4%', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
        { icon: FiDollarSign, label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+18.2%', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
        { icon: FiUsers, label: 'Total Guests', value: totalGuests, change: '+9.5%', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        { icon: FiStar, label: 'Avg. Rating', value: `${avgRatingVal} / 5`, change: '+3.1%', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
      ];

      // Dynamic checks for today check-in/check-out
      const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const checkinsToday = bookings.filter(b => b && ((b.checkIn && b.checkIn.includes(todayStr)) || b.status === 'Checked-in')).length;
      const checkoutsToday = bookings.filter(b => b && ((b.checkOut && b.checkOut.includes(todayStr)) || b.status === 'Checked-out')).length;

      const bottomStats = [
        { IconCmp: FiHome,    value: totalRoomsCount, label: 'Total Rooms',     link: '/admin/rooms',    linkLabel: 'View Rooms' },
        { IconCmp: FiKey,     value: occupiedCount,   label: 'Occupied Rooms',  link: '/admin/rooms',    linkLabel: 'View Details' },
        { IconCmp: FiLogIn,   value: checkinsToday,   label: 'Check-ins Today', link: '/admin/bookings', linkLabel: 'View Check-ins' },
        { IconCmp: FiLogOut,  value: checkoutsToday,  label: 'Check-outs Today',link: '/admin/bookings', linkLabel: 'View Check-outs' },
        { IconCmp: FiMap,     value: tours.length,    label: 'Total Tours',     link: '/admin/tours',    linkLabel: 'View Tours' },
        { IconCmp: FiStar,    value: reviews.length,  label: 'New Reviews',     link: '/admin/reviews',  linkLabel: 'View Reviews' },
      ];

      // Dynamic Top Tours
      const topTours = tours.map(t => {
        const count = bookings.filter(b => b && b.extras && b.extras.includes(t.name)).length;
        const rev = count * Number(t.price || 0);
        return {
          name: t.name,
          bookings: count,
          revenue: rev,
          img: (t.images && t.images[0]) || 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=100&q=70'
        };
      }).sort((a, b) => b.bookings - a.bookings).slice(0, 4);

      // Room vs Tour Revenue split
      let roomRevenue = 0;
      let tourRevenue = 0;
      bookings.forEach(b => {
        if (b && b.status !== 'Cancelled') {
          const amt = Number(b.amount || b.price || 0);
          const roomPart = b.roomPrice !== undefined ? Number(b.roomPrice) : Math.round(amt * 0.75);
          const extraPart = b.extrasPrice !== undefined ? Number(b.extrasPrice) : (amt - roomPart);
          roomRevenue += roomPart;
          tourRevenue += extraPart;
        }
      });
      
      const totalRevCalculated = roomRevenue + tourRevenue || 1;
      const roomPct = Math.round((roomRevenue / totalRevCalculated) * 100) || 75;
      const tourPct = 100 - roomPct;

      const revenueOverview = [
        { label: 'Room Revenue', value: `$${roomRevenue.toLocaleString()}`, pct: roomPct, color: 'var(--primary)' },
        { label: 'Tour & Extras Revenue', value: `$${tourRevenue.toLocaleString()}`, pct: tourPct, color: '#10B981' },
      ];

      // Dynamic Chart Data mapping (aggregating bookings by check-in date)
      const bookingGroups = {};
      bookings.forEach(b => {
        if (!b || !b.checkIn) return;
        let label = b.checkIn;
        try {
          const dateParts = b.checkIn.split('-');
          if (dateParts.length === 3) {
            const d = new Date(b.checkIn + 'T00:00:00');
            label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
        } catch (e) {}
        bookingGroups[label] = (bookingGroups[label] || 0) + 1;
      });

      const bookingChartData = Object.keys(bookingGroups).map(date => ({
        date,
        bookings: bookingGroups[date],
        prev: Math.max(0, bookingGroups[date] - 1)
      })).slice(-5);

      if (bookingChartData.length === 0) {
        bookingChartData.push({ date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), bookings: 0, prev: 0 });
      }

      setData({
        totalBookings,
        totalRevenue,
        totalGuests,
        avgRating: `${avgRatingVal} / 5`,
        recentBookings: bookings.slice(0, 5),
        recentReviews: reviews.slice(0, 4),
        occupancyData,
        statCards,
        bottomStats,
        revenueOverview,
        topTours,
        bookingChartData,
      });
    };

    calculateDashboard();
    window.addEventListener('storage', calculateDashboard);
    return () => window.removeEventListener('storage', calculateDashboard);
  }, []);

  return (
    <AdminLayout>
      <div className="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-sub">Welcome back, Admin <FiSmile size={16} style={{ verticalAlign: 'middle', color: 'var(--primary)' }} /></p>
          </div>
          <div className="dashboard-date">
            <FiCalendar size={14} />
            Real-time Insights (Supabase)
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stat-cards-grid">
          {data.statCards.map((card, i) => (
            <div key={i} className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: card.bg, color: card.color }}>
                <card.icon size={22} />
              </div>
              <div className="dash-stat-info">
                <div className="dash-stat-label">{card.label}</div>
                <div className="dash-stat-value">{card.value}</div>
                <div className="dash-stat-change">
                  <FiArrowUp size={12} /> {card.change} from last 30 days
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Bookings Overview */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Bookings Overview</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.bookingChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px' }} />
                <Line type="monotone" dataKey="bookings" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} name="Bookings" />
                <Line type="monotone" dataKey="prev" stroke="#D1D5DB" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Previous Period" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Occupancy */}
          <div className="chart-card occupancy-card">
            <div className="chart-header">
              <h3>Room Occupancy</h3>
            </div>
            <div className="occupancy-content">
              <div className="pie-wrapper">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.occupancyData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" startAngle={90} endAngle={-270}>
                      {data.occupancyData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-center">
                  <div className="pie-pct">{data.occupancyData.find(d => d.name === 'Occupied')?.value || 0}%</div>
                  <div className="pie-label">Occupied</div>
                </div>
              </div>
              <div className="occupancy-legend">
                {data.occupancyData.map((d, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-dot" style={{ background: d.color }} />
                    <span className="legend-name">{d.name} ({d.value}%)</span>
                    <span className="legend-rooms">{d.count} Rooms</span>
                  </div>
                ))}
                <div className="legend-total">Total Rooms: {getStoredRooms().length}</div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="chart-card recent-bookings-card">
            <div className="chart-header">
              <h3>Recent Bookings</h3>
              <Link to="/admin/bookings" className="view-all-link">View All</Link>
            </div>
            <div className="recent-bookings-list">
              {data.recentBookings.map(b => (
                <div key={b.id} className="recent-booking-item">
                  <div className="rb-avatar" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>{b.avatar}</div>
                  <div className="rb-info">
                    <div className="rb-name">{b.guest}</div>
                    <div className="rb-room">{b.room}</div>
                  </div>
                  <div className="rb-dates">
                    <FiCalendar size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {(b.checkIn && typeof b.checkIn === 'string') ? b.checkIn.split(',')[0] : '—'} – {(b.checkOut && typeof b.checkOut === 'string') ? b.checkOut.split(',')[0] : '—'}
                  </div>
                  <span className={statusColor[b.status] || 'badge'}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="bottom-stats-grid">
          {data.bottomStats.map((s, i) => (
            <div key={i} className="bottom-stat-card">
              <span className="bottom-stat-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}><s.IconCmp size={22} /></span>
              <div className="bottom-stat-value">{s.value}</div>
              <div className="bottom-stat-label">{s.label}</div>
              <Link to={s.link} className="bottom-stat-link">{s.linkLabel}</Link>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="bottom-row">
          {/* Recent Reviews */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Recent Reviews</h3>
              <Link to="/admin/reviews" className="view-all-link">View All</Link>
            </div>
            <div className="recent-reviews-list">
              {data.recentReviews.map(r => (
                <div key={r.id} className="recent-review-item">
                  <div className="rb-avatar" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>{r.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div className="rb-name">{r.guest}</div>
                    <div className="rb-room">{r.room}</div>
                    <div className="mini-stars" style={{ color: '#F59E0B' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  <div className="review-preview">{r.review.slice(0, 40)}…</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tours */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Top Tours</h3>
              <Link to="/admin/tours" className="view-all-link">View All</Link>
            </div>
            <div className="top-tours-list">
              {data.topTours.map((t, i) => (
                <div key={i} className="top-tour-item">
                  <img src={t.img} alt={t.name} className="top-tour-img" />
                  <div className="top-tour-info">
                    <div className="top-tour-name">{t.name}</div>
                    <div className="top-tour-bookings">{t.bookings} Bookings</div>
                  </div>
                  <div className="top-tour-revenue">${t.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Overview */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Revenue Overview</h3>
              <Link to="/admin/reports" className="view-all-link">View Report</Link>
            </div>
            <div className="revenue-overview">
              {data.revenueOverview.map((r, i) => (
                <div key={i} className="revenue-row">
                  <div className="revenue-row-header">
                    <span>{r.label}</span>
                    <strong>{r.value}</strong>
                  </div>
                  <div className="revenue-bar-track">
                    <div className="revenue-bar-fill" style={{ width: `${r.pct}%`, background: r.color }} />
                  </div>
                  <span className="revenue-pct">{r.pct}%</span>
                </div>
              ))}
              <div className="revenue-total">
                <span>Total Revenue</span>
                <strong>${data.totalRevenue?.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

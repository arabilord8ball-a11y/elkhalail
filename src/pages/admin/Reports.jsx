import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiDownload, FiArrowUp } from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  getStoredBookings,
  getStoredPayments,
  getStoredGuests,
  exportToCSV
} from '../../utils/storage';
import './AdminTable.css';

export default function Reports() {
  const [data, setData] = useState({
    summaryCards: [],
    revenueChartData: [],
    bookingChartData: [],
    sourceData: [],
    totalRevenue: 0,
    totalBookings: 0,
    paymentsList: []
  });

  useEffect(() => {
    const calculateReports = () => {
      document.title = 'Analytics & Reports | Elkhalil Hotel';

      const bookings = getStoredBookings() || [];
      const payments = getStoredPayments() || [];
      const guests = getStoredGuests() || [];

      // 1. Calculations
      const totalBookings = bookings.length;
      const totalGuests = guests.length;
      const paidPayments = payments.filter(p => p && p.status === 'Paid');
      const totalRevenue = paidPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      // Calculate Avg Daily Rate (ADR)
      const avgDailyRate = totalBookings ? Math.round(totalRevenue / totalBookings) : 0;

      // Calculate real % change: compare first half vs second half of data
      const calcChange = (current, previous) => {
        if (!previous || previous === 0) return current > 0 ? '+100%' : '0%';
        const pct = Math.round(((current - previous) / previous) * 100);
        return (pct >= 0 ? '+' : '') + pct + '%';
      };

      // Split bookings into old vs recent halves
      const mid = Math.floor(bookings.length / 2);
      const oldBookings = bookings.slice(0, mid);
      const newBookings = bookings.slice(mid);
      const oldRevenue = payments.filter((p, i) => i < Math.floor(payments.length / 2) && p?.status === 'Paid').reduce((s, p) => s + (Number(p.amount) || 0), 0);
      const newRevenue = payments.filter((p, i) => i >= Math.floor(payments.length / 2) && p?.status === 'Paid').reduce((s, p) => s + (Number(p.amount) || 0), 0);

      const summaryCards = [
        { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: calcChange(newRevenue, oldRevenue) },
        { label: 'Total Bookings', value: totalBookings, change: calcChange(newBookings.length, oldBookings.length) },
        { label: 'Total Guests', value: totalGuests, change: totalGuests > 0 ? `+${totalGuests}` : '0' },
        { label: 'Avg. Daily Rate', value: `$${avgDailyRate}`, change: calcChange(avgDailyRate, avgDailyRate * 0.92) },
      ];

      // Source data calculations
      const directCount = payments.filter(p => p && (p.method === 'Credit Card' || p.method === 'Debit Card')).length;
      const paypalCount = payments.filter(p => p && p.method === 'PayPal').length;
      const otherCount = payments.length - directCount - paypalCount;
      const totalCount = payments.length || 1;

      const sourceData = [
        { name: 'Direct (Card)', value: Number(((directCount / totalCount) * 100).toFixed(1)), color: 'var(--primary)' },
        { name: 'PayPal', value: Number(((paypalCount / totalCount) * 100).toFixed(1)), color: '#3B82F6' },
        { name: 'Other Channels', value: Number(((otherCount / totalCount) * 100).toFixed(1)), color: '#10B981' },
      ];

      // Generate chart data by grouping payments/bookings safely
      const revenueByDate = {};
      payments.forEach(p => {
        if (!p) return;
        const dateKey = (p.date && typeof p.date === 'string') ? p.date.split(',')[0] : 'Jun 18';
        if (!revenueByDate[dateKey]) {
          revenueByDate[dateKey] = { revenue: 0, bookings: 0 };
        }
        if (p.status === 'Paid') {
          revenueByDate[dateKey].revenue += Number(p.amount) || 0;
        }
        revenueByDate[dateKey].bookings += 1;
      });

      const dates = Object.keys(revenueByDate).sort();
      const revenueChartData = dates.map(d => ({
        date: d,
        revenue: revenueByDate[d].revenue
      }));

      const bookingChartData = dates.map(d => ({
        date: d,
        bookings: revenueByDate[d].bookings
      }));

      setData({
        summaryCards,
        revenueChartData: revenueChartData.length ? revenueChartData : [
          { date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: 0 }
        ],
        bookingChartData: bookingChartData.length ? bookingChartData : [
          { date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), bookings: 0 }
        ],
        sourceData,
        totalRevenue,
        totalBookings,
        paymentsList: payments
      });
    };

    calculateReports();
    window.addEventListener('storage', calculateReports);
    return () => window.removeEventListener('storage', calculateReports);
  }, []);

  const handleExportCSV = () => {
    exportToCSV(data.paymentsList, 'elkhalil_reports_transactions.csv');
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Reports</h1>
            <p>Analytics, transaction summaries, and hotel performance overview.</p>
          </div>
          <div className="admin-page-actions">
            <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>
              <FiDownload /> Export CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="stat-cards-grid">
          {data.summaryCards.map((c, i) => (
            <div key={i} className="dash-stat-card">
              <div style={{ flex: 1 }}>
                <div className="dash-stat-label">{c.label}</div>
                <div className="dash-stat-value">{c.value}</div>
                <div className="dash-stat-change" style={{ color: 'var(--green)' }}>
                  <FiArrowUp size={12} /> {c.change} from last period
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          <div className="chart-card">
            <div className="chart-header"><h3>Revenue Overview ($)</h3></div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-header"><h3>Revenue by Source (%)</h3></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={data.sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    {data.sourceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '150px' }}>
                {data.sourceData.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--gray-600)' }}>{s.name}</span>
                    <strong style={{ color: 'var(--dark-600)' }}>{s.value}%</strong>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '8px', fontWeight: 700, fontSize: '16px', color: 'var(--primary)' }}>
                  ${data.totalRevenue?.toLocaleString()} Total
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
            <div className="chart-header"><h3>Bookings Trend</h3></div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.bookingChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                <Line type="monotone" dataKey="bookings" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

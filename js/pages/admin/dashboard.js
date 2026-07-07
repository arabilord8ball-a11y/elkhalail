/**
 * ELKHALIL HOTEL — Admin Dashboard Page
 * Ported from Dashboard.jsx
 */

window.renderDashboardPage = function() {
  document.title = 'Dashboard — Admin Panel';
  const bookings = window.getStoredBookings() || [];
  const rooms = window.getStoredRooms() || [];
  const reviews = window.getStoredReviews() || [];
  const payments = window.getStoredPayments() || [];
  const guests = window.getStoredGuests() || [];

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const todayBookings = bookings.filter(b => b.createdAt === todayStr || new Date(b.checkIn).toDateString() === new Date().toDateString());
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const pendingReviews = reviews.filter(r => r.status === 'Pending').length;
  const checkedIn = bookings.filter(b => b.status === 'Checked-in').length;
  const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;
  const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0;
  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + Number(r.rating || 5), 0) / reviews.length).toFixed(1) : '5.0';
  
  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: window.Icons.creditCard, iconBg: 'rgba(16,185,129,0.1)', iconColor: '#10B981', change: '+12%', up: true },
    { label: 'Total Bookings', value: bookings.length, icon: window.Icons.calendar, iconBg: 'rgba(201,151,58,0.1)', iconColor: 'var(--gold)', change: `${pendingBookings} pending`, up: true },
    { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: window.Icons.home, iconBg: 'rgba(59,130,246,0.1)', iconColor: '#3B82F6', change: `${checkedIn} checked in`, up: occupancyRate > 50 },
    { label: 'Avg Rating', value: `★ ${avgRating}`, icon: window.Icons.star, iconBg: 'rgba(245,158,11,0.1)', iconColor: '#F59E0B', change: `${reviews.length} reviews`, up: true },
  ];

  const recentBookings = bookings.slice(0, 6);
  const statusColors = { Confirmed: 'badge-green', Pending: 'badge-orange', Cancelled: 'badge-red', 'Checked-in': 'badge-blue', 'Checked-out': 'badge-gray' };

  const quickActions = [
    { label: 'Add Booking', path: '/admin/bookings', icon: '➕' },
    { label: 'Add Room', path: '/admin/rooms', icon: '🏨' },
    { label: 'Add Tour', path: '/admin/tours', icon: '🗺️' },
    { label: 'Add Offer', path: '/admin/offers', icon: '🏷️' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
    { label: 'View Site', path: '/', icon: '🌐' },
  ];

  const contentHtml = `
    <div class="admin-page-header">
      <div class="admin-page-header-text">
        <h1>Dashboard</h1>
        <p>Welcome back, ${window.Auth.user?.name || 'Admin'}! Here's what's happening today.</p>
      </div>
      <div style="display:flex;gap:var(--space-3);">
        <a href="#/" class="btn btn-outline btn-sm">View Site</a>
        <button class="btn btn-primary btn-sm" onclick="window.navigateTo('/admin/bookings')">+ New Booking</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="admin-stats-grid">
      ${stats.map(s => `
        <div class="stat-card">
          <div class="stat-card-inner">
            <div>
              <div class="stat-card-label">${s.label}</div>
              <div class="stat-card-value">${s.value}</div>
              <div class="${s.up ? 'stat-change-up' : 'stat-change-down'}">${s.change}</div>
            </div>
            <div class="stat-card-icon" style="background:${s.iconBg};color:${s.iconColor};">${s.icon}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Quick Actions -->
    <div class="admin-card" style="margin-bottom:var(--space-5);">
      <div class="admin-card-title">Quick Actions</div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:var(--space-3);">
        ${quickActions.map(qa => `
          <button onclick="window.navigateTo('${qa.path}')" style="background:var(--gray-50);border:1.5px solid var(--gray-200);border-radius:var(--radius-xl);padding:var(--space-4);display:flex;flex-direction:column;align-items:center;gap:var(--space-2);font-size:13px;font-weight:600;color:var(--gray-700);cursor:pointer;transition:var(--transition);" onmouseover="this.style.borderColor='var(--gold)';this.style.color='var(--gold)'" onmouseout="this.style.borderColor='var(--gray-200)';this.style.color='var(--gray-700)'">
            <span style="font-size:24px;">${qa.icon}</span>
            ${qa.label}
          </button>
        `).join('')}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:var(--space-5);">
      <!-- Recent Bookings -->
      <div class="admin-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);">
          <div class="admin-card-title" style="margin-bottom:0;">Recent Bookings</div>
          <a href="#/admin/bookings" class="view-all-link">View All →</a>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>Guest</th><th>Room</th><th>Dates</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              ${recentBookings.length ? recentBookings.map(b => `
                <tr>
                  <td><div style="display:flex;align-items:center;gap:8px;"><div class="avatar">${(b.avatar || b.guest?.[0] || 'G')}</div><span style="font-weight:600;">${b.guest}</span></div></td>
                  <td>${b.room}</td>
                  <td style="font-size:12px;color:var(--gray-500);">${b.checkIn} → ${b.checkOut}</td>
                  <td><span class="badge ${statusColors[b.status] || 'badge-gray'}">${b.status}</span></td>
                  <td style="font-weight:700;color:var(--gold);">$${b.amount || b.price}</td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--gray-400);padding:30px;">No bookings yet</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Room Status -->
      <div class="admin-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);">
          <div class="admin-card-title" style="margin-bottom:0;">Room Status</div>
          <a href="#/admin/rooms" class="view-all-link">Manage →</a>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3);">
          ${rooms.slice(0, 8).map(r => {
            const isOccupied = r.status === 'Maintenance' || bookings.some(b => b.roomId == r.id && b.status === 'Checked-in');
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--gray-50);border-radius:var(--radius-md);">
                <span style="font-weight:600;font-size:13px;color:var(--gray-700);">${r.name}</span>
                <span class="badge ${r.status === 'Available' ? 'badge-green' : r.status === 'Maintenance' ? 'badge-orange' : 'badge-red'}">${r.status}</span>
              </div>
            `;
          }).join('')}
          ${rooms.length > 8 ? `<div style="text-align:center;font-size:13px;color:var(--gray-400);">+${rooms.length - 8} more rooms</div>` : ''}
        </div>
      </div>
    </div>

    <!-- Pending Items -->
    ${(pendingBookings > 0 || pendingReviews > 0) ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5);margin-top:var(--space-5);">
      ${pendingBookings > 0 ? `
      <div class="admin-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);">
          <div class="admin-card-title" style="margin-bottom:0;">Pending Bookings (${pendingBookings})</div>
          <a href="#/admin/bookings" class="view-all-link">View All →</a>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-2);">
          ${bookings.filter(b => b.status === 'Pending').slice(0, 4).map(b => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--orange-bg);border-radius:var(--radius-md);">
              <div>
                <div style="font-weight:600;font-size:13px;">${b.guest}</div>
                <div style="font-size:12px;color:var(--gray-500);">${b.room} · ${b.checkIn}</div>
              </div>
              <button onclick="window.navigateTo('/admin/bookings')" class="btn btn-sm btn-primary">Review</button>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
      ${pendingReviews > 0 ? `
      <div class="admin-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);">
          <div class="admin-card-title" style="margin-bottom:0;">Pending Reviews (${pendingReviews})</div>
          <a href="#/admin/reviews" class="view-all-link">View All →</a>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-2);">
          ${reviews.filter(r => r.status === 'Pending').slice(0, 4).map(r => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--gold-bg);border-radius:var(--radius-md);">
              <div>
                <div style="font-weight:600;font-size:13px;">${r.guest}</div>
                <div style="font-size:12px;color:var(--gray-500);">★ ${r.rating} · ${r.room || 'Hotel'}</div>
              </div>
              <button onclick="window.navigateTo('/admin/reviews')" class="btn btn-sm btn-outline">Review</button>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    </div>` : ''}
  `;

  window.renderAdminPage(contentHtml, '/admin');

  // Real-time updates
  window.addEventListener('storage', () => {
    if (window.Router.currentPath === '/admin') setTimeout(() => window.renderDashboardPage(), 500);
  }, { once: true });
  window.addEventListener('live-chat-update', () => {
    if (window.Router.currentPath === '/admin') setTimeout(() => window.renderDashboardPage(), 500);
  }, { once: true });
};

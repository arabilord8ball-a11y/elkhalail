/**
 * ELKHALIL HOTEL — Admin Reports Page
 * Ported from Reports.jsx
 */

window.renderReportsPage = function() {
  document.title = 'Reports — Admin Panel';
  const bookings = window.getStoredBookings() || [];
  const payments = window.getStoredPayments() || [];
  const rooms = window.getStoredRooms() || [];

  // Monthly stats helper
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate monthly revenue
  const monthlyRevenue = Array(12).fill(0);
  payments.filter(p => p.status === 'Paid').forEach(p => {
    const d = new Date(p.date);
    if (!isNaN(d.getTime())) monthlyRevenue[d.getMonth()] += Number(p.amount || 0);
  });

  // Calculate monthly bookings
  const monthlyBookingsCount = Array(12).fill(0);
  bookings.forEach(b => {
    const d = new Date(b.createdAt || b.checkIn);
    if (!isNaN(d.getTime())) monthlyBookingsCount[d.getMonth()]++;
  });

  const maxRevenue = Math.max(...monthlyRevenue, 1);
  const maxBookings = Math.max(...monthlyBookingsCount, 1);

  // Stats calculation
  const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'Checked-out' || b.status === 'Confirmed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;

  const contentHtml = `
    <div class="admin-page-header">
      <div class="admin-page-header-text">
        <h1>Reports & Insights</h1>
        <p>Analyze reservation volumes, monthly revenue performance, occupancy rates, and overall metrics</p>
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="admin-stats-grid" style="margin-bottom:var(--space-6);">
      <div class="stat-card">
        <div class="stat-card-label">Total Completed Revenue</div>
        <div class="stat-card-value" style="color:var(--green);">$${totalRevenue.toLocaleString()}</div>
        <div class="stat-card-sub">From paid invoices</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Total Reservations</div>
        <div class="stat-card-value">${totalBookings}</div>
        <div class="stat-card-sub">${completedBookings} confirmed/completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Cancellation Rate</div>
        <div class="stat-card-value" style="color:var(--red);">${totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0}%</div>
        <div class="stat-card-sub">${cancelledBookings} cancelled bookings</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Room Count</div>
        <div class="stat-card-value">${rooms.length}</div>
        <div class="stat-card-sub">Active in hotel catalog</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6);">
      <!-- Revenue Chart -->
      <div class="admin-card">
        <div class="admin-card-title">Monthly Revenue Performance</div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;height:240px;padding:20px 10px;background:var(--gray-50);border-radius:var(--radius-xl);border:1px solid var(--gray-200);">
          ${monthlyRevenue.map((rev, idx) => {
            const h = Math.max(10, Math.round((rev / maxRevenue) * 160));
            return `
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;">
                <span style="font-size:10px;font-weight:600;color:var(--gold);">${rev > 0 ? '$' + rev : ''}</span>
                <div style="width:70%;height:${h}px;background:var(--gold);border-radius:4px 4px 0 0;transition:all 0.3s ease;" title="${months[idx]}: $${rev}"></div>
                <span style="font-size:11px;font-weight:700;color:var(--gray-500);">${months[idx]}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Booking Volume Chart -->
      <div class="admin-card">
        <div class="admin-card-title">Monthly Booking Volumes</div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;height:240px;padding:20px 10px;background:var(--gray-50);border-radius:var(--radius-xl);border:1px solid var(--gray-200);">
          ${monthlyBookingsCount.map((count, idx) => {
            const h = Math.max(10, Math.round((count / maxBookings) * 160));
            return `
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;">
                <span style="font-size:10px;font-weight:600;color:#3B82F6;">${count > 0 ? count : ''}</span>
                <div style="width:70%;height:${h}px;background:#3B82F6;border-radius:4px 4px 0 0;transition:all 0.3s ease;" title="${months[idx]}: ${count} bookings"></div>
                <span style="font-size:11px;font-weight:700;color:var(--gray-500);">${months[idx]}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  window.renderAdminPage(contentHtml, '/admin/reports');
};

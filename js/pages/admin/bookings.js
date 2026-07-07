/**
 * ELKHALIL HOTEL — Admin Bookings Page
 * Full CRUD for bookings management
 */

window.renderBookingsPage = function() {
  document.title = 'Bookings — Admin Panel';
  let bookings = window.getStoredBookings() || [];
  let search = '';
  let filterStatus = 'All';
  let filterPayment = 'All';
  let sortBy = 'newest';
  let page = 1;
  const perPage = 10;

  const statuses = ['All', 'Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'];
  const paymentStatuses = ['All', 'Paid', 'Unpaid', 'Partial'];
  const statusColors = { Confirmed: 'badge-green', Pending: 'badge-orange', Cancelled: 'badge-red', 'Checked-in': 'badge-blue', 'Checked-out': 'badge-gray' };
  const paymentColors = { Paid: 'badge-green', Unpaid: 'badge-red', Partial: 'badge-orange' };

  const getFiltered = () => {
    let filtered = [...bookings];
    if (search) filtered = filtered.filter(b =>
      (b.guest || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.room || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.email || '').toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatus !== 'All') filtered = filtered.filter(b => b.status === filterStatus);
    if (filterPayment !== 'All') filtered = filtered.filter(b => b.payment === filterPayment);
    if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.createdAt || b.checkIn) - new Date(a.createdAt || a.checkIn));
    else if (sortBy === 'oldest') filtered.sort((a, b) => new Date(a.createdAt || a.checkIn) - new Date(b.createdAt || b.checkIn));
    else if (sortBy === 'amount-high') filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
    else if (sortBy === 'checkin') filtered.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
    return filtered;
  };

  const renderTable = (filtered) => {
    const total = filtered.length;
    const paged = filtered.slice((page - 1) * perPage, page * perPage);
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const totalRevenue = filtered.reduce((acc, b) => acc + Number(b.amount || 0), 0);

    return `
      <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap;align-items:center;">
        <div class="search-box" style="flex:1;min-width:200px;">
          <span class="search-icon">${window.Icons.search}</span>
          <input type="text" id="booking-search" class="search-input" placeholder="Search by name, ID, room..." value="${search}" oninput="bookingSearchChange(this.value)">
        </div>
        <select class="filter-select" onchange="bookingFilterChange('status', this.value)">
          ${statuses.map(s => `<option value="${s}" ${s === filterStatus ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <select class="filter-select" onchange="bookingFilterChange('payment', this.value)">
          ${paymentStatuses.map(s => `<option value="${s}" ${s === filterPayment ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <select class="filter-select" onchange="bookingFilterChange('sort', this.value)">
          <option value="newest" ${sortBy==='newest'?'selected':''}>Newest First</option>
          <option value="oldest" ${sortBy==='oldest'?'selected':''}>Oldest First</option>
          <option value="amount-high" ${sortBy==='amount-high'?'selected':''}>Highest Amount</option>
          <option value="checkin" ${sortBy==='checkin'?'selected':''}>Check-in Date</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="openAddBookingModal()">+ New Booking</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-3);margin-bottom:var(--space-4);">
        ${[
          { label: 'Total Bookings', value: total },
          { label: 'Revenue (filtered)', value: `$${totalRevenue.toLocaleString()}` },
          { label: 'Pending', value: filtered.filter(b => b.status === 'Pending').length },
          { label: 'Checked-in', value: filtered.filter(b => b.status === 'Checked-in').length },
        ].map(s => `<div class="stat-card" style="padding:var(--space-3);"><div class="stat-card-label">${s.label}</div><div class="stat-card-value" style="font-size:20px;">${s.value}</div></div>`).join('')}
      </div>

      <div class="admin-card" style="padding:0;">
        <div class="table-toolbar">
          <span style="font-size:13px;color:var(--gray-500);">${total} bookings found · Page ${page} of ${totalPages}</span>
          <button class="btn btn-outline btn-sm" onclick="exportBookings()">Export CSV</button>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>ID</th><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Nights</th><th>Guests</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
            <tbody>
              ${paged.length ? paged.map(b => `
                <tr>
                  <td style="font-size:12px;color:var(--gray-400);">${b.id}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <div class="avatar">${b.avatar || (b.guest||'G')[0]}</div>
                      <div>
                        <div style="font-weight:600;font-size:13px;">${b.guest}</div>
                        <div style="font-size:11px;color:var(--gray-400);">${b.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style="font-size:13px;">${b.room}</td>
                  <td style="font-size:13px;">${b.checkIn}</td>
                  <td style="font-size:13px;">${b.checkOut}</td>
                  <td style="text-align:center;">${b.nights}</td>
                  <td style="text-align:center;">${b.guests}</td>
                  <td style="font-weight:700;color:var(--gold);">$${b.amount || b.price}</td>
                  <td><span class="badge ${statusColors[b.status] || 'badge-gray'}">${b.status}</span></td>
                  <td><span class="badge ${paymentColors[b.payment] || 'badge-gray'}">${b.payment}</span></td>
                  <td>
                    <div style="display:flex;gap:4px;">
                      <button class="icon-action-btn" title="View" onclick="viewBooking('${b.id}')">${window.Icons.user}</button>
                      <button class="icon-action-btn" title="Edit" onclick="editBooking('${b.id}')">${window.Icons.settings}</button>
                      <button class="icon-action-btn danger" title="Delete" onclick="deleteBooking('${b.id}')">${window.Icons.x}</button>
                    </div>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="11" style="text-align:center;padding:30px;color:var(--gray-400);">No bookings found.</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="table-footer">
          <span>${(page-1)*perPage + 1}–${Math.min(page*perPage, total)} of ${total}</span>
          <div style="display:flex;gap:var(--space-2);">
            <button class="btn btn-sm btn-outline" ${page <= 1 ? 'disabled' : ''} onclick="bookingChangePage(${page-1})">← Prev</button>
            <button class="btn btn-sm btn-outline" ${page >= totalPages ? 'disabled' : ''} onclick="bookingChangePage(${page+1})">Next →</button>
          </div>
        </div>
      </div>
    `;
  };

  const renderContent = () => {
    const grid = document.getElementById('bookings-content');
    if (grid) grid.innerHTML = renderTable(getFiltered());
  };

  const contentHtml = `
    <div class="admin-page-header">
      <div class="admin-page-header-text">
        <h1>Bookings</h1>
        <p>Manage all hotel and tour reservations</p>
      </div>
    </div>
    <div id="bookings-content">${renderTable(getFiltered())}</div>
    <div id="booking-modal-root"></div>
  `;

  window.renderAdminPage(contentHtml, '/admin/bookings');

  // Actions
  window.bookingSearchChange = (val) => { search = val; page = 1; renderContent(); };
  window.bookingFilterChange = (type, val) => {
    if (type === 'status') filterStatus = val;
    else if (type === 'payment') filterPayment = val;
    else if (type === 'sort') sortBy = val;
    page = 1; renderContent();
  };
  window.bookingChangePage = (p) => { page = p; renderContent(); };

  window.deleteBooking = async (id) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    bookings = bookings.filter(b => b.id !== id);
    await window.saveStoredBookings(bookings);
    renderContent();
    window.showAdminToast('Booking deleted!', 'success');
  };

  window.viewBooking = (id) => {
    const b = bookings.find(b => b.id === id);
    if (!b) return;
    document.getElementById('booking-modal-root').innerHTML = `
      <div class="admin-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="admin-modal">
          <div class="admin-modal-header">
            <h3>Booking Details — ${b.id}</h3>
            <button class="icon-action-btn" onclick="document.getElementById('booking-modal-root').innerHTML=''">${window.Icons.x}</button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-form-grid">
              ${[['Guest Name', b.guest], ['Email', b.email], ['Phone', b.phone], ['Room', b.room], ['Check-in', b.checkIn], ['Check-out', b.checkOut], ['Nights', b.nights], ['Guests', b.guests], ['Amount', '$' + b.amount], ['Status', b.status], ['Payment', b.payment], ['Payment Method', b.paymentMethod], ['Booked On', b.createdAt]].map(([label, val]) => `
                <div><div style="font-size:11px;font-weight:700;color:var(--gray-400);margin-bottom:4px;text-transform:uppercase;">${label}</div><div style="font-size:14px;font-weight:600;color:var(--gray-800);">${val || 'N/A'}</div></div>
              `).join('')}
            </div>
          </div>
          <div class="admin-modal-footer">
            <button onclick="document.getElementById('booking-modal-root').innerHTML=''" class="btn btn-outline">Close</button>
            <button onclick="editBooking('${b.id}')" class="btn btn-primary">Edit Booking</button>
          </div>
        </div>
      </div>
    `;
  };

  window.editBooking = (id) => {
    const b = bookings.find(b => b.id === id);
    if (!b) return;
    const rooms = window.getStoredRooms();
    document.getElementById('booking-modal-root').innerHTML = `
      <div class="admin-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="admin-modal">
          <div class="admin-modal-header">
            <h3>Edit Booking — ${b.id}</h3>
            <button class="icon-action-btn" onclick="document.getElementById('booking-modal-root').innerHTML=''">${window.Icons.x}</button>
          </div>
          <div class="admin-modal-body">
            <form id="edit-booking-form" class="admin-form-grid" onsubmit="saveBookingEdit(event, '${id}')">
              <div class="form-group"><label class="form-label">Guest Name</label><input class="form-input" value="${b.guest}" name="guest" required></div>
              <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" value="${b.email || ''}" name="email"></div>
              <div class="form-group"><label class="form-label">Phone</label><input class="form-input" value="${b.phone || ''}" name="phone"></div>
              <div class="form-group"><label class="form-label">Room</label>
                <select class="form-input" name="room">
                  ${rooms.map(r => `<option value="${r.name}" ${r.name === b.room ? 'selected' : ''}>${r.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label class="form-label">Check-in</label><input class="form-input" type="date" value="${b.checkIn}" name="checkIn" required></div>
              <div class="form-group"><label class="form-label">Check-out</label><input class="form-input" type="date" value="${b.checkOut}" name="checkOut" required></div>
              <div class="form-group"><label class="form-label">Guests</label><input class="form-input" type="number" value="${b.guests || 1}" name="guests" min="1"></div>
              <div class="form-group"><label class="form-label">Amount ($)</label><input class="form-input" type="number" value="${b.amount || 0}" name="amount" min="0"></div>
              <div class="form-group"><label class="form-label">Status</label>
                <select class="form-input" name="status">
                  ${['Pending','Confirmed','Checked-in','Checked-out','Cancelled'].map(s => `<option value="${s}" ${s===b.status?'selected':''}>${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label class="form-label">Payment</label>
                <select class="form-input" name="payment">
                  ${['Unpaid','Paid','Partial'].map(s => `<option value="${s}" ${s===b.payment?'selected':''}>${s}</option>`).join('')}
                </select>
              </div>
            </form>
          </div>
          <div class="admin-modal-footer">
            <button onclick="document.getElementById('booking-modal-root').innerHTML=''" class="btn btn-outline">Cancel</button>
            <button type="submit" form="edit-booking-form" class="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    `;
  };

  window.saveBookingEdit = async (e, id) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) return;
    const updated = { ...bookings[idx] };
    fd.forEach((val, key) => { updated[key] = val; });
    const nights = Math.max(1, Math.round((new Date(updated.checkOut) - new Date(updated.checkIn)) / (1000 * 60 * 60 * 24)));
    updated.nights = nights;
    bookings[idx] = updated;
    await window.saveStoredBookings(bookings);
    document.getElementById('booking-modal-root').innerHTML = '';
    renderContent();
    window.showAdminToast('Booking updated!', 'success');
  };

  window.openAddBookingModal = () => {
    const rooms = window.getStoredRooms();
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    document.getElementById('booking-modal-root').innerHTML = `
      <div class="admin-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="admin-modal">
          <div class="admin-modal-header">
            <h3>New Booking</h3>
            <button class="icon-action-btn" onclick="document.getElementById('booking-modal-root').innerHTML=''">${window.Icons.x}</button>
          </div>
          <div class="admin-modal-body">
            <form id="add-booking-form" class="admin-form-grid" onsubmit="submitNewBooking(event)">
              <div class="form-group"><label class="form-label">Guest Name *</label><input class="form-input" name="guest" required placeholder="Full name"></div>
              <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" name="email" placeholder="email@example.com"></div>
              <div class="form-group"><label class="form-label">Phone</label><input class="form-input" name="phone" placeholder="+20 xxx xxx xxxx"></div>
              <div class="form-group"><label class="form-label">Country</label><input class="form-input" name="country" placeholder="Country"></div>
              <div class="form-group"><label class="form-label">Room *</label>
                <select class="form-input" name="room" required>
                  <option value="">Select room...</option>
                  ${rooms.map(r => `<option value="${r.name}" data-id="${r.id}" data-price="${r.price}">${r.name} ($${r.price}/night)</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label class="form-label">Check-in *</label><input class="form-input" type="date" name="checkIn" required min="${today}" value="${today}"></div>
              <div class="form-group"><label class="form-label">Check-out *</label><input class="form-input" type="date" name="checkOut" required min="${tomorrow}" value="${tomorrow}"></div>
              <div class="form-group"><label class="form-label">Guests</label><input class="form-input" type="number" name="guests" min="1" value="1"></div>
              <div class="form-group"><label class="form-label">Amount ($)</label><input class="form-input" type="number" name="amount" min="0" value="0"></div>
              <div class="form-group"><label class="form-label">Status</label>
                <select class="form-input" name="status">
                  <option>Pending</option><option>Confirmed</option><option>Checked-in</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">Payment</label>
                <select class="form-input" name="payment">
                  <option>Unpaid</option><option>Paid</option><option>Partial</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">Payment Method</label>
                <select class="form-input" name="paymentMethod">
                  <option>Pay at Hotel</option><option>Credit Card</option><option>Bank Transfer</option><option>Cash</option>
                </select>
              </div>
            </form>
          </div>
          <div class="admin-modal-footer">
            <button onclick="document.getElementById('booking-modal-root').innerHTML=''" class="btn btn-outline">Cancel</button>
            <button type="submit" form="add-booking-form" class="btn btn-primary">Add Booking</button>
          </div>
        </div>
      </div>
    `;
  };

  window.submitNewBooking = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {};
    fd.forEach((val, key) => { data[key] = val; });
    const nights = Math.max(1, Math.round((new Date(data.checkOut) - new Date(data.checkIn)) / (1000 * 60 * 60 * 24)));
    const newBooking = {
      id: 'BKG-' + Math.floor(10000 + Math.random() * 90000),
      ...data,
      nights,
      guests: Number(data.guests) || 1,
      amount: Number(data.amount) || 0,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatar: (data.guest?.[0] || 'G').toUpperCase(),
    };
    bookings.push(newBooking);
    await window.saveStoredBookings(bookings);
    document.getElementById('booking-modal-root').innerHTML = '';
    renderContent();
    window.showAdminToast('Booking added!', 'success');
  };

  window.exportBookings = () => {
    const filtered = getFiltered();
    const headers = ['ID', 'Guest', 'Email', 'Phone', 'Room', 'Check-in', 'Check-out', 'Nights', 'Guests', 'Amount', 'Status', 'Payment'];
    const rows = filtered.map(b => [b.id, b.guest, b.email, b.phone, b.room, b.checkIn, b.checkOut, b.nights, b.guests, b.amount, b.status, b.payment]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bookings.csv';
    a.click();
  };

  window.addEventListener('storage', () => {
    if (window.Router.currentPath === '/admin/bookings') {
      bookings = window.getStoredBookings() || [];
      renderContent();
    }
  }, { once: true });
};

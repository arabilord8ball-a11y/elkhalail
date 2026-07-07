/**
 * ELKHALIL HOTEL — Admin Guests Page
 * Ported from Guests.jsx
 */

window.renderGuestsPage = function() {
  document.title = 'Guests — Admin Panel';
  let guests = window.getStoredGuests() || [];
  let bookings = window.getStoredBookings() || [];
  let search = '';
  let page = 1;
  const perPage = 10;

  const getFiltered = () => {
    let filtered = [...guests];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(g =>
        (g.name || '').toLowerCase().includes(q) ||
        (g.email || '').toLowerCase().includes(q) ||
        (g.phone || '').toLowerCase().includes(q) ||
        (g.passport || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const renderTable = (filtered) => {
    const total = filtered.length;
    const paged = filtered.slice((page - 1) * perPage, page * perPage);
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    return `
      <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap;align-items:center;">
        <div class="search-box" style="flex:1;min-width:200px;">
          <span class="search-icon">${window.Icons.search}</span>
          <input type="text" id="guests-search" class="search-input" placeholder="Search by name, email, phone..." value="${search}" oninput="guestSearchChange(this.value)">
        </div>
        <button class="btn btn-primary btn-sm" onclick="openAddGuestModal()">+ Add Guest</button>
      </div>

      <div class="admin-card" style="padding:0;">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Passport / ID</th>
                <th>Bookings Count</th>
                <th>Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paged.length ? paged.map(g => {
                const guestBookings = bookings.filter(b => b.email === g.email || b.guest === g.name);
                const totalSpent = guestBookings.reduce((acc, b) => acc + Number(b.amount || 0), 0);
                return `
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:8px;">
                        <div class="avatar">${g.avatar || (g.name || 'G')[0]}</div>
                        <span style="font-weight:600;color:var(--gray-800);">${g.name}</span>
                      </div>
                    </td>
                    <td>${g.email || 'N/A'}</td>
                    <td>${g.phone || 'N/A'}</td>
                    <td>${g.passport || 'N/A'}</td>
                    <td style="text-align:center;">${guestBookings.length}</td>
                    <td style="font-weight:700;color:var(--gold);">$${totalSpent.toLocaleString()}</td>
                    <td>
                      <div style="display:flex;gap:4px;">
                        <button class="icon-action-btn" title="View History" onclick="viewGuestHistory('${g.id || g.email}')">${window.Icons.calendar}</button>
                        <button class="icon-action-btn" title="Edit" onclick="editGuest('${g.id || g.email}')">${window.Icons.settings}</button>
                        <button class="icon-action-btn danger" title="Delete" onclick="deleteGuest('${g.id || g.email}')">${window.Icons.x}</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--gray-400);">No guests found.</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="table-footer">
          <span>${(page-1)*perPage + 1}–${Math.min(page*perPage, total)} of ${total}</span>
          <div style="display:flex;gap:var(--space-2);">
            <button class="btn btn-sm btn-outline" ${page <= 1 ? 'disabled' : ''} onclick="guestChangePage(${page-1})">← Prev</button>
            <button class="btn btn-sm btn-outline" ${page >= totalPages ? 'disabled' : ''} onclick="guestChangePage(${page+1})">Next →</button>
          </div>
        </div>
      </div>
    `;
  };

  const renderContent = () => {
    const el = document.getElementById('guests-content');
    if (el) el.innerHTML = renderTable(getFiltered());
  };

  const contentHtml = `
    <div class="admin-page-header">
      <div class="admin-page-header-text">
        <h1>Guests Directory</h1>
        <p>View, edit, search, and manage registered guest profiles and histories</p>
      </div>
    </div>
    <div id="guests-content">${renderTable(getFiltered())}</div>
    <div id="guests-modal-root"></div>
  `;

  window.renderAdminPage(contentHtml, '/admin/guests');

  window.guestSearchChange = (val) => { search = val; page = 1; renderContent(); };
  window.guestChangePage = (p) => { page = p; renderContent(); };

  window.deleteGuest = async (key) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    guests = guests.filter(g => (g.id || g.email) !== key);
    await window.saveStoredGuests(guests);
    renderContent();
    window.showAdminToast('Guest deleted!', 'success');
  };

  window.viewGuestHistory = (key) => {
    const g = guests.find(g => (g.id || g.email) === key);
    if (!g) return;
    const guestBookings = bookings.filter(b => b.email === g.email || b.guest === g.name);
    
    document.getElementById('guests-modal-root').innerHTML = `
      <div class="admin-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="admin-modal" style="max-width:750px;">
          <div class="admin-modal-header">
            <h3>Booking History — ${g.name}</h3>
            <button class="icon-action-btn" onclick="document.getElementById('guests-modal-root').innerHTML=''">${window.Icons.x}</button>
          </div>
          <div class="admin-modal-body" style="max-height:60vh;overflow-y:auto;">
            <div style="margin-bottom:20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
              <div><strong>Email:</strong> ${g.email}</div>
              <div><strong>Phone:</strong> ${g.phone}</div>
              <div><strong>Passport:</strong> ${g.passport || 'N/A'}</div>
            </div>
            <h4 style="margin-bottom:12px;">Reservations (${guestBookings.length})</h4>
            <div class="table-wrapper">
              <table class="data-table" style="font-size:13px;">
                <thead><tr><th>Booking ID</th><th>Room/Service</th><th>Check-in</th><th>Check-out</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  ${guestBookings.length ? guestBookings.map(b => `
                    <tr>
                      <td>${b.id}</td>
                      <td>${b.room}</td>
                      <td>${b.checkIn}</td>
                      <td>${b.checkOut}</td>
                      <td style="font-weight:700;color:var(--gold);">$${b.amount}</td>
                      <td><span class="badge ${b.status==='Confirmed'?'badge-green':b.status==='Pending'?'badge-orange':'badge-gray'}">${b.status}</span></td>
                    </tr>
                  `).join('') : '<tr><td colspan="6" style="text-align:center;padding:20px;">No bookings found.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
          <div class="admin-modal-footer">
            <button onclick="document.getElementById('guests-modal-root').innerHTML=''" class="btn btn-primary">Close</button>
          </div>
        </div>
      </div>
    `;
  };

  window.openAddGuestModal = () => {
    document.getElementById('guests-modal-root').innerHTML = `
      <div class="admin-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="admin-modal">
          <div class="admin-modal-header">
            <h3>Add New Guest</h3>
            <button class="icon-action-btn" onclick="document.getElementById('guests-modal-root').innerHTML=''">${window.Icons.x}</button>
          </div>
          <div class="admin-modal-body">
            <form id="add-guest-form" class="admin-form-grid" onsubmit="submitNewGuest(event)">
              <div class="form-group"><label class="form-label">Full Name *</label><input class="form-input" name="name" required></div>
              <div class="form-group"><label class="form-label">Email Address *</label><input class="form-input" type="email" name="email" required></div>
              <div class="form-group"><label class="form-label">Phone Number</label><input class="form-input" name="phone"></div>
              <div class="form-group"><label class="form-label">Passport / ID Number</label><input class="form-input" name="passport"></div>
              <div class="form-group" style="grid-column: 1/-1;"><label class="form-label">Notes</label><textarea class="form-input" name="notes" rows="2"></textarea></div>
            </form>
          </div>
          <div class="admin-modal-footer">
            <button onclick="document.getElementById('guests-modal-root').innerHTML=''" class="btn btn-outline">Cancel</button>
            <button type="submit" form="add-guest-form" class="btn btn-primary">Add Guest</button>
          </div>
        </div>
      </div>
    `;
  };

  window.submitNewGuest = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {};
    fd.forEach((val, key) => { data[key] = val; });

    const newGuest = {
      id: 'GST-' + Math.floor(10000 + Math.random() * 90000),
      name: data.name,
      email: data.email,
      phone: data.phone || 'N/A',
      passport: data.passport || 'N/A',
      avatar: (data.name[0] || 'G').toUpperCase(),
      notes: data.notes || '',
      createdAt: new Date().toLocaleDateString('en-US')
    };

    guests.push(newGuest);
    await window.saveStoredGuests(guests);
    document.getElementById('guests-modal-root').innerHTML = '';
    renderContent();
    window.showAdminToast('Guest added successfully!', 'success');
  };

  window.editGuest = (key) => {
    const g = guests.find(guest => (guest.id || guest.email) === key);
    if (!g) return;
    document.getElementById('guests-modal-root').innerHTML = `
      <div class="admin-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="admin-modal">
          <div class="admin-modal-header">
            <h3>Edit Guest — ${g.name}</h3>
            <button class="icon-action-btn" onclick="document.getElementById('guests-modal-root').innerHTML=''">${window.Icons.x}</button>
          </div>
          <div class="admin-modal-body">
            <form id="edit-guest-form" class="admin-form-grid" onsubmit="submitGuestEdit(event, '${key}')">
              <div class="form-group"><label class="form-label">Full Name *</label><input class="form-input" name="name" value="${g.name}" required></div>
              <div class="form-group"><label class="form-label">Email Address *</label><input class="form-input" type="email" name="email" value="${g.email}" required></div>
              <div class="form-group"><label class="form-label">Phone Number</label><input class="form-input" name="phone" value="${g.phone || ''}"></div>
              <div class="form-group"><label class="form-label">Passport / ID Number</label><input class="form-input" name="passport" value="${g.passport || ''}"></div>
              <div class="form-group" style="grid-column: 1/-1;"><label class="form-label">Notes</label><textarea class="form-input" name="notes" rows="2">${g.notes || ''}</textarea></div>
            </form>
          </div>
          <div class="admin-modal-footer">
            <button onclick="document.getElementById('guests-modal-root').innerHTML=''" class="btn btn-outline">Cancel</button>
            <button type="submit" form="edit-guest-form" class="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    `;
  };

  window.submitGuestEdit = async (e, key) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {};
    fd.forEach((val, key) => { data[key] = val; });

    const idx = guests.findIndex(g => (g.id || g.email) === key);
    if (idx === -1) return;

    guests[idx] = {
      ...guests[idx],
      name: data.name,
      email: data.email,
      phone: data.phone,
      passport: data.passport,
      notes: data.notes
    };

    await window.saveStoredGuests(guests);
    document.getElementById('guests-modal-root').innerHTML = '';
    renderContent();
    window.showAdminToast('Guest details updated!', 'success');
  };
};

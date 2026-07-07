/**
 * ELKHALIL HOTEL — Admin Payments Management
 * Ported from Payments.jsx
 */

window.renderPaymentsPage = function() {
  document.title = 'Payments — Admin Panel';
  let payments = window.getStoredPayments() || [];
  let search = '';
  let filterStatus = 'All';

  const getFiltered = () => {
    let filtered = [...payments];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        (p.guest || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q) ||
        (p.bookingId || '').toLowerCase().includes(q) ||
        (p.method || '').toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'All') filtered = filtered.filter(p => p.status === filterStatus);
    return filtered;
  };

  const renderTable = (filtered) => {
    const totalRevenue = filtered.filter(p => p.status === 'Paid').reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const statusColors = { Paid: 'badge-green', Unpaid: 'badge-red', Refunded: 'badge-gray', Pending: 'badge-orange' };

    return `
      <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap;align-items:center;">
        <div class="search-box" style="flex:1;min-width:200px;">
          <span class="search-icon">${window.Icons.search}</span>
          <input type="text" id="payments-search" class="search-input" placeholder="Search payments by name, booking ID..." value="${search}" oninput="paymentsSearchChange(this.value)">
        </div>
        <select class="filter-select" onchange="paymentsFilterChange(this.value)">
          <option value="All">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Pending">Pending</option>
          <option value="Refunded">Refunded</option>
        </select>
        <div style="font-weight:700;font-size:15px;color:var(--gold);margin-left:auto;">
          Total Collected: $${totalRevenue.toLocaleString()}
        </div>
      </div>

      <div class="admin-card" style="padding:0;">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length ? filtered.map(p => `
                <tr>
                  <td style="font-family:monospace;font-size:12px;color:var(--gray-400);">${p.id}</td>
                  <td style="font-family:monospace;font-size:12px;">${p.bookingId}</td>
                  <td style="font-weight:600;color:var(--gray-800);">${p.guest}</td>
                  <td>${p.method || 'Credit Card'}</td>
                  <td style="font-weight:700;color:var(--gold);">$${p.amount}</td>
                  <td>${p.date || 'Today'}</td>
                  <td><span class="badge ${statusColors[p.status] || 'badge-gray'}">${p.status}</span></td>
                  <td>
                    <div style="display:flex;gap:4px;">
                      ${p.status !== 'Paid' ? `<button class="btn btn-sm btn-primary" onclick="markPaymentPaid('${p.id}')" style="padding:2px 8px;font-size:11px;">Mark Paid</button>` : ''}
                      ${p.status === 'Paid' ? `<button class="btn btn-sm btn-outline" onclick="refundPayment('${p.id}')" style="padding:2px 8px;font-size:11px;">Refund</button>` : ''}
                      <button class="icon-action-btn danger" onclick="deletePayment('${p.id}')" style="width:24px;height:24px;">${window.Icons.x}</button>
                    </div>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--gray-400);">No transactions found.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const renderContent = () => {
    const el = document.getElementById('payments-admin-content');
    if (el) el.innerHTML = renderTable(getFiltered());
  };

  const contentHtml = `
    <div class="admin-page-header">
      <div class="admin-page-header-text">
        <h1>Payments & Transactions</h1>
        <p>Monitor customer invoices, receipts, payment statuses, and transaction details</p>
      </div>
    </div>
    <div id="payments-admin-content">${renderTable(getFiltered())}</div>
  `;

  window.renderAdminPage(contentHtml, '/admin/payments');

  window.paymentsSearchChange = (val) => { search = val; renderContent(); };
  window.paymentsFilterChange = (val) => { filterStatus = val; renderContent(); };

  window.markPaymentPaid = async (id) => {
    const idx = payments.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;
    payments[idx].status = 'Paid';
    await window.saveStoredPayments(payments);
    
    // Also update corresponding booking
    const bookings = window.getStoredBookings() || [];
    const bIdx = bookings.findIndex(b => b.id === payments[idx].bookingId);
    if (bIdx !== -1) {
      bookings[bIdx].payment = 'Paid';
      await window.saveStoredBookings(bookings);
    }

    renderContent();
    window.showAdminToast('Transaction marked as Paid!', 'success');
  };

  window.refundPayment = async (id) => {
    if (!confirm('Are you sure you want to refund this transaction?')) return;
    const idx = payments.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;
    payments[idx].status = 'Refunded';
    await window.saveStoredPayments(payments);
    
    const bookings = window.getStoredBookings() || [];
    const bIdx = bookings.findIndex(b => b.id === payments[idx].bookingId);
    if (bIdx !== -1) {
      bookings[bIdx].payment = 'Unpaid';
      bookings[bIdx].status = 'Cancelled';
      await window.saveStoredBookings(bookings);
    }

    renderContent();
    window.showAdminToast('Transaction refunded!', 'info');
  };

  window.deletePayment = async (id) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    payments = payments.filter(p => String(p.id) !== String(id));
    await window.saveStoredPayments(payments);
    renderContent();
    window.showAdminToast('Transaction deleted permanently!', 'success');
  };
};

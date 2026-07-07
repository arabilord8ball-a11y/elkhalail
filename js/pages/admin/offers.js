/**
 * ELKHALIL HOTEL — Admin Offers & Coupons
 * Ported from Offers.jsx
 */

window.renderAdminOffersPage = function() {
  document.title = 'Offers & Coupons — Admin Panel';
  let offers = window.getStoredOffers() || [];
  let filterStatus = 'All';

  const getFiltered = () => {
    let filtered = [...offers];
    if (filterStatus === 'Active') filtered = filtered.filter(o => o.status === 'Active');
    else if (filterStatus === 'Inactive') filtered = filtered.filter(o => o.status === 'Inactive');
    return filtered;
  };

  const renderTable = (filtered) => {
    return `
      <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap;align-items:center;">
        <select class="filter-select" onchange="offersFilterChange(this.value)">
          <option value="All">All Offers</option>
          <option value="Active">Active Only</option>
          <option value="Inactive">Inactive Only</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="openAddOfferModal()" style="margin-left:auto;">+ Create Offer</button>
      </div>

      <div class="admin-card" style="padding:0;">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Discount</th>
                <th>Min Nights</th>
                <th>Valid From</th>
                <th>Valid To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length ? filtered.map(o => `
                <tr>
                  <td style="font-family:monospace;font-weight:700;color:var(--gold);font-size:15px;letter-spacing:1px;">${o.code}</td>
                  <td style="font-weight:600;color:var(--gray-800);">${o.title}</td>
                  <td>${o.discount}</td>
                  <td style="text-align:center;">${o.minNights || 1} nights</td>
                  <td>${o.validFrom || 'N/A'}</td>
                  <td>${o.validTo || 'N/A'}</td>
                  <td><span class="badge ${o.status === 'Active' ? 'badge-green' : 'badge-red'}">${o.status}</span></td>
                  <td>
                    <div style="display:flex;gap:4px;">
                      <button class="icon-action-btn" title="Edit" onclick="editOffer('${o.id}')">${window.Icons.settings}</button>
                      <button class="icon-action-btn danger" title="Delete" onclick="deleteOffer('${o.id}')">${window.Icons.x}</button>
                    </div>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--gray-400);">No offers found.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const renderContent = () => {
    const el = document.getElementById('offers-admin-content');
    if (el) el.innerHTML = renderTable(getFiltered());
  };

  const contentHtml = `
    <div class="admin-page-header">
      <div class="admin-page-header-text">
        <h1>Offers & Coupons</h1>
        <p>Manage promotional coupon codes, discounts, seasonal offers, and validation criteria</p>
      </div>
    </div>
    <div id="offers-admin-content">${renderTable(getFiltered())}</div>
    <div id="offers-modal-root"></div>
  `;

  window.renderAdminPage(contentHtml, '/admin/offers');

  window.offersFilterChange = (val) => {
    filterStatus = val;
    renderContent();
  };

  window.deleteOffer = async (id) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    offers = offers.filter(o => String(o.id) !== String(id));
    await window.saveStoredOffers(offers);
    renderContent();
    window.showAdminToast('Offer deleted successfully!', 'success');
  };

  window.openAddOfferModal = () => {
    document.getElementById('offers-modal-root').innerHTML = `
      <div class="admin-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="admin-modal">
          <div class="admin-modal-header">
            <h3>Create Promo Offer</h3>
            <button class="icon-action-btn" onclick="document.getElementById('offers-modal-root').innerHTML=''">${window.Icons.x}</button>
          </div>
          <div class="admin-modal-body">
            <form id="add-offer-form" class="admin-form-grid" onsubmit="submitNewOffer(event)">
              <div class="form-group"><label class="form-label">Promo Code *</label><input class="form-input" name="code" required placeholder="e.g. PYRAMID15" style="text-transform:uppercase;"></div>
              <div class="form-group"><label class="form-label">Offer Title *</label><input class="form-input" name="title" required placeholder="e.g. Special Summer Discount"></div>
              <div class="form-group"><label class="form-label">Discount Value *</label><input class="form-input" name="discount" required placeholder="e.g. 15% or $20"></div>
              <div class="form-group"><label class="form-label">Min Nights Required</label><input class="form-input" type="number" name="minNights" value="1" min="1"></div>
              <div class="form-group"><label class="form-label">Valid From</label><input class="form-input" type="date" name="validFrom"></div>
              <div class="form-group"><label class="form-label">Valid To</label><input class="form-input" type="date" name="validTo"></div>
              <div class="form-group"><label class="form-label">Status</label>
                <select class="form-input" name="status">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Description</label><textarea class="form-input" name="description" rows="2" placeholder="Describe the offer rules..."></textarea></div>
            </form>
          </div>
          <div class="admin-modal-footer">
            <button onclick="document.getElementById('offers-modal-root').innerHTML=''" class="btn btn-outline">Cancel</button>
            <button type="submit" form="add-offer-form" class="btn btn-primary">Create Offer</button>
          </div>
        </div>
      </div>
    `;
  };

  window.submitNewOffer = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {};
    fd.forEach((val, key) => { data[key] = val; });

    const newOffer = {
      id: 'OFF-' + Math.floor(10000 + Math.random() * 90000),
      code: data.code.toUpperCase(),
      title: data.title,
      discount: data.discount,
      minNights: Number(data.minNights) || 1,
      validFrom: data.validFrom || '',
      validTo: data.validTo || '',
      status: data.status,
      description: data.description || ''
    };

    offers.push(newOffer);
    await window.saveStoredOffers(offers);
    document.getElementById('offers-modal-root').innerHTML = '';
    renderContent();
    window.showAdminToast('Offer created successfully!', 'success');
  };

  window.editOffer = (id) => {
    const o = offers.find(offer => String(offer.id) === String(id));
    if (!o) return;
    document.getElementById('offers-modal-root').innerHTML = `
      <div class="admin-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="admin-modal">
          <div class="admin-modal-header">
            <h3>Edit Offer — ${o.code}</h3>
            <button class="icon-action-btn" onclick="document.getElementById('offers-modal-root').innerHTML=''">${window.Icons.x}</button>
          </div>
          <div class="admin-modal-body">
            <form id="edit-offer-form" class="admin-form-grid" onsubmit="submitOfferEdit(event, '${id}')">
              <div class="form-group"><label class="form-label">Promo Code *</label><input class="form-input" name="code" value="${o.code}" required style="text-transform:uppercase;"></div>
              <div class="form-group"><label class="form-label">Offer Title *</label><input class="form-input" name="title" value="${o.title}" required></div>
              <div class="form-group"><label class="form-label">Discount Value *</label><input class="form-input" name="discount" value="${o.discount}" required></div>
              <div class="form-group"><label class="form-label">Min Nights Required</label><input class="form-input" type="number" name="minNights" value="${o.minNights || 1}" min="1"></div>
              <div class="form-group"><label class="form-label">Valid From</label><input class="form-input" type="date" name="validFrom" value="${o.validFrom || ''}"></div>
              <div class="form-group"><label class="form-label">Valid To</label><input class="form-input" type="date" name="validTo" value="${o.validTo || ''}"></div>
              <div class="form-group"><label class="form-label">Status</label>
                <select class="form-input" name="status">
                  <option value="Active" ${o.status==='Active'?'selected':''}>Active</option>
                  <option value="Inactive" ${o.status==='Inactive'?'selected':''}>Inactive</option>
                </select>
              </div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Description</label><textarea class="form-input" name="description" rows="2">${o.description || ''}</textarea></div>
            </form>
          </div>
          <div class="admin-modal-footer">
            <button onclick="document.getElementById('offers-modal-root').innerHTML=''" class="btn btn-outline">Cancel</button>
            <button type="submit" form="edit-offer-form" class="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    `;
  };

  window.submitOfferEdit = async (e, id) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {};
    fd.forEach((val, key) => { data[key] = val; });

    const idx = offers.findIndex(offer => String(offer.id) === String(id));
    if (idx === -1) return;

    offers[idx] = {
      ...offers[idx],
      code: data.code.toUpperCase(),
      title: data.title,
      discount: data.discount,
      minNights: Number(data.minNights) || 1,
      validFrom: data.validFrom,
      validTo: data.validTo,
      status: data.status,
      description: data.description
    };

    await window.saveStoredOffers(offers);
    document.getElementById('offers-modal-root').innerHTML = '';
    renderContent();
    window.showAdminToast('Offer details updated!', 'success');
  };
};

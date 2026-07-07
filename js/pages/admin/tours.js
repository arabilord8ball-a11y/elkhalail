/**
 * ELKHALIL HOTEL — Admin Tours Management
 * Ported from Tours.jsx
 */

window.renderAdminToursPage = function() {
  document.title = 'Tours Management — Admin Panel';
  let tours = window.getStoredTours() || [];
  let search = '';
  let filterCategory = 'All';
  let filterStatus = 'All';

  const categories = ['All', ...new Set(tours.map(t => t.category).filter(Boolean))];
  const statuses = ['All', 'Active', 'Inactive'];

  const getFiltered = () => {
    let filtered = [...tours];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'All') filtered = filtered.filter(t => t.category === filterCategory);
    if (filterStatus !== 'All') filtered = filtered.filter(t => t.status === filterStatus);
    return filtered;
  };

  const renderTable = (filtered) => {
    return `
      <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap;align-items:center;">
        <div class="search-box" style="flex:1;min-width:200px;">
          <span class="search-icon">${window.Icons.search}</span>
          <input type="text" id="admin-tours-search" class="search-input" placeholder="Search tours..." value="${search}" oninput="adminTourSearchChange(this.value)">
        </div>
        <select class="filter-select" onchange="adminTourFilterChange('category', this.value)">
          ${categories.map(c => `<option value="${c}" ${c === filterCategory ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <select class="filter-select" onchange="adminTourFilterChange('status', this.value)">
          ${statuses.map(s => `<option value="${s}" ${s === filterStatus ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <button class="btn btn-primary btn-sm" onclick="openAddTourModal()">+ Add Tour</button>
      </div>

      <div class="admin-card" style="padding:0;">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Max Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length ? filtered.map(t => {
                const img = (t.images && t.images[0]) || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&q=80';
                return `
                  <tr>
                    <td><img src="${img}" alt="${t.name}" style="width:60px;height:45px;object-fit:cover;border-radius:4px;border:1px solid var(--site-border);"></td>
                    <td style="font-weight:600;color:var(--gray-800);">${t.name}</td>
                    <td>${t.category || 'Sightseeing'}</td>
                    <td style="font-weight:700;color:var(--gold);">$${t.price}/person</td>
                    <td>${t.duration || '1 day'}</td>
                    <td>${t.capacity || 10} people</td>
                    <td><span class="badge ${t.status === 'Active' ? 'badge-green' : 'badge-red'}">${t.status}</span></td>
                    <td>
                      <div style="display:flex;gap:4px;">
                        <button class="icon-action-btn" title="Edit" onclick="editTour('${t.id}')">${window.Icons.settings}</button>
                        <button class="icon-action-btn danger" title="Delete" onclick="deleteTour('${t.id}')">${window.Icons.x}</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--gray-400);">No tours found.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const renderContent = () => {
    const el = document.getElementById('tours-admin-content');
    if (el) el.innerHTML = renderTable(getFiltered());
  };

  const contentHtml = `
    <div class="admin-page-header">
      <div class="admin-page-header-text">
        <h1>Tours Management</h1>
        <p>Configure local tours, sightseeing packages, durations, pricing, and active statuses</p>
      </div>
    </div>
    <div id="tours-admin-content">${renderTable(getFiltered())}</div>
    <div id="tours-modal-root"></div>
  `;

  window.renderAdminPage(contentHtml, '/admin/tours');

  window.adminTourSearchChange = (val) => { search = val; renderContent(); };
  window.adminTourFilterChange = (type, val) => {
    if (type === 'category') filterCategory = val;
    else if (type === 'status') filterStatus = val;
    renderContent();
  };

  window.deleteTour = async (id) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;
    tours = tours.filter(t => String(t.id) !== String(id));
    await window.saveStoredTours(tours);
    renderContent();
    window.showAdminToast('Tour deleted!', 'success');
  };

  window.openAddTourModal = () => {
    document.getElementById('tours-modal-root').innerHTML = `
      <div class="admin-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="admin-modal" style="max-width:700px;">
          <div class="admin-modal-header">
            <h3>Add New Tour</h3>
            <button class="icon-action-btn" onclick="document.getElementById('tours-modal-root').innerHTML=''">${window.Icons.x}</button>
          </div>
          <div class="admin-modal-body">
            <form id="add-tour-form" class="admin-form-grid" onsubmit="submitNewTour(event)">
              <div class="form-group"><label class="form-label">Tour Name *</label><input class="form-input" name="name" required placeholder="e.g. Pyramids & Sphinx Half-Day Tour"></div>
              <div class="form-group"><label class="form-label">Category *</label>
                <select class="form-input" name="category" required>
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Historical">Historical</option>
                  <option value="Cruises">Cruises</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">Price per Person ($) *</label><input class="form-input" type="number" name="price" required min="1" value="50"></div>
              <div class="form-group"><label class="form-label">Duration *</label><input class="form-input" name="duration" required placeholder="e.g. 4 hours or 1 day"></div>
              <div class="form-group"><label class="form-label">Max Capacity (People) *</label><input class="form-input" type="number" name="capacity" required min="1" value="10"></div>
              <div class="form-group"><label class="form-label">Status</label>
                <select class="form-input" name="status">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Description</label><textarea class="form-input" name="description" rows="3" placeholder="Tour details..."></textarea></div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Image URL</label><input class="form-input" name="imageUrl" placeholder="https://images.unsplash.com/..."></div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Included (Comma separated)</label><input class="form-input" name="included" placeholder="Hotel pickup, Tour guide, Entry tickets" value="Hotel pickup, English-speaking guide"></div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Excluded (Comma separated)</label><input class="form-input" name="excluded" placeholder="Lunch, Tipping, Camel rides" value="Tipping, Lunch"></div>
            </form>
          </div>
          <div class="admin-modal-footer">
            <button onclick="document.getElementById('tours-modal-root').innerHTML=''" class="btn btn-outline">Cancel</button>
            <button type="submit" form="add-tour-form" class="btn btn-primary">Add Tour</button>
          </div>
        </div>
      </div>
    `;
  };

  window.submitNewTour = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {};
    fd.forEach((val, key) => { data[key] = val; });

    const newTour = {
      id: tours.length ? Math.max(...tours.map(t => Number(t.id))) + 1 : 1,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: data.category,
      price: Number(data.price),
      duration: data.duration,
      capacity: Number(data.capacity),
      status: data.status,
      description: data.description,
      images: data.imageUrl ? [data.imageUrl] : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80'],
      included: data.included.split(',').map(i => i.trim()).filter(Boolean),
      excluded: data.excluded.split(',').map(e => e.trim()).filter(Boolean),
      rating: 5.0,
      reviewCount: 0
    };

    tours.push(newTour);
    await window.saveStoredTours(tours);
    document.getElementById('tours-modal-root').innerHTML = '';
    renderContent();
    window.showAdminToast('Tour added successfully!', 'success');
  };

  window.editTour = (id) => {
    const t = tours.find(tour => String(tour.id) === String(id));
    if (!t) return;
    document.getElementById('tours-modal-root').innerHTML = `
      <div class="admin-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="admin-modal" style="max-width:700px;">
          <div class="admin-modal-header">
            <h3>Edit Tour — ${t.name}</h3>
            <button class="icon-action-btn" onclick="document.getElementById('tours-modal-root').innerHTML=''">${window.Icons.x}</button>
          </div>
          <div class="admin-modal-body">
            <form id="edit-tour-form" class="admin-form-grid" onsubmit="submitTourEdit(event, '${id}')">
              <div class="form-group"><label class="form-label">Tour Name *</label><input class="form-input" name="name" value="${t.name}" required></div>
              <div class="form-group"><label class="form-label">Category *</label>
                <select class="form-input" name="category" required>
                  <option value="Sightseeing" ${t.category==='Sightseeing'?'selected':''}>Sightseeing</option>
                  <option value="Adventure" ${t.category==='Adventure'?'selected':''}>Adventure</option>
                  <option value="Historical" ${t.category==='Historical'?'selected':''}>Historical</option>
                  <option value="Cruises" ${t.category==='Cruises'?'selected':''}>Cruises</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">Price per Person ($) *</label><input class="form-input" type="number" name="price" value="${t.price}" required min="1"></div>
              <div class="form-group"><label class="form-label">Duration *</label><input class="form-input" name="duration" value="${t.duration || ''}" required></div>
              <div class="form-group"><label class="form-label">Max Capacity (People) *</label><input class="form-input" type="number" name="capacity" value="${t.capacity}" required min="1"></div>
              <div class="form-group"><label class="form-label">Status</label>
                <select class="form-input" name="status">
                  <option value="Active" ${t.status==='Active'?'selected':''}>Active</option>
                  <option value="Inactive" ${t.status==='Inactive'?'selected':''}>Inactive</option>
                </select>
              </div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Description</label><textarea class="form-input" name="description" rows="3">${t.description || ''}</textarea></div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Image URL</label><input class="form-input" name="imageUrl" value="${(t.images && t.images[0]) || ''}"></div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Included (Comma separated)</label><input class="form-input" name="included" value="${(t.included || []).join(', ')}"></div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Excluded (Comma separated)</label><input class="form-input" name="excluded" value="${(t.excluded || []).join(', ')}"></div>
            </form>
          </div>
          <div class="admin-modal-footer">
            <button onclick="document.getElementById('tours-modal-root').innerHTML=''" class="btn btn-outline">Cancel</button>
            <button type="submit" form="edit-tour-form" class="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    `;
  };

  window.submitTourEdit = async (e, id) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {};
    fd.forEach((val, key) => { data[key] = val; });

    const idx = tours.findIndex(tour => String(tour.id) === String(id));
    if (idx === -1) return;

    tours[idx] = {
      ...tours[idx],
      name: data.name,
      category: data.category,
      price: Number(data.price),
      duration: data.duration,
      capacity: Number(data.capacity),
      status: data.status,
      description: data.description,
      images: data.imageUrl ? [data.imageUrl] : tours[idx].images,
      included: data.included.split(',').map(i => i.trim()).filter(Boolean),
      excluded: data.excluded.split(',').map(ex => ex.trim()).filter(Boolean)
    };

    await window.saveStoredTours(tours);
    document.getElementById('tours-modal-root').innerHTML = '';
    renderContent();
    window.showAdminToast('Tour updated successfully!', 'success');
  };
};

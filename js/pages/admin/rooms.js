/**
 * ELKHALIL HOTEL — Admin Rooms Page
 * Ported from Rooms.jsx
 */

window.renderAdminRoomsPage = function() {
  document.title = 'Rooms — Admin Panel';
  let rooms = window.getStoredRooms() || [];
  let search = '';
  let filterType = 'All';
  let filterStatus = 'All';

  const roomTypes = ['All', ...new Set(rooms.map(r => r.type).filter(Boolean))];
  const statuses = ['All', 'Available', 'Booked', 'Maintenance'];

  const getFiltered = () => {
    let filtered = [...rooms];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r => 
        (r.name || '').toLowerCase().includes(q) ||
        (r.type || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q)
      );
    }
    if (filterType !== 'All') filtered = filtered.filter(r => r.type === filterType);
    if (filterStatus !== 'All') filtered = filtered.filter(r => r.status === filterStatus);
    return filtered;
  };

  const renderTable = (filtered) => {
    return `
      <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap;align-items:center;">
        <div class="search-box" style="flex:1;min-width:200px;">
          <span class="search-icon">${window.Icons.search}</span>
          <input type="text" id="rooms-search" class="search-input" placeholder="Search rooms by name, type..." value="${search}" oninput="roomSearchChange(this.value)">
        </div>
        <select class="filter-select" onchange="roomFilterChange('type', this.value)">
          ${roomTypes.map(t => `<option value="${t}" ${t === filterType ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <select class="filter-select" onchange="roomFilterChange('status', this.value)">
          ${statuses.map(s => `<option value="${s}" ${s === filterStatus ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <button class="btn btn-primary btn-sm" onclick="openAddRoomModal()">+ Add Room</button>
      </div>

      <div class="admin-card" style="padding:0;">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Type</th>
                <th>Price</th>
                <th>Capacity</th>
                <th>Size</th>
                <th>Beds</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length ? filtered.map(r => {
                const img = (r.images && r.images[0]) || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100&q=80';
                return `
                  <tr>
                    <td><img src="${img}" alt="${r.name}" style="width:60px;height:45px;object-fit:cover;border-radius:4px;border:1px solid var(--site-border);"></td>
                    <td style="font-weight:600;color:var(--gray-800);">${r.name}</td>
                    <td>${r.type || 'Standard'}</td>
                    <td style="font-weight:700;color:var(--gold);">$${r.price}/night</td>
                    <td>${r.capacity || 2} guests</td>
                    <td>${r.size || 20} m²</td>
                    <td>${r.beds || '1 Double'}</td>
                    <td><span class="badge ${r.status === 'Available' ? 'badge-green' : r.status === 'Maintenance' ? 'badge-orange' : 'badge-red'}">${r.status}</span></td>
                    <td>
                      <div style="display:flex;gap:4px;">
                        <button class="icon-action-btn" title="Edit" onclick="editRoom('${r.id}')">${window.Icons.settings}</button>
                        <button class="icon-action-btn danger" title="Delete" onclick="deleteRoom('${r.id}')">${window.Icons.x}</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--gray-400);">No rooms found.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const renderContent = () => {
    const el = document.getElementById('rooms-content');
    if (el) el.innerHTML = renderTable(getFiltered());
  };

  const contentHtml = `
    <div class="admin-page-header">
      <div class="admin-page-header-text">
        <h1>Rooms Management</h1>
        <p>Manage room types, configurations, pricing, and availability</p>
      </div>
    </div>
    <div id="rooms-content">${renderTable(getFiltered())}</div>
    <div id="rooms-modal-root"></div>
  `;

  window.renderAdminPage(contentHtml, '/admin/rooms');

  window.roomSearchChange = (val) => { search = val; renderContent(); };
  window.roomFilterChange = (type, val) => {
    if (type === 'type') filterType = val;
    else if (type === 'status') filterStatus = val;
    renderContent();
  };

  window.deleteRoom = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    rooms = rooms.filter(r => String(r.id) !== String(id));
    await window.saveStoredRooms(rooms);
    renderContent();
    window.showAdminToast('Room deleted successfully!', 'success');
  };

  window.openAddRoomModal = () => {
    document.getElementById('rooms-modal-root').innerHTML = `
      <div class="admin-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="admin-modal" style="max-width:700px;">
          <div class="admin-modal-header">
            <h3>Add New Room</h3>
            <button class="icon-action-btn" onclick="document.getElementById('rooms-modal-root').innerHTML=''">${window.Icons.x}</button>
          </div>
          <div class="admin-modal-body">
            <form id="add-room-form" class="admin-form-grid" onsubmit="submitNewRoom(event)">
              <div class="form-group"><label class="form-label">Room Name *</label><input class="form-input" name="name" required placeholder="e.g. Pyramid View Suite"></div>
              <div class="form-group"><label class="form-label">Room Type *</label>
                <select class="form-input" name="type" required>
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Family">Family</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">Price per Night ($) *</label><input class="form-input" type="number" name="price" required min="1" value="100"></div>
              <div class="form-group"><label class="form-label">Capacity (Guests) *</label><input class="form-input" type="number" name="capacity" required min="1" value="2"></div>
              <div class="form-group"><label class="form-label">Size (m²) *</label><input class="form-input" type="number" name="size" required min="1" value="25"></div>
              <div class="form-group"><label class="form-label">Beds *</label><input class="form-input" name="beds" required placeholder="e.g. 1 King Bed"></div>
              <div class="form-group"><label class="form-label">View</label><input class="form-input" name="view" placeholder="e.g. Pyramids View"></div>
              <div class="form-group"><label class="form-label">Status</label>
                <select class="form-input" name="status">
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Description</label><textarea class="form-input" name="description" rows="3" placeholder="Enter room details..."></textarea></div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Image URL</label><input class="form-input" name="imageUrl" placeholder="https://images.unsplash.com/..."></div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Amenities (Comma separated)</label><input class="form-input" name="amenities" placeholder="Free Wi-Fi, Air Conditioning, Smart TV, Minibar" value="Free Wi-Fi, Air Conditioning, Smart TV"></div>
            </form>
          </div>
          <div class="admin-modal-footer">
            <button onclick="document.getElementById('rooms-modal-root').innerHTML=''" class="btn btn-outline">Cancel</button>
            <button type="submit" form="add-room-form" class="btn btn-primary">Add Room</button>
          </div>
        </div>
      </div>
    `;
  };

  window.submitNewRoom = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {};
    fd.forEach((val, key) => { data[key] = val; });

    const newRoom = {
      id: rooms.length ? Math.max(...rooms.map(r => Number(r.id))) + 1 : 1,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      type: data.type,
      price: Number(data.price),
      capacity: Number(data.capacity),
      size: Number(data.size),
      beds: data.beds,
      view: data.view || 'City View',
      status: data.status,
      description: data.description,
      images: data.imageUrl ? [data.imageUrl] : ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80'],
      amenities: data.amenities.split(',').map(a => a.trim()).filter(Boolean),
      rating: 5.0,
      reviewCount: 0
    };

    rooms.push(newRoom);
    await window.saveStoredRooms(rooms);
    document.getElementById('rooms-modal-root').innerHTML = '';
    renderContent();
    window.showAdminToast('Room added successfully!', 'success');
  };

  window.editRoom = (id) => {
    const r = rooms.find(room => String(room.id) === String(id));
    if (!r) return;
    document.getElementById('rooms-modal-root').innerHTML = `
      <div class="admin-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="admin-modal" style="max-width:700px;">
          <div class="admin-modal-header">
            <h3>Edit Room — ${r.name}</h3>
            <button class="icon-action-btn" onclick="document.getElementById('rooms-modal-root').innerHTML=''">${window.Icons.x}</button>
          </div>
          <div class="admin-modal-body">
            <form id="edit-room-form" class="admin-form-grid" onsubmit="submitRoomEdit(event, '${id}')">
              <div class="form-group"><label class="form-label">Room Name *</label><input class="form-input" name="name" value="${r.name}" required></div>
              <div class="form-group"><label class="form-label">Room Type *</label>
                <select class="form-input" name="type" required>
                  <option value="Standard" ${r.type==='Standard'?'selected':''}>Standard</option>
                  <option value="Deluxe" ${r.type==='Deluxe'?'selected':''}>Deluxe</option>
                  <option value="Suite" ${r.type==='Suite'?'selected':''}>Suite</option>
                  <option value="Family" ${r.type==='Family'?'selected':''}>Family</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">Price per Night ($) *</label><input class="form-input" type="number" name="price" value="${r.price}" required min="1"></div>
              <div class="form-group"><label class="form-label">Capacity (Guests) *</label><input class="form-input" type="number" name="capacity" value="${r.capacity}" required min="1"></div>
              <div class="form-group"><label class="form-label">Size (m²) *</label><input class="form-input" type="number" name="size" value="${r.size}" required min="1"></div>
              <div class="form-group"><label class="form-label">Beds *</label><input class="form-input" name="beds" value="${r.beds || ''}" required></div>
              <div class="form-group"><label class="form-label">View</label><input class="form-input" name="view" value="${r.view || ''}"></div>
              <div class="form-group"><label class="form-label">Status</label>
                <select class="form-input" name="status">
                  <option value="Available" ${r.status==='Available'?'selected':''}>Available</option>
                  <option value="Booked" ${r.status==='Booked'?'selected':''}>Booked</option>
                  <option value="Maintenance" ${r.status==='Maintenance'?'selected':''}>Maintenance</option>
                </select>
              </div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Description</label><textarea class="form-input" name="description" rows="3">${r.description || ''}</textarea></div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Image URL</label><input class="form-input" name="imageUrl" value="${(r.images && r.images[0]) || ''}"></div>
              <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Amenities (Comma separated)</label><input class="form-input" name="amenities" value="${(r.amenities || []).join(', ')}"></div>
            </form>
          </div>
          <div class="admin-modal-footer">
            <button onclick="document.getElementById('rooms-modal-root').innerHTML=''" class="btn btn-outline">Cancel</button>
            <button type="submit" form="edit-room-form" class="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    `;
  };

  window.submitRoomEdit = async (e, id) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {};
    fd.forEach((val, key) => { data[key] = val; });

    const idx = rooms.findIndex(room => String(room.id) === String(id));
    if (idx === -1) return;

    rooms[idx] = {
      ...rooms[idx],
      name: data.name,
      type: data.type,
      price: Number(data.price),
      capacity: Number(data.capacity),
      size: Number(data.size),
      beds: data.beds,
      view: data.view,
      status: data.status,
      description: data.description,
      images: data.imageUrl ? [data.imageUrl] : rooms[idx].images,
      amenities: data.amenities.split(',').map(a => a.trim()).filter(Boolean)
    };

    await window.saveStoredRooms(rooms);
    document.getElementById('rooms-modal-root').innerHTML = '';
    renderContent();
    window.showAdminToast('Room updated successfully!', 'success');
  };
};

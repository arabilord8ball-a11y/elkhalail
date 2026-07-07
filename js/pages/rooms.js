/**
 * ELKHALIL HOTEL — Rooms Page
 * Ported from Rooms.jsx
 */

window.renderRoomsPage = function() {
  document.title = 'Our Rooms — Elkhalil Hotel';
  const settings = window.getStoredSettings();
  const rooms = window.getStoredRooms();

  const getTodayPrice = (roomId, basePrice) => {
    const cal = window.getRoomCalendar(roomId) || {};
    const d = new Date();
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return (cal[ds] && cal[ds].price !== undefined) ? cal[ds].price : basePrice;
  };

  const categories = ['All', ...new Set(rooms.map(r => r.type).filter(Boolean))];
  let selectedCategory = 'All';
  let filterStatus = 'All';

  const renderRoomCards = (filtered) => {
    if (!filtered.length) return `<div class="no-results"><span style="font-size:40px;">🏨</span><p>No rooms found.</p></div>`;
    return filtered.map(room => {
      const price = getTodayPrice(room.id, room.price);
      const img = (room.images && room.images[0]) || `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80`;
      const isAvailable = room.status === 'Available';
      const amenityIcons = (room.amenities || []).slice(0, 4).map(a => `<span class="amenity-tag">${window.Icons.wifi} ${a}</span>`).join('');
      return `
        <div class="room-card-full card" onclick="window.navigateTo('/rooms/${room.slug || room.id}')">
          <div class="room-card-img">
            <img src="${img}" alt="${room.name}" loading="lazy">
            <div class="room-badge">${room.type || 'Standard'}</div>
            ${!isAvailable ? `<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;letter-spacing:1px;">NOT AVAILABLE</div>` : ''}
          </div>
          <div class="room-card-body">
            <h3 class="room-card-name">${room.name}</h3>
            <p class="room-card-desc">${room.description || 'Comfortable and well-equipped room.'}</p>
            <div class="room-detail-meta" style="margin-bottom:var(--space-3);">
              <div class="room-detail-meta-item">${window.Icons.users} ${room.capacity || 2} guests</div>
              <div class="room-detail-meta-item">${window.Icons.maximize} ${room.size || 20}m²</div>
              <div class="room-detail-meta-item" style="color:#F59E0B">★ ${Number(room.rating || 5).toFixed(1)} (${room.reviewCount || 0})</div>
              <div class="room-detail-meta-item">${room.beds || '1 Double Bed'}</div>
            </div>
            ${amenityIcons ? `<div class="room-card-amenities">${amenityIcons}</div>` : ''}
            <div class="room-card-footer">
              <div class="room-card-price">
                <div class="price-num">$${price}<span class="price-unit">/night</span></div>
                <div class="${isAvailable ? 'room-status-available' : 'room-status-unavailable'}">${isAvailable ? '● Available' : '✕ Booked'}</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();window.navigateTo('/rooms/${room.slug || room.id}')">
                ${isAvailable ? 'BOOK NOW' : 'VIEW DETAILS'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  const getFiltered = () => {
    let filtered = rooms;
    if (selectedCategory !== 'All') filtered = filtered.filter(r => r.type === selectedCategory);
    if (filterStatus === 'Available') filtered = filtered.filter(r => r.status === 'Available');
    return filtered;
  };

  const html = `
    <div class="rooms-page">
      <div class="page-hero">
        <div class="page-hero-bg">
          <img src="${settings.imgRoomsHero || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80'}" alt="Our Rooms" loading="lazy">
          <div class="page-hero-overlay"></div>
        </div>
        <div class="container page-hero-content">
          <div class="breadcrumb white-breadcrumb">
            <a href="#/">Home</a><span>/</span><span>Rooms</span>
          </div>
          <h1>Our Rooms</h1>
          <p>Comfortable, clean and well-equipped rooms for every need</p>
        </div>
      </div>

      <section class="section">
        <div class="container">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5);flex-wrap:wrap;gap:var(--space-3);">
            <div class="filter-tabs" id="rooms-filter-tabs">
              ${categories.map(cat => `<button class="filter-tab ${cat === 'All' ? 'active' : ''}" data-cat="${cat}">${cat}</button>`).join('')}
            </div>
            <div style="display:flex;gap:var(--space-3);align-items:center;">
              <label style="font-size:13px;color:var(--gray-600);font-weight:600;">
                <input type="checkbox" id="avail-only" style="margin-right:4px;"> Available only
              </label>
              <span id="rooms-count" class="results-count"><strong>${rooms.length}</strong> rooms</span>
            </div>
          </div>
          <div class="rooms-grid" id="rooms-grid">
            ${renderRoomCards(rooms)}
          </div>
        </div>
      </section>
    </div>
  `;

  window.renderPublicPage(html, '/rooms');

  // Filter tabs
  document.querySelectorAll('#rooms-filter-tabs .filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.cat;
      document.querySelectorAll('#rooms-filter-tabs .filter-tab').forEach(b => b.classList.toggle('active', b === btn));
      const filtered = getFiltered();
      document.getElementById('rooms-grid').innerHTML = renderRoomCards(filtered);
      document.getElementById('rooms-count').innerHTML = `<strong>${filtered.length}</strong> rooms`;
    });
  });
  document.getElementById('avail-only')?.addEventListener('change', (e) => {
    filterStatus = e.target.checked ? 'Available' : 'All';
    const filtered = getFiltered();
    document.getElementById('rooms-grid').innerHTML = renderRoomCards(filtered);
    document.getElementById('rooms-count').innerHTML = `<strong>${filtered.length}</strong> rooms`;
  });

  window.addEventListener('storage', () => window.renderRoomsPage(), { once: true });
};

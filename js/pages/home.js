/**
 * ELKHALIL HOTEL — Home Page
 * Ported from Home.jsx
 */

window.renderHomePage = function() {
  const settings = window.getStoredSettings();
  const rooms = window.getStoredRooms();
  const tours = window.getStoredTours();
  let reviews = window.getStoredReviews();
  reviews = reviews.filter(r => r.status === 'Published').map(r => ({
    ...r, name: r.name || r.guest, comment: r.comment || r.review,
    country: r.country || 'Guest', avatar: r.avatar || (r.guest || 'G').slice(0, 2).toUpperCase()
  }));
  if (!reviews.length) {
    reviews = [
      { id: 1, name: 'Ahmed M.', country: 'Egypt', rating: 5, comment: 'Amazing hotel with breathtaking views of the Pyramids. Highly recommended!', avatar: 'AM', room: 'Pyramid View Room' },
      { id: 2, name: 'Sarah K.', country: 'Germany', rating: 5, comment: 'Perfect location, friendly staff and very clean rooms.', avatar: 'SK', room: 'Standard Room' },
      { id: 3, name: 'John D.', country: 'USA', rating: 4, comment: 'Great value for money. The breakfast was delicious and the pyramid view at sunset was magical.', avatar: 'JD', room: 'Deluxe Room' },
    ];
  }

  const getTodayPrice = (roomId, basePrice) => {
    const cal = window.getRoomCalendar(roomId) || {};
    const d = new Date();
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return (cal[ds] && cal[ds].price !== undefined) ? cal[ds].price : basePrice;
  };

  const featuredRooms = rooms.filter(r => r.status !== 'Maintenance').slice(0, 4);
  const featuredTours = tours.filter(t => t.status === 'Active').slice(0, 4);

  const renderStars = (r) => '★'.repeat(Math.min(5, Math.round(r || 5))) + '☆'.repeat(Math.max(0, 5 - Math.round(r || 5)));

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const tomStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;

  const logoHtml = settings.logoType === 'url'
    ? `<img src="${settings.logoValue}" alt="${settings.hotelName}" style="height:36px;width:auto;object-fit:contain;">`
    : `<span class="logo-icon">${settings.logoValue || '⚜'}</span>`;

  const whyUs = [
    { icon: window.Icons.mapPin, title: 'Prime Location', desc: 'Steps from the Pyramids of Giza' },
    { icon: window.Icons.home, title: 'Comfort & Clean', desc: 'Well-maintained, spotless rooms' },
    { icon: window.Icons.smile, title: 'Friendly Staff', desc: 'Always here to help you' },
    { icon: window.Icons.shield, title: 'Best Price', desc: 'Price match guarantee' },
  ];

  const statsData = [
    { icon: window.Icons.home, value: rooms.length || '10', label: 'Rooms' },
    { icon: window.Icons.clock, value: '24/7', label: 'Reception' },
    { icon: window.Icons.wifi, value: 'Free', label: 'Wi-Fi' },
    { icon: window.Icons.checkCircle, value: 'Daily', label: 'Housekeeping' },
    { icon: window.Icons.shield, value: 'Best Rate', label: 'Guarantee' },
    { icon: window.Icons.checkCircle, value: 'Secure', label: 'Book Now' },
  ];

  const roomsHtml = featuredRooms.length ? featuredRooms.map(room => {
    const price = getTodayPrice(room.id, room.price);
    const img = (room.images && room.images[0]) || `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80`;
    return `
      <div class="room-card card" onclick="window.navigateTo('/rooms/${room.slug || room.id}')">
        <div class="room-img-wrap">
          <img src="${img}" alt="${room.name}" loading="lazy">
          <div class="room-badge">${room.type || 'Standard'}</div>
        </div>
        <div class="room-info">
          <div class="room-name">${room.name}</div>
          <div class="room-meta">
            <div class="room-meta-item">${window.Icons.users} ${room.capacity || 2}</div>
            <div class="room-meta-item">${window.Icons.maximize} ${room.size || 20}m²</div>
            <div class="room-meta-item" style="color:#F59E0B">${renderStars(room.rating).slice(0,5)}</div>
          </div>
          <div class="room-footer">
            <div class="room-price">
              <span class="price-num">$${price}</span>
              <span class="price-unit">/night</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();window.navigateTo('/rooms/${room.slug || room.id}')">BOOK</button>
          </div>
        </div>
      </div>`;
  }).join('') : `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400);">Loading rooms...</div>`;

  const toursHtml = featuredTours.length ? featuredTours.map(tour => {
    const img = (tour.images && tour.images[0]) || `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80`;
    return `
      <div class="tour-card card" onclick="window.navigateTo('/tours/${tour.slug || tour.id}')">
        <div class="tour-img-wrap">
          <img src="${img}" alt="${tour.name}" loading="lazy">
          <div class="tour-badge">${tour.category || 'Tour'}</div>
        </div>
        <div class="tour-info">
          <div class="tour-name">${tour.name}</div>
          <div class="tour-meta">
            <div class="tour-meta-item">${window.Icons.clock} ${tour.duration || '1 day'}</div>
            <div class="tour-meta-item">${window.Icons.users} Max ${tour.capacity || 10}</div>
            <div class="tour-meta-item" style="color:#F59E0B">★ ${Number(tour.rating || 5).toFixed(1)}</div>
          </div>
          <div class="tour-footer">
            <div class="tour-price">
              <span class="price-num">$${tour.price}</span>
              <span class="price-unit">/person</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();window.navigateTo('/tours/${tour.slug || tour.id}')">BOOK</button>
          </div>
        </div>
      </div>`;
  }).join('') : `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400);">Loading tours...</div>`;

  const reviewsSlice = reviews.slice(0, 3);
  const reviewsHtml = reviewsSlice.map(rev => `
    <div class="review-card">
      <div class="review-stars" style="color:#F59E0B;font-size:15px;">${'★'.repeat(Math.min(5, rev.rating || 5))}</div>
      <p class="review-text">"${rev.comment}"</p>
      <div class="review-author">
        <div class="review-avatar">
          ${rev.avatar && rev.avatar.startsWith('http') ? `<img src="${rev.avatar}" alt="${rev.name}">` : (rev.avatar || (rev.name || 'G')[0]).toString().slice(0,2).toUpperCase()}
        </div>
        <div>
          <div class="review-name">${rev.name}</div>
          <div class="review-meta">${rev.country} · ${rev.room || 'Hotel Guest'}</div>
        </div>
      </div>
    </div>
  `).join('');

  const html = `
    <div class="home-page">
      <!-- HERO -->
      <section class="hero">
        <div class="hero-bg">
          <img src="${settings.imgHeroBg || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80'}" 
               alt="${settings.hotelName}" class="hero-img" loading="eager">
          <div class="hero-overlay"></div>
        </div>
        <div class="container hero-content">
          <p class="hero-eyebrow">Welcome to</p>
          <h1 class="hero-title">${settings.hotelName}</h1>
          <p class="hero-subtitle">${settings.heroSubtitle || 'A 15-minute walk to the Great Sphinx &amp; Giza Pyramids'}</p>
          <div class="hero-features">
            <div class="hero-feature">${window.Icons.home}<span>10 Cozy Rooms</span></div>
            <div class="hero-feature">${window.Icons.wifi}<span>Free Wi-Fi</span></div>
            <div class="hero-feature">${window.Icons.clock}<span>24/7 Reception</span></div>
            <div class="hero-feature">${window.Icons.mapPin}<span>Airport Transfer</span></div>
          </div>
          <div class="hero-ctas" style="margin-top:var(--space-8);">
            <a href="#/rooms" class="btn btn-primary btn-lg">EXPLORE ROOMS</a>
            <a href="#/tours" class="btn btn-outline btn-lg" style="color:var(--white);border-color:rgba(255,255,255,0.5);">OUR TOURS</a>
          </div>
        </div>
        <div class="hero-booking-bar">
          <div class="container">
            <form class="booking-form" id="home-booking-form" onsubmit="handleHomeBookingSubmit(event)">
              <div class="booking-form-group">
                <label class="booking-form-label">Check-in Date</label>
                <input type="date" class="booking-form-input" id="bf-checkin" min="${todayStr}" value="${todayStr}">
              </div>
              <div class="booking-form-divider"></div>
              <div class="booking-form-group">
                <label class="booking-form-label">Check-out Date</label>
                <input type="date" class="booking-form-input" id="bf-checkout" min="${tomStr}" value="${tomStr}">
              </div>
              <div class="booking-form-divider"></div>
              <div class="booking-form-group">
                <label class="booking-form-label">Guests</label>
                <select class="booking-form-input" id="bf-guests">
                  <option value="1">1 Guest</option>
                  <option value="2" selected>2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                </select>
              </div>
              <div class="booking-form-divider"></div>
              <div class="booking-form-group">
                <label class="booking-form-label">Room Type</label>
                <select class="booking-form-input" id="bf-type">
                  <option value="">Any Room Type</option>
                  ${[...new Set(rooms.map(r => r.type).filter(Boolean))].map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
              </div>
              <button type="submit" class="btn btn-primary" style="white-space:nowrap;flex-shrink:0;">CHECK AVAILABILITY</button>
            </form>
          </div>
        </div>
      </section>

      <!-- STATS BAR -->
      <section class="stats-bar">
        <div class="container">
          <div class="stats-grid">
            ${statsData.map(s => `
              <div class="stat-item">
                <div class="stat-icon">${s.icon}</div>
                <div class="stat-value">${s.value}</div>
                <div class="stat-label">${s.label}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ROOMS SECTION -->
      <section class="section" style="background:var(--site-bg);">
        <div class="container">
          <div class="flex-between mb-section-header">
            <div>
              <div class="section-tag">OUR ROOMS</div>
              <h2 class="section-title">Stay in Comfort</h2>
              <p class="section-subtitle">Choose from our ${rooms.length || 10} comfortable and well-equipped rooms.</p>
            </div>
            <a href="#/rooms" class="btn btn-outline hide-mobile">VIEW ALL ROOMS</a>
          </div>

          <div class="carousel-wrapper">
            <button class="carousel-btn prev" id="room-prev">${window.Icons.chevronLeft}</button>
            <div class="rooms-carousel" id="rooms-carousel">
              ${roomsHtml}
            </div>
            <button class="carousel-btn next" id="room-next">${window.Icons.chevronRight}</button>
          </div>
          <div style="text-align:center;margin-top:var(--space-5);">
            <a href="#/rooms" class="btn btn-outline">VIEW ALL ${rooms.length || 10} ROOMS</a>
          </div>
        </div>
      </section>

      <!-- TOURS SECTION -->
      <section class="section" style="background:var(--site-bg-alt);">
        <div class="container">
          <div class="flex-between mb-section-header">
            <div>
              <div class="section-tag">TOURS & EXCURSIONS</div>
              <h2 class="section-title">Explore the Wonders</h2>
              <p class="section-subtitle">Guided tours to Egypt's most iconic sites.</p>
            </div>
            <a href="#/tours" class="btn btn-outline hide-mobile">VIEW ALL TOURS</a>
          </div>
          <div class="carousel-wrapper">
            <button class="carousel-btn prev" id="tour-prev">${window.Icons.chevronLeft}</button>
            <div class="tours-carousel" id="tours-carousel">
              ${toursHtml}
            </div>
            <button class="carousel-btn next" id="tour-next">${window.Icons.chevronRight}</button>
          </div>
          <div style="text-align:center;margin-top:var(--space-5);">
            <a href="#/tours" class="btn btn-outline">VIEW ALL ${tours.length} TOURS</a>
          </div>
        </div>
      </section>

      <!-- WHY US -->
      <section class="section" style="background:var(--site-bg);">
        <div class="container">
          <div style="text-align:center;margin-bottom:var(--space-8);">
            <div class="section-tag" style="justify-content:center;">WHY CHOOSE US</div>
            <h2 class="section-title">The Elkhalil Difference</h2>
          </div>
          <div class="why-grid">
            ${whyUs.map(item => `
              <div class="why-card">
                <div class="why-icon">${item.icon}</div>
                <h3 class="why-title">${item.title}</h3>
                <p class="why-desc">${item.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- REVIEWS -->
      <section class="section" style="background:var(--site-bg-alt);">
        <div class="container">
          <div style="text-align:center;margin-bottom:var(--space-8);">
            <div class="section-tag" style="justify-content:center;">REVIEWS</div>
            <h2 class="section-title">What Our Guests Say</h2>
            <p class="section-subtitle" style="margin:0 auto;">Real experiences from real guests</p>
          </div>
          <div class="reviews-grid" id="reviews-grid">
            ${reviewsHtml}
          </div>
          ${reviews.length > 3 ? `
          <div class="reviews-nav">
            <button class="carousel-btn prev" id="review-prev" style="position:static;transform:none;">${window.Icons.chevronLeft}</button>
            <button class="carousel-btn next" id="review-next" style="position:static;transform:none;">${window.Icons.chevronRight}</button>
          </div>` : ''}
          <div style="text-align:center;margin-top:var(--space-6);">
            <a href="#/rooms" class="btn btn-primary">Leave a Review</a>
          </div>
        </div>
      </section>

      <!-- CTA BANNER -->
      <section class="section" style="background:var(--site-bg);">
        <div class="container">
          <div class="cta-banner">
            <h2>Ready for Your Stay?</h2>
            <p>Book directly with us for the best rates, and enjoy a truly unforgettable experience near the Pyramids.</p>
            <div class="cta-banner-btns">
              <a href="#/rooms" class="btn btn-primary btn-lg">BOOK YOUR ROOM</a>
              <a href="#/contact" class="btn btn-outline btn-lg" style="color:var(--white);border-color:rgba(255,255,255,0.4);">CONTACT US</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  window.renderPublicPage(html, '/');

  // Init page interactions
  const roomsCarousel = document.getElementById('rooms-carousel');
  const toursCarousel = document.getElementById('tours-carousel');
  let roomIdx = 0, tourIdx = 0;
  const visibleRooms = window.innerWidth <= 640 ? 1 : (window.innerWidth <= 1024 ? 2 : 4);
  const maxRoomIdx = Math.max(0, featuredRooms.length - visibleRooms);
  const maxTourIdx = Math.max(0, featuredTours.length - visibleRooms);

  const roomCards = roomsCarousel ? roomsCarousel.querySelectorAll('.room-card') : [];
  const tourCards = toursCarousel ? toursCarousel.querySelectorAll('.tour-card') : [];

  const updateCarouselVisibility = () => {
    if (window.innerWidth <= 640) return; // Let CSS scroll handle it
    roomCards.forEach((card, i) => { card.style.display = (i >= roomIdx && i < roomIdx + visibleRooms) ? '' : 'none'; });
    tourCards.forEach((card, i) => { card.style.display = (i >= tourIdx && i < tourIdx + visibleRooms) ? '' : 'none'; });
    const roomPrev = document.getElementById('room-prev');
    const roomNext = document.getElementById('room-next');
    const tourPrev = document.getElementById('tour-prev');
    const tourNext = document.getElementById('tour-next');
    if (roomPrev) roomPrev.disabled = roomIdx <= 0;
    if (roomNext) roomNext.disabled = roomIdx >= maxRoomIdx;
    if (tourPrev) tourPrev.disabled = tourIdx <= 0;
    if (tourNext) tourNext.disabled = tourIdx >= maxTourIdx;
  };

  document.getElementById('room-prev')?.addEventListener('click', () => { roomIdx = Math.max(0, roomIdx - 1); updateCarouselVisibility(); });
  document.getElementById('room-next')?.addEventListener('click', () => { roomIdx = Math.min(maxRoomIdx, roomIdx + 1); updateCarouselVisibility(); });
  document.getElementById('tour-prev')?.addEventListener('click', () => {
    if (window.innerWidth <= 640) toursCarousel?.scrollBy({ left: -300, behavior: 'smooth' });
    else { tourIdx = Math.max(0, tourIdx - 1); updateCarouselVisibility(); }
  });
  document.getElementById('tour-next')?.addEventListener('click', () => {
    if (window.innerWidth <= 640) toursCarousel?.scrollBy({ left: 300, behavior: 'smooth' });
    else { tourIdx = Math.min(maxTourIdx, tourIdx + 1); updateCarouselVisibility(); }
  });

  // Reviews nav
  let revIdx = 0;
  const renderCurrentReviews = () => {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;
    const slice = reviews.slice(revIdx, revIdx + 3);
    grid.innerHTML = slice.map(rev => `
      <div class="review-card">
        <div class="review-stars" style="color:#F59E0B;font-size:15px;">${'★'.repeat(Math.min(5, rev.rating || 5))}</div>
        <p class="review-text">"${rev.comment}"</p>
        <div class="review-author">
          <div class="review-avatar">${rev.avatar && rev.avatar.startsWith('http') ? `<img src="${rev.avatar}" alt="${rev.name}">` : (rev.avatar || (rev.name || 'G')[0]).toString().slice(0,2).toUpperCase()}</div>
          <div>
            <div class="review-name">${rev.name}</div>
            <div class="review-meta">${rev.country} · ${rev.room || 'Hotel Guest'}</div>
          </div>
        </div>
      </div>
    `).join('');
  };
  document.getElementById('review-prev')?.addEventListener('click', () => { revIdx = Math.max(0, revIdx - 3); renderCurrentReviews(); });
  document.getElementById('review-next')?.addEventListener('click', () => { revIdx = Math.min(reviews.length - 3, revIdx + 3); renderCurrentReviews(); });

  updateCarouselVisibility();

  // Listen for data updates
  window.addEventListener('storage', () => {
    // Reload page data when storage changes
    window.renderHomePage();
  }, { once: true });
};

window.handleHomeBookingSubmit = function(e) {
  e.preventDefault();
  const checkIn = document.getElementById('bf-checkin')?.value;
  const checkOut = document.getElementById('bf-checkout')?.value;
  const guests = document.getElementById('bf-guests')?.value;
  const type = document.getElementById('bf-type')?.value;
  const params = new URLSearchParams({ checkIn, checkOut, guests, type });
  window.navigateTo('/search?' + params.toString());
};

/**
 * ELKHALIL HOTEL — Room Detail Page
 * Ported from RoomDetail.jsx
 */

window.renderRoomDetailPage = function(slug) {
  const rooms = window.getStoredRooms();
  const room = rooms.find(r => r.slug === slug || String(r.id) === String(slug));

  if (!room) {
    window.renderPublicPage(`
      <div class="room-detail-page">
        <div style="padding-top:var(--navbar-height);"></div>
        <div class="room-not-found" style="text-align:center;padding:80px 20px;">
          <h2>Room Not Found</h2>
          <p style="color:var(--gray-500);margin:16px 0 24px;">This room doesn't exist or has been removed.</p>
          <a href="#/rooms" class="btn btn-primary">VIEW ALL ROOMS</a>
        </div>
      </div>
    `, '/rooms');
    return;
  }

  document.title = `${room.name} — Elkhalil Hotel`;

  const images = (room.images && room.images.length) ? room.images : ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'];
  const getTodayPrice = (roomId, basePrice) => {
    const cal = window.getRoomCalendar(roomId) || {};
    const d = new Date();
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return (cal[ds] && cal[ds].price !== undefined) ? cal[ds].price : basePrice;
  };
  const price = getTodayPrice(room.id, room.price);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const tomStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;

  const reviews = window.getStoredReviews().filter(r => r.status === 'Published' && (r.room === room.name || r.room === room.id));
  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + Number(r.rating || 5), 0) / reviews.length).toFixed(1) : Number(room.rating || 5).toFixed(1);
  const reviewCount = reviews.length || room.reviewCount || 0;

  const amenitiesHtml = (room.amenities || []).map(a => `
    <div class="room-amenity-item">
      <span class="room-amenity-icon">${window.Icons.checkCircle}</span>
      <span>${a}</span>
    </div>
  `).join('');

  const galleryHtml = images.map((img, i) => `
    <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-img="${img}" data-idx="${i}">
      <img src="${img}" alt="Room image ${i+1}" loading="lazy">
    </div>
  `).join('');

  const reviewsHtml = reviews.length ? reviews.slice(0, 4).map(rev => `
    <div class="review-card">
      <div class="review-stars" style="color:#F59E0B;font-size:14px;">${'★'.repeat(Math.min(5, rev.rating || 5))}</div>
      <p class="review-text">"${rev.review || rev.comment}"</p>
      <div class="review-author">
        <div class="review-avatar">${(rev.avatar || (rev.guest || 'G')[0]).toString().slice(0,2).toUpperCase()}</div>
        <div>
          <div class="review-name">${rev.guest || rev.name}</div>
          <div class="review-meta">${rev.country || 'Guest'} · ${rev.date || ''}</div>
        </div>
      </div>
    </div>
  `).join('') : `<p style="color:var(--gray-400);font-size:14px;">No reviews yet for this room.</p>`;

  const html = `
    <div class="room-detail-page">
      <div style="padding-top:var(--navbar-height);background:var(--site-bg-alt);padding-bottom:var(--space-3);">
        <div class="container">
          <div class="breadcrumb">
            <a href="#/">Home</a><span>/</span>
            <a href="#/rooms">Rooms</a><span>/</span>
            <span>${room.name}</span>
          </div>
        </div>
      </div>
      <section class="section-sm" style="background:var(--site-bg);">
        <div class="container">
          <div class="room-detail-layout">
            <!-- LEFT COLUMN -->
            <div>
              <!-- Gallery -->
              <div class="gallery-main" id="gallery-main">
                <img src="${images[0]}" alt="${room.name}" id="gallery-main-img" style="width:100%;height:100%;object-fit:cover;">
                ${images.length > 1 ? `
                  <button class="gallery-nav prev" id="gallery-prev">${window.Icons.chevronLeft}</button>
                  <button class="gallery-nav next" id="gallery-next">${window.Icons.chevronRight}</button>
                ` : ''}
              </div>
              ${images.length > 1 ? `<div class="gallery-thumbs">${galleryHtml}</div>` : ''}

              <!-- Info -->
              <div style="margin-top:var(--space-6);">
                <h1 class="room-detail-title">${room.name}</h1>
                <div class="room-detail-meta">
                  <div class="room-detail-meta-item">${window.Icons.users} ${room.capacity || 2} Guests</div>
                  <div class="room-detail-meta-item">${window.Icons.maximize} ${room.size || 20}m²</div>
                  <div class="room-detail-meta-item">${room.beds || '1 Double Bed'}</div>
                  <div class="room-detail-meta-item">${room.view || 'City View'}</div>
                  <div class="room-detail-rating">
                    <span style="color:#F59E0B;">★</span> ${avgRating}
                    <span style="font-size:13px;color:var(--gray-400);font-weight:400;">(${reviewCount} reviews)</span>
                  </div>
                </div>
                <p class="room-detail-desc">${room.description || 'Comfortable and well-equipped room with all amenities.'}</p>

                ${amenitiesHtml ? `
                <div style="margin-bottom:var(--space-6);">
                  <h3 style="font-size:17px;font-weight:700;color:var(--site-heading);margin-bottom:var(--space-4);">Room Amenities</h3>
                  <div class="room-detail-amenities-grid">${amenitiesHtml}</div>
                </div>
                ` : ''}

                <!-- Reviews -->
                <div>
                  <h3 style="font-size:17px;font-weight:700;color:var(--site-heading);margin-bottom:var(--space-4);">Guest Reviews</h3>
                  <div class="reviews-grid">${reviewsHtml}</div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN (Booking Card) -->
            <div>
              <div class="book-now-card">
                <div class="book-now-price">$${price} <span>/night</span></div>
                <div style="color:var(--green);font-size:13px;font-weight:600;margin-bottom:var(--space-4);">
                  ${room.status === 'Available' ? '● Available' : '✕ Currently Booked'}
                </div>
                <form class="book-now-form" id="room-book-form" onsubmit="handleRoomBooking(event, '${room.id}', '${room.slug}', '${room.name}', ${price})">
                  <div class="form-group">
                    <label class="form-label">Check-in Date</label>
                    <input type="date" class="form-input" id="book-checkin" required min="${todayStr}" value="${todayStr}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Check-out Date</label>
                    <input type="date" class="form-input" id="book-checkout" required min="${tomStr}" value="${tomStr}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Guests</label>
                    <select class="form-input" id="book-guests">
                      ${Array.from({ length: room.capacity || 2 }, (_, i) => i+1).map(n => `<option value="${n}">${n} Guest${n>1?'s':''}</option>`).join('')}
                    </select>
                  </div>
                  <div id="book-price-preview" style="background:var(--site-bg-alt);border-radius:var(--radius-md);padding:var(--space-4);font-size:14px;display:flex;flex-direction:column;gap:var(--space-2);">
                    <div style="display:flex;justify-content:space-between;color:var(--gray-600);">
                      <span>$${price} × 1 night</span>
                      <span>$${price}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-weight:700;color:var(--site-heading);border-top:1px solid var(--site-border);padding-top:var(--space-2);margin-top:var(--space-1);">
                      <span>Total</span>
                      <span id="book-total">$${price}</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-input" id="book-name" placeholder="Enter your full name" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" id="book-email" placeholder="your@email.com" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Phone</label>
                    <input type="tel" class="form-input" id="book-phone" placeholder="+20 xxx xxx xxxx">
                  </div>
                  <button type="submit" class="btn btn-primary" style="width:100%;" id="book-submit" ${room.status !== 'Available' ? 'disabled' : ''}>
                    ${room.status === 'Available' ? 'CONFIRM BOOKING' : 'ROOM UNAVAILABLE'}
                  </button>
                </form>
                <div style="margin-top:var(--space-4);display:flex;flex-direction:column;gap:var(--space-2);">
                  <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--gray-500);">${window.Icons.shield} Free cancellation up to 24h before</div>
                  <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--gray-500);">${window.Icons.checkCircle} Pay at hotel or pay now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  window.renderPublicPage(html, '/rooms');

  // Gallery
  let imgIdx = 0;
  const mainImg = document.getElementById('gallery-main-img');
  const updateGalleryMain = (idx) => {
    imgIdx = idx;
    if (mainImg) mainImg.src = images[idx];
    document.querySelectorAll('.gallery-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
  };
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => updateGalleryMain(Number(thumb.dataset.idx)));
  });
  document.getElementById('gallery-prev')?.addEventListener('click', () => updateGalleryMain((imgIdx - 1 + images.length) % images.length));
  document.getElementById('gallery-next')?.addEventListener('click', () => updateGalleryMain((imgIdx + 1) % images.length));

  // Booking form - price preview
  const calcPrice = () => {
    const ci = document.getElementById('book-checkin')?.value;
    const co = document.getElementById('book-checkout')?.value;
    if (!ci || !co) return;
    const nights = Math.max(1, Math.round((new Date(co) - new Date(ci)) / (1000 * 60 * 60 * 24)));
    const total = price * nights;
    const preview = document.getElementById('book-price-preview');
    if (preview) preview.innerHTML = `
      <div style="display:flex;justify-content:space-between;color:var(--gray-600);">
        <span>$${price} × ${nights} night${nights>1?'s':''}</span><span>$${total}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-weight:700;color:var(--site-heading);border-top:1px solid var(--site-border);padding-top:var(--space-2);margin-top:var(--space-1);">
        <span>Total</span><span id="book-total">$${total}</span>
      </div>`;
  };
  document.getElementById('book-checkin')?.addEventListener('change', calcPrice);
  document.getElementById('book-checkout')?.addEventListener('change', calcPrice);
};

window.handleRoomBooking = async function(e, roomId, roomSlug, roomName, pricePerNight) {
  e.preventDefault();
  const submitBtn = document.getElementById('book-submit');
  const checkIn = document.getElementById('book-checkin')?.value;
  const checkOut = document.getElementById('book-checkout')?.value;
  const guests = Number(document.getElementById('book-guests')?.value) || 1;
  const name = document.getElementById('book-name')?.value?.trim();
  const email = document.getElementById('book-email')?.value?.trim();
  const phone = document.getElementById('book-phone')?.value?.trim();

  if (!checkIn || !checkOut || !name || !email) {
    alert('Please fill all required fields.');
    return;
  }

  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  if (co <= ci) { alert('Check-out must be after check-in.'); return; }

  // Check availability
  const available = window.checkRoomAvailability(roomId, checkIn, checkOut);
  if (!available) { alert('This room is not available for the selected dates.'); return; }

  const nights = Math.max(1, Math.round((co - ci) / (1000 * 60 * 60 * 24)));
  const totalAmount = pricePerNight * nights;
  const bookingId = 'BKG-' + Math.floor(10000 + Math.random() * 90000);
  const paymentId = 'PAY-' + Math.floor(10000 + Math.random() * 90000);

  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';

  try {
    const rooms = window.getStoredRooms();
    const room = rooms.find(r => String(r.id) === String(roomId));

    const bookings = window.getStoredBookings() || [];
    const newBooking = {
      id: bookingId,
      guest: name,
      email,
      phone: phone || 'N/A',
      country: 'Guest',
      room: roomName,
      roomId,
      roomSlug,
      roomType: room?.type || 'Standard',
      checkIn,
      checkOut,
      nights,
      guests,
      amount: totalAmount,
      status: 'Pending',
      payment: 'Unpaid',
      paymentMethod: 'Pay at Hotel',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatar: (name[0] || 'G').toUpperCase(),
    };

    bookings.push(newBooking);
    await window.saveStoredBookings(bookings);
    await window.registerGuestBooking(bookingId, name, email, phone, '', totalAmount);

    // Save guest info for portal
    localStorage.setItem('elkhalil_active_guest', JSON.stringify({ name, email, phone }));

    // Show success
    document.getElementById('room-book-form').innerHTML = `
      <div style="text-align:center;padding:var(--space-6);display:flex;flex-direction:column;align-items:center;gap:var(--space-4);">
        <span style="font-size:56px;color:var(--green);">${window.Icons.checkCircle}</span>
        <h3 style="font-family:var(--font-heading);font-size:20px;color:var(--site-heading);">Booking Confirmed!</h3>
        <div style="font-size:13px;color:var(--gray-500);line-height:1.7;text-align:center;">
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>${roomName}</strong></p>
          <p>${checkIn} → ${checkOut} (${nights} night${nights>1?'s':''})</p>
          <p><strong>Total: $${totalAmount}</strong></p>
        </div>
        <a href="#/guest/dashboard" class="btn btn-primary" style="width:100%;">VIEW MY BOOKING</a>
        <a href="#/rooms" class="btn btn-outline" style="width:100%;">BACK TO ROOMS</a>
      </div>
    `;
  } catch (err) {
    console.error('Booking error:', err);
    alert('Booking failed. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'CONFIRM BOOKING';
  }
};

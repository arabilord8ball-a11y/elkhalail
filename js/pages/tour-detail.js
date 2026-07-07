/**
 * ELKHALIL HOTEL — Tour Detail Page
 * Ported from TourDetail.jsx
 */

window.renderTourDetailPage = function(slug) {
  const tours = window.getStoredTours();
  const tour = tours.find(t => t.slug === slug || String(t.id) === String(slug));

  if (!tour) {
    window.renderPublicPage(`
      <div class="tour-detail-page">
        <div style="padding-top:var(--navbar-height);"></div>
        <div style="text-align:center;padding:80px 20px;">
          <h2 style="font-family:var(--font-heading);font-size:28px;color:var(--gray-600);">Tour Not Found</h2>
          <p style="color:var(--gray-500);margin:16px 0 24px;">This tour doesn't exist or has been removed.</p>
          <a href="#/tours" class="btn btn-primary">VIEW ALL TOURS</a>
        </div>
      </div>
    `, '/tours');
    return;
  }

  document.title = `${tour.name} — Elkhalil Hotel`;

  const images = (tour.images && tour.images.length) ? tour.images : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'];

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const includesHtml = (tour.included || []).map(item => `
    <div class="tour-include-item">
      <span class="tour-include-icon">${window.Icons.checkCircle}</span>
      <span>${item}</span>
    </div>
  `).join('');

  const excludesHtml = (tour.excluded || []).map(item => `
    <div class="tour-include-item">
      <span class="tour-exclude-icon" style="color:var(--red);">${window.Icons.x}</span>
      <span>${item}</span>
    </div>
  `).join('');

  const html = `
    <div class="tour-detail-page">
      <div style="padding-top:var(--navbar-height);background:var(--site-bg-alt);padding-bottom:var(--space-3);">
        <div class="container">
          <div class="breadcrumb">
            <a href="#/">Home</a><span>/</span>
            <a href="#/tours">Tours</a><span>/</span>
            <span>${tour.name}</span>
          </div>
        </div>
      </div>

      <section class="section-sm" style="background:var(--site-bg);">
        <div class="container">
          <div class="tour-detail-layout">
            <!-- LEFT -->
            <div>
              <!-- Gallery -->
              <div class="gallery-main" id="tour-gallery-main">
                <img src="${images[0]}" alt="${tour.name}" id="tour-main-img" style="width:100%;height:100%;object-fit:cover;">
                ${images.length > 1 ? `
                  <button class="gallery-nav prev" id="tour-gallery-prev">${window.Icons.chevronLeft}</button>
                  <button class="gallery-nav next" id="tour-gallery-next">${window.Icons.chevronRight}</button>
                ` : ''}
              </div>
              ${images.length > 1 ? `
              <div class="gallery-thumbs">
                ${images.map((img, i) => `
                  <div class="gallery-thumb ${i===0?'active':''}" data-idx="${i}" data-img="${img}">
                    <img src="${img}" alt="Tour image ${i+1}" loading="lazy">
                  </div>
                `).join('')}
              </div>` : ''}

              <!-- Details -->
              <div style="margin-top:var(--space-6);">
                <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);">
                  <span class="badge badge-gold">${tour.category || 'Tour'}</span>
                  <span style="display:flex;align-items:center;gap:4px;font-size:16px;font-weight:700;color:var(--site-heading);">
                    <span style="color:#F59E0B;">★</span> ${Number(tour.rating || 5).toFixed(1)}
                    <span style="font-size:13px;color:var(--gray-400);font-weight:400;">(${tour.reviewCount || 0} reviews)</span>
                  </span>
                </div>
                <h1 style="font-family:var(--font-heading);font-size:clamp(24px,4vw,36px);font-weight:700;color:var(--site-heading);margin-bottom:var(--space-4);">${tour.name}</h1>
                <div class="room-detail-meta" style="margin-bottom:var(--space-4);">
                  <div class="room-detail-meta-item">${window.Icons.clock} ${tour.duration || '1 day'}</div>
                  <div class="room-detail-meta-item">${window.Icons.users} Max ${tour.capacity || 10} people</div>
                </div>
                <p style="font-size:15px;color:var(--site-text);line-height:1.8;margin-bottom:var(--space-6);">${tour.description || 'An unforgettable tour experience.'}</p>

                ${includesHtml ? `
                <div style="margin-bottom:var(--space-6);">
                  <h3 style="font-size:17px;font-weight:700;color:var(--site-heading);margin-bottom:var(--space-4);">What's Included</h3>
                  <div class="tour-includes-grid">${includesHtml}</div>
                </div>` : ''}

                ${excludesHtml ? `
                <div>
                  <h3 style="font-size:17px;font-weight:700;color:var(--site-heading);margin-bottom:var(--space-4);">Not Included</h3>
                  <div class="tour-includes-grid">${excludesHtml}</div>
                </div>` : ''}
              </div>
            </div>

            <!-- RIGHT (Booking Card) -->
            <div>
              <div class="book-tour-card">
                <div style="font-size:28px;font-weight:700;color:var(--gold);font-family:var(--font-heading);margin-bottom:var(--space-4);">
                  $${tour.price} <span style="font-size:14px;color:var(--gray-400);font-weight:400;font-family:var(--font-main);">/person</span>
                </div>
                <form class="book-now-form" onsubmit="handleTourBooking(event, '${tour.id}', '${tour.slug}', '${tour.name}', ${tour.price})">
                  <div class="form-group">
                    <label class="form-label">Tour Date</label>
                    <input type="date" class="form-input" id="tour-date" required min="${todayStr}" value="${todayStr}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Number of Persons</label>
                    <select class="form-input" id="tour-persons">
                      ${Array.from({ length: Math.min(tour.capacity || 10, 10) }, (_, i) => i+1).map(n => `<option value="${n}">${n} Person${n>1?'s':''}</option>`).join('')}
                    </select>
                  </div>
                  <div id="tour-price-preview" style="background:var(--site-bg-alt);border-radius:var(--radius-md);padding:var(--space-4);font-size:14px;margin-bottom:var(--space-3);">
                    <div style="display:flex;justify-content:space-between;font-weight:700;color:var(--site-heading);">
                      <span>Total</span><span>$${tour.price}</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-input" id="tour-name" placeholder="Enter your full name" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" id="tour-email" placeholder="your@email.com" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Phone</label>
                    <input type="tel" class="form-input" id="tour-phone" placeholder="+20 xxx xxx xxxx">
                  </div>
                  <button type="submit" class="btn btn-primary" style="width:100%;" id="tour-submit">BOOK TOUR</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  window.renderPublicPage(html, '/tours');

  // Gallery
  let imgIdx = 0;
  const mainImg = document.getElementById('tour-main-img');
  const updateMain = (idx) => {
    imgIdx = idx;
    if (mainImg) mainImg.src = images[idx];
    document.querySelectorAll('.gallery-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
  };
  document.querySelectorAll('.gallery-thumb').forEach(thumb => { thumb.addEventListener('click', () => updateMain(Number(thumb.dataset.idx))); });
  document.getElementById('tour-gallery-prev')?.addEventListener('click', () => updateMain((imgIdx - 1 + images.length) % images.length));
  document.getElementById('tour-gallery-next')?.addEventListener('click', () => updateMain((imgIdx + 1) % images.length));

  // Price preview
  const calcPrice = () => {
    const persons = Number(document.getElementById('tour-persons')?.value) || 1;
    const total = tour.price * persons;
    document.getElementById('tour-price-preview').innerHTML = `
      <div style="display:flex;justify-content:space-between;color:var(--gray-600);margin-bottom:4px;">
        <span>$${tour.price} × ${persons} person${persons>1?'s':''}</span><span>$${total}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-weight:700;color:var(--site-heading);border-top:1px solid var(--site-border);padding-top:8px;">
        <span>Total</span><span>$${total}</span>
      </div>`;
  };
  document.getElementById('tour-persons')?.addEventListener('change', calcPrice);
};

window.handleTourBooking = async function(e, tourId, tourSlug, tourName, pricePerPerson) {
  e.preventDefault();
  const submitBtn = document.getElementById('tour-submit');
  const tourDate = document.getElementById('tour-date')?.value;
  const persons = Number(document.getElementById('tour-persons')?.value) || 1;
  const name = document.getElementById('tour-name')?.value?.trim();
  const email = document.getElementById('tour-email')?.value?.trim();
  const phone = document.getElementById('tour-phone')?.value?.trim();

  if (!tourDate || !name || !email) { alert('Please fill all required fields.'); return; }

  const totalAmount = pricePerPerson * persons;
  const bookingId = 'TOUR-' + Math.floor(10000 + Math.random() * 90000);

  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';

  try {
    const bookings = window.getStoredBookings() || [];
    const newBooking = {
      id: bookingId,
      guest: name,
      email,
      phone: phone || 'N/A',
      country: 'Guest',
      room: tourName + ' (Tour)',
      roomId: tourId,
      roomSlug: tourSlug,
      roomType: 'Tour',
      checkIn: tourDate,
      checkOut: tourDate,
      nights: 1,
      guests: persons,
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
    localStorage.setItem('elkhalil_active_guest', JSON.stringify({ name, email, phone }));

    e.target.innerHTML = `
      <div style="text-align:center;padding:var(--space-5);display:flex;flex-direction:column;align-items:center;gap:var(--space-4);">
        <span style="font-size:52px;color:var(--green);">${window.Icons.checkCircle}</span>
        <h3 style="font-family:var(--font-heading);font-size:20px;color:var(--site-heading);">Tour Booked!</h3>
        <div style="font-size:13px;color:var(--gray-500);line-height:1.7;text-align:center;">
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>${tourName}</strong></p>
          <p>${persons} person${persons>1?'s':''} · ${tourDate}</p>
          <p><strong>Total: $${totalAmount}</strong></p>
        </div>
        <a href="#/guest/dashboard" class="btn btn-primary" style="width:100%;">VIEW MY BOOKING</a>
      </div>
    `;
  } catch (err) {
    alert('Booking failed. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'BOOK TOUR';
  }
};

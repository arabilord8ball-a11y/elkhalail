/**
 * ELKHALIL HOTEL — Offers, FAQ, About, Contact, Search, Guest Portal Pages
 * Consolidated public pages
 */

// ── OFFERS PAGE ─────────────────────────────────────────────────
window.renderOffersPage = function() {
  document.title = 'Special Offers — Elkhalil Hotel';
  const offers = window.getStoredOffers();
  const now = new Date();

  const renderOfferCards = (filtered) => {
    if (!filtered.length) return `<div class="offer-no-results"><p style="font-size:40px;">🏷️</p><p>No active offers at the moment.</p></div>`;
    return filtered.map(offer => {
      const isActive = offer.status === 'Active';
      return `
        <div class="offer-card">
          <div class="offer-card-header">
            <div class="offer-discount">${offer.discount}</div>
            <div class="offer-off">OFF</div>
            ${!isActive ? `<div style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.4);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:1px;">EXPIRED</div>` : ''}
          </div>
          <div class="offer-card-body">
            <h3 class="offer-title">${offer.title}</h3>
            <p class="offer-desc">${offer.description || `Get ${offer.discount} off with code ${offer.code}.`}</p>
            <div class="offer-code-wrap">
              <span class="offer-code">${offer.code}</span>
              <button onclick="copyOfferCode('${offer.code}')" class="btn btn-sm btn-outline" style="flex-shrink:0;">Copy</button>
            </div>
            ${offer.minNights > 1 ? `<p class="offer-validity">Minimum ${offer.minNights} nights stay</p>` : ''}
            ${offer.validFrom || offer.validTo ? `<p class="offer-validity">Valid: ${offer.validFrom || ''} ${offer.validTo ? '→ ' + offer.validTo : ''}</p>` : ''}
            <a href="#/rooms" class="btn btn-primary" style="width:100%;margin-top:var(--space-3);">BOOK NOW</a>
          </div>
        </div>
      `;
    }).join('');
  };

  const activeOffers = offers.filter(o => o.status === 'Active');
  const html = `
    <div class="offers-page">
      <div class="page-hero">
        <div class="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80" alt="Offers" loading="lazy">
          <div class="page-hero-overlay"></div>
        </div>
        <div class="container page-hero-content">
          <div class="breadcrumb white-breadcrumb">
            <a href="#/">Home</a><span>/</span><span>Offers</span>
          </div>
          <h1>Special Offers</h1>
          <p>Exclusive deals and discounts for our guests</p>
        </div>
      </div>

      <section class="section">
        <div class="container">
          <div style="text-align:center;margin-bottom:var(--space-8);">
            <div class="section-tag" style="justify-content:center;">PROMOTIONS</div>
            <h2 class="section-title">Our Current Deals</h2>
            <p class="section-subtitle" style="margin:0 auto;">Limited time offers — book now and save!</p>
          </div>
          <div class="offers-grid">${renderOfferCards(activeOffers.length ? activeOffers : offers)}</div>
        </div>
      </section>

      <!-- Coupon Checker -->
      <section class="section-sm">
        <div class="container">
          <div class="coupon-checker">
            <h3>Have a Coupon Code?</h3>
            <p>Enter your code below to check if it's valid</p>
            <div class="coupon-input-row">
              <input type="text" id="coupon-input" class="newsletter-input" placeholder="Enter coupon code..." style="flex:1;">
              <button class="btn btn-primary" onclick="verifyCoupon()">CHECK CODE</button>
            </div>
            <div id="coupon-result" class="coupon-result" style="display:none;"></div>
          </div>
        </div>
      </section>
    </div>
  `;

  window.renderPublicPage(html, '/offers');

  window.copyOfferCode = (code) => {
    navigator.clipboard?.writeText(code).then(() => {
      window.showAdminToast(`Code "${code}" copied to clipboard!`, 'success');
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    });
  };

  window.verifyCoupon = () => {
    const code = document.getElementById('coupon-input')?.value?.trim().toUpperCase();
    const resultDiv = document.getElementById('coupon-result');
    if (!code) return;
    const found = offers.find(o => (o.code || '').toUpperCase() === code && o.status === 'Active');
    if (found) {
      resultDiv.className = 'coupon-result success';
      resultDiv.textContent = `✓ Valid code! You get ${found.discount} off. ${found.minNights > 1 ? `Minimum ${found.minNights} nights.` : ''}`;
    } else {
      resultDiv.className = 'coupon-result error';
      resultDiv.textContent = '✗ Invalid or expired coupon code.';
    }
    resultDiv.style.display = 'block';
  };
};

// ── FAQ PAGE ─────────────────────────────────────────────────────
window.renderFaqPage = function() {
  document.title = 'FAQ — Elkhalil Hotel';
  const faqs = window.getStoredFaqs();

  const fallbackFaqs = [
    { category: 'Booking', question: 'How do I make a reservation?', answer: 'You can book directly through our website by selecting your room and desired dates, then following the checkout process.' },
    { category: 'Booking', question: 'Can I cancel my reservation?', answer: 'Yes, cancellations are free up to 24 hours before check-in. After that, one night\'s charge may apply.' },
    { category: 'Facilities', question: 'Do you have free Wi-Fi?', answer: 'Yes! All rooms and common areas have complimentary high-speed Wi-Fi.' },
    { category: 'Facilities', question: 'Is there an airport transfer?', answer: 'Yes, we offer airport pickup and drop-off services at an additional cost. Please contact us to arrange.' },
    { category: 'Check-in', question: 'What are the check-in and check-out times?', answer: 'Check-in is from 2:00 PM and check-out is by 12:00 PM (noon). Early check-in or late check-out may be available on request.' },
    { category: 'Dining', question: 'Do you serve breakfast?', answer: 'Yes, a delicious Egyptian-style breakfast is available daily. It can be included in your booking or ordered separately.' },
    { category: 'Location', question: 'How far are the Pyramids?', answer: 'The Great Sphinx and Giza Pyramids are approximately a 15-minute walk from our hotel.' },
    { category: 'Tours', question: 'Can you arrange tours for us?', answer: 'Absolutely! We offer guided tours to all major attractions including the Pyramids, Egyptian Museum, and more.' },
  ];

  const allFaqs = faqs.length ? faqs : fallbackFaqs;
  const categories = ['All', ...new Set(allFaqs.map(f => f.category).filter(Boolean))];
  let selectedCat = 'All';

  const renderFaqs = (filtered) => filtered.map((faq, i) => `
    <div class="faq-item" data-idx="${i}">
      <div class="faq-question" onclick="toggleFaq(${i})">
        <span>${faq.question}</span>
        <div class="faq-icon">+</div>
      </div>
      <div class="faq-answer">${faq.answer}</div>
    </div>
  `).join('');

  const html = `
    <div class="faq-page">
      <div class="page-hero">
        <div class="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80" alt="FAQ" loading="lazy">
          <div class="page-hero-overlay"></div>
        </div>
        <div class="container page-hero-content">
          <div class="breadcrumb white-breadcrumb">
            <a href="#/">Home</a><span>/</span><span>FAQ</span>
          </div>
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know before your stay</p>
        </div>
      </div>
      <section class="section">
        <div class="container">
          <div class="faq-categories" id="faq-cats">
            ${categories.map(c => `<button class="faq-category-btn ${c==='All'?'active':''}" data-cat="${c}">${c}</button>`).join('')}
          </div>
          <div class="faq-list" id="faq-list">
            ${renderFaqs(allFaqs)}
          </div>
        </div>
      </section>
    </div>
  `;

  window.renderPublicPage(html, '/faq');

  window.toggleFaq = (idx) => {
    const item = document.querySelector(`.faq-item[data-idx="${idx}"]`);
    if (!item) return;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => { el.classList.remove('open'); el.querySelector('.faq-icon').textContent = '+'; });
    if (!wasOpen) { item.classList.add('open'); item.querySelector('.faq-icon').textContent = '−'; }
  };

  document.querySelectorAll('#faq-cats .faq-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCat = btn.dataset.cat;
      document.querySelectorAll('#faq-cats .faq-category-btn').forEach(b => b.classList.toggle('active', b === btn));
      const filtered = selectedCat === 'All' ? allFaqs : allFaqs.filter(f => f.category === selectedCat);
      document.getElementById('faq-list').innerHTML = renderFaqs(filtered);
    });
  });
};

// ── ABOUT PAGE ───────────────────────────────────────────────────
window.renderAboutPage = function() {
  document.title = 'About Us — Elkhalil Hotel';
  const settings = window.getStoredSettings();

  const values = [
    { icon: '🏛️', title: 'Heritage', desc: 'Rooted in Egyptian culture and hospitality traditions.' },
    { icon: '💎', title: 'Excellence', desc: 'Every detail is crafted to provide the finest experience.' },
    { icon: '🤝', title: 'Warmth', desc: 'We treat every guest like a member of our family.' },
    { icon: '🌍', title: 'Sustainability', desc: 'Committed to eco-friendly and responsible practices.' },
    { icon: '⭐', title: 'Quality', desc: 'Consistently high standards in service and comfort.' },
    { icon: '📍', title: 'Location', desc: 'Unbeatable proximity to the Wonders of the World.' },
  ];

  const team = [
    { name: 'Ahmed Elkhalil', role: 'General Manager', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
    { name: 'Sara Mohamed', role: 'Head of Hospitality', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
    { name: 'Omar Hassan', role: 'Tour Guide Manager', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' },
  ];

  const html = `
    <div class="about-page">
      <div class="page-hero">
        <div class="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80" alt="About" loading="lazy">
          <div class="page-hero-overlay"></div>
        </div>
        <div class="container page-hero-content">
          <div class="breadcrumb white-breadcrumb">
            <a href="#/">Home</a><span>/</span><span>About Us</span>
          </div>
          <h1>About Elkhalil Hotel</h1>
          <p>Your gateway to Egypt's most iconic wonders</p>
        </div>
      </div>

      <!-- Story -->
      <section class="section" style="background:var(--site-bg);">
        <div class="container">
          <div class="about-story-layout">
            <div>
              <div class="section-tag">OUR STORY</div>
              <h2 class="section-title">A Legacy of Hospitality</h2>
              <p style="color:var(--site-text);font-size:15px;line-height:1.8;margin-bottom:var(--space-4);">
                El Khalil Pyramids View Inn was established with a singular vision: to offer travelers an authentic Egyptian experience combined with modern comfort. Located steps away from the legendary Giza Pyramids, we have been welcoming guests from around the world for years.
              </p>
              <p style="color:var(--site-text-muted);font-size:15px;line-height:1.8;margin-bottom:var(--space-6);">
                Our hotel blends traditional Egyptian hospitality with contemporary amenities. Every room is designed to provide a home away from home, with carefully selected furnishings and a team of dedicated staff ready to assist you at every step.
              </p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
                ${[['10+', 'Rooms & Suites'], ['5000+', 'Happy Guests'], ['10+', 'Years Experience'], ['15min', 'To Pyramids']].map(([val, label]) => `
                  <div style="text-align:center;padding:var(--space-4);background:var(--site-bg-alt);border-radius:var(--radius-xl);border:1px solid var(--site-border);">
                    <div style="font-size:24px;font-weight:700;color:var(--gold);font-family:var(--font-heading);">${val}</div>
                    <div style="font-size:13px;color:var(--site-text-muted);">${label}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="about-img-wrap">
              <img src="${settings.imgAboutStory || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=700&q=80'}" alt="Our Story" loading="lazy">
            </div>
          </div>
        </div>
      </section>

      <!-- Values -->
      <section class="section" style="background:var(--site-bg-alt);">
        <div class="container">
          <div style="text-align:center;margin-bottom:var(--space-8);">
            <div class="section-tag" style="justify-content:center;">OUR VALUES</div>
            <h2 class="section-title">What Drives Us</h2>
          </div>
          <div class="values-grid">
            ${values.map(v => `
              <div class="value-card">
                <div class="value-icon">${v.icon}</div>
                <h3 class="value-title">${v.title}</h3>
                <p class="value-desc">${v.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Team -->
      <section class="section" style="background:var(--site-bg);">
        <div class="container">
          <div style="text-align:center;margin-bottom:var(--space-8);">
            <div class="section-tag" style="justify-content:center;">OUR TEAM</div>
            <h2 class="section-title">Meet the People Behind the Magic</h2>
          </div>
          <div class="about-team-grid">
            ${team.map(member => `
              <div class="team-card">
                <div class="team-img"><img src="${member.img}" alt="${member.name}" loading="lazy"></div>
                <div class="team-info">
                  <div class="team-name">${member.name}</div>
                  <div class="team-role">${member.role}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </div>
  `;

  window.renderPublicPage(html, '/about');
};

// ── CONTACT PAGE ─────────────────────────────────────────────────
window.renderContactPage = function() {
  document.title = 'Contact Us — Elkhalil Hotel';
  const settings = window.getStoredSettings();

  const html = `
    <div class="contact-page">
      <div class="page-hero">
        <div class="page-hero-bg">
          <img src="${settings.imgContactHero || 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80'}" alt="Contact" loading="lazy">
          <div class="page-hero-overlay"></div>
        </div>
        <div class="container page-hero-content">
          <div class="breadcrumb white-breadcrumb">
            <a href="#/">Home</a><span>/</span><span>Contact</span>
          </div>
          <h1>Contact Us</h1>
          <p>We'd love to hear from you</p>
        </div>
      </div>

      <section class="section">
        <div class="container">
          <div class="contact-layout">
            <div class="contact-info">
              ${[
                { icon: window.Icons.mapPin, title: 'Address', text: settings.address },
                { icon: window.Icons.phone, title: 'Phone', text: `<a href="tel:${settings.phone}" style="color:inherit;">${settings.phone}</a>` },
                { icon: window.Icons.mail, title: 'Email', text: `<a href="mailto:${settings.email}" style="color:inherit;">${settings.email}</a>` },
                { icon: window.Icons.clock, title: 'Office Hours', text: 'Reception: 24/7 · Office: 9 AM – 6 PM' },
              ].map(item => `
                <div class="contact-info-item">
                  <div class="contact-info-icon">${item.icon}</div>
                  <div>
                    <div class="contact-info-title">${item.title}</div>
                    <div class="contact-info-text">${item.text}</div>
                  </div>
                </div>
              `).join('')}
              <div style="background:var(--site-bg-alt);border-radius:var(--radius-xl);padding:var(--space-5);border:1px solid var(--site-border);">
                <h4 style="font-weight:700;color:var(--site-heading);margin-bottom:var(--space-3);">Check-in Information</h4>
                <div style="display:flex;flex-direction:column;gap:var(--space-2);font-size:13px;color:var(--site-text-muted);">
                  <div>${window.Icons.clock} Check-in: ${settings.checkIn}</div>
                  <div>${window.Icons.clock} Check-out: ${settings.checkOut}</div>
                </div>
              </div>
            </div>

            <div class="contact-form-card">
              <h3 style="font-family:var(--font-heading);font-size:20px;font-weight:700;color:var(--site-heading);margin-bottom:var(--space-6);">Send us a Message</h3>
              <form id="contact-form" onsubmit="handleContactSubmit(event)">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
                  <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-input" id="contact-name" placeholder="Your full name" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" id="contact-email" placeholder="your@email.com" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input type="tel" class="form-input" id="contact-phone" placeholder="+20 xxx xxx xxxx">
                </div>
                <div class="form-group">
                  <label class="form-label">Subject</label>
                  <select class="form-input" id="contact-subject">
                    <option>Room Inquiry</option>
                    <option>Tour Booking</option>
                    <option>Airport Transfer</option>
                    <option>General Question</option>
                    <option>Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Message</label>
                  <textarea class="form-input" id="contact-message" placeholder="How can we help you?" rows="5" style="resize:vertical;" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%;" id="contact-submit">SEND MESSAGE</button>
              </form>
            </div>
          </div>

          <!-- Map -->
          ${settings.googleMapsUrl ? `
          <div class="contact-map">
            <iframe src="${settings.googleMapsUrl}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Hotel Location"></iframe>
          </div>` : ''}
        </div>
      </section>
    </div>
  `;

  window.renderPublicPage(html, '/contact');

  window.handleContactSubmit = async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('contact-submit');
    const name = document.getElementById('contact-name')?.value?.trim();
    const email = document.getElementById('contact-email')?.value?.trim();
    const phone = document.getElementById('contact-phone')?.value?.trim();
    const subject = document.getElementById('contact-subject')?.value;
    const message = document.getElementById('contact-message')?.value?.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const messages = window.getStoredContactMessages() || [];
      const newMsg = {
        id: 'MSG-' + Date.now(),
        name, email, phone: phone || 'N/A', subject, message,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      messages.push(newMsg);
      await window.saveStoredContactMessages(messages);

      document.getElementById('contact-form').innerHTML = `
        <div style="text-align:center;padding:var(--space-8);display:flex;flex-direction:column;align-items:center;gap:var(--space-4);">
          <span style="font-size:56px;color:var(--green);">${window.Icons.checkCircle}</span>
          <h3 style="font-family:var(--font-heading);font-size:20px;color:var(--site-heading);">Message Sent!</h3>
          <p style="color:var(--site-text-muted);font-size:14px;">Thank you ${name}! We'll get back to you within 24 hours.</p>
          <button onclick="window.renderContactPage()" class="btn btn-primary">Send Another</button>
        </div>
      `;
    } catch (err) {
      alert('Failed to send message. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'SEND MESSAGE';
    }
  };
};

// ── SEARCH PAGE ──────────────────────────────────────────────────
window.renderSearchPage = function() {
  document.title = 'Search — Elkhalil Hotel';
  const params = window.Router.getQueryParams();
  const rooms = window.getStoredRooms();
  const tours = window.getStoredTours();

  let searchQuery = params.q || '';
  let activeTab = params.tab || 'rooms';
  const checkIn = params.checkIn || '';
  const checkOut = params.checkOut || '';
  const guests = Number(params.guests) || 1;
  const type = params.type || '';

  const filterRooms = () => {
    let filtered = rooms;
    if (type) filtered = filtered.filter(r => r.type === type);
    if (guests) filtered = filtered.filter(r => (r.capacity || 2) >= guests);
    if (searchQuery) filtered = filtered.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || (r.type || '').toLowerCase().includes(searchQuery.toLowerCase()));
    if (checkIn && checkOut) filtered = filtered.filter(r => window.checkRoomAvailability(r.id, checkIn, checkOut));
    return filtered;
  };

  const filterTours = () => {
    let filtered = tours;
    if (searchQuery) filtered = filtered.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || (t.category || '').toLowerCase().includes(searchQuery.toLowerCase()));
    if (guests) filtered = filtered.filter(t => (t.capacity || 10) >= guests);
    return filtered;
  };

  const renderRoomResults = (filtered) => {
    if (!filtered.length) return `<div style="text-align:center;padding:40px;color:var(--gray-400);grid-column:1/-1;"><p style="font-size:36px;">🏨</p><p>No rooms match your criteria.</p></div>`;
    return filtered.map(room => `
      <div class="room-card-full card" onclick="window.navigateTo('/rooms/${room.slug || room.id}')">
        <div class="room-card-img">
          <img src="${(room.images && room.images[0]) || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80'}" alt="${room.name}" loading="lazy">
          <div class="room-badge">${room.type || 'Standard'}</div>
        </div>
        <div class="room-card-body">
          <h3 class="room-card-name">${room.name}</h3>
          <div class="room-detail-meta" style="margin-bottom:var(--space-3);">
            <div class="room-detail-meta-item">${window.Icons.users} ${room.capacity || 2}</div>
            <div class="room-detail-meta-item">${window.Icons.maximize} ${room.size || 20}m²</div>
          </div>
          <div class="room-card-footer">
            <div class="price-num">$${room.price}/night</div>
            <a href="#/rooms/${room.slug || room.id}" class="btn btn-primary btn-sm">BOOK</a>
          </div>
        </div>
      </div>
    `).join('');
  };

  const renderTourResults = (filtered) => {
    if (!filtered.length) return `<div style="text-align:center;padding:40px;color:var(--gray-400);grid-column:1/-1;"><p style="font-size:36px;">🗺️</p><p>No tours match your criteria.</p></div>`;
    return filtered.map(tour => `
      <div class="tour-card-full card" onclick="window.navigateTo('/tours/${tour.slug || tour.id}')">
        <div class="tour-card-img">
          <img src="${(tour.images && tour.images[0]) || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80'}" alt="${tour.name}" loading="lazy">
          <div class="tour-card-category">${tour.category || 'Tour'}</div>
        </div>
        <div class="tour-card-body">
          <h3 class="tour-card-name">${tour.name}</h3>
          <div class="tour-card-footer">
            <div class="price-num">$${tour.price}/person</div>
            <a href="#/tours/${tour.slug || tour.id}" class="btn btn-primary btn-sm">BOOK</a>
          </div>
        </div>
      </div>
    `).join('');
  };

  const html = `
    <div class="search-page">
      <div class="search-hero">
        <div class="container">
          <h1>Search Availability</h1>
          <div class="search-bar">
            <div class="search-box" style="flex:1;">
              <span class="search-icon">${window.Icons.search}</span>
              <input type="text" id="main-search-input" value="${searchQuery}" placeholder="Search rooms or tours..." style="width:100%;padding:14px 14px 14px 44px;border:1.5px solid rgba(255,255,255,0.3);border-radius:var(--radius-md);background:rgba(255,255,255,0.1);color:#fff;font-size:16px;outline:none;font-family:inherit;" onkeydown="if(event.key==='Enter')updateSearch()">
            </div>
            <button class="btn btn-primary" onclick="updateSearch()">SEARCH</button>
          </div>
          ${checkIn ? `<div style="color:rgba(255,255,255,0.7);font-size:13px;text-align:center;margin-top:12px;">Dates: ${checkIn} → ${checkOut} · ${guests} guest${guests>1?'s':''}</div>` : ''}
        </div>
      </div>
      <section class="section-sm">
        <div class="container">
          <div class="search-results-header">
            <div class="search-tabs">
              <button class="search-tab ${activeTab==='rooms'?'active':''}" onclick="switchSearchTab('rooms')">🏨 Rooms (${filterRooms().length})</button>
              <button class="search-tab ${activeTab==='tours'?'active':''}" onclick="switchSearchTab('tours')">🗺️ Tours (${filterTours().length})</button>
            </div>
          </div>
          <div id="search-results-grid" class="search-results-grid">
            ${activeTab === 'rooms' ? renderRoomResults(filterRooms()) : renderTourResults(filterTours())}
          </div>
        </div>
      </section>
    </div>
  `;

  window.renderPublicPage(html, '/search');

  window.updateSearch = () => {
    searchQuery = document.getElementById('main-search-input')?.value || '';
    const grid = document.getElementById('search-results-grid');
    if (grid) grid.innerHTML = activeTab === 'rooms' ? renderRoomResults(filterRooms()) : renderTourResults(filterTours());
  };

  window.switchSearchTab = (tab) => {
    activeTab = tab;
    document.querySelectorAll('.search-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.search-tab').forEach(btn => { if (btn.textContent.includes(tab === 'rooms' ? '🏨' : '🗺️')) btn.classList.add('active'); });
    const grid = document.getElementById('search-results-grid');
    if (grid) grid.innerHTML = tab === 'rooms' ? renderRoomResults(filterRooms()) : renderTourResults(filterTours());
  };
};

// ── GUEST PORTAL PAGE ─────────────────────────────────────────────
window.renderGuestPortalPage = function() {
  document.title = 'My Bookings — Elkhalil Hotel';

  let activeGuest = null;
  try {
    const g = localStorage.getItem('elkhalil_active_guest');
    activeGuest = (g && g !== 'undefined') ? JSON.parse(g) : null;
  } catch (e) {}

  const renderBookingResults = (bookings) => {
    if (!bookings.length) return `<div style="text-align:center;padding:40px;color:var(--gray-400);">No bookings found for this guest.</div>`;
    return bookings.map(b => {
      const statusColors = { 'Confirmed': 'badge-green', 'Pending': 'badge-orange', 'Cancelled': 'badge-red', 'Checked-in': 'badge-blue', 'Checked-out': 'badge-gray' };
      return `
        <div class="guest-booking-card">
          <div class="guest-booking-header">
            <div>
              <h3 style="font-weight:700;color:var(--site-heading);font-size:16px;">${b.room}</h3>
              <p style="font-size:13px;color:var(--gray-500);">${b.id}</p>
            </div>
            <span class="badge ${statusColors[b.status] || 'badge-gray'}">${b.status}</span>
          </div>
          <div class="guest-booking-grid">
            <div><div style="font-size:11px;color:var(--gray-400);font-weight:600;margin-bottom:4px;">CHECK-IN</div><div style="font-weight:600;color:var(--site-heading);">${b.checkIn}</div></div>
            <div><div style="font-size:11px;color:var(--gray-400);font-weight:600;margin-bottom:4px;">CHECK-OUT</div><div style="font-weight:600;color:var(--site-heading);">${b.checkOut}</div></div>
            <div><div style="font-size:11px;color:var(--gray-400);font-weight:600;margin-bottom:4px;">GUESTS</div><div style="font-weight:600;color:var(--site-heading);">${b.guests}</div></div>
            <div><div style="font-size:11px;color:var(--gray-400);font-weight:600;margin-bottom:4px;">AMOUNT</div><div style="font-weight:600;color:var(--gold);">$${b.amount || b.price}</div></div>
          </div>
        </div>
      `;
    }).join('');
  };

  const html = `
    <div class="guest-portal-page">
      <div class="guest-portal-header">
        <div class="container">
          <h1 class="guest-portal-title">My Bookings</h1>
          <p style="color:rgba(255,255,255,0.7);margin-bottom:var(--space-5);">Look up your reservations using your name or email</p>
          <form class="guest-search-form" id="guest-search-form" onsubmit="lookupGuestBookings(event)">
            <input type="text" id="guest-lookup-input" class="newsletter-input" placeholder="Enter your name or email..." style="flex:1;" value="${activeGuest?.email || ''}">
            <button type="submit" class="btn btn-primary">FIND BOOKINGS</button>
          </form>
        </div>
      </div>
      <div class="container">
        <div class="guest-lookup-result" id="guest-result">
          ${activeGuest ? `
          <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-4);background:var(--gold-bg);border-radius:var(--radius-xl);margin-bottom:var(--space-5);border:1px solid var(--gold);">
            <div style="width:44px;height:44px;border-radius:50%;background:var(--gold);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;flex-shrink:0;">${(activeGuest.name || 'G')[0]}</div>
            <div>
              <div style="font-weight:700;color:var(--site-heading);">Welcome back, ${activeGuest.name || 'Guest'}!</div>
              <div style="font-size:13px;color:var(--site-text-muted);">${activeGuest.email || ''}</div>
            </div>
            <button onclick="localStorage.removeItem('elkhalil_active_guest');window.renderGuestPortalPage();" style="margin-left:auto;background:none;border:none;color:var(--gray-400);cursor:pointer;font-size:13px;">Sign out</button>
          </div>
          ` : ''}
          <div id="guest-bookings-result"></div>
        </div>
      </div>
    </div>
  `;

  window.renderPublicPage(html, '/guest/portal');

  // Auto-lookup if we have a guest
  if (activeGuest) { lookupGuestByValue(activeGuest.email || activeGuest.name); }

  window.lookupGuestBookings = (e) => {
    e.preventDefault();
    const val = document.getElementById('guest-lookup-input')?.value?.trim();
    if (val) lookupGuestByValue(val);
  };

  function lookupGuestByValue(val) {
    const bookings = window.getStoredBookings() || [];
    const valLower = val.toLowerCase();
    const found = bookings.filter(b =>
      (b.guest || '').toLowerCase().includes(valLower) ||
      (b.email || '').toLowerCase().includes(valLower) ||
      (b.id || '').toLowerCase() === valLower
    );
    const container = document.getElementById('guest-bookings-result');
    if (!container) return;
    container.innerHTML = found.length
      ? `<h3 style="font-size:16px;font-weight:700;color:var(--site-heading);margin-bottom:var(--space-4);">Found ${found.length} booking${found.length>1?'s':''}:</h3>
         <div class="guest-bookings-list">${renderBookingResults(found)}</div>`
      : `<div style="text-align:center;padding:var(--space-10);color:var(--gray-400);">
           <p style="font-size:36px;">🔍</p>
           <p style="font-size:15px;">No bookings found for "${val}"</p>
           <p style="font-size:13px;margin-top:8px;">Try your full name or email address</p>
           <a href="#/rooms" class="btn btn-primary" style="margin-top:16px;">BOOK NOW</a>
         </div>`;
  }
};

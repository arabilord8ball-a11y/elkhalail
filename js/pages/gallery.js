/**
 * ELKHALIL HOTEL — Gallery Page
 * Ported from Gallery.jsx
 */

window.renderGalleryPage = function() {
  document.title = 'Gallery — Elkhalil Hotel';
  const galleryItems = window.getStoredGallery();
  const settings = window.getStoredSettings();

  const fallbackGallery = [
    { id: 1, url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', title: 'Hotel Exterior', category: 'Hotel' },
    { id: 2, url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', title: 'Standard Room', category: 'Rooms' },
    { id: 3, url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', title: 'Pool Area', category: 'Facilities' },
    { id: 4, url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80', title: 'Restaurant', category: 'Dining' },
    { id: 5, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', title: 'Pyramids View', category: 'Surroundings' },
    { id: 6, url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80', title: 'Lobby', category: 'Hotel' },
    { id: 7, url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80', title: 'Bathroom', category: 'Rooms' },
    { id: 8, url: 'https://images.unsplash.com/photo-1596386461350-326ccb383e9f?w=800&q=80', title: 'Deluxe Room', category: 'Rooms' },
    { id: 9, url: 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=800&q=80', title: 'Hotel Garden', category: 'Facilities' },
    { id: 10, url: 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?w=800&q=80', title: 'Giza Pyramids', category: 'Surroundings' },
    { id: 11, url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', title: 'Breakfast', category: 'Dining' },
    { id: 12, url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80', title: 'Suite Room', category: 'Rooms' },
  ];
  const items = galleryItems.length ? galleryItems : fallbackGallery;
  const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];
  let selectedCat = 'All';
  let lightboxIdx = -1;

  const getFiltered = () => selectedCat === 'All' ? items : items.filter(i => i.category === selectedCat);

  const renderGrid = (filtered) => `
    <div class="gallery-masonry" id="gallery-masonry">
      ${filtered.map((item, i) => `
        <div class="gallery-item" data-idx="${i}" data-url="${item.url}" onclick="openGalleryLightbox(${i})">
          <img src="${item.url}" alt="${item.title || 'Gallery image'}" loading="lazy">
          <div class="gallery-item-overlay">
            <span style="color:white;font-size:32px;">${window.Icons.maximize}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const html = `
    <div class="gallery-page">
      <div class="page-hero">
        <div class="page-hero-bg">
          <img src="${settings.imgHeroBg || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80'}" alt="Gallery" loading="lazy">
          <div class="page-hero-overlay"></div>
        </div>
        <div class="container page-hero-content">
          <div class="breadcrumb white-breadcrumb">
            <a href="#/">Home</a><span>/</span><span>Gallery</span>
          </div>
          <h1>Photo Gallery</h1>
          <p>Explore our hotel and surroundings</p>
        </div>
      </div>

      <section class="section">
        <div class="container">
          <div class="filter-tabs" id="gallery-filter-tabs" style="justify-content:center;margin-bottom:var(--space-6);">
            ${categories.map(cat => `<button class="filter-tab ${cat==='All'?'active':''}" data-cat="${cat}">${cat}</button>`).join('')}
          </div>
          <div id="gallery-grid-wrap">${renderGrid(items)}</div>
        </div>
      </section>

      <!-- Lightbox -->
      <div class="gallery-lightbox" id="gallery-lightbox" style="display:none;" onclick="closeGalleryLightbox(event)">
        <img src="" alt="Gallery" id="lightbox-img">
        <button class="gallery-lightbox-close" onclick="closeGalleryLightbox()">${window.Icons.x}</button>
        <button class="gallery-lightbox-nav gallery-lightbox-prev" onclick="event.stopPropagation();prevLightbox()">${window.Icons.chevronLeft}</button>
        <button class="gallery-lightbox-nav gallery-lightbox-next" onclick="event.stopPropagation();nextLightbox()">${window.Icons.chevronRight}</button>
      </div>
    </div>
  `;

  window.renderPublicPage(html, '/gallery');

  // Filter tabs
  document.querySelectorAll('#gallery-filter-tabs .filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCat = btn.dataset.cat;
      document.querySelectorAll('#gallery-filter-tabs .filter-tab').forEach(b => b.classList.toggle('active', b === btn));
      document.getElementById('gallery-grid-wrap').innerHTML = renderGrid(getFiltered());
    });
  });

  // Lightbox functions
  let filteredItems = items;
  window.openGalleryLightbox = (idx) => {
    filteredItems = getFiltered();
    lightboxIdx = idx;
    const lb = document.getElementById('gallery-lightbox');
    const img = document.getElementById('lightbox-img');
    if (lb && img) {
      img.src = filteredItems[lightboxIdx]?.url || '';
      lb.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };
  window.closeGalleryLightbox = (e) => {
    if (!e || e.target.id === 'gallery-lightbox' || e.target.tagName === 'BUTTON') {
      document.getElementById('gallery-lightbox').style.display = 'none';
      document.body.style.overflow = '';
    }
  };
  window.prevLightbox = () => {
    filteredItems = getFiltered();
    lightboxIdx = (lightboxIdx - 1 + filteredItems.length) % filteredItems.length;
    document.getElementById('lightbox-img').src = filteredItems[lightboxIdx]?.url || '';
  };
  window.nextLightbox = () => {
    filteredItems = getFiltered();
    lightboxIdx = (lightboxIdx + 1) % filteredItems.length;
    document.getElementById('lightbox-img').src = filteredItems[lightboxIdx]?.url || '';
  };

  // Keyboard
  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('gallery-lightbox');
    if (!lb || lb.style.display === 'none') return;
    if (e.key === 'Escape') window.closeGalleryLightbox();
    if (e.key === 'ArrowLeft') window.prevLightbox();
    if (e.key === 'ArrowRight') window.nextLightbox();
  });
};

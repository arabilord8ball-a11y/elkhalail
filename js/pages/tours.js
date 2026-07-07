/**
 * ELKHALIL HOTEL — Tours Page
 * Ported from Tours.jsx
 */

window.renderToursPage = function() {
  document.title = 'Tours & Excursions — Elkhalil Hotel';
  const settings = window.getStoredSettings();
  const tours = window.getStoredTours();

  const categories = ['All', ...new Set(tours.map(t => t.category).filter(Boolean))];
  let selectedCategory = 'All';

  const renderTourCards = (filtered) => {
    if (!filtered.length) return `<div class="no-results"><span style="font-size:40px;">🗺️</span><p>No tours found.</p></div>`;
    return filtered.map(tour => {
      const img = (tour.images && tour.images[0]) || `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80`;
      return `
        <div class="tour-card-full card" onclick="window.navigateTo('/tours/${tour.slug || tour.id}')">
          <div class="tour-card-img">
            <img src="${img}" alt="${tour.name}" loading="lazy">
            <div class="tour-card-category">${tour.category || 'Tour'}</div>
          </div>
          <div class="tour-card-body">
            <h3 class="tour-card-name">${tour.name}</h3>
            <p class="tour-card-desc">${tour.description || 'An incredible tour experience.'}</p>
            <div class="tour-card-tags">
              <span class="badge badge-gold">${window.Icons.clock} ${tour.duration || '1 day'}</span>
              <span class="badge badge-blue">${window.Icons.users} Max ${tour.capacity || 10}</span>
              <span class="badge badge-orange">★ ${Number(tour.rating || 5).toFixed(1)}</span>
            </div>
            <div class="tour-card-footer">
              <div style="display:flex;flex-direction:column;gap:2px;">
                <div class="price-num">$${tour.price}</div>
                <div class="price-unit">per person</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();window.navigateTo('/tours/${tour.slug || tour.id}')">BOOK TOUR</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  const getFiltered = () => selectedCategory === 'All' ? tours : tours.filter(t => t.category === selectedCategory);

  const html = `
    <div class="tours-page">
      <div class="page-hero">
        <div class="page-hero-bg">
          <img src="${settings.imgToursHero || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80'}" alt="Tours" loading="lazy">
          <div class="page-hero-overlay"></div>
        </div>
        <div class="container page-hero-content">
          <div class="breadcrumb white-breadcrumb">
            <a href="#/">Home</a><span>/</span><span>Tours</span>
          </div>
          <h1>Tours & Excursions</h1>
          <p>Explore Egypt's most iconic sites with our guided tours</p>
        </div>
      </div>

      <section class="section">
        <div class="container">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5);flex-wrap:wrap;gap:var(--space-3);">
            <div class="filter-tabs" id="tours-filter-tabs">
              ${categories.map(cat => `<button class="filter-tab ${cat === 'All' ? 'active' : ''}" data-cat="${cat}">${cat}</button>`).join('')}
            </div>
            <span id="tours-count" class="results-count"><strong>${tours.length}</strong> tours</span>
          </div>
          <div class="tours-grid" id="tours-grid">
            ${renderTourCards(tours)}
          </div>
        </div>
      </section>
    </div>
  `;

  window.renderPublicPage(html, '/tours');

  document.querySelectorAll('#tours-filter-tabs .filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.cat;
      document.querySelectorAll('#tours-filter-tabs .filter-tab').forEach(b => b.classList.toggle('active', b === btn));
      const filtered = getFiltered();
      document.getElementById('tours-grid').innerHTML = renderTourCards(filtered);
      document.getElementById('tours-count').innerHTML = `<strong>${filtered.length}</strong> tours`;
    });
  });

  window.addEventListener('storage', () => window.renderToursPage(), { once: true });
};

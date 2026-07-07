/**
 * ELKHALIL HOTEL — Admin Reviews Management
 * Ported from Reviews.jsx
 */

window.renderReviewsPage = function() {
  document.title = 'Reviews — Admin Panel';
  let reviews = window.getStoredReviews() || [];
  let filterStatus = 'All';

  const statuses = ['All', 'Pending', 'Published', 'Archived'];

  const getFiltered = () => {
    let filtered = [...reviews];
    if (filterStatus !== 'All') filtered = filtered.filter(r => r.status === filterStatus);
    return filtered;
  };

  const renderGrid = (filtered) => {
    if (!filtered.length) return `<div style="text-align:center;padding:40px;color:var(--gray-400);grid-column: 1/-1;">No reviews found.</div>`;
    
    return filtered.map(r => {
      const displayDate = r.createdAt || r.date || 'Today';
      return `
        <div class="admin-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <div class="avatar">${(r.avatar || r.guest?.[0] || 'G').toUpperCase()}</div>
                <div>
                  <div style="font-weight:600;font-size:13px;color:var(--gray-800);">${r.guest || r.name}</div>
                  <div style="font-size:11px;color:var(--gray-400);">${r.country || 'Guest'}</div>
                </div>
              </div>
              <span class="badge ${r.status === 'Published' ? 'badge-green' : r.status === 'Pending' ? 'badge-orange' : 'badge-gray'}">${r.status}</span>
            </div>
            <div style="color:#F59E0B;font-size:14px;margin-bottom:8px;">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</div>
            <div style="font-size:11px;color:var(--gray-400);margin-bottom:6px;">Target: <strong>${r.room || 'Hotel'}</strong></div>
            <p style="font-size:13px;color:var(--gray-600);line-height:1.5;font-style:italic;">"${r.review || r.comment}"</p>
          </div>

          <div style="border-top:1px solid var(--gray-100);padding-top:10px;margin-top:auto;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--gray-400);">
            <span>${displayDate}</span>
            <div style="display:flex;gap:4px;">
              ${r.status === 'Pending' ? `<button class="btn btn-sm btn-primary" onclick="approveReview('${r.id}')" style="padding:2px 8px;font-size:11px;">Publish</button>` : ''}
              ${r.status !== 'Archived' ? `<button class="btn btn-sm btn-outline" onclick="archiveReview('${r.id}')" style="padding:2px 8px;font-size:11px;">Archive</button>` : ''}
              <button class="icon-action-btn danger" onclick="deleteReview('${r.id}')" style="width:24px;height:24px;font-size:12px;">${window.Icons.x}</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  const renderContent = () => {
    const el = document.getElementById('reviews-admin-grid');
    if (el) el.innerHTML = renderGrid(getFiltered());
  };

  const contentHtml = `
    <div class="admin-page-header">
      <div class="admin-page-header-text">
        <h1>Reviews & Ratings</h1>
        <p>Review and moderate guest testimonials, publish positive feedback, and archive older items</p>
      </div>
      <div>
        <select class="filter-select" onchange="reviewFilterChange(this.value)">
          ${statuses.map(s => `<option value="${s}" ${s === filterStatus ? 'selected' : ''}>${s} Reviews</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="reviews-admin-grid" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:var(--space-5);">
      ${renderGrid(getFiltered())}
    </div>
  `;

  window.renderAdminPage(contentHtml, '/admin/reviews');

  window.reviewFilterChange = (val) => {
    filterStatus = val;
    renderContent();
  };

  window.approveReview = async (id) => {
    const idx = reviews.findIndex(r => String(r.id) === String(id));
    if (idx === -1) return;
    reviews[idx].status = 'Published';
    await window.saveStoredReviews(reviews);
    renderContent();
    window.showAdminToast('Review published to website!', 'success');
  };

  window.archiveReview = async (id) => {
    const idx = reviews.findIndex(r => String(r.id) === String(id));
    if (idx === -1) return;
    reviews[idx].status = 'Archived';
    await window.saveStoredReviews(reviews);
    renderContent();
    window.showAdminToast('Review archived!', 'success');
  };

  window.deleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    reviews = reviews.filter(r => String(r.id) !== String(id));
    await window.saveStoredReviews(reviews);
    renderContent();
    window.showAdminToast('Review deleted permanently!', 'success');
  };
};

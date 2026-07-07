import { useState, useCallback, useEffect } from 'react';
import { FiSearch, FiMoreVertical, FiCheckCircle, FiXCircle, FiTrash2, FiStar } from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';
import { getStoredReviews, saveStoredReviews, getStoredRooms, saveStoredRooms } from '../../utils/storage';
import './AdminTable.css';

const statusColors = { Published: 'badge badge-green', Pending: 'badge badge-orange' };

// Get initials safely from any string
const getInitial = (str) => {
  if (!str || typeof str !== 'string' || str.trim() === '') return 'G';
  return str.trim()[0].toUpperCase();
};

// Build a safe star string (1-5)
const buildStars = (rating) => {
  const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
};

export default function Reviews() {
  const [reviews, setReviews] = useState(() => getStoredReviews());
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [activeActionsId, setActiveActionsId] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync reviews reactively on storage events
  useEffect(() => {
    setReviews(getStoredReviews());
    const handleSync = () => {
      setReviews(getStoredReviews());
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const filtered = reviews.filter(r => {
    if (!r || typeof r !== 'object') return false;
    const guestName = String(r.guest || r.name || '');
    const reviewText = String(r.review || r.comment || '');
    const ratingVal = String(r.rating ?? 0);
    const statusVal = String(r.status || 'Pending');

    const q = search.toLowerCase();
    const matchSearch = !search || guestName.toLowerCase().includes(q) || reviewText.toLowerCase().includes(q);
    const matchRating = ratingFilter === 'All Ratings' || ratingVal === ratingFilter.split(' ')[0];
    const matchStatus = statusFilter === 'All Status' || statusVal === statusFilter;
    return matchSearch && matchRating && matchStatus;
  });

  const persist = (updated) => {
    setReviews(updated);
    saveStoredReviews(updated);
  };

  const recalcRoomRating = (updated, roomId) => {
    if (!roomId) return;
    const roomsList = getStoredRooms() || [];
    const roomReviews = updated.filter(r => r.roomId === roomId && r.status === 'Published');
    const newAvgRating = roomReviews.length
      ? parseFloat((roomReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / roomReviews.length).toFixed(1))
      : 0;
    const updatedRooms = roomsList.map(room =>
      room.id === roomId ? { ...room, rating: newAvgRating, reviewCount: roomReviews.length } : room
    );
    saveStoredRooms(updatedRooms);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    const target = reviews.find(r => r.id === id);
    const updated = reviews.filter(r => r.id !== id);
    persist(updated);
    if (target) recalcRoomRating(updated, target.roomId);
    setActiveActionsId(null);
    showToast('Review deleted successfully.');
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = reviews.map(r => r.id === id ? { ...r, status: newStatus } : r);
    persist(updated);
    const target = reviews.find(r => r.id === id);
    if (target) recalcRoomRating(updated, target.roomId);
    setActiveActionsId(null);
    showToast(`Review ${newStatus === 'Published' ? 'published' : 'unpublished'} successfully.`);
  };

  // Stats
  const totalPublished = reviews.filter(r => r.status === 'Published').length;
  const totalPending = reviews.filter(r => r.status === 'Pending').length;
  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <AdminLayout>
      <div className="admin-page">
        {toast && (
          <div className="admin-toast">
            <FiCheckCircle style={{ flexShrink: 0 }} />
            {toast}
          </div>
        )}

        <div className="admin-page-header">
          <div>
            <h1>Reviews</h1>
            <p>Moderating guest reviews and testimonials published on the landing pages.</p>
          </div>
          <div className="admin-page-actions">
            <select
              className="form-input"
              style={{ width: 'auto' }}
              value={ratingFilter}
              onChange={e => setRatingFilter(e.target.value)}
            >
              <option>All Ratings</option>
              <option>5 Stars</option>
              <option>4 Stars</option>
              <option>3 Stars</option>
              <option>2 Stars</option>
              <option>1 Stars</option>
            </select>
            <select
              className="form-input"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Published</option>
              <option>Pending</option>
            </select>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Reviews', value: reviews.length, color: 'var(--gold)' },
            { label: 'Published', value: totalPublished, color: 'var(--green)' },
            { label: 'Pending', value: totalPending, color: 'var(--orange)' },
            { label: 'Avg Rating', value: `${avgRating} ★`, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} className="admin-stat-mini" style={{
              background: 'var(--card-bg)', border: '1px solid var(--border-color)',
              borderRadius: '10px', padding: '14px 20px', flex: '1', minWidth: '120px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="admin-card">
          <div className="table-toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                placeholder="Search by guest name or review text..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Booking</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                      <FiStar size={32} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />
                      No reviews match your filters.
                    </td>
                  </tr>
                ) : filtered.map(r => {
                  const guestDisplay = String(r.guest || r.name || 'Guest');
                  const avatarLetter = r.avatar || getInitial(guestDisplay);
                  const reviewText = String(r.review || r.comment || '');
                  const ratingNum = Math.max(0, Math.min(5, Math.round(Number(r.rating) || 0)));
                  const statusVal = String(r.status || 'Pending');

                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="table-user">
                          <div className="rb-avatar">{avatarLetter}</div>
                          <div>
                            <div className="table-user-name">{guestDisplay}</div>
                            <div className="table-user-sub">{r.room || 'General'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{r.booking || '—'}</td>
                      <td>
                        <span style={{ color: '#F59E0B', fontWeight: 700, letterSpacing: '1px', fontSize: '15px' }}>
                          {'★'.repeat(ratingNum)}
                        </span>
                        <span style={{ color: 'var(--gray-200)', fontSize: '15px' }}>
                          {'★'.repeat(5 - ratingNum)}
                        </span>
                      </td>
                      <td style={{
                        maxWidth: '280px', fontSize: '13px', color: 'var(--gray-600)',
                        whiteSpace: 'normal', lineHeight: '1.5'
                      }}>
                        {reviewText.length > 120 ? `"${reviewText.slice(0, 120)}…"` : `"${reviewText}"`}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{r.date || '—'}</td>
                      <td>
                        <span className={statusColors[statusVal] || 'badge'}>
                          {statusVal}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', position: 'relative' }}>
                        <button
                          className="icon-action-btn"
                          style={{ marginLeft: 'auto' }}
                          onClick={() => setActiveActionsId(activeActionsId === r.id ? null : r.id)}
                        >
                          <FiMoreVertical />
                        </button>

                        {activeActionsId === r.id && (
                          <div className="table-dropdown">
                            {statusVal === 'Pending' && (
                              <button onClick={() => handleStatusChange(r.id, 'Published')}>
                                <FiCheckCircle style={{ color: 'var(--green)' }} /> Publish Review
                              </button>
                            )}
                            {statusVal === 'Published' && (
                              <button onClick={() => handleStatusChange(r.id, 'Pending')}>
                                <FiXCircle style={{ color: 'var(--orange)' }} /> Unpublish Review
                              </button>
                            )}
                            <button className="delete-action" onClick={() => handleDelete(r.id)}>
                              <FiTrash2 /> Delete Review
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

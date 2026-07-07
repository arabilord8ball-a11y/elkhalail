import { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiPlus, FiMoreVertical, FiEdit, FiTrash, FiEye, FiCheck, FiX } from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';
import { getStoredGuests, saveStoredGuests, deleteStoredGuest, getStoredBookings, exportToCSV } from '../../utils/storage';
import './AdminTable.css';

export default function Guests() {
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  // Modals
  const [detailGuest, setDetailGuest] = useState(null);
  const [editGuest, setEditGuest] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', spent: 0, bookings: 0 });

  const statusColor = {
    Confirmed: 'badge badge-green',
    Pending: 'badge badge-orange',
    Cancelled: 'badge badge-red',
    'Checked-in': 'badge badge-blue',
    'Checked-out': 'badge badge-gray',
  };

  // Load guests and bookings
  useEffect(() => {
    document.title = 'Guests Management | Elkhalil Hotel';
    const refreshGuests = () => {
      setGuests(getStoredGuests());
    };
    refreshGuests();
    window.addEventListener('storage', refreshGuests);
    return () => window.removeEventListener('storage', refreshGuests);
  }, []);

  const handleSave = (updatedList) => {
    setGuests(updatedList);
    saveStoredGuests(updatedList);
  };

  // Add Guest
  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!newGuest.name || !newGuest.email) return;

    const nextId = guests.length ? Math.max(...guests.map(g => g.id)) + 1 : 1;
    const added = {
      id: nextId,
      name: newGuest.name,
      email: newGuest.email,
      phone: newGuest.phone || 'N/A',
      bookings: Number(newGuest.bookings) || 0,
      spent: Number(newGuest.spent) || 0,
      avatar: newGuest.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    };

    const updated = [added, ...guests];
    handleSave(updated);
    setAddModal(false);
    setNewGuest({ name: '', email: '', phone: '', spent: 0, bookings: 0 });
  };

  // Edit Guest
  const handleEditGuest = (e) => {
    e.preventDefault();
    const updated = guests.map(g => g.id === editGuest.id ? {
      ...editGuest,
      avatar: editGuest.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    } : g);
    handleSave(updated);
    setEditGuest(null);
  };

  // Delete Guest
  const handleDeleteGuest = (id) => {
    if (window.confirm('Are you sure you want to delete this guest? This will also remove all their bookings, payments, reviews, and chats.')) {
      deleteStoredGuest(id);
      setActiveMenuId(null);
    }
  };

  // Export CSV
  const handleExport = () => {
    exportToCSV(guests, 'elkhalil_guests.csv');
  };

  // Search filter
  const filtered = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase()) ||
    g.phone.includes(search)
  );

  // Get specific guest bookings
  const getGuestBookings = (guestName) => {
    return getStoredBookings().filter(b => b.guest.toLowerCase() === guestName.toLowerCase());
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Guests</h1>
            <p>Manage hotel guest profiles, check-in history, total spendings, and contact details.</p>
          </div>
          <div className="admin-page-actions">
            <button className="btn btn-outline btn-sm" onClick={handleExport}><FiDownload /> Export CSV</button>
            <button className="btn btn-primary btn-sm" onClick={() => setAddModal(true)}><FiPlus /> Add Guest</button>
          </div>
        </div>

        <div className="admin-card">
          <div className="table-toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input 
                placeholder="Search by name, email or phone..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Bookings</th>
                  <th>Total Spent</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => (
                  <tr key={g.id}>
                    <td>
                      <div className="table-user">
                        <div className="rb-avatar" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>{g.avatar}</div>
                        <div className="table-user-name" style={{ fontWeight: 600 }}>{g.name}</div>
                      </div>
                    </td>
                    <td>{g.email}</td>
                    <td>{g.phone}</td>
                    <td><span className="badge badge-gray">{g.bookings} Bookings</span></td>
                    <td><strong style={{ color: 'var(--primary)' }}>${g.spent}</strong></td>
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <button 
                        className="icon-action-btn"
                        onClick={() => setActiveMenuId(activeMenuId === g.id ? null : g.id)}
                      >
                        <FiMoreVertical />
                      </button>

                      {activeMenuId === g.id && (
                        <div className="topbar-dropdown" style={{ right: '10px', top: '35px', minWidth: '160px', display: 'block' }}>
                          <button onClick={() => { setDetailGuest(g); setActiveMenuId(null); }}><FiEye /> View Details</button>
                          <button onClick={() => { setEditGuest(g); setActiveMenuId(null); }}><FiEdit /> Edit Guest</button>
                          <button onClick={() => handleDeleteGuest(g.id)} className="delete-action" style={{ color: 'var(--red)' }}><FiTrash /> Delete Guest</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-count">Showing {filtered.length} of {guests.length} guests</span>
          </div>
        </div>
      </div>

      {/* 1. Add Guest Modal */}
      {addModal && (
        <div className="admin-modal-overlay" onClick={() => setAddModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add New Guest</h3>
              <button className="modal-close-btn" onClick={() => setAddModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleAddGuest} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. John Doe"
                  value={newGuest.name}
                  onChange={e => setNewGuest({ ...newGuest, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  required 
                  placeholder="e.g. john@example.com"
                  value={newGuest.email}
                  onChange={e => setNewGuest({ ...newGuest, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. +20 123 456 7890"
                  value={newGuest.phone}
                  onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })}
                />
              </div>
              <div className="settings-grid" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Bookings Count</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={newGuest.bookings}
                    onChange={e => setNewGuest({ ...newGuest, bookings: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Spent ($)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={newGuest.spent}
                    onChange={e => setNewGuest({ ...newGuest, spent: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Guest Modal */}
      {editGuest && (
        <div className="admin-modal-overlay" onClick={() => setEditGuest(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit Guest Profile</h3>
              <button className="modal-close-btn" onClick={() => setEditGuest(null)}><FiX /></button>
            </div>
            <form onSubmit={handleEditGuest} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={editGuest.name}
                  onChange={e => setEditGuest({ ...editGuest, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  required 
                  value={editGuest.email}
                  onChange={e => setEditGuest({ ...editGuest, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editGuest.phone}
                  onChange={e => setEditGuest({ ...editGuest, phone: e.target.value })}
                />
              </div>
              <div className="settings-grid" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Bookings Count</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editGuest.bookings}
                    onChange={e => setEditGuest({ ...editGuest, bookings: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Spent ($)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editGuest.spent}
                    onChange={e => setEditGuest({ ...editGuest, spent: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditGuest(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. View Guest Details Modal */}
      {detailGuest && (
        <div className="admin-modal-overlay" onClick={() => setDetailGuest(null)}>
          <div className="admin-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Guest Details Profile</h3>
              <button className="modal-close-btn" onClick={() => setDetailGuest(null)}><FiX /></button>
            </div>
            <div className="admin-modal-form" style={{ gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--gray-50)', padding: '16px', borderRadius: '12px' }}>
                <div className="rb-avatar" style={{ width: '60px', height: '60px', fontSize: '24px', background: 'var(--primary-bg)', color: 'var(--primary)' }}>{detailGuest.avatar}</div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{detailGuest.name}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>Profile ID: #{detailGuest.id}</p>
                </div>
              </div>

              <div className="settings-grid" style={{ marginBottom: 0 }}>
                <div>
                  <label className="form-label" style={{ color: 'var(--gray-400)' }}>Email Address</label>
                  <div style={{ fontWeight: 600 }}>{detailGuest.email}</div>
                </div>
                <div>
                  <label className="form-label" style={{ color: 'var(--gray-400)' }}>Phone Number</label>
                  <div style={{ fontWeight: 600 }}>{detailGuest.phone}</div>
                </div>
                <div>
                  <label className="form-label" style={{ color: 'var(--gray-400)' }}>Total Bookings</label>
                  <div style={{ fontWeight: 600 }} className="badge badge-gray">{detailGuest.bookings} Bookings</div>
                </div>
                <div>
                  <label className="form-label" style={{ color: 'var(--gray-400)' }}>Total Revenue Spent</label>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '16px' }}>${detailGuest.spent}</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '6px' }}>
                  📅 Reservation History ({getGuestBookings(detailGuest.name).length})
                </h4>
                {getGuestBookings(detailGuest.name).length === 0 ? (
                  <p style={{ color: 'var(--gray-400)', fontSize: '13px', fontStyle: 'italic' }}>No reservations recorded under this guest name.</p>
                ) : (
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getGuestBookings(detailGuest.name).map(b => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--gray-100)', borderRadius: '8px', fontSize: '13px' }}>
                        <div>
                          <strong>{b.room}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{b.checkIn} - {b.checkOut}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700 }}>${b.amount}</span>
                          <span className={statusColor[b.status] || 'badge'}>{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-modal-actions" style={{ marginTop: '10px' }}>
                <button type="button" className="btn btn-primary" onClick={() => setDetailGuest(null)}>Close Profile</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

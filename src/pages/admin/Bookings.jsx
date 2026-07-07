import { useState, useEffect } from 'react';
import { 
  FiSearch, FiDownload, FiPlus, FiMoreVertical, FiCheck, FiCheckSquare, 
  FiCheckCircle, FiX, FiTrash2, FiPrinter, FiUser, FiMail, FiPhone, 
  FiGlobe, FiAward, FiBriefcase, FiInfo 
} from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';
import { getStoredBookings, saveStoredBookings, deleteStoredBooking, exportToCSV } from '../../utils/storage';
import Pagination from '../../components/ui/Pagination';
import './AdminTable.css';

const tabs = ['All Bookings', 'Upcoming', 'Checked-in', 'Checked-out', 'Cancelled'];
const statusColors = {
  Confirmed: 'badge badge-green',
  Pending: 'badge badge-orange',
  Cancelled: 'badge badge-red',
  'Checked-in': 'badge badge-blue',
  'Checked-out': 'badge badge-gray',
};

export default function Bookings() {
  const [bookings, setBookings] = useState(() => getStoredBookings());
  const [tab, setTab] = useState('All Bookings');
  const [search, setSearch] = useState('');
  const [activeActionsId, setActiveActionsId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null); // Click to open detailed modal
  const [toast, setToast] = useState(null);

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    guest: '',
    email: '',
    phone: '',
    country: 'Egypt',
    nationality: '',
    passportId: '',
    room: 'Deluxe Room',
    checkIn: '',
    checkOut: '',
    guests: 2,
    amount: 150,
    breakfast: false,
    airportShuttle: false,
    extraBed: false
  });

  // Sync state with storage live updates & pull latest cache on mount
  useEffect(() => {
    setBookings(getStoredBookings());
    const handleStorage = () => {
      setBookings(getStoredBookings());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Filter Bookings
  const filtered = bookings.filter(b => {
    const matchTab = tab === 'All Bookings' || b.status === tab || (tab === 'Upcoming' && b.status === 'Confirmed');
    const matchSearch = b.guest.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [tab, search]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Delete Booking
  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete booking ${id}?`)) {
      deleteStoredBooking(id);
      setBookings(getStoredBookings());
      setActiveActionsId(null);
      showToast(`Booking ${id} has been deleted successfully.`);
    }
  };

  // Change Booking Status
  const handleStatusChange = (id, newStatus) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    setBookings(updated);
    saveStoredBookings(updated);
    setActiveActionsId(null);
    showToast(`Booking ${id} status updated to "${newStatus}".`);
  };

  // Add Booking
  const handleAddBooking = (e) => {
    e.preventDefault();
    if (!newBooking.guest || !newBooking.checkIn || !newBooking.checkOut) {
      alert('Please fill in all required fields.');
      return;
    }
    const nextId = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;
    const guestInitials = newBooking.guest.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const extrasList = [];
    if (newBooking.breakfast) extrasList.push('Breakfast Buffet');
    if (newBooking.airportShuttle) extrasList.push('Airport Shuttle Service');
    if (newBooking.extraBed) extrasList.push('Extra Bed');

    const bookingToAdd = {
      id: nextId,
      guest: newBooking.guest,
      email: newBooking.email || 'N/A',
      phone: newBooking.phone || 'N/A',
      country: newBooking.country,
      nationality: newBooking.nationality || 'N/A',
      passportId: newBooking.passportId || 'N/A',
      arrivalTime: 'Standard (12:00 - 16:00)',
      specialRequests: 'None',
      room: newBooking.room,
      checkIn: newBooking.checkIn,
      checkOut: newBooking.checkOut,
      guests: Number(newBooking.guests),
      amount: Number(newBooking.amount),
      price: Number(newBooking.amount),
      status: 'Confirmed',
      avatar: guestInitials || 'G',
      extras: extrasList,
      roomPrice: Number(newBooking.amount) - (newBooking.breakfast ? 15 : 0) - (newBooking.airportShuttle ? 25 : 0),
      extrasPrice: (newBooking.breakfast ? 15 : 0) + (newBooking.airportShuttle ? 25 : 0)
    };

    const updated = [bookingToAdd, ...bookings];
    setBookings(updated);
    saveStoredBookings(updated);
    setShowAddModal(false);
    
    // Reset Form
    setNewBooking({
      guest: '',
      email: '',
      phone: '',
      country: 'Egypt',
      nationality: '',
      passportId: '',
      room: 'Deluxe Room',
      checkIn: '',
      checkOut: '',
      guests: 2,
      amount: 150,
      breakfast: false,
      airportShuttle: false,
      extraBed: false
    });
    showToast(`New booking ${nextId} created successfully!`);
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Toast Notification */}
        {toast && (
          <div className="admin-toast">
            <FiCheckCircle className="toast-icon" />
            {toast}
          </div>
        )}

        <div className="admin-page-header">
          <div>
            <h1>Bookings</h1>
            <p>Manage all hotel bookings, check status, check guests in/out, and edit files.</p>
          </div>
          <div className="admin-page-actions">
            <button className="btn btn-outline btn-sm" onClick={() => { exportToCSV(bookings, 'elkhalil_bookings.csv'); showToast('Bookings database exported successfully (CSV)'); }}><FiDownload /> Export</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}><FiPlus /> New Booking</button>
          </div>
        </div>

        <div className="admin-card">
          {/* Tabs */}
          <div className="admin-tabs">
            {tabs.map(t => (
              <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="table-toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input placeholder="Search by guest name or booking ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map(b => (
                  <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedBooking(b)}>
                    <td>
                      <div className="table-user">
                        <div className="rb-avatar">{b.avatar}</div>
                        <div>
                          <div className="table-user-name" style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{b.guest}</div>
                          <div className="table-user-sub">{b.id}</div>
                        </div>
                      </div>
                    </td>
                    <td onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}>{b.room}</td>
                    <td onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}>{b.checkIn}</td>
                    <td onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}>{b.checkOut}</td>
                    <td onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}>{b.guests} Guests</td>
                    <td onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}>${b.price || b.amount}</td>
                    <td onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}><span className={statusColors[b.status] || 'badge'}>{b.status}</span></td>
                    <td style={{ textAlign: 'right', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="icon-action-btn"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => setActiveActionsId(activeActionsId === b.id ? null : b.id)}
                      >
                        <FiMoreVertical />
                      </button>

                      {/* Dropdown Actions */}
                      {activeActionsId === b.id && (
                        <div className="table-dropdown">
                          {b.status === 'Pending' && (
                            <button onClick={() => handleStatusChange(b.id, 'Confirmed')}>
                              <FiCheck style={{ color: 'var(--green)' }} /> Confirm Booking
                            </button>
                          )}
                          {b.status === 'Confirmed' && (
                            <button onClick={() => handleStatusChange(b.id, 'Checked-in')}>
                              <FiCheckSquare style={{ color: 'var(--blue)' }} /> Check In Guest
                            </button>
                          )}
                          {b.status === 'Checked-in' && (
                            <button onClick={() => handleStatusChange(b.id, 'Checked-out')}>
                              <FiX style={{ color: 'var(--gray-600)' }} /> Check Out Guest
                            </button>
                          )}
                          {b.status !== 'Cancelled' && b.status !== 'Checked-out' && (
                            <button onClick={() => handleStatusChange(b.id, 'Cancelled')}>
                              <FiX style={{ color: 'var(--red)' }} /> Cancel Booking
                            </button>
                          )}
                          <button className="delete-action" onClick={() => handleDelete(b.id)}>
                            <FiTrash2 /> Delete Record
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <span className="table-count">Showing {paginatedList.length} of {filtered.length} matching bookings (Total: {bookings.length})</span>
            <Pagination 
              currentPage={currentPage} 
              totalItems={filtered.length} 
              itemsPerPage={itemsPerPage} 
              onPageChange={setCurrentPage} 
            />
          </div>
        </div>
      </div>

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal card" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="admin-modal-header">
              <h3>Create New Booking</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleAddBooking} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">Guest Full Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. John Doe"
                  required
                  value={newBooking.guest}
                  onChange={e => setNewBooking(p => ({ ...p, guest: e.target.value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="guest@example.com"
                    value={newBooking.email}
                    onChange={e => setNewBooking(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+20 100 000 0000"
                    value={newBooking.phone}
                    onChange={e => setNewBooking(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Room Type *</label>
                <select
                  className="form-input"
                  value={newBooking.room}
                  onChange={e => setNewBooking(p => ({ ...p, room: e.target.value }))}
                >
                  <option>Standard Room</option>
                  <option>Deluxe Room</option>
                  <option>Superior Room</option>
                  <option>Family Room</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Check-in Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={newBooking.checkIn}
                    onChange={e => setNewBooking(p => ({ ...p, checkIn: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-out Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={newBooking.checkOut}
                    onChange={e => setNewBooking(p => ({ ...p, checkOut: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Number of Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    className="form-input"
                    value={newBooking.guests}
                    onChange={e => setNewBooking(p => ({ ...p, guests: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Amount ($)</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    value={newBooking.amount}
                    onChange={e => setNewBooking(p => ({ ...p, amount: e.target.value }))}
                  />
                </div>
              </div>

              {/* Extras Selector */}
              <div className="form-group">
                <label className="form-label">Add-ons &amp; Extras</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <input 
                      type="checkbox" 
                      checked={newBooking.breakfast} 
                      onChange={e => setNewBooking(p => ({ ...p, breakfast: e.target.checked }))} 
                    />
                    Breakfast Buffet
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <input 
                      type="checkbox" 
                      checked={newBooking.airportShuttle} 
                      onChange={e => setNewBooking(p => ({ ...p, airportShuttle: e.target.checked }))} 
                    />
                    Airport Shuttle
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <input 
                      type="checkbox" 
                      checked={newBooking.extraBed} 
                      onChange={e => setNewBooking(p => ({ ...p, extraBed: e.target.checked }))} 
                    />
                    Extra Bed
                  </label>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Detail Modal with Invoice Preview */}
      {selectedBooking && (
        <div className="admin-modal-overlay">
          <div className="admin-modal card" style={{ maxWidth: '750px', width: '90%' }}>
            <div className="admin-modal-header">
              <h3>Booking Detail &amp; Invoice ({selectedBooking.id})</h3>
              <button className="modal-close-btn" onClick={() => setSelectedBooking(null)}>
                <FiX size={18} />
              </button>
            </div>
            
            {/* Modal Scrollable Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Left Column: Guest & Stay Details */}
              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Guest Information</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                  <div><span style={{ color: 'var(--gray-500)' }}>Full Name:</span> <strong>{selectedBooking.guest}</strong></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Email:</span> <strong>{selectedBooking.email || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Phone:</span> <strong>{selectedBooking.phone || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Country:</span> <strong>{selectedBooking.country || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Nationality:</span> <strong>{selectedBooking.nationality || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Passport/ID:</span> <strong>{selectedBooking.passportId || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Arrival Time:</span> <strong>{selectedBooking.arrivalTime || 'Standard (12:00 - 16:00)'}</strong></div>
                </div>

                <h4 style={{ fontSize: '13px', color: 'var(--gold)', textTransform: 'uppercase', marginTop: '20px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Stay Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                  <div><span style={{ color: 'var(--gray-500)' }}>Room Reserved:</span> <strong>{selectedBooking.room}</strong></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Check-in:</span> <strong>{selectedBooking.checkIn}</strong></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Check-out:</span> <strong>{selectedBooking.checkOut}</strong></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Guests Count:</span> <strong>{selectedBooking.guests} Guest(s)</strong></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Nights Count:</span> <strong>{selectedBooking.nights || 1} Night(s)</strong></div>
                  <div>
                    <span style={{ color: 'var(--gray-500)' }}>Status:</span>{' '}
                    <span className={statusColors[selectedBooking.status] || 'badge'}>{selectedBooking.status}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Invoice Preview */}
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', color: '#111' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#C9973A' }}>⚜ INVOICE</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', background: '#fee2e2', color: '#ef4444', borderRadius: '4px', textTransform: 'uppercase' }}>{selectedBooking.paymentMethod || 'Pay at Hotel'}</span>
                </div>
                
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                  <div><strong>Booking ID:</strong> {selectedBooking.id}</div>
                  <div><strong>Date Created:</strong> {selectedBooking.createdAt || selectedBooking.checkIn}</div>
                </div>

                <div style={{ flex: 1, borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                  {/* Itemized Room Cost */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
                    <span>Room Cost ({selectedBooking.room})</span>
                    <strong>${selectedBooking.roomPrice || selectedBooking.price || selectedBooking.amount}</strong>
                  </div>

                  {/* Extras List */}
                  {selectedBooking.extras && selectedBooking.extras.length > 0 ? (
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Add-ons &amp; Extras:</span>
                      {selectedBooking.extras.map((extra, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4b5563', marginBottom: '4px', paddingLeft: '8px', borderLeft: '2px solid #C9973A' }}>
                          <span>• {extra}</span>
                          <span>Included</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11.5px', color: '#9ca3af', fontStyle: 'italic', marginTop: '10px' }}>No extras or add-ons selected.</div>
                  )}
                </div>

                <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '10px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14.5px' }}>
                    <span>Total Amount Due:</span>
                    <span style={{ color: '#C9973A', fontSize: '18px' }}>${selectedBooking.price || selectedBooking.amount || 0}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '10px', lineHeight: '1.4' }}>
                    Pay at Hotel. The invoice amount will be paid by the guest directly at standard hotel check-in.
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => {
                  const printContent = document.getElementById('printable-invoice-content').innerHTML;
                  const originalContent = document.body.innerHTML;
                  document.body.innerHTML = printContent;
                  window.print();
                  window.location.reload(); // Reload cleanly to restore react UI
                }}
              >
                <FiPrinter /> Print Guest Invoice
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setSelectedBooking(null)}>Close Details</button>
            </div>

            {/* Hidden printable invoice container */}
            <div id="printable-invoice-content" style={{ display: 'none' }}>
              <div style={{ padding: '40px', background: '#fff', color: '#111', fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <div>
                    <h2 style={{ margin: 0, color: '#C9973A' }}>⚜ EL KHALIL BOUTIQUE HOTEL</h2>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>Pyramids View &amp; Luxury Suites</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: 0 }}>INVOICE</h3>
                    <div style={{ fontSize: '12px' }}><strong>Booking Ref:</strong> {selectedBooking.id}</div>
                    <div style={{ fontSize: '12px' }}><strong>Status:</strong> Pay on Arrival</div>
                  </div>
                </div>
                <hr style={{ border: '0', height: '1px', background: '#e5e7eb', margin: '20px 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px', fontSize: '13px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px', color: '#9ca3af' }}>HOTEL DETAILS</h4>
                    <div><strong>El Khalil Boutique Hotel</strong></div>
                    <div>Giza Pyramids Area, Cairo, Egypt</div>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 8px', color: '#9ca3af' }}>GUEST DETAILS</h4>
                    <div><strong>{selectedBooking.guest}</strong></div>
                    <div>Email: {selectedBooking.email || 'N/A'}</div>
                    <div>Phone: {selectedBooking.phone || 'N/A'}</div>
                    <div>Nationality: {selectedBooking.nationality || 'N/A'}</div>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Description</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Nights</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 10px' }}>
                        <strong>Room: {selectedBooking.room}</strong>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Check-in: {selectedBooking.checkIn} | Check-out: {selectedBooking.checkOut}</div>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>{selectedBooking.nights || 1}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>${selectedBooking.roomPrice || selectedBooking.amount || selectedBooking.price || 0}</td>
                    </tr>
                    {selectedBooking.extras && selectedBooking.extras.map((extra, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 10px' }}>• {extra}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>—</td>
                        <td style={{ padding: '12px 10px', textAlign: 'right' }}>Included</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '14px', fontWeight: 'bold' }}>
                  <div style={{ width: '250px', borderTop: '2px solid #e5e7eb', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Amount Due:</span>
                    <span style={{ color: '#C9973A', fontSize: '18px' }}>${selectedBooking.price || selectedBooking.amount || 0}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}

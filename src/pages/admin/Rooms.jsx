import { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiPlus, FiX, FiCheckCircle, FiTrash2, FiEdit2, FiRefreshCw, FiUsers, FiMaximize, FiGrid, FiList } from 'react-icons/fi';
import { FaBed } from 'react-icons/fa';
import AdminLayout from '../../components/layout/AdminLayout';
import { getStoredRooms, saveStoredRooms } from '../../utils/storage';
import { compressImageToBase64 } from '../../utils/image';
import './AdminTable.css';

const ALL_AMENITIES = [
  'Free Wi-Fi',
  'Air Conditioning',
  'Flat-screen TV',
  'Minibar',
  'Coffee & Tea',
  'In-room Safe',
  'Hair Dryer',
  'Bathroom Amenities',
  'Slippers',
  'Washrobe',
  'Private Bathroom',
  'Daily Housekeeping',
  'Mini Fridge',
  'Extra Bed Available',
  'Pool View'
];

export default function AdminRooms() {
  const [rooms, setRooms] = useState(() => getStoredRooms());
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Room Types');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.title = 'Rooms Management | Elkhalil Hotel';
    setRooms(getStoredRooms());
    const handleSync = () => {
      setRooms(getStoredRooms());
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  // Edit/Add Form states
  const [currentRoom, setCurrentRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    number: '',
    name: '',
    type: 'Standard',
    capacity: 2,
    beds: '1 King Bed',
    size: 32,
    price: 90,
    view: 'Pyramids View',
    images: [],
    status: 'Available',
    description: '',
    longDescription: '',
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV'],
    highlights: '',
    checkIn: '2:00 PM',
    checkOut: '12:00 PM',
    cancellation: 'Free cancellation up to 48 hours before arrival',
  });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = rooms.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.number.toString().includes(search);
    const matchType = typeFilter === 'All Room Types' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const statusBadge = { Available: 'badge badge-green', Occupied: 'badge badge-red', Reserved: 'badge badge-orange' };

  // Delete Room
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      const updated = rooms.filter(r => r.id !== id);
      setRooms(updated);
      saveStoredRooms(updated);
      showToast('Room deleted successfully.');
    }
  };

  // Toggle Status
  const handleToggleStatus = (id) => {
    const updated = rooms.map(r => {
      if (r.id === id) {
        let nextStatus = 'Available';
        if (r.status === 'Available') nextStatus = 'Occupied';
        else if (r.status === 'Occupied') nextStatus = 'Reserved';
        return { ...r, status: nextStatus };
      }
      return r;
    });
    setRooms(updated);
    saveStoredRooms(updated);
    showToast('Room status toggled successfully.');
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleRoomImageUpload = async (e, mode) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const base64Url = await compressImageToBase64(file, 800, 600, 0.7);
      if (mode === 'add') {
        setNewRoom(prev => ({
          ...prev,
          images: [...(prev.images || []), base64Url]
        }));
      } else {
        setCurrentRoom(prev => ({
          ...prev,
          images: [...(prev.images || []), base64Url]
        }));
      }
      showToast('Image uploaded and optimized successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to process image.');
    } finally {
      setUploadingImage(false);
    }
  };


  const handleRemoveImage = (index, mode) => {
    if (mode === 'add') {
      setNewRoom(prev => ({
        ...prev,
        images: (prev.images || []).filter((_, i) => i !== index)
      }));
    } else {
      setCurrentRoom(prev => ({
        ...prev,
        images: (prev.images || []).filter((_, i) => i !== index)
      }));
    }
    showToast('Image removed.');
  };

  // Toggle Amenities checklist selection
  const handleAmenityChange = (amenity, mode) => {
    if (mode === 'add') {
      setNewRoom(prev => {
        const amenities = prev.amenities || [];
        const updated = amenities.includes(amenity)
          ? amenities.filter(a => a !== amenity)
          : [...amenities, amenity];
        return { ...prev, amenities: updated };
      });
    } else {
      setCurrentRoom(prev => {
        const amenities = prev.amenities || [];
        const updated = amenities.includes(amenity)
          ? amenities.filter(a => a !== amenity)
          : [...amenities, amenity];
        return { ...prev, amenities: updated };
      });
    }
  };

  // Add Room
  const handleAddRoom = (e) => {
    e.preventDefault();
    if (!newRoom.number || !newRoom.name) {
      alert('Please fill out all required fields.');
      return;
    }
    const slug = newRoom.name.toLowerCase().replace(/ /g, '-');
    const roomToAdd = {
      id: Date.now(), // Unique ID
      number: newRoom.number,
      name: newRoom.name,
      slug: slug,
      type: newRoom.type,
      capacity: Number(newRoom.capacity),
      beds: newRoom.beds,
      size: Number(newRoom.size),
      price: Number(newRoom.price),
      view: newRoom.view,
      status: newRoom.status || 'Available',
      rating: 4.8,
      reviewCount: 0,
      images: newRoom.images && newRoom.images.length > 0 ? newRoom.images : ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&q=70'],
      amenities: newRoom.amenities && newRoom.amenities.length > 0 ? newRoom.amenities : ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV'],
      description: newRoom.description || 'Comfortable newly added hotel room with modern styling.',
      longDescription: newRoom.longDescription || '',
      highlights: newRoom.highlights ? newRoom.highlights.split(',').map(h => h.trim()).filter(Boolean) : [],
      checkIn: newRoom.checkIn || '2:00 PM',
      checkOut: newRoom.checkOut || '12:00 PM',
      cancellation: newRoom.cancellation || 'Free cancellation up to 48 hours before arrival',
    };

    const updated = [roomToAdd, ...rooms];
    setRooms(updated);
    saveStoredRooms(updated);
    setShowAddModal(false);
    setNewRoom({
      number: '',
      name: '',
      type: 'Standard',
      capacity: 2,
      beds: '1 King Bed',
      size: 32,
      price: 90,
      view: 'Pyramids View',
      images: [],
      status: 'Available',
      description: '',
      longDescription: '',
      amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV'],
      highlights: '',
      checkIn: '2:00 PM',
      checkOut: '12:00 PM',
      cancellation: 'Free cancellation up to 48 hours before arrival',
    });
    showToast(`Room #${newRoom.number} added successfully.`);
  };

  // Open Edit Modal
  const openEditModal = (room) => {
    setCurrentRoom({
      ...room,
      highlights: room.highlights ? room.highlights.join(', ') : '',
    });
    setShowEditModal(true);
  };

  // Save Edit Room
  const handleEditRoomSubmit = (e) => {
    e.preventDefault();
    if (!currentRoom.number || !currentRoom.name) {
      alert('Please fill out all required fields.');
      return;
    }
    const slug = currentRoom.name.toLowerCase().replace(/ /g, '-');
    const roomToSave = {
      ...currentRoom,
      slug: slug,
      highlights: typeof currentRoom.highlights === 'string' 
        ? currentRoom.highlights.split(',').map(h => h.trim()).filter(Boolean) 
        : (currentRoom.highlights || [])
    };
    const updated = rooms.map(r => r.id === currentRoom.id ? roomToSave : r);
    
    setRooms(updated);
    saveStoredRooms(updated);
    setShowEditModal(false);
    showToast(`Room #${currentRoom.number} updated successfully.`);
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        {toast && (
          <div className="admin-toast">
            <FiCheckCircle className="toast-icon" />
            {toast}
          </div>
        )}

        <div className="admin-page-header">
          <div><h1>Rooms</h1><p>Manage all hotel rooms, adjust prices, edit configurations, and check availability status.</p></div>
          <div className="admin-page-actions">
            <button className="btn btn-outline btn-sm" onClick={() => showToast('Rooms report exported successfully (CSV)')}><FiDownload /> Export</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}><FiPlus /> Add Room</button>
          </div>
        </div>

        <div className="admin-card">
          <div className="table-toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input placeholder="Search rooms by name or number..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="toolbar-right">
              <select className="form-input" style={{ width: 'auto' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option>All Room Types</option>
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Superior</option>
                <option>Family</option>
              </select>
              <button className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('grid')}><FiGrid size={13} /> Grid</button>
              <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('list')}><FiList size={13} /> List</button>
            </div>
          </div>

          {view === 'grid' ? (
            <div className="admin-rooms-grid">
              {filtered.map(room => (
                <div key={room.id} className="admin-room-card">
                  <div className="admin-room-card-img">
                    <img src={room.images[0]} alt={room.name} />
                    <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                      <span className={statusBadge[room.status]}>{room.status}</span>
                    </div>
                  </div>
                  <div className="admin-room-card-body">
                    <div className="admin-room-card-header">
                      <div>
                        <div className="admin-room-card-num">Room #{room.number}</div>
                        <div className="admin-room-card-name">{room.name}</div>
                      </div>
                      <span className="badge badge-gold">{room.type}</span>
                    </div>
                    <div className="admin-room-meta">
                      <span><FiUsers size={12} /> {room.capacity} Guests</span>
                      <span><FaBed size={12} /> {room.beds}</span>
                      <span><FiMaximize size={12} /> {room.size}m²</span>
                    </div>
                    <div className="admin-room-card-footer">
                      <div className="admin-room-price">${room.price}<span>/night</span></div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-outline btn-sm" style={{ padding: '5px 8px', display: 'flex', alignItems: 'center' }} onClick={() => openEditModal(room)} title="Edit Room">
                          <FiEdit2 size={12} />
                        </button>
                        <button className="btn btn-outline btn-sm" style={{ padding: '5px 8px', display: 'flex', alignItems: 'center' }} onClick={() => handleToggleStatus(room.id)} title="Toggle Status">
                          <FiRefreshCw size={12} />
                        </button>
                        <button className="btn btn-sm" style={{ color: 'var(--red)', border: '1px solid var(--red)', background: 'none', padding: '5px 8px', display: 'flex', alignItems: 'center' }} onClick={() => handleDelete(room.id)}>
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Price/Night</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(room => (
                    <tr key={room.id}>
                      <td>
                        <div className="table-user">
                          <img src={room.images[0]} alt={room.name} style={{ width: 48, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                          <div>
                            <div className="table-user-name">{room.name}</div>
                            <div className="table-user-sub">#{room.number}</div>
                          </div>
                        </div>
                      </td>
                      <td>{room.type}</td>
                      <td>{room.capacity} Guests</td>
                      <td>${room.price}</td>
                      <td><span className={statusBadge[room.status]}>{room.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEditModal(room)}>Edit</button>
                          <button className="btn btn-outline btn-sm" onClick={() => handleToggleStatus(room.id)}>Toggle Status</button>
                          <button className="btn btn-sm" style={{ color: 'var(--red)', border: '1px solid var(--red)', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', background: 'none' }} onClick={() => handleDelete(room.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal card" style={{ maxWidth: '750px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h3>Add New Hotel Room</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleAddRoom} className="admin-modal-form">
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Room Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 101"
                    required
                    value={newRoom.number}
                    onChange={e => setNewRoom(p => ({ ...p, number: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Room Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Deluxe Pyramids Room"
                    required
                    value={newRoom.name}
                    onChange={e => setNewRoom(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Room Type</label>
                  <select
                    className="form-input"
                    value={newRoom.type}
                    onChange={e => setNewRoom(p => ({ ...p, type: e.target.value }))}
                  >
                    <option>Standard</option>
                    <option>Deluxe</option>
                    <option>Superior</option>
                    <option>Family</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Beds Setup</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 1 King Bed, 2 Single Beds"
                    value={newRoom.beds}
                    onChange={e => setNewRoom(p => ({ ...p, beds: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Capacity (Guests)</label>
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    value={newRoom.capacity}
                    onChange={e => setNewRoom(p => ({ ...p, capacity: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Size (m²)</label>
                  <input
                    type="number"
                    min={10}
                    className="form-input"
                    value={newRoom.size}
                    onChange={e => setNewRoom(p => ({ ...p, size: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Price per Night ($)</label>
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    value={newRoom.price}
                    onChange={e => setNewRoom(p => ({ ...p, price: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Room View Description</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Pyramids View, City View"
                    value={newRoom.view}
                    onChange={e => setNewRoom(p => ({ ...p, view: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Room Status</label>
                  <select
                    className="form-input"
                    value={newRoom.status}
                    onChange={e => setNewRoom(p => ({ ...p, status: e.target.value }))}
                  >
                    <option>Available</option>
                    <option>Occupied</option>
                    <option>Reserved</option>
                    <option>Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Short Description *</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    placeholder="e.g. Spacious Deluxe room with beautiful details..."
                    required
                    value={newRoom.description}
                    onChange={e => setNewRoom(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Long Description (Overview detail)</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    placeholder="Provide full description for detail tab..."
                    value={newRoom.longDescription}
                    onChange={e => setNewRoom(p => ({ ...p, longDescription: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Check-In Policy</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 2:00 PM"
                    value={newRoom.checkIn}
                    onChange={e => setNewRoom(p => ({ ...p, checkIn: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Check-Out Policy</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 12:00 PM"
                    value={newRoom.checkOut}
                    onChange={e => setNewRoom(p => ({ ...p, checkOut: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Cancellation Policy</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Free cancellation up to 48h before arrival"
                    value={newRoom.cancellation}
                    onChange={e => setNewRoom(p => ({ ...p, cancellation: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label className="form-label">Room Highlights (comma-separated)</label>
                <input
                  className="form-input"
                  placeholder="e.g. Pyramid view, Private balcony, Mini bar, Free WiFi"
                  value={newRoom.highlights}
                  onChange={e => setNewRoom(p => ({ ...p, highlights: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label className="form-label" style={{ fontWeight: 700, color: 'var(--gold)' }}>Amenities / Inclusions</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: '8px', padding: '12px', background: '#fafafa' }}>
                  {ALL_AMENITIES.map(amenity => {
                    const isChecked = (newRoom.amenities || []).includes(amenity);
                    return (
                      <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleAmenityChange(amenity, 'add')}
                        />
                        {amenity}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Room Image Gallery Management */}
              <div className="form-group" style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '15px', marginTop: '15px' }}>
                <label className="form-label" style={{ fontWeight: 700, color: 'var(--gold)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Room Images Manager</span>
                  <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--gray-500)' }}>CDN Hosted - 0 bytes DB space</span>
                </label>
                
                {/* Thumbnails */}
                <div className="uploaded-thumbs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {(newRoom.images || []).map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                      <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveImage(idx, 'add')}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', cursor: 'pointer' }}
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Upload Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label className="btn btn-outline btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                    {uploadingImage ? 'Uploading to CDN...' : '➕ Add Room Photo'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={e => handleRoomImageUpload(e, 'add')} 
                    />
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Upload standard JPG/PNG files</span>
                </div>
              </div>

              <div className="admin-modal-actions" style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '15px', marginTop: '15px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && currentRoom && (
        <div className="admin-modal-overlay">
          <div className="admin-modal card" style={{ maxWidth: '750px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="admin-modal-header">
              <h3>Edit Room Configuration</h3>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleEditRoomSubmit} className="admin-modal-form">
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Room Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={currentRoom.number}
                    onChange={e => setCurrentRoom(p => ({ ...p, number: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Room Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={currentRoom.name}
                    onChange={e => setCurrentRoom(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Room Type</label>
                  <select
                    className="form-input"
                    value={currentRoom.type}
                    onChange={e => setCurrentRoom(p => ({ ...p, type: e.target.value }))}
                  >
                    <option>Standard</option>
                    <option>Deluxe</option>
                    <option>Superior</option>
                    <option>Family</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Beds Setup</label>
                  <input
                    className="form-input"
                    value={currentRoom.beds}
                    onChange={e => setCurrentRoom(p => ({ ...p, beds: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Capacity (Guests)</label>
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    value={currentRoom.capacity}
                    onChange={e => setCurrentRoom(p => ({ ...p, capacity: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Size (m²)</label>
                  <input
                    type="number"
                    min={10}
                    className="form-input"
                    value={currentRoom.size}
                    onChange={e => setCurrentRoom(p => ({ ...p, size: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Price per Night ($)</label>
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    value={currentRoom.price}
                    onChange={e => setCurrentRoom(p => ({ ...p, price: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Room View Description</label>
                  <input
                    className="form-input"
                    value={currentRoom.view}
                    onChange={e => setCurrentRoom(p => ({ ...p, view: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Room Status</label>
                  <select
                    className="form-input"
                    value={currentRoom.status}
                    onChange={e => setCurrentRoom(p => ({ ...p, status: e.target.value }))}
                  >
                    <option>Available</option>
                    <option>Occupied</option>
                    <option>Reserved</option>
                    <option>Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Short Description *</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    required
                    value={currentRoom.description || ''}
                    onChange={e => setCurrentRoom(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Long Description (Overview detail)</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    value={currentRoom.longDescription || ''}
                    onChange={e => setCurrentRoom(p => ({ ...p, longDescription: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Check-In Policy</label>
                  <input
                    className="form-input"
                    value={currentRoom.checkIn || ''}
                    onChange={e => setCurrentRoom(p => ({ ...p, checkIn: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Check-Out Policy</label>
                  <input
                    className="form-input"
                    value={currentRoom.checkOut || ''}
                    onChange={e => setCurrentRoom(p => ({ ...p, checkOut: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Cancellation Policy</label>
                  <input
                    className="form-input"
                    value={currentRoom.cancellation || ''}
                    onChange={e => setCurrentRoom(p => ({ ...p, cancellation: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label className="form-label">Room Highlights (comma-separated)</label>
                <input
                  className="form-input"
                  value={currentRoom.highlights || ''}
                  onChange={e => setCurrentRoom(p => ({ ...p, highlights: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label className="form-label" style={{ fontWeight: 700, color: 'var(--gold)' }}>Amenities / Inclusions</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: '8px', padding: '12px', background: '#fafafa' }}>
                  {ALL_AMENITIES.map(amenity => {
                    const isChecked = (currentRoom.amenities || []).includes(amenity);
                    return (
                      <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleAmenityChange(amenity, 'edit')}
                        />
                        {amenity}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Room Image Gallery Management */}
              <div className="form-group" style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '15px', marginTop: '15px' }}>
                <label className="form-label" style={{ fontWeight: 700, color: 'var(--gold)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Room Images Manager</span>
                  <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--gray-500)' }}>CDN Hosted - 0 bytes DB space</span>
                </label>
                
                {/* Thumbnails */}
                <div className="uploaded-thumbs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {(currentRoom.images || []).map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                      <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveImage(idx, 'edit')}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', cursor: 'pointer' }}
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Upload Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label className="btn btn-outline btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                    {uploadingImage ? 'Uploading to CDN...' : '➕ Add Room Photo'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={e => handleRoomImageUpload(e, 'edit')} 
                    />
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Upload standard JPG/PNG files</span>
                </div>
              </div>

              <div className="admin-modal-actions" style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '15px', marginTop: '15px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

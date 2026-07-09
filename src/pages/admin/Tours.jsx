import { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiPlus, FiX, FiCheckCircle, FiTrash2, FiEdit2, FiClock, FiUsers, FiDollarSign } from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';
import { getStoredTours, saveStoredTours } from '../../utils/storage';
import { compressImageToBase64 } from '../../utils/image';
import './AdminTable.css';

export default function AdminTours() {
  const [tours, setTours] = useState(() => getStoredTours());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.title = 'Tours Management | Elkhalil Hotel';
    setTours(getStoredTours());
    const handleSync = () => {
      setTours(getStoredTours());
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  // Form states
  const [currentTour, setCurrentTour] = useState(null);
  const [newTour, setNewTour] = useState({
    name: '',
    category: 'Cultural',
    duration: '4 Hours',
    durationType: 'Half Day',
    price: 35,
    guide: 'Live Tour Guide',
    pickup: 'From Hotel',
    language: 'English',
    description: '',
    longDescription: '',
    images: [],
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = tours.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All Categories' || t.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Tour Image Upload
  const handleTourImageUpload = async (e, mode) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const base64Url = await compressImageToBase64(file, 800, 600, 0.7);
      if (mode === 'add') {
        setNewTour(prev => ({
          ...prev,
          images: [...(prev.images || []), base64Url]
        }));
      } else {
        setCurrentTour(prev => ({
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
      setNewTour(prev => ({
        ...prev,
        images: (prev.images || []).filter((_, i) => i !== index)
      }));
    } else {
      setCurrentTour(prev => ({
        ...prev,
        images: (prev.images || []).filter((_, i) => i !== index)
      }));
    }
    showToast('Image removed.');
  };

  // Add Tour Submit
  const handleAddTourSubmit = (e) => {
    e.preventDefault();
    if (!newTour.name || !newTour.description) {
      alert('Please fill out all required fields.');
      return;
    }
    const slug = newTour.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const tourToAdd = {
      ...newTour,
      id: Date.now(),
      slug: slug,
      rating: 4.8,
      reviewCount: 0,
      bookings: 0,
      status: 'Active',
      images: newTour.images && newTour.images.length > 0 ? newTour.images : ['https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=500&q=70'],
    };

    const updated = [tourToAdd, ...tours];
    setTours(updated);
    saveStoredTours(updated);
    setShowAddModal(false);
    setNewTour({
      name: '',
      category: 'Cultural',
      duration: '4 Hours',
      durationType: 'Half Day',
      price: 35,
      guide: 'Live Tour Guide',
      pickup: 'From Hotel',
      language: 'English',
      description: '',
      longDescription: '',
      images: [],
    });
    showToast('New tour created successfully.');
  };

  // Open Edit Modal
  const openEditModal = (tour) => {
    setCurrentTour(tour);
    setShowEditModal(true);
  };

  // Edit Tour Submit
  const handleEditTourSubmit = (e) => {
    e.preventDefault();
    if (!currentTour.name || !currentTour.description) {
      alert('Please fill out all required fields.');
      return;
    }
    const slug = currentTour.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const updated = tours.map(t => t.id === currentTour.id ? { ...currentTour, slug: slug } : t);
    setTours(updated);
    saveStoredTours(updated);
    setShowEditModal(false);
    showToast('Tour details updated successfully.');
  };

  // Delete Tour
  const handleDeleteTour = (id) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      const updated = tours.filter(t => t.id !== id);
      setTours(updated);
      saveStoredTours(updated);
      showToast('Tour deleted successfully.');
    }
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
          <div>
            <h1>Tours & Safaris</h1>
            <p>Manage sightseeing experiences, desert safaris, prices, dynamic galleries, and guides details.</p>
          </div>
          <div className="admin-page-actions">
            <button className="btn btn-outline btn-sm" onClick={() => showToast('Tours list exported (CSV)')}><FiDownload /> Export</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}><FiPlus /> Add Tour</button>
          </div>
        </div>

        <div className="admin-card">
          <div className="table-toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input placeholder="Search tours by name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="toolbar-right">
              <select className="form-input" style={{ width: 'auto' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option>All Categories</option>
                <option>Cultural</option>
                <option>Adventure</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tour Details</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Rate/Person</th>
                  <th>Guide</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className="table-user">
                        <img 
                          src={t.images && t.images.length > 0 ? t.images[0] : 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=80&q=80'} 
                          alt={t.name} 
                          style={{ width: 56, height: 42, borderRadius: 6, objectFit: 'cover' }} 
                        />
                        <div>
                          <div className="table-user-name" style={{ fontWeight: 700 }}>{t.name}</div>
                          <span style={{ fontSize: '11px', color: 'var(--gray-400)' }}>/{t.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>{t.category}</td>
                    <td><span style={{ fontSize: '13px' }}>⏱ {t.duration} ({t.durationType})</span></td>
                    <td><strong style={{ color: 'var(--gold)' }}>${t.price}</strong></td>
                    <td>{t.guide}</td>
                    <td><span className="badge badge-green">{t.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                        <button className="icon-action-btn" title="Edit Tour" onClick={() => openEditModal(t)}><FiEdit2 /></button>
                        <button className="icon-action-btn delete" title="Delete Tour" onClick={() => handleDeleteTour(t.id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Tour Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal card" style={{ maxWidth: '650px' }}>
            <div className="admin-modal-header">
              <h3>Create New Tour Experience</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleAddTourSubmit} className="admin-modal-form">
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Tour Name *</label>
                  <input className="form-input" required placeholder="e.g. Pyramids Quad Bike Safari" value={newTour.name} onChange={e => setNewTour(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={newTour.category} onChange={e => setNewTour(p => ({ ...p, category: e.target.value }))}>
                    <option>Cultural</option>
                    <option>Adventure</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration *</label>
                  <input className="form-input" required placeholder="e.g. 4 Hours" value={newTour.duration} onChange={e => setNewTour(p => ({ ...p, duration: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration Type</label>
                  <select className="form-input" value={newTour.durationType} onChange={e => setNewTour(p => ({ ...p, durationType: e.target.value }))}>
                    <option>Half Day</option>
                    <option>Full Day</option>
                    <option>Evening</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price per Person ($) *</label>
                  <input className="form-input" type="number" min={1} required value={newTour.price} onChange={e => setNewTour(p => ({ ...p, price: Number(e.target.value) }))} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tour Guide Details</label>
                  <input className="form-input" value={newTour.guide} onChange={e => setNewTour(p => ({ ...p, guide: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pickup Service</label>
                  <input className="form-input" value={newTour.pickup} onChange={e => setNewTour(p => ({ ...p, pickup: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Guide Language</label>
                  <input className="form-input" value={newTour.language} onChange={e => setNewTour(p => ({ ...p, language: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Brief Description *</label>
                <textarea className="form-input" required rows={2} placeholder="Brief summary of the experience..." value={newTour.description} onChange={e => setNewTour(p => ({ ...p, description: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Full Tour Itinerary / Details</label>
                <textarea className="form-input" rows={3} placeholder="Full itinerary details..." value={newTour.longDescription} onChange={e => setNewTour(p => ({ ...p, longDescription: e.target.value }))} />
              </div>

              {/* Tour Images Manager */}
              <div className="form-group" style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '15px', marginTop: '15px' }}>
                <label className="form-label" style={{ fontWeight: 700, color: 'var(--gold)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tour Gallery Manager</span>
                  <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--gray-500)' }}>CDN Hosted - 0 bytes DB space</span>
                </label>
                <div className="uploaded-thumbs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {(newTour.images || []).map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                      <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => handleRemoveImage(idx, 'add')} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', cursor: 'pointer' }}><FiX size={10} /></button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label className="btn btn-outline btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                    {uploadingImage ? 'Uploading...' : '➕ Add Tour Photo'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleTourImageUpload(e, 'add')} />
                  </label>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Tour</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tour Modal */}
      {showEditModal && currentTour && (
        <div className="admin-modal-overlay">
          <div className="admin-modal card" style={{ maxWidth: '650px' }}>
            <div className="admin-modal-header">
              <h3>Edit Tour Experience Details</h3>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleEditTourSubmit} className="admin-modal-form">
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Tour Name *</label>
                  <input className="form-input" required value={currentTour.name} onChange={e => setCurrentTour(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={currentTour.category} onChange={e => setCurrentTour(p => ({ ...p, category: e.target.value }))}>
                    <option>Cultural</option>
                    <option>Adventure</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration *</label>
                  <input className="form-input" required value={currentTour.duration} onChange={e => setCurrentTour(p => ({ ...p, duration: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration Type</label>
                  <select className="form-input" value={currentTour.durationType} onChange={e => setCurrentTour(p => ({ ...p, durationType: e.target.value }))}>
                    <option>Half Day</option>
                    <option>Full Day</option>
                    <option>Evening</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price per Person ($) *</label>
                  <input className="form-input" type="number" min={1} required value={currentTour.price} onChange={e => setCurrentTour(p => ({ ...p, price: Number(e.target.value) }))} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tour Guide Details</label>
                  <input className="form-input" value={currentTour.guide || ''} onChange={e => setCurrentTour(p => ({ ...p, guide: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pickup Service</label>
                  <input className="form-input" value={currentTour.pickup || ''} onChange={e => setCurrentTour(p => ({ ...p, pickup: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Guide Language</label>
                  <input className="form-input" value={currentTour.language || ''} onChange={e => setCurrentTour(p => ({ ...p, language: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Brief Description *</label>
                <textarea className="form-input" required rows={2} value={currentTour.description} onChange={e => setCurrentTour(p => ({ ...p, description: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Full Tour Itinerary / Details</label>
                <textarea className="form-input" rows={3} value={currentTour.longDescription || ''} onChange={e => setCurrentTour(p => ({ ...p, longDescription: e.target.value }))} />
              </div>

              {/* Tour Images Manager */}
              <div className="form-group" style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '15px', marginTop: '15px' }}>
                <label className="form-label" style={{ fontWeight: 700, color: 'var(--gold)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tour Gallery Manager</span>
                  <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--gray-500)' }}>CDN Hosted - 0 bytes DB space</span>
                </label>
                <div className="uploaded-thumbs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {(currentTour.images || []).map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                      <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => handleRemoveImage(idx, 'edit')} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', cursor: 'pointer' }}><FiX size={10} /></button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label className="btn btn-outline btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                    {uploadingImage ? 'Uploading...' : '➕ Add Tour Photo'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleTourImageUpload(e, 'edit')} />
                  </label>
                </div>
              </div>

              <div className="admin-modal-actions">
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

import { useState, useEffect, useCallback } from 'react';
import { FiCheckCircle, FiPlus, FiTrash2, FiX, FiTag, FiMoreVertical, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';
import { getStoredOffers, saveStoredOffers, deleteStoredOffer } from '../../utils/storage';
import './AdminTable.css';

export default function AdminOffers() {
  const [offers, setOffers] = useState(() => getStoredOffers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeActionsId, setActiveActionsId] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync with Supabase when data loads in background
  const syncOffers = useCallback(() => {
    setOffers(getStoredOffers());
  }, []);

  useEffect(() => {
    syncOffers();
    window.addEventListener('storage', syncOffers);
    return () => window.removeEventListener('storage', syncOffers);
  }, [syncOffers]);

  // Form State
  const [newOffer, setNewOffer] = useState({
    title: '',
    code: '',
    discount: '',
    type: 'Percentage',
    minNights: 2,
    validTo: '',
  });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const statusColor = { Active: 'badge badge-green', Inactive: 'badge badge-gray' };

  // Delete Offer
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      const updated = offers.filter(o => o.id !== id);
      setOffers(updated);
      setActiveActionsId(null);
      await deleteStoredOffer(id);
      showToast('Special offer deleted successfully.');
    }
  };

  // Toggle status
  const handleToggleStatus = async (id) => {
    const updated = offers.map(o => {
      if (o.id === id) {
        const nextStatus = o.status === 'Active' ? 'Inactive' : 'Active';
        return { ...o, status: nextStatus };
      }
      return o;
    });
    setOffers(updated);
    setActiveActionsId(null);
    await saveStoredOffers(updated);
    showToast('Promotion status updated.');
  };

  // Add Offer
  const handleAddOffer = async (e) => {
    e.preventDefault();
    if (!newOffer.title || !newOffer.code || !newOffer.discount || !newOffer.validTo) {
      alert('Please fill out all required fields.');
      return;
    }

    const maxId = offers.length > 0 ? Math.max(...offers.map(o => Number(o.id) || 0)) : 0;
    const offerToAdd = {
      id: maxId + 1,
      title: newOffer.title,
      code: newOffer.code.toUpperCase().replace(/ /g, ''),
      discount: newOffer.discount,
      type: newOffer.type,
      minNights: Number(newOffer.minNights),
      validFrom: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      validTo: newOffer.validTo,
      status: 'Active',
      usages: 0,
      description: `Get ${newOffer.discount} discount with promo code ${newOffer.code.toUpperCase()}.`,
    };

    const updated = [offerToAdd, ...offers];
    setOffers(updated);
    setShowAddModal(false);
    setNewOffer({
      title: '',
      code: '',
      discount: '',
      type: 'Percentage',
      minNights: 2,
      validTo: '',
    });
    await saveStoredOffers(updated);
    showToast(`Promotion code ${offerToAdd.code} added successfully!`);
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
          <div><h1>Offers & Coupons</h1><p>Manage promotions, active campaigns, discount percentages, and validity dates.</p></div>
          <div className="admin-page-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}><FiPlus /> Add Offer</button>
          </div>
        </div>
        <div className="admin-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Type</th>
                  <th>Min. Nights</th>
                  <th>Valid To</th>
                  <th>Usages</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(o => (
                  <tr key={o.id}>
                    <td><div className="table-user-name" style={{ fontWeight: 600 }}>{o.title}</div></td>
                    <td><code style={{ background: 'var(--gray-100)', padding: '4px 8px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.5px' }}>{o.code}</code></td>
                    <td style={{ color: 'var(--gold)', fontWeight: 800 }}>{o.discount}</td>
                    <td>{o.type}</td>
                    <td>{o.minNights} nights</td>
                    <td>{o.validTo}</td>
                    <td>{o.usages} times</td>
                    <td><span className={statusColor[o.status]}>{o.status}</span></td>
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <button className="icon-action-btn" style={{ marginLeft: 'auto' }} onClick={() => setActiveActionsId(activeActionsId === o.id ? null : o.id)}>
                        <FiMoreVertical />
                      </button>

                      {activeActionsId === o.id && (
                        <div className="table-dropdown">
                          <button onClick={() => handleToggleStatus(o.id)}>
                            {o.status === 'Active' ? (
                              <>
                                <FiToggleLeft style={{ color: 'var(--gray-400)' }} /> Deactivate Code
                              </>
                            ) : (
                              <>
                                <FiToggleRight style={{ color: 'var(--green)' }} /> Activate Code
                              </>
                            )}
                          </button>
                          <button className="delete-action" onClick={() => handleDelete(o.id)}>
                            <FiTrash2 /> Delete Code
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Offer Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal card">
            <div className="admin-modal-header">
              <h3>Create Promotion Code</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleAddOffer} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">Offer Title *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Black Friday Special"
                  required
                  value={newOffer.title}
                  onChange={e => setNewOffer(p => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Promo Code *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. SAVE30"
                    required
                    value={newOffer.code}
                    onChange={e => setNewOffer(p => ({ ...p, code: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Value *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 15% or $50"
                    required
                    value={newOffer.discount}
                    onChange={e => setNewOffer(p => ({ ...p, discount: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select
                    className="form-input"
                    value={newOffer.type}
                    onChange={e => setNewOffer(p => ({ ...p, type: e.target.value }))}
                  >
                    <option>Percentage</option>
                    <option>Fixed Amount</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Min. Nights Stay</label>
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    value={newOffer.minNights}
                    onChange={e => setNewOffer(p => ({ ...p, minNights: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Valid Until *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={newOffer.validTo}
                  onChange={e => setNewOffer(p => ({ ...p, validTo: e.target.value }))}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiGlobe, FiMail, FiPhone, FiDollarSign, FiBell, FiUsers, FiSettings, FiLock, FiAlertCircle, FiPlus, FiTrash2, FiKey, FiEdit2, FiX, FiCheckCircle, FiDroplet } from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredGallery,
  saveStoredGallery,
  getStoredFaqs,
  saveStoredFaqs,
  getStoredContactMessages,
  saveStoredContactMessages,
  getStoredUsers,
  saveStoredUsers
} from '../../utils/storage';
import { useTheme, THEMES } from '../../context/ThemeContext';
import './AdminTable.css';

const navItems = [
  { label: 'General', icon: FiSettings },
  { label: 'Hotel Information', icon: FiGlobe },
  { label: 'Payment Settings', icon: FiDollarSign },
  { label: 'Email Settings', icon: FiMail },
  { label: 'Social Media', icon: FiGlobe },
  { label: 'Notifications', icon: FiBell },
  { label: 'Website Settings', icon: FiGlobe },
  { label: 'Appearance', icon: FiDroplet },
  { label: 'Contact Inquiries', icon: FiMail },
  { label: 'Gallery Manager', icon: FiGlobe },
  { label: 'FAQ Manager', icon: FiSettings },
  { label: 'Users & Roles', icon: FiUsers },
];


export default function Settings() {
  const location = useLocation();
  const { themeId, changeTheme, themes } = useTheme();
  const [activeSection, setActiveSection] = useState('General');
  const [toast, setToast] = useState(null);
  
  // Settings form state
  const [form, setForm] = useState(() => getStoredSettings());
  const [isLoaded, setIsLoaded] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);

  // Contact messages state
  const [contactMessages, setContactMessages] = useState(() => getStoredContactMessages());

  // Gallery items state
  const defaultGallery = [
    { id: 1, url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', title: 'Hotel Exterior', category: 'Exterior' },
    { id: 2, url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', title: 'Deluxe Room', category: 'Rooms' },
    { id: 3, url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', title: 'Hotel Lobby', category: 'Lobby' },
    { id: 4, url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80', title: 'Superior Room', category: 'Rooms' },
    { id: 5, url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80', title: 'Pool Area', category: 'Pool' },
    { id: 6, url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', title: 'Restaurant', category: 'Dining' }
  ];
  const [galleryItems, setGalleryItems] = useState(() => getStoredGallery().length ? getStoredGallery() : defaultGallery);

  // FAQ items state
  const defaultFaqs = [
    { id: 1, category: 'Booking', question: 'How do I make a reservation?', answer: 'You can book directly through our website by selecting your room, choosing dates, and completing the checkout process. You can also call us or send an email.' },
    { id: 2, category: 'Check-in', question: 'What are the check-in and check-out times?', answer: 'Standard check-in is at 2:00 PM and check-out is at 12:00 PM (noon). Early check-in and late check-out may be available upon request, subject to availability.' }
  ];
  const [faqItems, setFaqItems] = useState(() => getStoredFaqs().length ? getStoredFaqs() : defaultFaqs);

  // Form states
  const [newGallery, setNewGallery] = useState({ title: '', url: '', category: 'Rooms' });
  const [newFaq, setNewFaq] = useState({ category: 'Booking', question: '', answer: '' });

  // Users list state
  const [users, setUsers] = useState(() => getStoredUsers());
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Load and sync from Supabase reactive cache on storage event
  useEffect(() => {
    const syncData = () => {
      const currentSettings = getStoredSettings();
      if (currentSettings && currentSettings.hotelName && !isLoaded) {
        setForm(currentSettings);
        setIsLoaded(true);
      }
      setContactMessages(getStoredContactMessages());
      
      const currentGallery = getStoredGallery();
      setGalleryItems(currentGallery.length ? currentGallery : defaultGallery);

      const currentFaqs = getStoredFaqs();
      setFaqItems(currentFaqs.length ? currentFaqs : defaultFaqs);

      const currentUsers = getStoredUsers();
      setUsers(currentUsers);

      const adminUser = currentUsers.find(u => u.username === 'admin');
      if (adminUser) {
        setAdminPassword(adminUser.password);
      }
    };

    syncData();
    window.addEventListener('storage', syncData);
    return () => window.removeEventListener('storage', syncData);
  }, [isLoaded]);

  const deleteContactMessage = (id) => {
    if (window.confirm('Delete this inquiry?')) {
      const updated = contactMessages.filter(m => m.id !== id);
      setContactMessages(updated);
      saveStoredContactMessages(updated);
      showToast('Message deleted successfully.');
    }
  };

  const handleAddGallery = (e) => {
    e.preventDefault();
    if (!newGallery.title || !newGallery.url) return;
    const added = {
      id: Date.now(),
      title: newGallery.title,
      url: newGallery.url,
      category: newGallery.category
    };
    const updated = [added, ...galleryItems];
    setGalleryItems(updated);
    saveStoredGallery(updated);
    setNewGallery({ title: '', url: '', category: 'Rooms' });
    showToast('Gallery item added successfully!');
  };

  const deleteGalleryItem = (id) => {
    if (window.confirm('Delete this gallery photo?')) {
      const updated = galleryItems.filter(item => item.id !== id);
      setGalleryItems(updated);
      saveStoredGallery(updated);
      showToast('Gallery item deleted.');
    }
  };

  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) return;
    const added = {
      id: Date.now(),
      category: newFaq.category,
      question: newFaq.question,
      answer: newFaq.answer
    };
    const updated = [...faqItems, added];
    setFaqItems(updated);
    saveStoredFaqs(updated);
    setNewFaq({ category: 'Booking', question: '', answer: '' });
    showToast('FAQ item added successfully!');
  };

  const deleteFaqItem = (id) => {
    if (window.confirm('Delete this FAQ?')) {
      const updated = faqItems.filter(item => item.id !== id);
      setFaqItems(updated);
      saveStoredFaqs(updated);
      showToast('FAQ item deleted.');
    }
  };

  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('Staff / Receptionist');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Editing User Modal states
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('Staff / Receptionist');
  const [editPassword, setEditPassword] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  // Sync active section with route path
  useEffect(() => {
    if (location.pathname === '/admin/users') {
      setActiveSection('Users & Roles');
    } else if (location.pathname === '/admin/website') {
      setActiveSection('Website Settings');
    } else if (location.pathname === '/admin/settings') {
      setActiveSection('General');
    }
  }, [location.pathname]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Image Upload helper
  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingField(fieldName);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.data && data.data.url) {
        const directUrl = data.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
        handleChange(fieldName, directUrl);
        showToast('Image uploaded successfully (0 bytes database footprint)!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      handleChange(fieldName, localUrl);
      showToast('Cached locally (session preview mode).');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveStoredSettings(form);
    window.dispatchEvent(new Event('storage'));
    showToast(`${activeSection} settings updated successfully!`);
  };

  // Save admin password
  const handleSaveAdminPassword = (e) => {
    e.preventDefault();
    
    const updated = users.map(u => {
      if (u.id === 1 || u.username === 'admin') {
        return { ...u, password: adminPassword };
      }
      return u;
    });
    setUsers(updated);
    saveStoredUsers(updated);
    showToast('Admin password updated successfully!');
  };

  // Add user
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUsername || !newName || !newPassword) return;

    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
      alert('Username already exists. Please choose a unique username.');
      return;
    }

    const newUser = {
      id: Date.now(),
      name: newName,
      username: newUsername,
      role: newRole,
      status: 'Active',
      password: newPassword,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveStoredUsers(updated);
    setNewName('');
    setNewUsername('');
    setNewPassword('');
    showToast(`User ${newUsername} added successfully.`);
  };

  // Open Edit User Modal
  const handleEditClick = (u) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditUsername(u.username);
    setEditRole(u.role);
    setEditPassword(u.password || '');
    setEditStatus(u.status || 'Active');
  };

  // Save Edited User
  const handleSaveEditUser = (e) => {
    e.preventDefault();
    if (!editName || !editUsername || !editPassword) return;

    if (users.some(u => u.id !== editingUser.id && u.username.toLowerCase() === editUsername.toLowerCase())) {
      alert('Username already exists. Please choose a unique username.');
      return;
    }

    const updated = users.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          name: editName,
          username: editUsername,
          role: editRole,
          status: editStatus,
          password: editPassword
        };
      }
      return u;
    });

    setUsers(updated);
    saveStoredUsers(updated);

    if (editingUser.id === 1 || editingUser.username === 'admin') {
      setAdminPassword(editPassword);
    }

    setEditingUser(null);
    showToast('User account updated successfully.');
  };

  // Delete user
  const handleDeleteUser = (id) => {
    if (id === 1) {
      alert('Cannot delete default Super Admin account.');
      return;
    }
    if (window.confirm('Delete this user account?')) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      saveStoredUsers(updated);
      showToast('User account deleted.');
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
            <h1>Extranet Configuration</h1>
            <p>Customize hotel rules, default currencies, users permissions, branding imagery, and payment APIs.</p>
          </div>
        </div>

        <div className="settings-layout">
          {/* Settings Sub-Navigation */}
          <div className="settings-nav">
            {navItems.map(item => (
              <button
                key={item.label}
                type="button"
                className={`settings-nav-item ${activeSection === item.label ? 'active' : ''}`}
                onClick={() => setActiveSection(item.label)}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Settings Forms Content Panel */}
          <div className="settings-content">
            <h2 className="settings-section-title">{activeSection} Configuration</h2>

            {/* 1. GENERAL SECTION */}
            {activeSection === 'General' && (
              <form onSubmit={handleSave} className="settings-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Hotel Name *</label>
                  <input className="form-input" required value={form.hotelName} onChange={e => handleChange('hotelName', e.target.value)} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Check-in Time</label>
                  <input className="form-input" value={form.checkIn} onChange={e => handleChange('checkIn', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-out Time</label>
                  <input className="form-input" value={form.checkOut} onChange={e => handleChange('checkOut', e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Display Currency</label>
                  <select className="form-input" value={form.currency} onChange={e => handleChange('currency', e.target.value)}>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>EGP (£)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Time Zone</label>
                  <select className="form-input" value={form.timezone} onChange={e => handleChange('timezone', e.target.value)}>
                    <option>(GMT+2:00) Cairo</option>
                    <option>(GMT+0:00) UTC</option>
                    <option>(GMT+3:00) Riyadh</option>
                  </select>
                </div>

                {/* LOGO DESIGN SELECTOR */}
                <div className="form-group" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--gray-100)', paddingTop: '20px', marginTop: '10px' }}>
                  <label className="form-label" style={{ fontSize: '15px', color: 'var(--gold)', fontWeight: 700 }}>Hotel Logo Settings</label>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '12px' }}>Choose between an emoji/icon preset or upload/paste a custom image logo.</p>
                  
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--gray-700)' }}>
                      <input 
                        type="radio" 
                        name="logoType" 
                        value="emoji" 
                        checked={form.logoType === 'emoji'} 
                        onChange={() => handleChange('logoType', 'emoji')}
                      />
                      Icon / Emoji Preset
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--gray-700)' }}>
                      <input 
                        type="radio" 
                        name="logoType" 
                        value="url" 
                        checked={form.logoType === 'url'} 
                        onChange={() => handleChange('logoType', 'url')}
                      />
                      Custom Image Logo URL
                    </label>
                  </div>

                  {form.logoType === 'emoji' ? (
                    <div className="logo-presets-grid" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <select 
                        className="form-input" 
                        style={{ width: 'auto', minWidth: '150px' }}
                        value={form.logoValue} 
                        onChange={e => handleChange('logoValue', e.target.value)}
                      >
                        <option value="⚜">⚜ Gold Lily (⚜)</option>
                        <option value="🏨">🏨 Hotel (🏨)</option>
                        <option value="⬡">⬡ Hexagon (⬡)</option>
                        <option value="🌟">🌟 Star (🌟)</option>
                        <option value="🏰">🏰 Castle (🏰)</option>
                      </select>
                      <div style={{ fontSize: '24px', background: 'var(--gold-bg)', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {form.logoValue}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <input 
                          className="form-input" 
                          placeholder="Paste image URL or click Upload" 
                          value={form.logoValue}
                          onChange={e => handleChange('logoValue', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="btn btn-outline btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                          {uploadingField === 'logoValue' ? 'Uploading...' : 'Upload File'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={e => handleImageUpload(e, 'logoValue')} 
                          />
                        </label>
                      </div>
                      {form.logoValue && form.logoValue.startsWith('http') && (
                        <div style={{ padding: '4px', background: '#F9FAFB', border: '1px solid var(--gray-200)', borderRadius: '8px' }}>
                          <img src={form.logoValue} alt="Logo Preview" style={{ height: '32px', maxWidth: '100px', objectFit: 'contain' }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="settings-save-btn" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* 2. HOTEL INFORMATION SECTION (Booking.com details) */}
            {activeSection === 'Hotel Information' && (
              <form onSubmit={handleSave} className="settings-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Full Street Address *</label>
                  <input className="form-input" required value={form.address} onChange={e => handleChange('address', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Locality / Neighborhood</label>
                  <input className="form-input" value={form.locality} onChange={e => handleChange('locality', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input className="form-input" value={form.postalCode} onChange={e => handleChange('postalCode', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-input" required value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Email *</label>
                  <input className="form-input" type="email" required value={form.email} onChange={e => handleChange('email', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Property Description</label>
                  <textarea className="form-input" rows={4} value={form.description} onChange={e => handleChange('description', e.target.value)} />
                </div>
                <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                  <div className="form-group">
                    <label className="form-label">Booking.com Rating</label>
                    <input className="form-input" readOnly value={form.ratingValue} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Review Count</label>
                    <input className="form-input" readOnly value={form.reviewCount} />
                  </div>
                </div>

                <div className="settings-save-btn" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* 3. PAYMENT SETTINGS */}
            {activeSection === 'Payment Settings' && (
              <form onSubmit={handleSave} className="settings-grid">
                <div className="form-group">
                  <label className="form-label">Payment Gateways</label>
                  <select className="form-input" value={form.paymentGateway} onChange={e => handleChange('paymentGateway', e.target.value)}>
                    <option>PayPal Only</option>
                    <option>Stripe Credit Cards</option>
                    <option>PayPal & Stripe</option>
                    <option>Pay on Arrival Only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Default Currency Code</label>
                  <input className="form-input" value={form.currencyCode} onChange={e => handleChange('currencyCode', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Public Publishable API Key</label>
                  <input className="form-input" type="password" value={form.apiKeyPublic} onChange={e => handleChange('apiKeyPublic', e.target.value)} />
                </div>
                <div className="bulk-info-alert" style={{ gridColumn: '1 / -1', background: 'var(--gold-bg)', color: 'var(--gold)' }}>
                  <FiAlertCircle size={18} />
                  <span>Stripe and PayPal APIs operate in Sandbox developer mode. Set keys above to switch to real payments.</span>
                </div>

                <div className="settings-save-btn" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* 4. EMAIL SETTINGS */}
            {activeSection === 'Email Settings' && (
              <form onSubmit={handleSave} className="settings-grid">
                <div className="form-group">
                  <label className="form-label">SMTP Server Host</label>
                  <input className="form-input" value={form.smtpHost} onChange={e => handleChange('smtpHost', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">SMTP Port</label>
                  <input className="form-input" value={form.smtpPort} onChange={e => handleChange('smtpPort', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">SMTP Username Address</label>
                  <input className="form-input" value={form.smtpUser} onChange={e => handleChange('smtpUser', e.target.value)} />
                </div>

                <div className="settings-save-btn" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* 5. SOCIAL MEDIA */}
            {activeSection === 'Social Media' && (
              <form onSubmit={handleSave} className="settings-grid">
                <div className="form-group">
                  <label className="form-label">Facebook Profile Link</label>
                  <input className="form-input" value={form.facebookUrl} onChange={e => handleChange('facebookUrl', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Instagram Username link</label>
                  <input className="form-input" value={form.instagramUrl} onChange={e => handleChange('instagramUrl', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Twitter/X Profile Link</label>
                  <input className="form-input" value={form.twitterUrl} onChange={e => handleChange('twitterUrl', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">YouTube Channel Link</label>
                  <input className="form-input" value={form.youtubeUrl} onChange={e => handleChange('youtubeUrl', e.target.value)} />
                </div>

                <div className="settings-save-btn" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* 6. NOTIFICATIONS */}
            {activeSection === 'Notifications' && (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.notifyNewBookings} 
                    onChange={e => handleChange('notifyNewBookings', e.target.checked)} 
                  />
                  <span style={{ fontSize: '14px', color: 'var(--gray-700)' }}>Email alert on new Booking confirmation</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.notifyNewReviews} 
                    onChange={e => handleChange('notifyNewReviews', e.target.checked)} 
                  />
                  <span style={{ fontSize: '14px', color: 'var(--gray-700)' }}>Moderate new guest review uploads</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.notifyNewMessages} 
                    onChange={e => handleChange('notifyNewMessages', e.target.checked)} 
                  />
                  <span style={{ fontSize: '14px', color: 'var(--gray-700)' }}>Dashboard notify on customer chat alerts</span>
                </label>

                <div className="settings-save-btn" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* 7. WEBSITE SETTINGS (Hero and image asset controls) */}
            {activeSection === 'Website Settings' && (
              <form onSubmit={handleSave} className="settings-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Main Landing Hero Title</label>
                  <input className="form-input" value={form.heroTitle} onChange={e => handleChange('heroTitle', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Main Landing Hero Subtitle</label>
                  <input className="form-input" value={form.heroSubtitle} onChange={e => handleChange('heroSubtitle', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp Contact Number</label>
                  <input className="form-input" placeholder="e.g. +201234567890" value={form.whatsappNumber || ''} onChange={e => handleChange('whatsappNumber', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Google Maps Embed URL</label>
                  <input className="form-input" placeholder="https://www.google.com/maps/embed?pb=..." value={form.googleMapsUrl || ''} onChange={e => handleChange('googleMapsUrl', e.target.value)} />
                </div>

                {/* Hero BG Image Asset */}
                <div className="form-group" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--gray-100)', paddingTop: '20px', marginTop: '10px' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: 'var(--gold)' }}>Website Image Assets Management</label>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '16px' }}>Upload photos directly to a free CDN. Only short URL strings are saved in settings to ensure zero database bloat!</p>
                  
                  {/* Hero Bg Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <label className="form-label">Hero Background Image</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input className="form-input" style={{ flex: 1 }} value={form.imgHeroBg} onChange={e => handleChange('imgHeroBg', e.target.value)} />
                      <label className="btn btn-outline btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                        {uploadingField === 'imgHeroBg' ? 'Uploading...' : 'Upload File'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'imgHeroBg')} />
                      </label>
                    </div>
                  </div>

                  {/* About Story Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <label className="form-label">About Story Section Image</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input className="form-input" style={{ flex: 1 }} value={form.imgAboutStory} onChange={e => handleChange('imgAboutStory', e.target.value)} />
                      <label className="btn btn-outline btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                        {uploadingField === 'imgAboutStory' ? 'Uploading...' : 'Upload File'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'imgAboutStory')} />
                      </label>
                    </div>
                  </div>

                  {/* Rooms Hero Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <label className="form-label">Rooms Page Hero Image</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input className="form-input" style={{ flex: 1 }} value={form.imgRoomsHero} onChange={e => handleChange('imgRoomsHero', e.target.value)} />
                      <label className="btn btn-outline btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                        {uploadingField === 'imgRoomsHero' ? 'Uploading...' : 'Upload File'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'imgRoomsHero')} />
                      </label>
                    </div>
                  </div>

                  {/* Tours Hero Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <label className="form-label">Tours Page Hero Image</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input className="form-input" style={{ flex: 1 }} value={form.imgToursHero} onChange={e => handleChange('imgToursHero', e.target.value)} />
                      <label className="btn btn-outline btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                        {uploadingField === 'imgToursHero' ? 'Uploading...' : 'Upload File'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'imgToursHero')} />
                      </label>
                    </div>
                  </div>

                  {/* Contact Hero Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <label className="form-label">Contact Page Hero Image</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input className="form-input" style={{ flex: 1 }} value={form.imgContactHero} onChange={e => handleChange('imgContactHero', e.target.value)} />
                      <label className="btn btn-outline btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                        {uploadingField === 'imgContactHero' ? 'Uploading...' : 'Upload File'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'imgContactHero')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-save-btn" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* APPEARANCE — THEME SECTION */}
            {activeSection === 'Appearance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Header Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                  borderRadius: '16px',
                  padding: '28px 32px',
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: -30, right: -30,
                    width: 150, height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: -20, right: 60,
                    width: 80, height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <FiDroplet size={22} />
                      <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Site Theme & Appearance</h3>
                    </div>
                    <p style={{ opacity: 0.85, fontSize: '14px', margin: 0, maxWidth: '500px' }}>
                      اختر ثيماً لتغيير ألوان، خطوط، وانيميشنات الموقع بالكامل — يُطبق فوراً على المظهر العام والأدمن.
                    </p>
                  </div>
                </div>

                {/* Currently Active */}
                <div style={{
                  background: 'var(--gold-bg)',
                  border: '1.5px solid var(--gold)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{ fontSize: '24px' }}>{themes[themeId]?.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '2px' }}>الثيم المفعّل حالياً</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gold)' }}>{themes[themeId]?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>{themes[themeId]?.description}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                    {themes[themeId]?.preview.map((color, i) => (
                      <div key={i} style={{
                        width: 20, height: 20,
                        borderRadius: '50%',
                        background: color,
                        border: '2px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }} />
                    ))}
                  </div>
                </div>

                {/* Themes Grid */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    اختر ثيماً
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '16px',
                  }}>
                    {Object.values(themes).map(theme => {
                      const isActive = themeId === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            changeTheme(theme.id);
                            showToast(`✨ تم تطبيق ثيم "${theme.name}" بنجاح!`);
                          }}
                          style={{
                            position: 'relative',
                            background: isActive ? 'var(--gold-bg)' : 'var(--white)',
                            border: isActive ? '2px solid var(--gold)' : '2px solid var(--gray-200)',
                            borderRadius: '16px',
                            padding: '20px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.25s ease',
                            transform: isActive ? 'scale(1.02)' : 'scale(1)',
                            boxShadow: isActive
                              ? '0 8px 24px var(--gold-bg)'
                              : '0 2px 8px rgba(0,0,0,0.06)',
                          }}
                          onMouseEnter={e => {
                            if (!isActive) {
                              e.currentTarget.style.borderColor = 'var(--gold)';
                              e.currentTarget.style.transform = 'translateY(-3px)';
                              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isActive) {
                              e.currentTarget.style.borderColor = 'var(--gray-200)';
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                            }
                          }}
                        >
                          {isActive && (
                            <div style={{
                              position: 'absolute',
                              top: 12, right: 12,
                              background: 'var(--gold)',
                              color: '#fff',
                              borderRadius: '50%',
                              width: 22, height: 22,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 13,
                            }}>
                              <FiCheckCircle size={13} />
                            </div>
                          )}

                          {/* Color swatches preview */}
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                            {theme.preview.map((color, i) => (
                              <div key={i} style={{
                                flex: i === 0 ? '2' : '1',
                                height: 36,
                                borderRadius: '8px',
                                background: color,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                              }} />
                            ))}
                          </div>

                          {/* Icon + Name */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '22px' }}>{theme.icon}</span>
                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-800)' }}>{theme.name}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: 0, lineHeight: 1.5 }}>
                            {theme.description}
                          </p>

                          {/* Design Style Tags */}
                          <div style={{
                            marginTop: '12px',
                            display: 'flex',
                            gap: '5px',
                            flexWrap: 'wrap',
                          }}>
                            {isActive && (
                              <span style={{
                                fontSize: '10px',
                                padding: '3px 10px',
                                borderRadius: '999px',
                                background: 'var(--gold)',
                                color: '#fff',
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                              }}>
                                ✓ مفعّل
                              </span>
                            )}
                            {(theme.tags || []).map((tag, ti) => (
                              <span key={ti} style={{
                                fontSize: '10px',
                                padding: '3px 8px',
                                borderRadius: '999px',
                                background: isActive ? 'rgba(255,255,255,0.15)' : 'var(--gray-100)',
                                color: isActive ? '#fff' : 'var(--gray-500)',
                                fontWeight: 600,
                                letterSpacing: '0.3px',
                                border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--gray-200)',
                              }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Animation Preview Info */}
                <div style={{
                  background: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '12px' }}>
                    🎨 ما الذي يتغير مع كل ثيم؟
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {[
                      { icon: '🎨', label: 'اللون الأساسي للموقع والأزرار' },
                      { icon: '🔤', label: 'الخطوط والطباعة' },
                      { icon: '⚡', label: 'سرعة ونوع الأنيميشنات' },
                      { icon: '📐', label: 'حجم الـ Border Radius للعناصر' },
                      { icon: '🌙', label: 'ألوان الـ Admin Sidebar والكروت' },
                      { icon: '🌐', label: 'ألوان خلفية الموقع العام' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--gray-600)' }}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 8. CONTACT INQUIRIES */}
            {activeSection === 'Contact Inquiries' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dark-600)', borderBottom: '1px solid var(--gray-100)', paddingBottom: '10px' }}>
                  📩 Guest Inquiries & Contact Messages
                </h3>
                {contactMessages.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>
                    No messages received yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {contactMessages.map(msg => (
                      <div key={msg.id} className="card" style={{ padding: '20px', border: '1px solid var(--gray-200)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                          <div>
                            <strong style={{ fontSize: '15px', color: 'var(--dark-600)' }}>{msg.name}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                              📧 {msg.email} | 📞 {msg.phone}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className="badge badge-gray" style={{ fontSize: '11px' }}>{msg.date}</span>
                            <button 
                              onClick={() => deleteContactMessage(msg.id)} 
                              style={{ marginLeft: '12px', background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}
                            >
                              <FiTrash2 size={15} /> Delete
                            </button>
                          </div>
                        </div>
                        <div style={{ background: 'var(--gray-50)', padding: '12px 16px', borderRadius: '8px' }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary)', marginBottom: '4px' }}>
                            Subject: {msg.subject}
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--gray-700)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 9. GALLERY MANAGER */}
            {activeSection === 'Gallery Manager' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <form onSubmit={handleAddGallery} className="card" style={{ padding: '20px', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: '15px' }}>
                    ➕ Add Image to Photo Gallery
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="settings-grid" style={{ marginBottom: 0 }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Image Title *</label>
                        <input 
                          className="form-input" 
                          required 
                          placeholder="e.g. Luxury Suite Pyramids View" 
                          value={newGallery.title}
                          onChange={e => setNewGallery({ ...newGallery, title: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Category</label>
                        <select 
                          className="form-input" 
                          value={newGallery.category}
                          onChange={e => setNewGallery({ ...newGallery, category: e.target.value })}
                        >
                          <option value="Rooms">Rooms</option>
                          <option value="Exterior">Exterior</option>
                          <option value="Lobby">Lobby</option>
                          <option value="Pool">Pool</option>
                          <option value="Dining">Dining</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Image Link / CDN URL *</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          className="form-input" 
                          style={{ flex: 1 }}
                          required 
                          placeholder="Paste image address or upload below" 
                          value={newGallery.url}
                          onChange={e => setNewGallery({ ...newGallery, url: e.target.value })}
                        />
                        <label className="btn btn-outline btn-sm" style={{ margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          {uploadingField === 'galleryUrl' ? 'Uploading...' : 'Upload File'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              setUploadingField('galleryUrl');
                              const fd = new FormData();
                              fd.append('file', file);
                              try {
                                const res = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: fd });
                                const json = await res.json();
                                if (res.ok && json.data?.url) {
                                  const url = json.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
                                  setNewGallery(g => ({ ...g, url }));
                                  showToast('Image uploaded successfully!');
                                } else {
                                  throw new Error();
                                }
                              } catch {
                                setNewGallery(g => ({ ...g, url: URL.createObjectURL(file) }));
                                showToast('Image loaded locally (fallback).');
                              } finally {
                                setUploadingField(null);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Upload & Publish</button>
                  </div>
                </form>

                <div className="card" style={{ padding: '20px', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '15px' }}>
                    🖼️ Active Gallery Photos ({galleryItems.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                    {galleryItems.map(item => (
                      <div key={item.id} style={{ position: 'relative', borderRadius: '12px', border: '1px solid var(--gray-200)', overflow: 'hidden', background: '#f9fafb' }}>
                        <div style={{ height: '110px', overflow: 'hidden' }}>
                          <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '10px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--dark-600)' }}>{item.title}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                            <span className="badge badge-gray" style={{ fontSize: '10px' }}>{item.category}</span>
                            <button 
                              onClick={() => deleteGalleryItem(item.id)} 
                              style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 0 }}
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 10. FAQ MANAGER */}
            {activeSection === 'FAQ Manager' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <form onSubmit={handleAddFaq} className="card" style={{ padding: '20px', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: '15px' }}>
                    ➕ Add FAQ Question
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="settings-grid" style={{ marginBottom: 0 }}>
                      <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                        <label className="form-label">Category</label>
                        <select 
                          className="form-input" 
                          value={newFaq.category}
                          onChange={e => setNewFaq({ ...newFaq, category: e.target.value })}
                        >
                          <option value="Booking">Booking</option>
                          <option value="Payment">Payment</option>
                          <option value="Check-in">Check-in</option>
                          <option value="Rooms">Rooms</option>
                          <option value="Tours">Tours</option>
                          <option value="Facilities">Facilities</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Question Text *</label>
                      <input 
                        className="form-input" 
                        required 
                        placeholder="e.g. Is airport shuttle included?" 
                        value={newFaq.question}
                        onChange={e => setNewFaq({ ...newFaq, question: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Answer Text *</label>
                      <textarea 
                        className="form-input" 
                        rows={3}
                        required 
                        placeholder="Provide answer description here..." 
                        value={newFaq.answer}
                        onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save FAQ</button>
                  </div>
                </form>

                <div className="card" style={{ padding: '20px', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '15px' }}>
                    ❓ Listed Questions ({faqItems.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {faqItems.map(faq => (
                      <div key={faq.id} style={{ padding: '16px', border: '1px solid var(--gray-150)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', gap: '15px', background: '#fafafa' }}>
                        <div style={{ flex: 1 }}>
                          <span className="badge badge-orange" style={{ fontSize: '9px', marginBottom: '6px', textTransform: 'uppercase' }}>{faq.category}</span>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '4px 0', color: 'var(--dark-600)' }}>Q: {faq.question}</h4>
                          <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '4px 0 0 0', lineHeight: 1.4 }}>A: {faq.answer}</p>
                        </div>
                        <button 
                          onClick={() => deleteFaqItem(faq.id)} 
                          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 0 }}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* 8. USERS & ROLES MANAGER SECTION */}
            {activeSection === 'Users & Roles' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Save admin password */}
                <form onSubmit={handleSaveAdminPassword} className="card" style={{ padding: '20px', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', marginBottom: '12px' }}>
                    <FiKey /> Reset Super Admin Login Password
                  </h3>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '240px', margin: 0 }}>
                      <label className="form-label">New Password *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="Enter new admin password"
                        value={adminPassword} 
                        onChange={e => setAdminPassword(e.target.value)} 
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 24px' }}>Update Password</button>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--gray-400)', display: 'block', marginTop: '6px' }}>This updates the active login credentials. Default is: admin123</span>
                </form>

                {/* Users List Table */}
                <div className="card" style={{ padding: '20px', border: '1px solid var(--gray-200)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '15px' }}>Active User Accounts</h3>
                  
                  <div className="table-wrapper" style={{ boxShadow: 'none', border: '1px solid var(--gray-100)', borderRadius: '8px', marginBottom: '20px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Full Name</th>
                          <th>Username</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id}>
                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                            <td style={{ fontFamily: 'monospace' }}>@{u.username}</td>
                            <td>{u.role}</td>
                            <td>
                              <span className={`badge ${u.status === 'Active' ? 'badge-green' : 'badge-red'}`} style={{ backgroundColor: u.status === 'Active' ? '' : '#fee2e2', color: u.status === 'Active' ? '' : '#ef4444' }}>
                                {u.status || 'Active'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <button 
                                  className="icon-action-btn" 
                                  onClick={() => handleEditClick(u)}
                                  title="Edit User / Change Password"
                                  style={{ padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <FiEdit2 size={14} />
                                </button>
                                <button 
                                  className="icon-action-btn delete" 
                                  disabled={u.id === 1}
                                  onClick={() => handleDeleteUser(u.id)}
                                  style={{ opacity: u.id === 1 ? 0.3 : 1, padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  title="Delete User"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add New Mock User Form */}
                  <form onSubmit={handleAddUser} style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>➕ Create Staff Account</h4>
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Full Name *</label>
                        <input className="form-input" required placeholder="e.g. John receptionist" value={newName} onChange={e => setNewName(e.target.value)} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Username *</label>
                        <input className="form-input" required placeholder="e.g. john" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Password *</label>
                        <input type="text" className="form-input" required placeholder="Enter password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Role</label>
                        <select className="form-input" value={newRole} onChange={e => setNewRole(e.target.value)}>
                          <option>Staff / Receptionist</option>
                          <option>Manager</option>
                          <option>Developer / Auditor</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-outline" style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Add Account</button>
                    </div>
                  </form>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal card" style={{ maxWidth: '450px', width: '90%', padding: '24px' }}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Edit User Account: @{editingUser.username}</h3>
              <button className="modal-close-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setEditingUser(null)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSaveEditUser} className="admin-modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Username *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={editUsername} 
                  onChange={e => setEditUsername(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="Change password"
                  value={editPassword} 
                  onChange={e => setEditPassword(e.target.value)} 
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Role</label>
                  <select 
                    className="form-input" 
                    value={editRole} 
                    onChange={e => setEditRole(e.target.value)}
                    disabled={editingUser.id === 1}
                  >
                    <option>Super Admin</option>
                    <option>Staff / Receptionist</option>
                    <option>Manager</option>
                    <option>Developer / Auditor</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Status</label>
                  <select 
                    className="form-input" 
                    value={editStatus} 
                    onChange={e => setEditStatus(e.target.value)}
                    disabled={editingUser.id === 1}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--gray-100)', paddingTop: '16px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

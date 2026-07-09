import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { supabase } from '../../utils/supabaseClient';
import { 
  FiUser, FiCalendar, FiMessageSquare, FiStar, FiMail, 
  FiLogOut, FiPhone, FiGlobe, FiLock, FiCheckCircle, 
  FiPrinter, FiSend, FiX, FiCheck, FiInfo, FiEdit3, FiTrash2, FiAlertCircle, FiEye, FiEyeOff
} from 'react-icons/fi';
import './GuestDashboard.css';
import { 
  getStoredBookings, saveStoredBookings,
  getStoredReviews, saveStoredReviews,
  getStoredChats, saveStoredChats, isChatsLoaded,
  getStoredGuests, saveStoredGuests,
  getStoredSettings
} from '../../utils/storage';

export default function GuestDashboard() {
  const navigate = useNavigate();
  const [activeGuest, setActiveGuest] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');
  const [settings, setSettings] = useState(() => getStoredSettings());
  
  // Bookings, Reviews, Chats from local storage
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [chats, setChats] = useState([]);
  
  // Forms & Modals
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', country: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const chatEndRef = useRef(null);
  const [linkBookingCode, setLinkBookingCode] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null); // booking object for invoice modal
  const [chatInput, setChatInput] = useState('');
  const [editReviewObj, setEditReviewObj] = useState(null); // review object for edit review modal
  const [writeReviewBooking, setWriteReviewBooking] = useState(null); // booking object for write review modal
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Authenticate Guest & Load Data
  useEffect(() => {
    const guestData = localStorage.getItem('elkhalil_active_guest');
    let guest = null;
    try {
      guest = (guestData && guestData !== 'undefined') ? JSON.parse(guestData) : null;
    } catch (e) {
      guest = null;
    }
    if (!guest) {
      navigate('/guest/portal');
      return;
    }
    setActiveGuest(guest);
    setProfileForm({
      name: guest.name,
      email: guest.email,
      phone: guest.phone || '',
      country: guest.country || ''
    });
    setOldPassword('');
    setNewPassword('');

    // Load Bookings from reactive cache
    const bookingsList = getStoredBookings() || [];
    const getMyBookings = (list) => list.filter(b => {
      if (!b) return false;
      const bEmail = b.email || '';
      const gEmail = guest?.email || '';
      const bGuest = b.guest || '';
      const gName = guest?.name || '';
      
      const emailMatch = bEmail && gEmail && bEmail.toLowerCase() === gEmail.toLowerCase();
      const nameMatch = bGuest && gName && bGuest.toLowerCase() === gName.toLowerCase();
      return emailMatch || nameMatch;
    });
    setBookings(getMyBookings(bookingsList));

    // Dynamic Live Fetch from Supabase for instant updates
    supabase.from('bookings').select('*').then(({ data, error }) => {
      if (!error && data) {
        const formatted = data.map(b => ({
          id: b.id,
          guest: b.guest,
          email: b.email,
          phone: b.phone,
          country: b.country,
          room: b.room,
          roomId: b.room_id,
          roomSlug: b.room_slug,
          roomType: b.room_type,
          checkIn: b.check_in,
          checkOut: b.check_out,
          nights: b.nights,
          guests: b.guests,
          amount: b.price,
          status: b.status,
          payment: b.payment,
          paymentMethod: b.payment_method,
          createdAt: b.created_at,
          avatar: b.avatar
        }));
        const local = getStoredBookings() || [];
        const mergedMap = new Map();
        local.forEach(x => mergedMap.set(x.id, x));
        formatted.forEach(x => mergedMap.set(x.id, x));
        const merged = Array.from(mergedMap.values());
        saveStoredBookings(merged);
        setBookings(getMyBookings(merged));
      }
    });

    // Load Reviews
    const reviewsList = getStoredReviews() || [];
    const myReviews = reviewsList.filter(r => {
      const rGuest = r?.guest || '';
      const gName = guest?.name || '';
      return rGuest && gName && rGuest.toLowerCase() === gName.toLowerCase();
    });
    setReviews(myReviews);

    // Load/Initialize Chat
    const loadChat = () => {
      const chatsList = getStoredChats() || [];

      let myChat = chatsList.find(c => {
        const cGuest = c?.guest || '';
        const gName = guest?.name || '';
        return cGuest && gName && cGuest.toLowerCase() === gName.toLowerCase();
      });
      
      if (!myChat) {
        if (isChatsLoaded()) {
          // Initialize a chat session
          myChat = {
            id: Date.now(),
            guest: guest.name,
            booking: 'General Support',
            status: 'Online',
            unread: 0,
            avatar: guest.avatar || guest.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            messages: [
              { from: 'admin', text: `Welcome to El Khalil Hotel chat support, ${guest.name}! How can we assist you today?`, time: 'Now' }
            ]
          };
          const updatedChats = [...chatsList, myChat];
          saveStoredChats(updatedChats);
          window.dispatchEvent(new Event('live-chat-update'));
          setChats(myChat.messages);
        }
      } else {
        setChats(myChat.messages);
      }
    };
    loadChat();

    // Listen for live updates
    const handleLiveUpdates = () => {
      setSettings(getStoredSettings());
      const updatedBookings = getStoredBookings() || [];
      setBookings(updatedBookings.filter(b => b.guest && b.guest.toLowerCase() === guest.name.toLowerCase()));

      const updatedReviews = getStoredReviews() || [];
      setReviews(updatedReviews.filter(r => r.guest && r.guest.toLowerCase() === guest.name.toLowerCase()));

      const updatedChats = getStoredChats() || [];
      const myChat = updatedChats.find(c => c.guest && c.guest.toLowerCase() === guest.name.toLowerCase());
      if (myChat) {
        setChats(myChat.messages);
      } else {
        loadChat();
      }
    };
    window.addEventListener('storage', handleLiveUpdates);
    window.addEventListener('live-chat-update', handleLiveUpdates);

    return () => {
      window.removeEventListener('storage', handleLiveUpdates);
      window.removeEventListener('live-chat-update', handleLiveUpdates);
    };
  }, [navigate]);

  // Scroll Chat to bottom on message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, activeTab]);

  const triggerAlert = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem('elkhalil_active_guest');
    window.dispatchEvent(new Event('guest-auth-change'));
    navigate('/guest/portal');
  };

  // Update Profile
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // If changing password, validate old password
    let finalPassword = activeGuest.password;
    if (newPassword.trim()) {
      if (!oldPassword) {
        triggerError('Please enter your current password to set a new one.');
        return;
      }
      if (oldPassword !== activeGuest.password) {
        triggerError('Error: The current password you entered is incorrect.');
        return;
      }
      finalPassword = newPassword;
    }

    const guestsList = getStoredGuests() || [];
    
    const updatedList = guestsList.map(g => {
      if (g.id === activeGuest.id) {
        return {
          ...g,
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone,
          country: profileForm.country,
          password: finalPassword
        };
      }
      return g;
    });

    const updatedGuest = {
      ...activeGuest,
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      country: profileForm.country,
      password: finalPassword
    };

    saveStoredGuests(updatedList);
    localStorage.setItem('elkhalil_active_guest', JSON.stringify(updatedGuest));
    setActiveGuest(updatedGuest);
    setOldPassword('');
    setNewPassword('');
    window.dispatchEvent(new Event('guest-auth-change'));
    triggerAlert('Profile details updated successfully!');
  };

  // Link Booking
  const handleLinkBooking = (e) => {
    e.preventDefault();
    if (!linkBookingCode.trim()) return;
    const cleanCode = linkBookingCode.trim().toUpperCase().replace('#', '');
    
    const bookingsList = getStoredBookings() || [];

    const foundIdx = bookingsList.findIndex(b => b.id.toUpperCase().replace('#', '') === cleanCode);
    
    if (foundIdx === -1) {
      alert('Error: Booking Reference code not found on server. Try e.g. BKG-1020.');
      return;
    }

    // Link booking to current guest name and email
    bookingsList[foundIdx].guest = activeGuest.name;
    bookingsList[foundIdx].email = activeGuest.email;
    saveStoredBookings(bookingsList);
    
    // Background push to Supabase to persist the link
    supabase
      .from('bookings')
      .update({ 
        guest: activeGuest.name, 
        email: activeGuest.email 
      })
      .eq('id', bookingsList[foundIdx].id)
      .then(({ error }) => {
        if (error) {
          console.error('Error linking booking in Supabase:', error);
        } else {
          console.log('Booking linked successfully in Supabase!');
        }
      });
    
    const getMyBookings = (list) => list.filter(b => 
      (b.email && b.email.toLowerCase() === activeGuest.email.toLowerCase()) || 
      (b.guest && b.guest.toLowerCase() === activeGuest.name.toLowerCase())
    );

    setBookings(getMyBookings(bookingsList));
    setLinkBookingCode('');
    triggerAlert(`Booking ${bookingsList[foundIdx].id} linked to your account successfully!`);
  };

  // Send Message in Chat
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const chatsList = getStoredChats() || [];
    let idx = chatsList.findIndex(c => c.guest && c.guest.toLowerCase() === activeGuest.name.toLowerCase());
    
    const newMsg = {
      from: 'guest',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (idx === -1) {
      // Initialize a new chat session if none exists
      const newChat = {
        id: Date.now(),
        guest: activeGuest.name,
        booking: 'General Support',
        status: 'Online',
        unread: 1,
        avatar: activeGuest.avatar || activeGuest.name[0]?.toUpperCase() || 'G',
        messages: [
          { from: 'admin', text: `Welcome to El Khalil Hotel chat support, ${activeGuest.name}! How can we assist you today?`, time: 'Now' },
          newMsg
        ]
      };
      chatsList.push(newChat);
      idx = chatsList.length - 1;
    } else {
      chatsList[idx].messages = chatsList[idx].messages || [];
      chatsList[idx].messages.push(newMsg);
      chatsList[idx].unread = (chatsList[idx].unread || 0) + 1;
      chatsList[idx].status = 'Online';
    }
    
    await saveStoredChats(chatsList);
    setChats([...chatsList[idx].messages]);
    setChatInput('');
    window.dispatchEvent(new Event('live-chat-update'));
  };

  // Submit new Review from Booking
  const handleCreateReview = (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    const reviewsList = getStoredReviews() || [];

    const newReview = {
      id: Date.now(),
      roomId: writeReviewBooking.room.includes('Standard') ? 1 
            : writeReviewBooking.room.includes('Deluxe') ? 2 
            : writeReviewBooking.room.includes('Superior') ? 3 
            : writeReviewBooking.room.includes('Family') ? 4 : 1,
      guest: activeGuest.name,
      name: activeGuest.name,
      email: activeGuest.email,
      rating: newReviewRating,
      review: newReviewComment,
      comment: newReviewComment,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      avatar: activeGuest.avatar || activeGuest.name[0].toUpperCase(),
      country: activeGuest.country || 'Egypt',
      booking: '#' + writeReviewBooking.id,
      status: 'Pending',
      room: writeReviewBooking.room,
    };

    const updated = [newReview, ...reviewsList];
    saveStoredReviews(updated);
    setReviews(updated.filter(r => r.guest.toLowerCase() === activeGuest.name.toLowerCase()));
    setWriteReviewBooking(null);
    setNewReviewComment('');
    setNewReviewRating(5);
    triggerAlert('Thank you! Your review has been submitted and is pending admin moderation.');
  };

  // Save Edited Review
  const handleEditReviewSave = (e) => {
    e.preventDefault();
    const reviewsList = getStoredReviews() || [];

    const updated = reviewsList.map(r => {
      if (r.id === editReviewObj.id) {
        return {
          ...r,
          rating: newReviewRating,
          review: newReviewComment,
          comment: newReviewComment,
          status: 'Pending'
        };
      }
      return r;
    });

    saveStoredReviews(updated);
    setReviews(updated.filter(r => r.guest.toLowerCase() === activeGuest.name.toLowerCase()));
    setEditReviewObj(null);
    setNewReviewComment('');
    setNewReviewRating(5);
    triggerAlert('Review updated successfully and is pending approval.');
  };

  // Delete Review
  const handleDeleteReview = (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      const reviewsList = getStoredReviews() || [];
      const updated = reviewsList.filter(r => r.id !== id);
      saveStoredReviews(updated);
      setReviews(updated.filter(r => r.guest.toLowerCase() === activeGuest.name.toLowerCase()));
      triggerAlert('Review deleted successfully.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const hasBookings = bookings.length > 0;

  // Render automated email notification logs
  const renderEmailLogs = () => {
    const logs = [];
    bookings.forEach(b => {
      // 1. Confirmation Email
      logs.push({
        id: `email-conf-${b.id}`,
        title: `Instant Booking Confirmation - #${b.id}`,
        subject: `El Khalil Hotel - Booking Confirmation [${b.id}]`,
        date: b.checkIn,
        type: 'confirm',
        body: `Dear Guest ${b.guest}, your booking for room (${b.room}) has been successfully confirmed. Stay dates: ${b.checkIn} to ${b.checkOut}. We look forward to welcoming you!`
      });
      // 2. Invoice receipt email
      logs.push({
        id: `email-inv-${b.id}`,
        title: `Digital Tax Invoice Receipt - #${b.id}`,
        subject: `El Khalil Hotel - Invoice Receipt for [${b.id}]`,
        date: b.checkIn,
        type: 'invoice',
        body: `Dear ${b.guest}, please find attached the official digital invoice and payment receipt for your booking ${b.id} totaling $${b.amount}. Thank you for your business.`
      });
      // 3. Checkout thank you & review request (if checked-out)
      if (b.status === 'Checked-out') {
        logs.push({
          id: `email-chk-${b.id}`,
          title: `Thank you for staying! Leave a review - #${b.id}`,
          subject: `How was your stay at El Khalil Hotel? [${b.id}]`,
          date: b.checkOut,
          type: 'checkout',
          body: `Hi ${b.guest}, it was a pleasure hosting you at El Khalil Hotel Giza. Please take a moment to review your room and experience to help us improve our services.`
        });
      }
    });

    return logs.length > 0 ? logs : [
      { id: 'no-log', title: 'No Notifications Yet', subject: '', date: '-', type: 'empty', body: 'Once a booking is created or checked out, automated notifications logs dispatched to your mailbox will appear here.' }
    ];
  };

  return (
    <div className="guest-dashboard-page">
      <Navbar />

      <div className="guest-db-container">
        {successMsg && (
          <div className="db-success-toast">
            <FiCheckCircle size={16} />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="db-error-toast" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            <FiAlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        <div className="guest-db-layout">
          {/* Bottom App Navigation for Mobile */}
          {isMobile && (
            <div className="guest-db-bottom-nav">
              <button className={`bottom-nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                <FiCalendar />
                <span>Bookings</span>
              </button>
              <button className={`bottom-nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                <FiMessageSquare />
                <span>Chat</span>
              </button>
              <button className={`bottom-nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                <FiStar />
                <span>Reviews</span>
              </button>
              <button className={`bottom-nav-item ${activeTab === 'emails' ? 'active' : ''}`} onClick={() => setActiveTab('emails')}>
                <FiMail />
                <span>Inbox</span>
              </button>
              <button className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <FiUser />
                <span>Profile</span>
              </button>
            </div>
          )}

          {/* SIDEBAR */}
          {!isMobile && (
            <div className="guest-db-sidebar">
              {activeGuest && (
                <div className="guest-db-profile-header">
                  <div className="db-guest-avatar">{activeGuest.avatar || activeGuest.name[0]}</div>
                  <div className="guest-db-profile-header-info">
                    <h4>{activeGuest.name}</h4>
                    <p>{activeGuest.email}</p>
                    <span className="guest-status-badge">Active Guest</span>
                  </div>
                </div>
              )}
              <div className="guest-db-menu">
                <button className={`guest-db-menu-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                  <FiCalendar />
                  <span>My Bookings & Invoices</span>
                </button>
                <button className={`guest-db-menu-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                  <FiMessageSquare />
                  <span>Live Support Chat</span>
                </button>
                <button className={`guest-db-menu-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                  <FiStar />
                  <span>My Reviews & Ratings</span>
                </button>
                <button className={`guest-db-menu-item ${activeTab === 'emails' ? 'active' : ''}`} onClick={() => setActiveTab('emails')}>
                  <FiMail />
                  <span>Automated Email Logs</span>
                </button>
                <button className={`guest-db-menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                  <FiUser />
                  <span>My Profile Settings</span>
                </button>
                <button className="guest-db-menu-item logout-item" onClick={handleLogout}>
                  <FiLogOut />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}

          {/* MAIN CONTENT AREA */}
          <div className="guest-db-content">
            {/* TAB: BOOKINGS & INVOICES */}
            {activeTab === 'bookings' && (
              <div className="db-tab-panel">
                <div className="db-tab-header">
                  <h3>My Stays & Invoices</h3>
                  <p>Track stay schedules and download professional PDF/printable invoice receipts.</p>
                </div>

                {/* Link a booking form */}
                <form onSubmit={handleLinkBooking} className="link-booking-form">
                  <input 
                    type="text" 
                    placeholder="Link another reservation? Enter Booking Reference code (e.g. BKG-1020)" 
                    value={linkBookingCode}
                    onChange={e => setLinkBookingCode(e.target.value)}
                  />
                  <button type="submit">Link Booking</button>
                </form>

                <div className="bookings-timeline-list">
                  {hasBookings ? (
                    bookings.map(b => (
                      <div key={b.id} className="booking-db-card">
                        <div className="booking-db-card-header">
                          <div>
                            <span className="booking-db-id">#{b.id}</span>
                            <span className={`booking-status-pill ${b.status.toLowerCase()}`}>{b.status}</span>
                          </div>
                          <span className="booking-db-price">${b.amount}</span>
                        </div>
                        
                        <div className="booking-db-card-body">
                          <div className="booking-db-info-grid">
                            <div>
                              <strong>Room Type:</strong>
                              <span>{b.room}</span>
                            </div>
                            <div>
                              <strong>Check-In Date:</strong>
                              <span>{b.checkIn}</span>
                            </div>
                            <div>
                              <strong>Check-Out Date:</strong>
                              <span>{b.checkOut}</span>
                            </div>
                            <div>
                              <strong>Guests Count:</strong>
                              <span>{b.guests} {b.guests === 1 ? 'guest' : 'guests'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="booking-db-card-footer">
                          <button className="btn-invoice" onClick={() => setSelectedInvoice(b)}>
                            <FiPrinter /> View & Print Invoice
                          </button>
                          
                          {b.status === 'Checked-out' && (
                            <button 
                              className="btn-add-review" 
                              onClick={() => {
                                setWriteReviewBooking(b);
                                setNewReviewRating(5);
                                setNewReviewComment('');
                              }}
                            >
                              <FiStar /> Write Room Review
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-panel">
                      <FiCalendar size={48} className="empty-icon" />
                      <h4>No bookings linked to your account yet</h4>
                      <p>If you placed a reservation while logged out, insert your Booking Reference code above to link it.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: LIVE CHAT */}
            {activeTab === 'chat' && (
              <div className="db-tab-panel chat-panel-wrapper">
                <div className="db-tab-header">
                  <h3>Reception Live Chat Support</h3>
                  <p>Message hotel reception desk and order room amenities or service instantly.</p>
                </div>

                <div className="guest-chat-box">
                  {/* Premium Chat Header */}
                  <div className="guest-chat-header">
                    <div className="chat-header-agent-avatar">
                      <div className="agent-avatar-circle">EK</div>
                      <span className="agent-online-badge"></span>
                    </div>
                    <div className="chat-header-agent-info">
                      <h4>El Khalil Reception Desk</h4>
                      <p>Active Support Desk • Usually replies instantly</p>
                    </div>
                  </div>

                  <div className="guest-chat-messages">
                    {chats.map((msg, idx) => (
                      <div key={idx} className={`chat-message ${msg.from === 'guest' ? 'guest-sender' : 'admin-sender'}`}>
                        <div className="msg-sender-label">{msg.from === 'guest' ? 'You' : 'Reception Staff'}</div>
                        <div className="msg-bubble">{msg.text}</div>
                        <div className="msg-time">{msg.time}</div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <form className="guest-chat-input-bar" onSubmit={handleSendChat}>
                    <input 
                      type="text" 
                      placeholder="Ask the front desk for anything (e.g. towels, late check-out, tours)..." 
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                    />
                    <button type="submit" className="chat-send-btn" title="Send Message">
                      <FiSend />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="db-tab-panel">
                <div className="db-tab-header">
                  <h3>My Room Reviews & Feedback</h3>
                  <p>Manage, edit, or delete feedback and stars you have submitted for your stays.</p>
                </div>

                <div className="reviews-db-list">
                  {reviews.length > 0 ? (
                    reviews.map(r => (
                      <div key={r.id} className="review-db-card">
                        <div className="review-db-card-header">
                          <div>
                            <strong>{r.room}</strong>
                            <div className="review-db-stars">{'★'.repeat(r.rating)}</div>
                          </div>
                          <div>
                            <span className={`review-status-pill ${r.status === 'Published' ? 'published' : 'pending'}`}>
                              {r.status === 'Published' ? 'Published' : 'Pending Moderation'}
                            </span>
                            <span className="review-db-date">{r.date}</span>
                          </div>
                        </div>
                        <p className="review-db-text">"{r.review}"</p>
                        
                        <div className="review-db-actions">
                          <button 
                            className="btn-edit" 
                            onClick={() => {
                              setEditReviewObj(r);
                              setNewReviewRating(r.rating);
                              setNewReviewComment(r.review);
                            }}
                          >
                            <FiEdit3 /> Edit Review
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteReview(r.id)}>
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-panel">
                      <FiStar size={48} className="empty-icon" />
                      <h4>No reviews submitted yet</h4>
                      <p>Reviews are only editable or open to bookings that have completed checkout status.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: AUTOMATED EMAILS LOGS */}
            {activeTab === 'emails' && (
              <div className="db-tab-panel">
                <div className="db-tab-header">
                  <h3>Automated Systems Dispatch Logs</h3>
                  <p>Verify simulated notifications and invoices automatically dispatched to your inbox.</p>
                </div>

                <div className="email-logs-list">
                  {renderEmailLogs().map((email, idx) => (
                    <div key={email.id || idx} className="email-log-item">
                      <div className="email-log-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`email-type-dot ${email.type}`} />
                          <h4>{email.title}</h4>
                        </div>
                        <span className="email-log-date">{email.date}</span>
                      </div>
                      <div className="email-log-body">
                        {email.subject && <div className="email-subject"><strong>Subject:</strong> {email.subject}</div>}
                        <p className="email-text">{email.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PROFILE SETTINGS */}
            {activeTab === 'profile' && (
              <div className="db-tab-panel">
                <div className="db-tab-header">
                  <h3>Update Account Profile</h3>
                  <p>Keep your phone number, country location, and login credentials updated.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                  <div className="form-group-db">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={profileForm.name} 
                      onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>

                  <div className="form-group-db">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={profileForm.email} 
                      onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>

                  <div className="form-group-db">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      value={profileForm.phone} 
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>

                  <div className="form-group-db">
                    <label>Country</label>
                    <input 
                      type="text" 
                      value={profileForm.country} 
                      onChange={e => setProfileForm(p => ({ ...p, country: e.target.value }))}
                    />
                  </div>

                  <div className="form-group-db" style={{ position: 'relative' }}>
                    <label>Current Password (required to change password)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={showOldPassword ? 'text' : 'password'} 
                        value={oldPassword} 
                        onChange={e => setOldPassword(e.target.value)}
                        placeholder="Enter your current password"
                        style={{ paddingRight: '40px' }}
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--gray-400)' }}
                      >
                        {showOldPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group-db" style={{ position: 'relative' }}>
                    <label>New Password (leave blank if not changing)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={showNewPassword ? 'text' : 'password'} 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter a new strong password"
                        style={{ paddingRight: '40px' }}
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--gray-400)' }}
                      >
                        {showNewPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn-save-profile">Save Profile Details</button>
                </form>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ color: 'var(--red)', fontSize: '14px', fontWeight: 700 }}>Account Session</h4>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Log out of your current guest account session. You will need to enter your email and password to log in again.</p>
                  <button 
                    type="button" 
                    className="btn-db-logout"
                    onClick={handleLogout}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '8px',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: '1.5px solid #fca5a5',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '14px',
                      width: '100%',
                      maxWidth: '220px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FiLogOut /> LOG OUT SESSION
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: PROFESSIONAL INVOICE (الفاتورة الفندقية) */}
      {selectedInvoice && (
        <div className="invoice-modal-overlay">
          <div className="invoice-modal card printable-invoice">
            <div className="invoice-header-actions no-print">
              <button className="btn-print-action" onClick={handlePrint}><FiPrinter /> Print Invoice</button>
              <button className="btn-close-action" onClick={() => setSelectedInvoice(null)}><FiX /></button>
            </div>

            <div className="invoice-content">
              {/* Hotel Header */}
              <div className="invoice-hotel-row">
                <div>
                  <h2>⚜ {settings.hotelName || 'El Khalil Boutique Hotel'}</h2>
                  <p>Nazlet El-Semman, Al Haram, Giza, Egypt</p>
                  <p>{settings.email} | {settings.phone}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ color: 'var(--gold)' }}>TAX INVOICE</h3>
                  <p><strong>Invoice No:</strong> INV-{selectedInvoice.id}</p>
                  <p><strong>Issue Date:</strong> {selectedInvoice.checkIn}</p>
                </div>
              </div>

              <hr />

              {/* Guest & Booking details */}
              <div className="invoice-details-grid">
                <div>
                  <h5>Billed To (Guest):</h5>
                  <p><strong>Name:</strong> {selectedInvoice.guest}</p>
                  <p><strong>Email:</strong> {activeGuest?.email}</p>
                  <p><strong>Phone:</strong> {activeGuest?.phone || '-'}</p>
                </div>
                <div>
                  <h5>Stay & Booking Info:</h5>
                  <p><strong>Booking Ref:</strong> #{selectedInvoice.id}</p>
                  <p><strong>Check-In Date:</strong> {selectedInvoice.checkIn}</p>
                  <p><strong>Check-Out Date:</strong> {selectedInvoice.checkOut}</p>
                  <p><strong>Status:</strong> {selectedInvoice.status}</p>
                </div>
              </div>

              {/* Billing table */}
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Description of Services</th>
                    <th>Daily Rate</th>
                    <th>Nights</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Room accommodation ({selectedInvoice.room}) including city taxes & breakfast</td>
                    <td>${(selectedInvoice.amount / 3).toFixed(0)}</td>
                    <td>3 nights</td>
                    <td style={{ textAlign: 'right' }}>${selectedInvoice.amount}</td>
                  </tr>
                </tbody>
              </table>

              <div className="invoice-totals">
                <div className="totals-row">
                  <span>Subtotal:</span>
                  <span>${selectedInvoice.amount}</span>
                </div>
                <div className="totals-row">
                  <span>Service Charge (10%):</span>
                  <span>Included</span>
                </div>
                <div className="totals-row">
                  <span>VAT (14%):</span>
                  <span>Included</span>
                </div>
                <div className="totals-row grand-total">
                  <span>Total Paid Amount:</span>
                  <span>${selectedInvoice.amount}</span>
                </div>
              </div>

              <div className="invoice-footer">
                <p>Thank you for choosing El Khalil Hotel. We wish you safe travels and a comfortable stay!</p>
                <div className="stamp-signature">
                  <div className="hotel-stamp">⚜ EL KHALIL HOTEL GIZA ⚜</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT OR WRITE REVIEW */}
      {(editReviewObj || writeReviewBooking) && (
        <div className="invoice-modal-overlay">
          <div className="review-modal card">
            <div className="review-modal-header">
              <h3>{editReviewObj ? 'Edit Room Review' : 'Write Guest Room Review'}</h3>
              <button className="btn-close-action" onClick={() => {
                setEditReviewObj(null);
                setWriteReviewBooking(null);
              }}><FiX /></button>
            </div>
            
            <form onSubmit={editReviewObj ? handleEditReviewSave : handleCreateReview} className="review-modal-form">
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '15px' }}>
                {editReviewObj ? `Modify feedback for: ${editReviewObj.room}` : `Write review for: ${writeReviewBooking.room}`}
              </p>

              <div className="form-group-db" style={{ marginBottom: '15px' }}>
                <label>Choose Star Rating (1 to 5 Stars)</label>
                <div className="star-picker-db">
                  {[1,2,3,4,5].map(n => (
                    <button 
                      key={n}
                      type="button" 
                      className={`star-db ${n <= newReviewRating ? 'active' : ''}`}
                      onClick={() => setNewReviewRating(n)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group-db">
                <label>Review Comment / Feedback</label>
                <textarea 
                  rows={4} 
                  required
                  placeholder="Tell us about your room, cleanliness, checkout speed, staff behaviour..."
                  value={newReviewComment}
                  onChange={e => setNewReviewComment(e.target.value)}
                />
              </div>

              <div className="review-modal-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-save-review-submit">Submit Review Details</button>
                <button type="button" className="btn-cancel" onClick={() => {
                  setEditReviewObj(null);
                  setWriteReviewBooking(null);
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!isMobile && <Footer />}
    </div>
  );
}

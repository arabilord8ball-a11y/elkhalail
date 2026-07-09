import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiCalendar, FiHome, FiUsers, FiMap, FiStar,
  FiTag, FiCreditCard, FiBarChart2, FiMessageSquare,
  FiSettings, FiGlobe, FiBell, FiUser, FiChevronDown,
  FiLogOut, FiMenu, FiX, FiChevronRight
} from 'react-icons/fi';
import { getStoredBookings, getStoredChats, getStoredReviews, getStoredPayments } from '../../utils/storage';
import { supabase } from '../../utils/supabaseClient';
import './AdminLayout.css';

const sidebarItems = [
  { path: '/admin', label: 'Dashboard', icon: FiGrid, exact: true },
  { path: '/admin/bookings', label: 'Bookings', icon: FiCalendar },
  { path: '/admin/rooms', label: 'Rooms', icon: FiHome },
  { path: '/admin/calendar', label: 'Rates & Calendar', icon: FiCalendar },
  { path: '/admin/guests', label: 'Guests', icon: FiUsers },
  { path: '/admin/tours', label: 'Tours', icon: FiMap },
  { path: '/admin/reviews', label: 'Reviews', icon: FiStar },
  { path: '/admin/offers', label: 'Offers & Coupons', icon: FiTag },
  { path: '/admin/payments', label: 'Payments', icon: FiCreditCard },
  { path: '/admin/reports', label: 'Reports', icon: FiBarChart2 },
  { path: '/admin/chat', label: 'Chat', icon: FiMessageSquare },
  { path: '/admin/settings', label: 'Settings', icon: FiSettings },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem('elkhalil_admin_notifications');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return []; // No fake mock notifications
  });

  const [counts, setCounts] = useState({
    bookings: 0,
    chat: 0,
    reviews: 0,
    payments: 0
  });

  // Sound chime synthesizer using browser Web Audio API
  const playNotificationChime = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playNote = (frequency, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, startTime);
        
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      const now = ctx.currentTime;
      // Premium chime: C5 (523.25 Hz) then G5 (783.99 Hz)
      playNote(523.25, now, 0.35);
      playNote(783.99, now + 0.12, 0.55);
    } catch (e) {
      console.error('Audio chime failed:', e);
    }
  };

  useEffect(() => {
    const updateCounts = () => {
      const bookingsList = getStoredBookings() || [];
      const chatsList = getStoredChats() || [];
      const reviewsList = getStoredReviews() || [];
      const paymentsList = getStoredPayments() || [];

      setCounts({
        bookings: bookingsList.filter(b => b && b.status === 'Pending').length,
        chat: chatsList.filter(c => c && c.unread > 0).length,
        reviews: reviewsList.filter(r => r && r.status === 'Pending').length,
        payments: paymentsList.filter(p => p && p.status === 'Pending').length
      });
    };

    updateCounts();
    window.addEventListener('storage', updateCounts);
    window.addEventListener('live-chat-update', updateCounts);
    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('live-chat-update', updateCounts);
    };
  }, []);

  // 1. Supabase Real-time subscriptions for new events
  useEffect(() => {
    // Bookings listener
    const bookingsSub = supabase
      .channel('admin-bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        const newB = payload.new;
        const text = `New Booking by ${newB.guest || 'Guest'} (${newB.room || 'Room'})`;
        setNotifications(prev => [{ id: Date.now() + Math.random(), text, time: 'Just now', read: false }, ...prev]);
        playNotificationChime();
      })
      .subscribe();

    // Reviews listener
    const reviewsSub = supabase
      .channel('admin-reviews')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, (payload) => {
        const newR = payload.new;
        const text = `New Review received (${newR.rating || 5} stars) from ${newR.guest || 'Guest'}`;
        setNotifications(prev => [{ id: Date.now() + Math.random(), text, time: 'Just now', read: false }, ...prev]);
        playNotificationChime();
      })
      .subscribe();

    // Chat messages listener
    const chatsSub = supabase
      .channel('admin-chats')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chats' }, (payload) => {
        const updatedChat = payload.new;
        const oldChat = payload.old;
        const oldMsgs = oldChat?.messages || [];
        const newMsgs = updatedChat?.messages || [];
        
        if (newMsgs.length > oldMsgs.length) {
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg && lastMsg.from === 'guest') {
            const text = `New Message from ${updatedChat.guest || 'Guest'}: "${lastMsg.text}"`;
            setNotifications(prev => [{ id: Date.now() + Math.random(), text, time: 'Just now', read: false }, ...prev]);
            playNotificationChime();
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSub);
      supabase.removeChannel(reviewsSub);
      supabase.removeChannel(chatsSub);
    };
  }, []);

  // 2. Fallback polling for status/count comparison alerts
  const prevCountsRef = useRef({ bookings: 0, reviews: 0, chats: 0 });
  useEffect(() => {
    const bookingsList = getStoredBookings() || [];
    const reviewsList = getStoredReviews() || [];
    const chatsList = getStoredChats() || [];
    prevCountsRef.current = {
      bookings: bookingsList.filter(b => b.status === 'Pending').length,
      reviews: reviewsList.filter(r => r.status === 'Pending').length,
      chats: chatsList.filter(c => c.unread > 0).length
    };
  }, []);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      // Fetch directly from Supabase to check for updates & sync cache
      Promise.all([
        supabase.from('bookings').select('*'),
        supabase.from('reviews').select('*'),
        supabase.from('chats').select('*')
      ]).then(([bookingsRes, reviewsRes, chatsRes]) => {
        if (bookingsRes.error || reviewsRes.error || chatsRes.error) return;

        const bookingsList = bookingsRes.data.map(b => ({
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
          price: b.price,
          status: b.status,
          payment: b.payment,
          paymentMethod: b.payment_method,
          createdAt: b.created_at,
          avatar: b.avatar
        })) || [];

        const reviewsList = reviewsRes.data.map(r => ({
          id: r.id,
          guest: r.guest,
          name: r.guest,
          booking: r.booking,
          rating: Number(r.rating) || 5,
          review: r.review,
          comment: r.review,
          date: r.date,
          status: r.status,
          avatar: r.avatar,
          room: r.room
        })) || [];

        const chatsList = chatsRes.data || [];

        // Save back to stored caches dynamically
        // Import save helpers from storage utility
        import('../../utils/storage').then((storage) => {
          storage.saveStoredBookings(bookingsList);
          storage.saveStoredReviews(reviewsList);
          storage.saveStoredChats(chatsList);
        });

        const current = {
          bookings: bookingsList.filter(b => b && b.status === 'Pending').length,
          reviews: reviewsList.filter(r => r && r.status === 'Pending').length,
          chats: chatsList.filter(c => c && c.unread > 0).length
        };
        
        const prev = prevCountsRef.current;
        let trigger = false;
        let text = '';

        if (current.bookings > prev.bookings) {
          trigger = true;
          const lastB = bookingsList.find(b => b && b.status === 'Pending');
          text = lastB ? `New Booking by ${lastB.guest || 'Guest'} (${lastB.room || 'Room'})` : 'New guest booking received!';
        } else if (current.reviews > prev.reviews) {
          trigger = true;
          const lastR = reviewsList.find(r => r && r.status === 'Pending');
          text = lastR ? `New Review received (${lastR.rating || 5} stars) from ${lastR.guest || 'Guest'}` : 'New review received!';
        } else if (current.chats > prev.chats) {
          trigger = true;
          const activeC = chatsList.filter(c => c && c.unread > 0);
          const lastC = activeC[activeC.length - 1];
          text = lastC ? `New Message from ${lastC.guest || 'Guest'}` : 'New chat message received!';
        }

        if (trigger) {
          setNotifications(prevNotifs => [{ id: Date.now() + Math.random(), text, time: 'Just now', read: false }, ...prevNotifs]);
          playNotificationChime();
        }
        
        prevCountsRef.current = current;
      }).catch(err => console.error("Admin polling failed:", err));
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    localStorage.setItem('elkhalil_admin_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };


  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo">
            <span className="logo-icon-admin">⬡</span>
            <div>
              <div className="admin-logo-name">Elkhalil Hotel</div>
              <div className="admin-logo-sub">Admin Panel</div>
            </div>
          </Link>
        </div>

        <nav className="admin-nav">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            let badgeCount = 0;
            if (item.path === '/admin/bookings') badgeCount = counts.bookings;
            if (item.path === '/admin/chat') badgeCount = counts.chat;
            if (item.path === '/admin/reviews') badgeCount = counts.reviews;
            if (item.path === '/admin/payments') badgeCount = counts.payments;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="admin-nav-icon" />
                <span className="admin-nav-label">{item.label}</span>
                {badgeCount > 0 && <span className="admin-nav-badge">{badgeCount}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">{(user?.name || 'Admin')[0].toUpperCase()}</div>
            <div>
              <div className="admin-user-name">{user?.name || 'Admin'}</div>
              <div className="admin-user-role">{user?.role || 'Super Admin'}</div>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <FiLogOut />
            Log Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FiMenu size={20} />
          </button>

          <div className="topbar-right">
            <div className="notif-container">
              <button className="topbar-icon-btn notif-btn" onClick={() => setNotifMenuOpen(!notifMenuOpen)}>
                <FiBell size={18} />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>
              
              {notifMenuOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>Notifications</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {unreadCount > 0 && (
                        <button className="notif-clear-btn" style={{ fontSize: '11px', background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }} onClick={markAllRead}>Mark all read</button>
                      )}
                      {notifications.length > 0 && (
                        <button className="notif-clear-btn" style={{ fontSize: '11px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => setNotifications([])}>Clear all</button>
                      )}
                    </div>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-color)', position: 'relative' }} onClick={() => {
                          setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item));
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: '12px' }}>
                            <span className="notif-item-text">{n.text}</span>
                            <span className="notif-item-time">{n.time}</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifications(notifications.filter(item => item.id !== n.id));
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#9ca3af',
                              cursor: 'pointer',
                              padding: '4px',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Dismiss notification"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="topbar-user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="topbar-avatar">A</div>
              <span className="topbar-user-name hide-mobile">Admin</span>
              <FiChevronDown size={14} />
              {userMenuOpen && (
                <div className="topbar-dropdown">
                  <Link to="/admin/settings">Settings</Link>
                  <button onClick={handleLogout}>Log Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

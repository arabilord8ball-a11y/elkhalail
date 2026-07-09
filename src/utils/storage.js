import { supabase } from './supabaseClient';

// In-Memory cache variables to completely replace localStorage
let cacheTours = null;
let cacheRooms = null;
let cacheBookings = null;
let cachePayments = null;
let cacheGuests = null;
let cacheContactMessages = null;
let cacheFaqs = null;
let cacheGallery = null;
let cacheSettings = null;
let cacheUsers = null;
let cacheReviews = null;
let cacheChats = null;
let cacheOffers = null;
let cacheCalendar = {};

// Fetching guard flags to prevent infinite request loops during component mount cascades
let fetchingTours = false;
let fetchingRooms = false;
let fetchingBookings = false;
let fetchingPayments = false;
let fetchingGuests = false;
let fetchingContactMessages = false;
let fetchingFaqs = false;
let fetchingGallery = false;
let fetchingSettings = false;
let fetchingUsers = false;
let fetchingReviews = false;
let fetchingChats = false;
let fetchingOffers = false;

// Helper to trigger UI state refresh in components listening to storage updates
function triggerUIRefresh() {
  window.dispatchEvent(new Event('storage'));
}

const parseSafeDate = (str) => {
  if (!str) return new Date();
  if (/[a-zA-Z]/.test(str)) {
    const d = new Date(str);
    d.setHours(0,0,0,0);
    return d;
  }
  return new Date(str + 'T00:00:00');
};

// 1. TOURS
export function getStoredTours() {
  if (cacheTours) return cacheTours;
  
  if (!fetchingTours) {
    fetchingTours = true;
    supabase.from('tours').select('*').then(({ data, error }) => {
      fetchingTours = false;
      if (!error && data && data.length) {
        cacheTours = data.map(dbTour => {
          return {
            ...dbTour,
            reviewCount: dbTour.review_count !== undefined ? dbTour.review_count : 0,
          };
        });
        triggerUIRefresh();
      }
    });
  }

  return [];
}

export async function saveStoredTours(tours) {
  cacheTours = tours;
  triggerUIRefresh();

  const records = tours.map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    duration: t.duration || '',
    price: Number(t.price || 0),
    capacity: Number(t.capacity || 1),
    description: t.description || '',
    images: t.images || [t.image] || [],
    included: t.included || [],
    excluded: t.excluded || [],
    category: t.category || 'Cultural',
    status: t.status || 'Active',
    rating: Number(t.rating || 5),
    review_count: Number(t.reviewCount || 0)
  }));

  const { error } = await supabase.from('tours').upsert(records);
  if (error) {
    console.error("Error saving tours to Supabase:", error);
  }
}

// 2. ROOMS
export function getStoredRooms() {
  if (cacheRooms) return cacheRooms;

  if (!fetchingRooms) {
    fetchingRooms = true;
    supabase.from('rooms').select('*').then(({ data, error }) => {
      fetchingRooms = false;
      if (!error && data && data.length) {
        cacheRooms = data.map(dbRoom => {
          return {
            ...dbRoom,
            reviewCount: dbRoom.review_count !== undefined ? dbRoom.review_count : 0,
          };
        });
        triggerUIRefresh();
      }
    });
  }

  return [];
}

export async function saveStoredRooms(rooms) {
  cacheRooms = rooms;
  triggerUIRefresh();

  const records = rooms.map(r => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    number: r.number || '',
    type: r.type || 'Standard',
    price: Number(r.price || 0),
    capacity: Number(r.capacity || 2),
    size: Number(r.size || 20),
    beds: r.beds || '1 Double Bed',
    view: r.view || 'City View',
    description: r.description || '',
    images: r.images || [r.image] || [],
    amenities: r.amenities || [],
    status: r.status || 'Available',
    rating: Number(r.rating || 5),
    review_count: Number(r.reviewCount || 0)
  }));

  const { error } = await supabase.from('rooms').upsert(records);
  if (error) {
    console.error("Error saving rooms to Supabase:", error);
  }
}

// 3. BOOKINGS
export function getStoredBookings() {
  if (cacheBookings) return cacheBookings;

  if (!fetchingBookings) {
    fetchingBookings = true;
    supabase.from('bookings').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      fetchingBookings = false;
      if (!error && data) {
        if (!cacheBookings) {
          cacheBookings = data.map(b => ({
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
            payment: (b.status === 'Checked-in' || b.status === 'Checked-out') ? 'Paid' : b.payment,
            paymentMethod: b.payment_method,
            createdAt: b.created_at,
            avatar: b.avatar,
            extras: b.extras || []
          }));
          triggerUIRefresh();
        }
      }
    });
  }

  return [];
}

export async function saveStoredBookings(bookings) {
  cacheBookings = bookings;
  triggerUIRefresh();

  const records = bookings.map(b => ({
    id: b.id,
    guest: b.guest,
    email: b.email || 'guest@example.com',
    phone: b.phone || 'N/A',
    country: b.country || 'Egypt',
    room: b.room,
    room_id: b.roomId || null,
    room_slug: b.roomSlug || '',
    room_type: b.roomType || '',
    check_in: b.checkIn,
    check_out: b.checkOut,
    nights: Number(b.nights || 1),
    guests: Number(b.guests || 1),
    price: Number(b.amount !== undefined ? b.amount : (b.price || 0)),
    status: b.status,
    payment: (b.status === 'Checked-in' || b.status === 'Checked-out') ? 'Paid' : (b.payment || 'Unpaid'),
    payment_method: b.paymentMethod || 'Pay at Hotel',
    created_at: b.createdAt || new Date().toISOString().split('T')[0],
    avatar: b.avatar || 'G'
  }));

  const { error } = await supabase.from('bookings').upsert(records);
  if (error) {
    console.error("Error saving bookings to Supabase:", error);
  }

  // Auto-sync payments table for new/changed bookings
  try {
    const { data: existingPayments, error: payError } = await supabase.from('payments').select('*');
    if (!payError) {
      const payMap = {};
      (existingPayments || []).forEach(p => {
        if (p.booking) payMap[p.booking] = p;
      });

      let paymentsChanged = false;
      const newPaymentsToInsert = [];

      for (let b of bookings) {
        const isPaid = (b.status === 'Checked-in' || b.status === 'Checked-out');
        const isCancelled = (b.status === 'Cancelled');
        const existingPay = payMap[b.id];

        if (!existingPay) {
          const newPay = {
            id: `PAY-${b.id.replace('BKG-', '') || Math.floor(1000 + Math.random() * 9000)}`,
            booking: b.id,
            guest: b.guest,
            amount: Number(b.amount !== undefined ? b.amount : (b.price || 0)),
            method: b.paymentMethod || 'Pay at Hotel',
            status: isPaid ? 'Paid' : (isCancelled ? 'Refunded' : 'Pending'),
            date: b.createdAt || new Date().toISOString().split('T')[0],
            avatar: b.avatar || 'G'
          };
          newPaymentsToInsert.push(newPay);
          paymentsChanged = true;
        } else {
          const targetStatus = isPaid ? 'Paid' : (isCancelled ? 'Refunded' : 'Pending');
          if (existingPay.status !== targetStatus) {
            await supabase.from('payments').update({ status: targetStatus }).eq('booking', b.id);
            if (cachePayments) {
              cachePayments = cachePayments.map(p => p.booking === b.id ? { ...p, status: targetStatus } : p);
            }
            paymentsChanged = true;
          }
        }
      }

      if (newPaymentsToInsert.length > 0) {
        const { error: insErr } = await supabase.from('payments').insert(newPaymentsToInsert);
        if (!insErr && cachePayments) {
          cachePayments = [...cachePayments, ...newPaymentsToInsert];
        }
      }

      if (paymentsChanged) {
        triggerUIRefresh();
      }
    }
  } catch (paySyncErr) {
    console.error("Error syncing payments in saveStoredBookings:", paySyncErr);
  }

  // Auto-update room_calendar for bookings
  for (let b of bookings) {
    if (!b.roomId) continue;
    const isClosedStatus = (b.status !== 'Cancelled');
    
    // Ensure cacheCalendar[b.roomId] is loaded
    // If not loaded yet, fetch it or initialize it
    if (!cacheCalendar[b.roomId]) {
      // Try to load from database synchronously or initialize empty
      cacheCalendar[b.roomId] = {};
    }
    const calendar = { ...cacheCalendar[b.roomId] };
    
    // Parse dates
    const start = parseSafeDate(b.checkIn);
    const end = parseSafeDate(b.checkOut);
    const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
    
    let changed = false;
    for (let i = 0; i < nights; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const yearStr = current.getFullYear();
      const monthStr = String(current.getMonth() + 1).padStart(2, '0');
      const dayStr = String(current.getDate()).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
      
      const currentVal = calendar[dateStr] || { price: b.pricePerNight || (nights > 0 ? (b.amount / nights) : 45) };
      if (currentVal.closed !== isClosedStatus) {
        calendar[dateStr] = {
          ...currentVal,
          closed: isClosedStatus
        };
        changed = true;
      }
    }
    
    if (changed) {
      cacheCalendar[b.roomId] = calendar;
      // Save to Supabase
      await supabase.from('room_calendar').upsert({
        room_id: Number(b.roomId),
        calendar_data: calendar,
        updated_at: new Date().toISOString()
      });
    }
  }

  triggerUIRefresh();
}

// 4. PAYMENTS
export function getStoredPayments() {
  if (cachePayments) return cachePayments;

  if (!fetchingPayments) {
    fetchingPayments = true;
    supabase.from('payments').select('*').then(({ data, error }) => {
      fetchingPayments = false;
      if (!error && data) {
        cachePayments = data.map(p => ({
          id: p.id,
          guest: p.guest,
          booking: p.booking,
          amount: p.amount,
          method: p.method,
          date: p.date,
          status: p.status,
          avatar: p.avatar
        }));
        triggerUIRefresh();
      }
    });
  }

  return [];
}

export async function saveStoredPayments(payments) {
  cachePayments = payments;
  triggerUIRefresh();

  const records = payments.map(p => ({
    id: p.id,
    guest: p.guest,
    booking: p.booking,
    amount: Number(p.amount || 0),
    method: p.method || 'Cash',
    date: p.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: p.status || 'Pending',
    avatar: p.avatar || 'G'
  }));

  const { error } = await supabase.from('payments').upsert(records);
  if (error) {
    console.error("Error saving payments to Supabase:", error);
  }
}

// 5. GUESTS
export function getStoredGuests() {
  if (cacheGuests) return cacheGuests;

  if (!fetchingGuests) {
    fetchingGuests = true;
    supabase.from('guests').select('*').then(({ data, error }) => {
      fetchingGuests = false;
      if (!error && data) {
        cacheGuests = data.map(g => ({
          id: g.id,
          name: g.name,
          email: g.email,
          phone: g.phone,
          country: g.country,
          bookings: g.bookings,
          joinedAt: g.joined_at,
          spent: g.spent,
          bookingsCount: g.bookings_count,
          avatar: g.avatar
        }));
        triggerUIRefresh();
      }
    });
  }

  return [];
}

export async function saveStoredGuests(guests) {
  cacheGuests = guests;
  triggerUIRefresh();

  const records = guests.map(g => ({
    id: g.id,
    name: g.name,
    email: g.email || 'guest@example.com',
    phone: g.phone || 'N/A',
    country: g.country || 'Egypt',
    bookings: g.bookings || [],
    joined_at: g.joinedAt || new Date().toISOString().split('T')[0],
    spent: Number(g.spent || 0),
    bookings_count: Number(g.bookingsCount || g.bookings?.length || 0),
    avatar: g.avatar || 'G'
  }));

  const { error } = await supabase.from('guests').upsert(records);
  if (error) {
    console.error("Error saving guests to Supabase:", error);
  }
}

export async function registerGuestBooking(bookingId, guestName, guestEmail, guestPhone, guestCountry, amount) {
  try {
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('*')
      .eq('email', guestEmail)
      .maybeSingle();

    let guestId = '';
    if (existingGuest) {
      guestId = existingGuest.id;
      const updatedBookings = [...(existingGuest.bookings || []), bookingId];
      const newSpent = Number(existingGuest.spent || 0) + Number(amount || 0);
      const newCount = Number(existingGuest.bookings_count || 0) + 1;

      await supabase.from('guests').update({
        bookings: updatedBookings,
        spent: newSpent,
        bookings_count: newCount,
        phone: guestPhone || existingGuest.phone,
        country: guestCountry || existingGuest.country
      }).eq('id', guestId);
    } else {
      guestId = 'G' + Date.now();
      await supabase.from('guests').insert({
        id: guestId,
        name: guestName,
        email: guestEmail,
        phone: guestPhone || 'N/A',
        country: guestCountry || 'Egypt',
        bookings: [bookingId],
        joined_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        spent: Number(amount || 0),
        bookings_count: 1,
        avatar: guestName[0]?.toUpperCase() || 'G'
      });
    }

    cacheGuests = null;
    return guestId;
  } catch (err) {
    console.error("Error in registerGuestBooking:", err);
    return 'G' + Date.now();
  }
}

// 6. CONTACT MESSAGES
export function getStoredContactMessages() {
  if (cacheContactMessages) return cacheContactMessages;

  if (!fetchingContactMessages) {
    fetchingContactMessages = true;
    supabase.from('contact_messages').select('*').then(({ data, error }) => {
      fetchingContactMessages = false;
      if (!error && data) {
        cacheContactMessages = data;
        triggerUIRefresh();
      }
    });
  }

  return [];
}

export async function saveStoredContactMessages(messages) {
  cacheContactMessages = messages;
  triggerUIRefresh();

  for (let m of messages) {
    await supabase.from('contact_messages').upsert({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      subject: m.subject,
      message: m.message,
      date: m.date
    });
  }
}

// 7. FAQs
export function getStoredFaqs() {
  if (cacheFaqs) return cacheFaqs;
  
  if (!fetchingFaqs) {
    fetchingFaqs = true;
    supabase.from('faqs').select('*').then(({ data, error }) => {
      fetchingFaqs = false;
      if (!error && data && data.length) {
        cacheFaqs = data;
        triggerUIRefresh();
      }
    });
  }

  return [];
}

export async function saveStoredFaqs(faqs) {
  cacheFaqs = faqs;
  triggerUIRefresh();

  await supabase.from('faqs').delete().neq('id', 0);
  for (let f of faqs) {
    await supabase.from('faqs').insert({
      category: f.category,
      question: f.question,
      answer: f.answer
    });
  }
}

// 8. GALLERY
export function getStoredGallery() {
  if (cacheGallery) return cacheGallery;

  if (!fetchingGallery) {
    fetchingGallery = true;
    supabase.from('gallery').select('*').then(({ data, error }) => {
      fetchingGallery = false;
      if (!error && data && data.length) {
        cacheGallery = data;
        triggerUIRefresh();
      }
    });
  }

  return [];
}

export async function saveStoredGallery(gallery) {
  cacheGallery = gallery;
  triggerUIRefresh();

  await supabase.from('gallery').delete().neq('id', 0);
  for (let g of gallery) {
    await supabase.from('gallery').insert({
      url: g.url,
      title: g.title,
      category: g.category
    });
  }
}

// 9. SETTINGS
const defaultSettings = {
  hotelName: 'El Khalil Pyramids View Inn',
  phone: '+20 123 456 7890',
  email: 'elkhalilpyramidsinn@gmail.com',
  currency: 'USD ($)',
  timezone: '(GMT+2:00) Cairo',
  checkIn: '2:00 PM',
  checkOut: '12:00 PM',
  logoType: 'emoji',
  logoValue: '⚜',
  address: 'نزلة السمان الوسطاني, Giza, 12512 Cairo, Egypt',
  locality: 'نزلة السمان الوسطاني',
  region: 'Giza / Cairo Governorate',
  postalCode: '12512',
  country: 'Egypt',
  ratingValue: '8.4',
  reviewCount: '179',
  description: 'Located in Cairo, a 15-minute walk from Great Sphinx, El Khalil Pyramids View Inn has accommodations with a garden, free private parking, a shared lounge, and a terrace. Free WiFi is available throughout.',
  paymentGateway: 'PayPal & Stripe',
  apiKeyPublic: 'pk_test_elkhalil...',
  currencyCode: 'USD',
  smtpHost: 'smtp.gmail.com',
  smtpPort: '587',
  smtpUser: 'elkhalilpyramidsinn@gmail.com',
  facebookUrl: 'https://facebook.com/elkhalilpyramidsinn',
  instagramUrl: 'https://instagram.com/elkhalilpyramidsinn',
  twitterUrl: 'https://twitter.com/elkhalilpyramids',
  youtubeUrl: 'https://youtube.com/elkhalilpyramids',
  notifyNewBookings: true,
  notifyNewReviews: true,
  notifyNewMessages: true,
  heroTitle: 'Experience Ancient Wonder with Unmatched Luxury',
  heroSubtitle: 'A 15-minute walk to the Great Sphinx & Giza Pyramids',
  brandColor: '#C9973A',
  whatsappNumber: '+20 123 456 7890',
  googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.0963840742183!2d31.13197027581177!3d29.977287974958172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458459203a9ad3d%3A0xe543e49818817268!2sGreat%20Sphinx%20of%20Giza!5e0!3m2!1sen!2seg!4v1719999999999!5m2!1sen!2seg',
  imgHeroBg: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80',
  imgAboutStory: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=700&q=80',
  imgContactHero: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80',
  imgRoomsHero: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  imgToursHero: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
};

export function getStoredSettings() {
  if (cacheSettings) return cacheSettings;

  if (!fetchingSettings) {
    fetchingSettings = true;
    supabase.from('settings').select('*').eq('key', 'elkhalil_settings').maybeSingle().then(({ data, error }) => {
      fetchingSettings = false;
      if (!error && data?.value) {
        cacheSettings = data.value;
      } else {
        cacheSettings = defaultSettings;
      }
      triggerUIRefresh();
    });
  }

  return defaultSettings;
}

export async function saveStoredSettings(settings) {
  cacheSettings = settings;
  triggerUIRefresh();

  await supabase.from('settings').upsert({
    key: 'elkhalil_settings',
    value: settings
  });
}

// 10. SYSTEM USERS
export function getStoredUsers() {
  if (cacheUsers) return cacheUsers;

  if (!fetchingUsers) {
    fetchingUsers = true;
    supabase.from('users').select('*').then(({ data, error }) => {
      fetchingUsers = false;
      if (!error && data && data.length) {
        cacheUsers = data;
        triggerUIRefresh();
      }
    });
  }

  return [
    { id: 1, name: 'Admin Account', username: 'admin', role: 'Super Admin', status: 'Active', password: 'admin123' },
    { id: 2, name: 'Sara Front Desk', username: 'sara', role: 'Staff / Receptionist', status: 'Active', password: 'sara123' },
    { id: 3, name: 'Omar General Manager', username: 'omar', role: 'Manager', status: 'Active', password: 'omar123' },
  ];
}

export async function saveStoredUsers(users) {
  cacheUsers = users;
  triggerUIRefresh();

  for (let u of users) {
    await supabase.from('users').upsert({
      id: u.id,
      name: u.name,
      username: u.username,
      role: u.role,
      status: u.status,
      password: u.password
    });
  }
}

// 11. REVIEWS
export function getStoredReviews() {
  if (cacheReviews) return cacheReviews;

  if (!fetchingReviews) {
    fetchingReviews = true;
    supabase.from('reviews').select('*').then(({ data, error }) => {
      fetchingReviews = false;
      if (!error && data && data.length) {
        cacheReviews = data.map(r => ({
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
          room: r.room,
          roomId: r.room === 'Standard Room' ? 1
                 : r.room === 'Deluxe Room' ? 2
                 : r.room === 'Superior Room' ? 3
                 : r.room === 'Family Room' ? 4 : 1
        }));
        triggerUIRefresh();
      }
    });
  }

  return [];
}

export async function saveStoredReviews(reviews) {
  cacheReviews = reviews;
  triggerUIRefresh();

  for (let r of reviews) {
    await supabase.from('reviews').upsert({
      id: r.id,
      guest: r.guest || r.name,
      booking: r.booking,
      rating: Number(r.rating),
      review: r.review || r.comment,
      date: r.date,
      status: r.status,
      avatar: r.avatar,
      room: r.room
    });
  }
}

// 12. CHATS
let chatChannel = null;
let isPollingChats = false;

export function initRealtimeChats() {
  if (chatChannel || isPollingChats) return;

  // 1. Supabase Realtime Subscription
  try {
    chatChannel = supabase
      .channel('realtime:chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        
        if (eventType === 'INSERT') {
          if (cacheChats) {
            if (!cacheChats.some(c => c.id === newRow.id)) {
              cacheChats = [...cacheChats, newRow];
            }
          } else {
            cacheChats = [newRow];
          }
        } else if (eventType === 'UPDATE') {
          if (cacheChats) {
            cacheChats = cacheChats.map(c => c.id === newRow.id ? newRow : c);
          } else {
            cacheChats = [newRow];
          }
        } else if (eventType === 'DELETE') {
          if (cacheChats) {
            cacheChats = cacheChats.filter(c => c.id !== oldRow.id);
          }
        }
        triggerUIRefresh();
        window.dispatchEvent(new Event('live-chat-update'));
      })
      .subscribe();
  } catch (err) {
    console.error('Supabase Realtime subscription error:', err);
  }

  // 2. Short Polling Fallback (every 3 seconds)
  isPollingChats = true;
  setInterval(() => {
    let query = supabase.from('chats').select('*');
    
    // Guest isolation check
    const activeGuestData = localStorage.getItem('elkhalil_active_guest');
    let guestName = null;
    if (activeGuestData) {
      try {
        const g = JSON.parse(activeGuestData);
        if (g && g.name) {
          guestName = g.name;
          query = query.eq('guest', g.name);
        }
      } catch (e) {}
    }

    query.then(({ data, error }) => {
      if (!error && data) {
        if (guestName) {
          // Guest mode: Merge/update only this guest's chat in the cache
          if (data.length > 0) {
            const guestChat = data[0];
            const hasChanged = !cacheChats || !cacheChats.some(c => 
              c.guest && c.guest.toLowerCase() === guestChat.guest.toLowerCase() && 
              JSON.stringify(c.messages) === JSON.stringify(guestChat.messages)
            );
            if (hasChanged) {
              if (cacheChats) {
                cacheChats = cacheChats.map(c => 
                  c.guest && c.guest.toLowerCase() === guestChat.guest.toLowerCase() ? guestChat : c
                );
                if (!cacheChats.some(c => c.guest && c.guest.toLowerCase() === guestChat.guest.toLowerCase())) {
                  cacheChats.push(guestChat);
                }
              } else {
                cacheChats = [guestChat];
              }
              triggerUIRefresh();
              window.dispatchEvent(new Event('live-chat-update'));
            }
          }
        } else {
          // Admin mode: Overwrite full cache
          const hasChanged = JSON.stringify(data) !== JSON.stringify(cacheChats);
          if (hasChanged) {
            cacheChats = data;
            triggerUIRefresh();
            window.dispatchEvent(new Event('live-chat-update'));
          }
        }
      }
    });
  }, 3000);
}

export function isChatsLoaded() {
  return cacheChats !== null;
}

export function getStoredChats() {
  initRealtimeChats();
  
  if (cacheChats) return cacheChats;

  if (!fetchingChats) {
    fetchingChats = true;
    let query = supabase.from('chats').select('*');
    
    // Guest isolation check
    const activeGuestData = localStorage.getItem('elkhalil_active_guest');
    if (activeGuestData) {
      try {
        const g = JSON.parse(activeGuestData);
        if (g && g.name) {
          query = query.eq('guest', g.name);
        }
      } catch (e) {}
    }

    query.then(({ data, error }) => {
      fetchingChats = false;
      if (!error && data && data.length) {
        cacheChats = data;
        triggerUIRefresh();
        window.dispatchEvent(new Event('live-chat-update'));
      }
    });
  }

  return [];
}


export async function saveStoredChats(chats) {
  cacheChats = chats;
  triggerUIRefresh();

  for (let c of chats) {
    const { error } = await supabase.from('chats').upsert({
      id: c.id,
      guest: c.guest,
      booking: c.booking,
      status: c.status,
      unread: Number(c.unread || 0),
      avatar: c.avatar,
      messages: c.messages
    });
    if (error) {
      console.error("Error upserting chat to Supabase:", error);
    }
  }
}

export async function saveSingleChat(chat) {
  // Update in-memory cache
  if (cacheChats) {
    cacheChats = cacheChats.map(c => c.id === chat.id ? chat : c);
    if (!cacheChats.some(c => c.id === chat.id)) {
      cacheChats.push(chat);
    }
  } else {
    cacheChats = [chat];
  }
  triggerUIRefresh();

  // Send single row upsert to Supabase
  const { error } = await supabase.from('chats').upsert({
    id: chat.id,
    guest: chat.guest,
    booking: chat.booking,
    status: chat.status,
    unread: Number(chat.unread || 0),
    avatar: chat.avatar,
    messages: chat.messages
  });

  if (error) {
    console.error("Error saving single chat to Supabase:", error);
  }
}



// 13. OFFERS

export function getStoredOffers() {
  if (cacheOffers) return cacheOffers;

  if (!fetchingOffers) {
    fetchingOffers = true;
    supabase.from('offers').select('*').order('id', { ascending: true }).then(({ data, error }) => {
      fetchingOffers = false;
      if (!error && data && data.length) {
        cacheOffers = data.map(o => ({
          id: o.id,
          title: o.title,
          discount: o.discount,
          code: o.code,
          description: o.description,
          type: o.type,
          minNights: o.min_nights,
          validFrom: o.valid_from,
          validTo: o.valid_to,
          status: o.status,
          usages: o.usages
        }));
        triggerUIRefresh();
      }
    });
  }

  return [];
}

export async function saveStoredOffers(offers) {
  cacheOffers = offers;
  triggerUIRefresh();

  for (let o of offers) {
    await supabase.from('offers').upsert({
      id: o.id,
      title: o.title,
      discount: o.discount,
      code: o.code,
      description: o.description || `Get ${o.discount} discount with promo code ${o.code}.`,
      type: o.type,
      min_nights: Number(o.minNights || 1),
      valid_from: o.validFrom || null,
      valid_to: o.validTo || null,
      status: o.status,
      usages: Number(o.usages || 0)
    });
  }
}

export async function deleteStoredOffer(id) {
  cacheOffers = cacheOffers ? cacheOffers.filter(o => o.id !== id) : null;
  triggerUIRefresh();
  await supabase.from('offers').delete().eq('id', id);
}

export async function deleteStoredBooking(id) {
  cacheBookings = cacheBookings ? cacheBookings.filter(b => b.id !== id) : null;
  triggerUIRefresh();
  await supabase.from('bookings').delete().eq('id', id);
}

export async function deleteStoredRoom(id) {
  cacheRooms = cacheRooms ? cacheRooms.filter(r => r.id !== id) : null;
  triggerUIRefresh();
  await supabase.from('rooms').delete().eq('id', id);
}

export async function deleteStoredTour(id) {
  cacheTours = cacheTours ? cacheTours.filter(t => t.id !== id) : null;
  triggerUIRefresh();
  await supabase.from('tours').delete().eq('id', id);
}

export async function deleteStoredReview(id) {
  cacheReviews = cacheReviews ? cacheReviews.filter(r => r.id !== id) : null;
  triggerUIRefresh();
  await supabase.from('reviews').delete().eq('id', id);
}

export async function deleteStoredGuest(id) {
  try {
    const { data: guestData, error: fetchErr } = await supabase.from('guests').select('*').eq('id', id).maybeSingle();
    if (fetchErr || !guestData) {
      cacheGuests = cacheGuests ? cacheGuests.filter(g => g.id !== id) : null;
      triggerUIRefresh();
      await supabase.from('guests').delete().eq('id', id);
      return;
    }

    const { name, email } = guestData;

    cacheGuests = cacheGuests ? cacheGuests.filter(g => g.id !== id) : null;
    cacheBookings = cacheBookings ? cacheBookings.filter(b => b.guest !== name && b.email !== email) : null;
    cachePayments = cachePayments ? cachePayments.filter(p => p.guest !== name) : null;
    cacheReviews = cacheReviews ? cacheReviews.filter(r => r.guest !== name && r.name !== name) : null;
    cacheChats = cacheChats ? cacheChats.filter(c => c.guest !== name) : null;

    triggerUIRefresh();

    if (email) {
      const { data: guestBookings } = await supabase.from('bookings').select('id').eq('email', email);
      if (guestBookings && guestBookings.length > 0) {
        const bIds = guestBookings.map(b => b.id);
        await supabase.from('payments').delete().in('booking', bIds);
      }
      await supabase.from('bookings').delete().eq('email', email);
      await supabase.from('reviews').delete().eq('guest', name);
    } else {
      const { data: guestBookings } = await supabase.from('bookings').select('id').eq('guest', name);
      if (guestBookings && guestBookings.length > 0) {
        const bIds = guestBookings.map(b => b.id);
        await supabase.from('payments').delete().in('booking', bIds);
      }
      await supabase.from('bookings').delete().eq('guest', name);
      await supabase.from('reviews').delete().eq('guest', name);
    }

    await supabase.from('payments').delete().eq('guest', name);
    await supabase.from('chats').delete().eq('guest', name);
    await supabase.from('guests').delete().eq('id', id);

  } catch (err) {
    console.error("Error performing cascade delete of guest:", err);
  }
}

export async function deleteStoredUser(id) {
  cacheUsers = cacheUsers ? cacheUsers.filter(u => u.id !== id) : null;
  triggerUIRefresh();
  await supabase.from('users').delete().eq('id', id);
}

export async function deleteStoredChat(id) {
  cacheChats = cacheChats ? cacheChats.filter(c => c.id !== id) : null;
  triggerUIRefresh();
  await supabase.from('chats').delete().eq('id', id);
}

let calendarLastFetched = {};

// 14. ROOM CALENDAR — Supabase backed with TTL check
export function getRoomCalendar(roomId) {
  const numericId = Number(roomId);
  const now = Date.now();
  const lastFetched = calendarLastFetched[numericId] || 0;

  // If not fetched, or cache is older than 4 seconds, fetch in background
  if (!cacheCalendar[numericId] || (now - lastFetched > 4000)) {
    calendarLastFetched[numericId] = now;
    supabase.from('room_calendar').select('*').eq('room_id', numericId).maybeSingle().then(({ data, error }) => {
      if (!error && data && data.calendar_data) {
        const stringifiedNew = JSON.stringify(data.calendar_data);
        const stringifiedOld = JSON.stringify(cacheCalendar[numericId] || {});
        if (stringifiedNew !== stringifiedOld) {
          cacheCalendar[numericId] = data.calendar_data;
          triggerUIRefresh();
        }
      }
    });
  }

  return cacheCalendar[numericId] || {};
}

export async function saveRoomCalendar(roomId, calendarData) {
  const numericId = Number(roomId);
  cacheCalendar[numericId] = calendarData;
  triggerUIRefresh();

  await supabase.from('room_calendar').upsert({
    room_id: numericId,
    calendar_data: calendarData,
    updated_at: new Date().toISOString()
  });
}

// 15. CHECKROOM AVAILABILITY
export function checkRoomAvailability(roomId, checkInStr, checkOutStr) {
  const bookings = getStoredBookings();
  const roomBookings = bookings.filter(b => b.status !== 'Cancelled' && (b.roomId === roomId || b.room === roomId));
  
  if (roomBookings.length === 0) return true;

  const start = new Date(checkInStr);
  const end = new Date(checkOutStr);

  for (let b of roomBookings) {
    const bStart = new Date(b.checkIn);
    const bEnd = new Date(b.checkOut);
    if (start < bEnd && end > bStart) {
      return false;
    }
  }
  return true;
}

// 16. EXPORT CSV
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => {
      let val = obj[header];
      if (typeof val === 'string') {
        val = val.replace(/"/g, '""');
        if (val.includes(',') || val.includes('\n')) {
          val = `"${val}"`;
        }
      }
      return val;
    }).join(',')
  );
  
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

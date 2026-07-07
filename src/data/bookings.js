export const bookings = [
  { id: 'BKG-1025', guest: 'John Smith', room: 'Deluxe Room', checkIn: 'Jun 18, 2024', checkOut: 'Jun 21, 2024', guests: 2, amount: 180, status: 'Confirmed', avatar: 'JS' },
  { id: 'BKG-1024', guest: 'Maria Garcia', room: 'Superior Room', checkIn: 'Jun 17, 2024', checkOut: 'Jun 19, 2024', guests: 1, amount: 150, status: 'Pending', avatar: 'MG' },
  { id: 'BKG-1023', guest: 'Ahmed Hassan', room: 'Family Room', checkIn: 'Jun 17, 2024', checkOut: 'Jun 22, 2024', guests: 4, amount: 450, status: 'Confirmed', avatar: 'AH' },
  { id: 'BKG-1022', guest: 'Emma Wilson', room: 'Standard Room', checkIn: 'Jun 16, 2024', checkOut: 'Jun 18, 2024', guests: 1, amount: 90, status: 'Cancelled', avatar: 'EW' },
  { id: 'BKG-1021', guest: 'Daniel Brown', room: 'Deluxe Room', checkIn: 'Jun 16, 2024', checkOut: 'Jun 20, 2024', guests: 2, amount: 240, status: 'Confirmed', avatar: 'DB' },
  { id: 'BKG-1020', guest: 'Sophia Martin', room: 'Superior Room', checkIn: 'Jun 15, 2024', checkOut: 'Jun 17, 2024', guests: 2, amount: 150, status: 'Checked-out', avatar: 'SM' },
  { id: 'BKG-1019', guest: 'Liam Johnson', room: 'Family Room', checkIn: 'Jun 14, 2024', checkOut: 'Jun 18, 2024', guests: 3, amount: 360, status: 'Checked-in', avatar: 'LJ' },
  { id: 'BKG-1018', guest: 'Oliver Davis', room: 'Standard Room', checkIn: 'Jun 13, 2024', checkOut: 'Jun 14, 2024', guests: 1, amount: 45, status: 'Checked-out', avatar: 'OD' },
];

export const guests = [
  { id: 1, name: 'John Smith', email: 'john.smith@email.com', phone: '+1 000 000-8197', bookings: 3, spent: 940, avatar: 'JS' },
  { id: 2, name: 'Maria Garcia', email: 'maria.garcia@gmail.com', phone: '+1 000 000-9186', bookings: 2, spent: 500, avatar: 'MG' },
  { id: 3, name: 'Ahmed Hassan', email: 'ahmed.hassan@gmail.com', phone: '+1 000 000-9156', bookings: 4, spent: 725, avatar: 'AH' },
  { id: 4, name: 'Emma Wilson', email: 'emma.wilson@email.com', phone: '+1 000 000-1038', bookings: 1, spent: 285, avatar: 'EW' },
  { id: 5, name: 'Daniel Brown', email: 'daniel.brown@email.com', phone: '+1 000 000-6122', bookings: 6, spent: 1080, avatar: 'DB' },
  { id: 6, name: 'Sophia Martin', email: 'sophia.martin@email.com', phone: '+1 000 000-9127', bookings: 2, spent: 300, avatar: 'SM' },
  { id: 7, name: 'Liam Johnson', email: 'liam.johnson@email.com', phone: '+1 000 000-8311', bookings: 5, spent: 450, avatar: 'LJ' },
];

export const bookingChartData = [
  { date: 'May 20', bookings: 28, prev: 24 },
  { date: 'May 27', bookings: 35, prev: 30 },
  { date: 'Jun 3', bookings: 30, prev: 27 },
  { date: 'Jun 10', bookings: 42, prev: 35 },
  { date: 'Jun 18', bookings: 55, prev: 40 },
];

export const revenueChartData = [
  { date: 'May 20', revenue: 8200 },
  { date: 'May 27', revenue: 11500 },
  { date: 'Jun 3', revenue: 9800 },
  { date: 'Jun 10', revenue: 14200 },
  { date: 'Jun 18', revenue: 18750 },
];

export const reviews = [
  { id: 1, guest: 'Sarah Johnson', booking: '#BKG-1024', rating: 5, review: 'Amazing stay! The view from the balcony was incredible. Will definitely come back!', date: 'Jun 18, 2024', status: 'Published', avatar: 'SJ', room: 'Deluxe Room' },
  { id: 2, guest: 'Michael Brown', booking: '#BKG-1023', rating: 4, review: 'Excellent hotel and great location. Friendly and professional staff.', date: 'Jun 17, 2024', status: 'Published', avatar: 'MB', room: 'Superior Room' },
  { id: 3, guest: 'Emma Wilson', booking: '#BKG-1022', rating: 5, review: 'Everything was perfect! The staff went above and beyond.', date: 'Jun 16, 2024', status: 'Published', avatar: 'EW', room: 'Family Room' },
  { id: 4, guest: 'Ahmed Hassan', booking: '#BKG-1021', rating: 5, review: 'Great service, comfortable rooms and delicious breakfast.', date: 'Jun 16, 2024', status: 'Pending', avatar: 'AH', room: 'Deluxe Room' },
  { id: 5, guest: 'Daniel Brown', booking: '#BKG-1020', rating: 3, review: 'It was okay, but some improvements needed in room service.', date: 'Jun 15, 2024', status: 'Pending', avatar: 'DB', room: 'Standard Room' },
  { id: 6, guest: 'Sophia Martin', booking: '#BKG-1019', rating: 4, review: 'Highly recommended! Great value for money.', date: 'Jun 14, 2024', status: 'Published', avatar: 'SM', room: 'Superior Room' },
];

export const payments = [
  { id: 'PAY-001', guest: 'John Smith', booking: 'BKG-1025', amount: 180, method: 'Credit Card', date: 'Jun 18, 2024', status: 'Paid', avatar: 'JS' },
  { id: 'PAY-002', guest: 'Maria Garcia', booking: 'BKG-1024', amount: 150, method: 'PayPal', date: 'Jun 17, 2024', status: 'Pending', avatar: 'MG' },
  { id: 'PAY-003', guest: 'Ahmed Hassan', booking: 'BKG-1023', amount: 450, method: 'Credit Card', date: 'Jun 17, 2024', status: 'Paid', avatar: 'AH' },
  { id: 'PAY-004', guest: 'Emma Wilson', booking: 'BKG-1022', amount: 90, method: 'Debit Card', date: 'Jun 16, 2024', status: 'Refunded', avatar: 'EW' },
  { id: 'PAY-005', guest: 'Daniel Brown', booking: 'BKG-1021', amount: 240, method: 'Booking.com', date: 'Jun 16, 2024', status: 'Paid', avatar: 'DB' },
  { id: 'PAY-006', guest: 'Sophia Martin', booking: 'BKG-1020', amount: 150, method: 'Credit Card', date: 'Jun 15, 2024', status: 'Paid', avatar: 'SM' },
];

export const chatMessages = [
  {
    id: 1,
    guest: 'John Smith',
    booking: 'BKG-1025',
    status: 'Online',
    unread: 2,
    avatar: 'JS',
    messages: [
      { from: 'guest', text: "Hi, I'd like to know if early check-in is available for my booking on June 18?", time: '10:30 AM' },
      { from: 'admin', text: 'Hello John! Yes, early check-in is available from 11:00 AM. Would you like me to reserve it for you?', time: '10:32 AM' },
      { from: 'guest', text: 'Yes please! That would be great.', time: '10:35 AM' },
      { from: 'admin', text: 'Perfect, early check-in at 11:00 AM is confirmed for your booking BKG-1025!', time: '10:36 AM' },
    ],
  },
  {
    id: 2,
    guest: 'Maria Garcia',
    booking: 'BKG-1024',
    status: 'Offline',
    unread: 0,
    avatar: 'MG',
    messages: [
      { from: 'guest', text: 'Can I change my room type?', time: 'Yesterday' },
      { from: 'admin', text: 'Of course! What room type would you prefer?', time: 'Yesterday' },
    ],
  },
  {
    id: 3,
    guest: 'Ahmed Hassan',
    booking: 'BKG-1023',
    status: 'Online',
    unread: 1,
    avatar: 'AH',
    messages: [
      { from: 'guest', text: 'I have a question about the tours.', time: 'May 16' },
    ],
  },
  {
    id: 4,
    guest: 'Emma Wilson',
    booking: 'BKG-1022',
    status: 'Offline',
    unread: 0,
    avatar: 'EW',
    messages: [
      { from: 'guest', text: 'Thank you for your assistance!', time: 'May 15' },
    ],
  },
  {
    id: 5,
    guest: 'Daniel Brown',
    booking: 'BKG-1021',
    status: 'Offline',
    unread: 0,
    avatar: 'DB',
    messages: [
      { from: 'guest', text: 'Is airport transfer included?', time: 'May 15' },
    ],
  },
];

export const offers = [
  { id: 1, title: 'Book Direct & Save', discount: '15%', code: 'DIRECT15', description: 'Save up to 15% when you book directly through our website.', type: 'Percentage', minNights: 2, validFrom: 'Jun 1, 2024', validTo: 'Aug 31, 2024', status: 'Active', usages: 45 },
  { id: 2, title: 'Early Bird Special', discount: '20%', code: 'EARLY20', description: 'Book 30 days in advance and save 20% on your stay.', type: 'Percentage', minNights: 3, validFrom: 'Jun 1, 2024', validTo: 'Dec 31, 2024', status: 'Active', usages: 28 },
  { id: 3, title: 'Weekend Getaway', discount: '$30', code: 'WEEKEND30', description: 'Enjoy $30 off on weekend stays of 2 nights or more.', type: 'Fixed', minNights: 2, validFrom: 'Jun 1, 2024', validTo: 'Jul 31, 2024', status: 'Active', usages: 62 },
  { id: 4, title: 'Long Stay Offer', discount: '25%', code: 'LONGSTAY25', description: 'Stay 7 nights or more and get 25% off your entire booking.', type: 'Percentage', minNights: 7, validFrom: 'Jan 1, 2024', validTo: 'Dec 31, 2024', status: 'Active', usages: 12 },
  { id: 5, title: 'Summer Flash Sale', discount: '30%', code: 'SUMMER30', description: 'Limited time offer! 30% off all rooms for summer stays.', type: 'Percentage', minNights: 1, validFrom: 'Jul 1, 2024', validTo: 'Jul 15, 2024', status: 'Inactive', usages: 0 },
];

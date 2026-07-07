import { useState, useEffect } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiEdit2, FiInfo, FiLock, FiUnlock, FiPlus, FiSave, FiAlertCircle, FiX, FiCheckCircle, FiSettings, FiGrid } from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';
import { getStoredRooms, getRoomCalendar, saveRoomCalendar, getStoredBookings } from '../../utils/storage';
import './Calendar.css';

const getLocalYYYYMMDD = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Calendar() {
  const [rooms] = useState(() => getStoredRooms());
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [toast, setToast] = useState(null);
  const [calendarView, setCalendarView] = useState('price'); // 'price' or 'timeline'
  const [bookingsList, setBookingsList] = useState(() => getStoredBookings());

  // Range selection states (drag-to-select & click range)
  const [rangeStart, setRangeStart] = useState(null); // 'YYYY-MM-DD'
  const [rangeEnd, setRangeEnd] = useState(null); // 'YYYY-MM-DD'
  const [hoverDate, setHoverDate] = useState(null); // 'YYYY-MM-DD'
  const [isDragging, setIsDragging] = useState(false);
  const [editPrice, setEditPrice] = useState(150);
  const [editClosed, setEditClosed] = useState(false);

  // Bulk update state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStart, setBulkStart] = useState('');
  const [bulkEnd, setBulkEnd] = useState('');
  const [bulkPrice, setBulkPrice] = useState(150);
  const [bulkClosed, setBulkClosed] = useState(false);

  useEffect(() => {
    if (selectedRoomId) {
      setCalendarData(getRoomCalendar(selectedRoomId));
    }
  }, [selectedRoomId]);

  useEffect(() => {
    const handleStorage = () => {
      setBookingsList(getStoredBookings());
      if (selectedRoomId) {
        setCalendarData(getRoomCalendar(selectedRoomId));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [selectedRoomId]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const getRoomPriceForDate = (dateStr, basePrice) => {
    if (calendarData[dateStr] && calendarData[dateStr].price !== undefined) {
      return calendarData[dateStr].price;
    }
    return basePrice;
  };

  const getRoomClosedForDate = (dateStr) => {
    if (calendarData[dateStr] && calendarData[dateStr].closed !== undefined) {
      return calendarData[dateStr].closed;
    }
    return false;
  };

  const selectedRoom = rooms.find(r => r.id === Number(selectedRoomId));

  // Calendar dates generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week (0-6)
  const totalDays = new Date(year, month + 1, 0).getDate(); // Days in current month

  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  const nextMonthTotalDays = 42 - (firstDayIndex + totalDays);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to determine if a date is within selected/dragging range
  const isInRange = (dateStr) => {
    if (!rangeStart) return false;
    
    let start = rangeStart;
    let end = rangeEnd || (isDragging ? hoverDate : null);
    if (!end) return dateStr === start;

    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }
    return dateStr >= start && dateStr <= end;
  };

  // Drag and Click Handlers
  const handleDayMouseDown = (dateStr) => {
    setRangeStart(dateStr);
    setRangeEnd(null);
    setHoverDate(dateStr);
    setIsDragging(true);

    const dayData = calendarData[dateStr] || {};
    setEditPrice(dayData.price !== undefined ? dayData.price : (selectedRoom ? selectedRoom.price : 150));
    setEditClosed(dayData.closed !== undefined ? dayData.closed : false);
  };

  const handleDayMouseEnter = (dateStr) => {
    if (isDragging) {
      setHoverDate(dateStr);
    }
  };

  const handleDayMouseUp = (dateStr) => {
    if (isDragging) {
      setIsDragging(false);
      if (dateStr !== rangeStart) {
        setRangeEnd(dateStr);
      }
    }
  };

  // Save Range Rates
  const handleSaveRange = (e) => {
    e.preventDefault();
    if (!rangeStart) return;

    let start = rangeStart;
    let end = rangeEnd || rangeStart;

    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }

    const updatedCalendar = { ...calendarData };
    const tempDate = new Date(start);
    const endDateObj = new Date(end);

    while (tempDate <= endDateObj) {
      const dateStr = getLocalYYYYMMDD(tempDate);
      updatedCalendar[dateStr] = {
        price: Number(editPrice),
        closed: editClosed
      };
      tempDate.setDate(tempDate.getDate() + 1);
    }

    setCalendarData(updatedCalendar);
    saveRoomCalendar(selectedRoomId, updatedCalendar);
    
    // Clear selection
    setRangeStart(null);
    setRangeEnd(null);
    setHoverDate(null);
    showToast(`Rates and availability updated successfully for the range.`);
  };

  // Save Bulk Rates
  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (!bulkStart || !bulkEnd) {
      alert('Please select start and end dates.');
      return;
    }

    const start = new Date(bulkStart);
    const end = new Date(bulkEnd);

    if (end < start) {
      alert('End date must be after or equal to start date.');
      return;
    }

    const updatedCalendar = { ...calendarData };
    const tempDate = new Date(start);

    while (tempDate <= end) {
      const dateStr = getLocalYYYYMMDD(tempDate);
      updatedCalendar[dateStr] = {
        price: Number(bulkPrice),
        closed: bulkClosed
      };
      tempDate.setDate(tempDate.getDate() + 1);
    }

    setCalendarData(updatedCalendar);
    saveRoomCalendar(selectedRoomId, updatedCalendar);
    setShowBulkModal(false);
    showToast('Bulk calendar updates applied successfully.');
  };
  const getBookingForRoomDate = (room, dateStr) => {
    const targetDate = new Date(dateStr);
    return bookingsList.find(b => {
      const nameMatch = b.room.toLowerCase() === room.name.toLowerCase();
      if (!nameMatch) return false;
      
      if (room.name === 'Standard Room') {
        const isOddBooking = parseInt(b.id.replace(/\D/g, ''), 10) % 2 === 0;
        if (room.number === '101' && !isOddBooking) return false;
        if (room.number === '105' && isOddBooking) return false;
      }
      
      if (room.name === 'Superior Room') {
        const isOddBooking = parseInt(b.id.replace(/\D/g, ''), 10) % 2 === 0;
        if (room.number === '103' && !isOddBooking) return false;
        if (room.number === '106' && isOddBooking) return false;
      }

      const checkInDate = new Date(b.checkIn);
      const checkOutDate = new Date(b.checkOut);
      
      checkInDate.setHours(0,0,0,0);
      checkOutDate.setHours(0,0,0,0);
      targetDate.setHours(0,0,0,0);
      
      return targetDate >= checkInDate && targetDate < checkOutDate;
    });
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
            <h1>{calendarView === 'price' ? 'Rates & Availability' : 'Bookings Calendar Grid'}</h1>
            <p>
              {calendarView === 'price' 
                ? 'Manage daily rates, block/unblock dates, and setup bulk parameters similar to Booking.com & Expedia extranet.'
                : 'See room availability status and guest bookings overlaid in a graphical timeline grid.'}
            </p>
          </div>
          <div className="admin-page-actions" style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={`btn btn-sm ${calendarView === 'price' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCalendarView('price')}
            >
              <FiSettings size={14} /> Rates &amp; Availability
            </button>
            <button 
              className={`btn btn-sm ${calendarView === 'timeline' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCalendarView('timeline')}
            >
              <FiGrid size={14} /> Bookings Calendar Grid
            </button>
            {calendarView === 'price' && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowBulkModal(true)}>
                <FiPlus /> Bulk Update Rates/Availability
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="calendar-filters card">
          {calendarView === 'price' && (
            <div className="form-group" style={{ margin: 0, flex: 1, maxWidth: '320px' }}>
              <label className="form-label">Select Room to Manage</label>
              <select
                className="form-input"
                value={selectedRoomId}
                onChange={e => setSelectedRoomId(e.target.value)}
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    Room #{r.number} – {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="calendar-month-selector" style={{ marginRight: calendarView === 'timeline' ? 'auto' : '' }}>
            <button className="btn btn-outline month-nav-btn" onClick={handlePrevMonth}>
              <FiChevronLeft />
            </button>
            <div className="month-name">
              <FiCalendar /> {monthNames[month]} {year}
            </div>
            <button className="btn btn-outline month-nav-btn" onClick={handleNextMonth}>
              <FiChevronRight />
            </button>
          </div>
        </div>

        {/* Main Grid */}
        {calendarView === 'timeline' ? (
          <div className="calendar-timeline-card card" style={{ overflowX: 'auto', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="timeline-legend" style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#d1fae5', border: '1px solid #10b981', display: 'inline-block' }} /> Confirmed
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#dbeafe', border: '1px solid #3b82f6', display: 'inline-block' }} /> Checked-in
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#f3f4f6', border: '1px solid #9ca3af', display: 'inline-block' }} /> Checked-out
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#fef3c7', border: '1px solid #f59e0b', display: 'inline-block' }} /> Pending
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', border: '1px solid var(--border-color)', minWidth: '180px', background: '#f8fafc', fontWeight: 'bold' }}>Room</th>
                  {Array.from({ length: totalDays }).map((_, idx) => {
                    const dayNum = idx + 1;
                    return (
                      <th key={dayNum} style={{ padding: '8px', border: '1px solid var(--border-color)', minWidth: '38px', background: '#f8fafc', fontWeight: 'bold' }}>
                        {dayNum}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id}>
                    <td style={{ textAlign: 'left', padding: '12px 16px', border: '1px solid var(--border-color)', fontWeight: 'bold', background: '#fff' }}>
                      Room {room.number}
                      <div style={{ fontSize: '10px', color: 'var(--gray-500)', fontWeight: 'normal', marginTop: '2px' }}>{room.name}</div>
                    </td>
                    {Array.from({ length: totalDays }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const booking = getBookingForRoomDate(room, formattedDate);
                      
                      let style = { padding: '4px', border: '1px solid var(--border-color)', height: '50px', verticalAlign: 'middle', background: '#fff', transition: 'all 0.2s' };
                      let content = null;
                      
                      if (booking) {
                        const checkInDate = new Date(booking.checkIn);
                        const isStart = checkInDate.getDate() === dayNum && checkInDate.getMonth() === month && checkInDate.getFullYear() === year;
                        
                        const statusColorsMap = {
                          Confirmed: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
                          Pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
                          'Checked-in': { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
                          'Checked-out': { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
                        };
                        const colors = statusColorsMap[booking.status] || { bg: '#e2e8f0', text: '#334155', border: '#cbd5e1' };
                        
                        style.background = colors.bg;
                        style.color = colors.text;
                        style.fontWeight = 'bold';
                        
                        if (isStart) {
                          content = (
                            <div 
                              style={{ 
                                whiteSpace: 'nowrap', 
                                textOverflow: 'ellipsis', 
                                overflow: 'hidden', 
                                maxWidth: '100px', 
                                margin: '0 auto', 
                                cursor: 'pointer',
                                padding: '4px 6px',
                                background: '#fff',
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                              }} 
                              title={`حجز ${booking.guest || ''}\nوصول: ${booking.checkIn || ''}\nمغادرة: ${booking.checkOut || ''}`}
                            >
                              👤 {(booking.guest && typeof booking.guest === 'string') ? booking.guest.split(' ')[0] : 'Guest'}
                            </div>
                          );
                        } else {
                          content = <span style={{ opacity: 0.4 }}>•</span>;
                        }
                      }
                      
                      return (
                        <td key={dayNum} style={style}>
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="calendar-layout-container">
          <div className="calendar-grid-card card">
            {/* Days of week */}
            <div className="weekday-header">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="weekday">{d}</div>
              ))}
            </div>

            {/* Dates grid */}
            <div className="dates-grid">
              {/* Prev Month Days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => {
                const dayVal = prevMonthTotalDays - firstDayIndex + i + 1;
                return (
                  <div key={`prev-${i}`} className="date-cell other-month">
                    <span className="date-number">{dayVal}</span>
                  </div>
                );
              })}

              {/* Current Month Days */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayVal = i + 1;
                const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;
                const price = getRoomPriceForDate(formattedDate, selectedRoom ? selectedRoom.price : 150);
                const isClosed = getRoomClosedForDate(formattedDate);
                const isSelectStart = rangeStart === formattedDate;
                const isSelectEnd = rangeEnd === formattedDate;
                const isHighlighted = isInRange(formattedDate);

                return (
                  <div
                    key={`curr-${i}`}
                    className={`date-cell current-month ${isClosed ? 'closed' : 'open'} ${isSelectStart ? 'active' : ''} ${isSelectEnd ? 'active' : ''} ${isHighlighted ? 'range-selected' : ''}`}
                    onMouseDown={() => handleDayMouseDown(formattedDate)}
                    onMouseEnter={() => handleDayMouseEnter(formattedDate)}
                    onMouseUp={() => handleDayMouseUp(formattedDate)}
                    style={{
                      userSelect: 'none',
                      background: isHighlighted ? 'var(--gold-bg)' : '',
                      borderColor: isSelectStart || isSelectEnd ? 'var(--gold)' : ''
                    }}
                  >
                    <span className="date-number">{dayVal}</span>
                    <div className="date-info">
                      <div className="date-price">${price}</div>
                      <div className={`date-status-badge ${isClosed ? 'closed' : 'open'}`}>
                        {isClosed ? '🔴 Blocked' : '🟢 Open'}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Next Month Days */}
              {Array.from({ length: nextMonthTotalDays > 0 ? nextMonthTotalDays : 0 }).map((_, i) => {
                return (
                  <div key={`next-${i}`} className="date-cell other-month">
                    <span className="date-number">{i + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Edit Sidebar Panel */}
          <div className="calendar-edit-sidebar card">
            {rangeStart ? (
              <form onSubmit={handleSaveRange} className="calendar-edit-form">
                <h3>Edit Range Inventory</h3>
                <div className="selected-date-badge" style={{ fontSize: '11px' }}>
                  {rangeEnd ? `📍 Range: ${rangeStart} to ${rangeEnd}` : `📍 Date: ${rangeStart} (Drag/Click to select range)`}
                </div>

                <div className="form-group">
                  <label className="form-label">Price Per Night ($) *</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    required
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inventory Status</label>
                  <div className="toggle-container" style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${!editClosed ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setEditClosed(false)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <FiUnlock size={14} /> Open
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${editClosed ? 'btn-primary' : 'btn-outline'}`}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: editClosed ? 'var(--red)' : '', borderColor: editClosed ? 'var(--red)' : '' }}
                      onClick={() => setEditClosed(true)}
                    >
                      <FiLock size={14} /> Blocked
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setRangeStart(null); setRangeEnd(null); }}>Clear</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, gap: '5px' }}>
                    <FiSave /> Apply
                  </button>
                </div>
              </form>
            ) : (
              <div className="no-day-selected">
                <FiInfo size={40} className="info-icon" />
                <p><strong>Drag to select</strong> multiple days, or click on a start date then drag to an end date to update pricing for the range at once.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal card">
            <div className="admin-modal-header">
              <h3>Bulk Update Rates & Availability</h3>
              <button className="modal-close-btn" onClick={() => setShowBulkModal(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleBulkSubmit} className="admin-modal-form">
              <div className="bulk-info-alert">
                <FiAlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>Bulk update will overwrite any existing individual daily parameters in the chosen date range.</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={bulkStart}
                    onChange={e => setBulkStart(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={bulkEnd}
                    onChange={e => setBulkEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nightly Rate ($) *</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    required
                    value={bulkPrice}
                    onChange={e => setBulkPrice(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <select
                    className="form-input"
                    value={bulkClosed ? 'Blocked' : 'Open'}
                    onChange={e => setBulkClosed(e.target.value === 'Blocked')}
                  >
                    <option value="Open">🟢 Open Room (Bookable)</option>
                    <option value="Blocked">🔴 Block Room (Closed)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowBulkModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Apply Updates</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}

/**
 * ELKHALIL HOTEL — Admin Rates & Calendar Page
 * Ported from Calendar.jsx
 */

window.renderCalendarPage = function() {
  document.title = 'Rates & Calendar — Admin Panel';
  const rooms = window.getStoredRooms() || [];
  let selectedRoomId = rooms[0]?.id || '';
  
  // Date states
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth(); // 0-indexed
  let selectedDateStr = '';

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 is Sunday

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const renderCalendar = () => {
    if (!selectedRoomId) return `<div style="text-align:center;padding:40px;color:var(--gray-400);">Please add a room first.</div>`;

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const roomCal = window.getRoomCalendar(selectedRoomId) || {};
    const room = rooms.find(r => String(r.id) === String(selectedRoomId));

    let daysHtml = '';
    // Empty spots
    for (let i = 0; i < firstDay; i++) {
      daysHtml += `<div class="calendar-day empty"></div>`;
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const rateOverride = roomCal[dateStr]?.price;
      const displayPrice = rateOverride !== undefined ? rateOverride : room?.price;
      const isOverride = rateOverride !== undefined;
      const isPast = new Date(dateStr) < new Date(todayStr) && dateStr !== todayStr;
      
      let classes = 'calendar-day';
      if (dateStr === todayStr) classes += ' today';
      if (isPast) classes += ' past';
      if (isOverride) classes += ' selected'; // highlighted override

      daysHtml += `
        <div class="${classes}" onclick="selectCalendarDate('${dateStr}', ${displayPrice}, ${isOverride})" style="flex-direction:column;gap:2px;">
          <span style="font-weight:600;">${day}</span>
          <span style="font-size:10px;color:var(--gold);font-weight:600;">$${displayPrice}</span>
        </div>
      `;
    }

    return `
      <div class="calendar-month">
        <div class="calendar-header-nav">
          <button class="btn btn-outline btn-sm" onclick="navCalendarMonth(-1)">← Prev</button>
          <span class="calendar-month-label">${monthNames[currentMonth]} ${currentYear}</span>
          <button class="btn btn-outline btn-sm" onclick="navCalendarMonth(1)">Next →</button>
        </div>
        <div class="calendar-weekdays">
          ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="calendar-weekday">${d}</div>`).join('')}
        </div>
        <div class="calendar-days">
          ${daysHtml}
        </div>
        <div class="calendar-legend" style="margin-top:20px;">
          <div class="legend-item"><div class="legend-dot" style="background:var(--gold-bg);border:1.5px solid var(--gold);"></div>Today</div>
          <div class="legend-item"><div class="legend-dot" style="background:var(--gold);"></div>Custom Rate</div>
          <div class="legend-item"><div class="legend-dot" style="background:transparent;border:1px solid var(--gray-200);"></div>Base Rate</div>
        </div>
      </div>
    `;
  };

  const renderContent = () => {
    const el = document.getElementById('calendar-grid-wrap');
    if (el) {
      el.innerHTML = `
        <div class="calendar-grid">
          ${renderCalendar()}
          <div class="admin-card" id="rate-editor-card">
            <div class="admin-card-title">Update Rates</div>
            <p style="font-size:13px;color:var(--gray-500);margin-bottom:20px;">Select a date on the calendar to configure a price override or select a date range below.</p>
            <form id="rate-update-form" onsubmit="applyRateUpdate(event)">
              <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="date" class="form-input" name="startDate" id="rate-start" required>
              </div>
              <div class="form-group">
                <label class="form-label">End Date</label>
                <input type="date" class="form-input" name="endDate" id="rate-end" required>
              </div>
              <div class="form-group">
                <label class="form-label">New Price per Night ($)</label>
                <input type="number" class="form-input" name="price" id="rate-price" required min="1">
              </div>
              <div style="display:flex;gap:12px;margin-top:20px;">
                <button type="submit" class="btn btn-primary" style="flex:1;">Apply Override</button>
                <button type="button" class="btn btn-outline" onclick="clearRateOverride()" style="flex:1;">Reset to Base</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }
  };

  const contentHtml = `
    <div class="admin-page-header">
      <div class="admin-page-header-text">
        <h1>Rates & Calendar</h1>
        <p>Set custom seasonal pricing, adjust room rates, and view availability calendars</p>
      </div>
      <div>
        <select class="filter-select" id="cal-room-select" style="min-width:200px;" onchange="changeCalendarRoom(this.value)">
          ${rooms.map(r => `<option value="${r.id}">${r.name} ($${r.price}/night base)</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="calendar-grid-wrap"></div>
  `;

  window.renderAdminPage(contentHtml, '/admin/calendar');
  renderContent();

  window.changeCalendarRoom = (roomId) => {
    selectedRoomId = roomId;
    renderContent();
  };

  window.navCalendarMonth = (dir) => {
    currentMonth += dir;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    else if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderContent();
  };

  window.selectCalendarDate = (dateStr, currentPrice, isOverride) => {
    selectedDateStr = dateStr;
    const startInput = document.getElementById('rate-start');
    const endInput = document.getElementById('rate-end');
    const priceInput = document.getElementById('rate-price');
    if (startInput) startInput.value = dateStr;
    if (endInput) endInput.value = dateStr;
    if (priceInput) priceInput.value = currentPrice;
  };

  window.applyRateUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const startDate = fd.get('startDate');
    const endDate = fd.get('endDate');
    const price = Number(fd.get('price'));

    if (!startDate || !endDate || isNaN(price)) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) { alert('End date must be after or equal to start date.'); return; }

    const roomCal = window.getRoomCalendar(selectedRoomId) || {};
    
    // Loop dates
    let current = new Date(start);
    while (current <= end) {
      const ds = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}-${String(current.getDate()).padStart(2,'0')}`;
      roomCal[ds] = { ...roomCal[ds], price };
      current.setDate(current.getDate() + 1);
    }

    await window.saveRoomCalendar(selectedRoomId, roomCal);
    renderContent();
    window.showAdminToast('Rates updated successfully!', 'success');
  };

  window.clearRateOverride = async () => {
    const startVal = document.getElementById('rate-start')?.value;
    const endVal = document.getElementById('rate-end')?.value;
    if (!startVal || !endVal) { alert('Please select dates to reset.'); return; }

    const start = new Date(startVal);
    const end = new Date(endVal);
    const roomCal = window.getRoomCalendar(selectedRoomId) || {};

    let current = new Date(start);
    while (current <= end) {
      const ds = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}-${String(current.getDate()).padStart(2,'0')}`;
      if (roomCal[ds]) delete roomCal[ds].price;
      current.setDate(current.getDate() + 1);
    }

    await window.saveRoomCalendar(selectedRoomId, roomCal);
    renderContent();
    window.showAdminToast('Rates reset to base successfully!', 'success');
  };
};

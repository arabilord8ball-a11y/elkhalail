/**
 * ELKHALIL HOTEL — Admin Settings Page
 * Ported from Settings.jsx — includes Hotel Info and Theme Settings
 */

window.renderSettingsPage = function() {
  document.title = 'Settings — Admin Panel';
  let settings = window.getStoredSettings();
  let activeTab = 'hotel'; // 'hotel', 'themes'

  const renderHotelSettings = () => {
    return `
      <form id="settings-form" onsubmit="saveHotelSettings(event)">
        <div class="settings-section-title">General Hotel Information</div>
        <div class="admin-form-grid">
          <div class="form-group"><label class="form-label">Hotel Name *</label><input class="form-input" name="hotelName" value="${settings.hotelName}" required></div>
          <div class="form-group"><label class="form-label">Phone Number *</label><input class="form-input" name="phone" value="${settings.phone}" required></div>
          <div class="form-group"><label class="form-label">Email Address *</label><input class="form-input" type="email" name="email" value="${settings.email}" required></div>
          <div class="form-group"><label class="form-label">Address *</label><input class="form-input" name="address" value="${settings.address}" required></div>
          <div class="form-group"><label class="form-label">Check-in Time</label><input class="form-input" name="checkIn" value="${settings.checkIn || '14:00'}"></div>
          <div class="form-group"><label class="form-label">Check-out Time</label><input class="form-input" name="checkOut" value="${settings.checkOut || '12:00'}"></div>
        </div>

        <div class="settings-section-title" style="margin-top:var(--space-6);">Logo Configuration</div>
        <div class="admin-form-grid">
          <div class="form-group">
            <label class="form-label">Logo Type</label>
            <select class="form-input" name="logoType" id="settings-logo-type" onchange="toggleLogoInput(this.value)">
              <option value="text" ${settings.logoType === 'text' ? 'selected' : ''}>Text / Icon</option>
              <option value="url" ${settings.logoType === 'url' ? 'selected' : ''}>Image URL</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" id="logo-value-label">${settings.logoType === 'url' ? 'Logo Image URL' : 'Icon Symbol'}</label>
            <input class="form-input" name="logoValue" id="settings-logo-value" value="${settings.logoValue}">
          </div>
        </div>

        <div class="settings-section-title" style="margin-top:var(--space-6);">Social Media Links</div>
        <div class="admin-form-grid">
          <div class="form-group"><label class="form-label">WhatsApp Number</label><input class="form-input" name="whatsappNumber" value="${settings.whatsappNumber || ''}" placeholder="+201234567890"></div>
          <div class="form-group"><label class="form-label">Facebook URL</label><input class="form-input" name="facebookUrl" value="${settings.facebookUrl || ''}" placeholder="https://facebook.com/..."></div>
          <div class="form-group"><label class="form-label">Instagram URL</label><input class="form-input" name="instagramUrl" value="${settings.instagramUrl || ''}" placeholder="https://instagram.com/..."></div>
          <div class="form-group"><label class="form-label">Google Maps iframe Embed URL</label><input class="form-input" name="googleMapsUrl" value="${settings.googleMapsUrl || ''}" placeholder="https://www.google.com/maps/embed/v1/place?..."></div>
        </div>

        <div style="margin-top:30px;display:flex;justify-content:flex-end;">
          <button type="submit" class="btn btn-primary">Save Settings</button>
        </div>
      </form>
    `;
  };

  const renderThemeSettings = () => {
    return `
      <div class="settings-section-title">Visual Branding & Themes</div>
      <p style="font-size:13px;color:var(--gray-500);margin-bottom:20px;">Choose a pre-designed theme to match your branding. This changes colors, animations, borders, and fonts across the guest and admin panels instantly.</p>
      
      <div class="theme-picker-grid">
        ${Object.entries(window.THEMES).map(([id, theme]) => {
          const isSelected = window.ThemeSystem.current === id;
          return `
            <div class="theme-picker-card ${isSelected ? 'selected' : ''}" onclick="pickTheme('${id}')" id="theme-card-${id}">
              <div class="theme-picker-icon">${theme.icon}</div>
              <div class="theme-picker-name">${theme.name}</div>
              <p style="font-size:11px;color:var(--gray-400);margin-top:6px;line-height:1.4;">${theme.description}</p>
              <div class="theme-preview-swatches" style="margin-top:10px;">
                ${theme.preview.map(color => `<div class="theme-swatch" style="background:${color};"></div>`).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  const renderContent = () => {
    const pane = document.getElementById('settings-pane');
    if (!pane) return;
    if (activeTab === 'hotel') {
      pane.innerHTML = renderHotelSettings();
    } else {
      pane.innerHTML = renderThemeSettings();
    }
  };

  const contentHtml = `
    <div class="admin-page-header">
      <div class="admin-page-header-text">
        <h1>Settings</h1>
        <p>Configure general hotel information, branding parameters, social profiles, and system themes</p>
      </div>
    </div>

    <div class="settings-layout">
      <div class="settings-nav">
        <button class="settings-nav-item ${activeTab==='hotel'?'active':''}" onclick="switchSettingsTab('hotel')" id="set-tab-hotel">🏢 Hotel Profile</button>
        <button class="settings-nav-item ${activeTab==='themes'?'active':''}" onclick="switchSettingsTab('themes')" id="set-tab-themes">🎨 Themes & Styling</button>
      </div>
      <div class="settings-content" id="settings-pane">
        ${renderHotelSettings()}
      </div>
    </div>
  `;

  window.renderAdminPage(contentHtml, '/admin/settings');

  window.switchSettingsTab = (tab) => {
    activeTab = tab;
    document.getElementById('set-tab-hotel').classList.toggle('active', tab === 'hotel');
    document.getElementById('set-tab-themes').classList.toggle('active', tab === 'themes');
    renderContent();
  };

  window.toggleLogoInput = (type) => {
    const valLabel = document.getElementById('logo-value-label');
    const valInput = document.getElementById('settings-logo-value');
    if (!valLabel || !valInput) return;
    if (type === 'url') {
      valLabel.textContent = 'Logo Image URL';
      valInput.placeholder = 'https://...';
    } else {
      valLabel.textContent = 'Icon Symbol';
      valInput.placeholder = '⚜';
    }
  };

  window.saveHotelSettings = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const updated = { ...settings };
    fd.forEach((val, key) => { updated[key] = val; });

    await window.saveStoredSettings(updated);
    settings = updated;
    window.showAdminToast('Hotel profile saved successfully!', 'success');
  };

  window.pickTheme = (themeId) => {
    window.ThemeSystem.changeTheme(themeId);
    document.querySelectorAll('.theme-picker-card').forEach(card => card.classList.remove('selected'));
    document.getElementById(`theme-card-${themeId}`)?.classList.add('selected');
    window.showAdminToast(`Theme switched to "${window.THEMES[themeId].name}"!`, 'success');
  };
};

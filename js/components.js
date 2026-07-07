/**
 * ELKHALIL HOTEL — Shared Components
 * Navbar, Footer, AdminLayout, WhatsApp, BackToTop
 * Ported from React components
 */

// ── SVG Icons (replaces react-icons/fi) ─────────────────────────
const Icons = {
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41C1.52 2.3 2.29 1.16 3.41 1H6.41a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16h1z"></path></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
  twitter: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>`,
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  xsm: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  globe: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  arrowUp: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  logout: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
  grid: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  map: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`,
  creditCard: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
  barChart: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  messageSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  alertCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  lock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  wifi: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`,
  maximize: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  smile: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
};

window.Icons = Icons;

// ── Navbar Component ─────────────────────────────────────────────
function renderNavbar(currentPath = '/') {
  const settings = window.getStoredSettings();
  const isAuth = window.Auth.isAuthenticated;
  let activeGuest = null;
  try {
    const g = localStorage.getItem('elkhalil_active_guest');
    activeGuest = (g && g !== 'undefined') ? JSON.parse(g) : null;
  } catch (e) {}

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/rooms', label: 'Rooms' },
    { path: '/tours', label: 'Tours' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/offers', label: 'Offers' },
    { path: '/faq', label: 'FAQ' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
  ];

  const logoHtml = settings.logoType === 'url'
    ? `<img src="${settings.logoValue}" alt="${settings.hotelName}" style="height:36px;width:auto;object-fit:contain;">`
    : `<span class="logo-icon">${settings.logoValue || '⚜'}</span>`;

  const desktopLinks = navLinks.map(link => `
    <li>
      <a href="#${link.path}" class="nav-link ${currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path)) ? 'active' : ''}">
        ${link.label}
      </a>
    </li>
  `).join('');

  const mobileLinks = navLinks.map(link => `
    <a href="#${link.path}" class="mobile-nav-link ${currentPath === link.path ? 'active' : ''}" data-mobile-link>
      ${link.label}
    </a>
  `).join('');

  const guestLink = activeGuest && activeGuest.name ? activeGuest.name.split(' ')[0] : 'Guest Portal';
  const guestDest = activeGuest ? '/guest/dashboard' : '/guest/portal';

  return `
    <nav class="navbar" id="main-navbar">
      <div class="navbar-inner">
        <a href="#/" class="navbar-logo">
          ${logoHtml}
          <div class="logo-text">
            <span class="logo-name">${settings.hotelName}</span>
            <span class="logo-sub">Premium Stay</span>
          </div>
        </a>

        <ul class="navbar-links hide-mobile">
          ${desktopLinks}
        </ul>

        <div class="navbar-right">
          <a href="tel:${settings.phone}" class="navbar-phone hide-mobile">
            ${Icons.phone} ${settings.phone}
          </a>
          <a href="#/search" class="lang-btn" title="Search rooms & tours" style="text-decoration:none;color:inherit;">
            ${Icons.search}
          </a>
          <button class="lang-btn hide-mobile">
            ${Icons.globe} EN ${Icons.chevronDown}
          </button>
          <a href="#${guestDest}" class="navbar-phone hide-mobile" style="color:var(--gold);font-weight:600;font-size:13px;">
            ${Icons.user} ${guestLink}
          </a>
          ${isAuth ? `<a href="#/admin" class="navbar-phone hide-mobile" style="color:var(--gold);font-weight:600;font-size:13px;">${Icons.settings} Dashboard</a>` : ''}
          <a href="#/rooms" class="btn btn-primary btn-sm">BOOK NOW</a>
          <button class="mobile-menu-btn" id="mobile-menu-toggle" aria-label="Menu">
            <span class="menu-open-icon">${Icons.menu}</span>
            <span class="menu-close-icon" style="display:none">${Icons.x}</span>
          </button>
        </div>
      </div>

      <div class="mobile-menu" id="mobile-menu" style="display:none;">
        ${mobileLinks}
        <a href="#${guestDest}" class="mobile-nav-link" style="color:var(--gold);font-weight:600;" data-mobile-link>
          👤 ${guestLink}
        </a>
        ${isAuth ? `<a href="#/admin" class="mobile-nav-link" style="color:var(--gold);font-weight:600;" data-mobile-link>⚙ Dashboard</a>` : ''}
        <div class="mobile-menu-footer">
          <a href="tel:${settings.phone}">${settings.phone}</a>
        </div>
      </div>
    </nav>
  `;
}

function initNavbar() {
  const btn = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.style.display !== 'none';
    menu.style.display = isOpen ? 'none' : 'flex';
    menu.style.flexDirection = 'column';
    btn.querySelector('.menu-open-icon').style.display = isOpen ? 'block' : 'none';
    btn.querySelector('.menu-close-icon').style.display = isOpen ? 'none' : 'block';
  });

  document.querySelectorAll('[data-mobile-link]').forEach(link => {
    link.addEventListener('click', () => {
      menu.style.display = 'none';
      btn.querySelector('.menu-open-icon').style.display = 'block';
      btn.querySelector('.menu-close-icon').style.display = 'none';
    });
  });
}

// ── Footer Component ─────────────────────────────────────────────
function renderFooter() {
  const settings = window.getStoredSettings();
  const logoHtml = settings.logoType === 'url'
    ? `<img src="${settings.logoValue}" alt="${settings.hotelName}" style="height:32px;width:auto;object-fit:contain;">`
    : `<span class="logo-icon">${settings.logoValue || '⚜'}</span>`;

  const socials = [];
  if (settings.facebookUrl) socials.push(`<a href="${settings.facebookUrl}" target="_blank" rel="noopener noreferrer" class="social-btn">${Icons.facebook}</a>`);
  if (settings.instagramUrl) socials.push(`<a href="${settings.instagramUrl}" target="_blank" rel="noopener noreferrer" class="social-btn">${Icons.instagram}</a>`);
  if (settings.twitterUrl) socials.push(`<a href="${settings.twitterUrl}" target="_blank" rel="noopener noreferrer" class="social-btn">${Icons.twitter}</a>`);
  if (settings.youtubeUrl) socials.push(`<a href="${settings.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="social-btn">${Icons.youtube}</a>`);

  const services = ['Airport Transfer', 'Laundry Service', 'Room Service', 'Wake-up Call', 'Tour Assistance', 'Free Wi-Fi'];

  return `
    <footer class="footer">
      <div class="footer-main">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="#/" class="footer-logo">
                ${logoHtml}
                <span class="footer-logo-text">${settings.hotelName}</span>
              </a>
              <p class="footer-desc">Your home away from home in Egypt. Comfort, hospitality and unforgettable experiences.</p>
              <div class="footer-social">${socials.join('')}</div>
            </div>

            <div class="footer-col">
              <h4 class="footer-heading">Quick Links</h4>
              <ul class="footer-links">
                ${['/', '/rooms', '/tours', '/gallery', '/offers', '/faq', '/about', '/contact'].map((p, i) =>
                  `<li><a href="#${p}">${['Home','Rooms','Tours','Gallery','Offers','FAQ','About Us','Contact'][i]}</a></li>`
                ).join('')}
              </ul>
            </div>

            <div class="footer-col">
              <h4 class="footer-heading">Our Services</h4>
              <ul class="footer-links">
                ${services.map(s => `<li><span>${s}</span></li>`).join('')}
              </ul>
            </div>

            <div class="footer-col">
              <h4 class="footer-heading">Contact Us</h4>
              <ul class="footer-contact-list">
                <li>${Icons.mapPin} <span>${settings.address}</span></li>
                <li>${Icons.phone} <a href="tel:${settings.phone}">${settings.phone}</a></li>
                <li>${Icons.mail} <a href="mailto:${settings.email}">${settings.email}</a></li>
                <li>${Icons.clock} <span>Check-in: ${settings.checkIn}</span></li>
                <li>${Icons.clock} <span>Check-out: ${settings.checkOut}</span></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4 class="footer-heading">Newsletter</h4>
              <p class="footer-newsletter-text">Subscribe to get special offers and hotel updates.</p>
              <form class="newsletter-form" onsubmit="event.preventDefault()">
                <input type="email" placeholder="Enter your email" class="newsletter-input">
                <button type="submit" class="btn btn-primary">SUBSCRIBE</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container">
          <p>© 2026 Elkhalil Hotel. All rights reserved.</p>
          <p style="color:var(--gray-500);font-size:13px;">
            Designed by <a href="https://www.facebook.com/ElAraby360D" target="_blank" rel="noopener noreferrer" style="color:var(--primary);text-decoration:none;font-weight:600;">El Araby 360 Digital Agency</a>
          </p>
          <div class="footer-bottom-links">
            <a href="#/privacy-policy">Privacy Policy</a>
            <a href="#/terms-conditions">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>

    <button class="back-to-top" id="back-to-top" title="Back to top" aria-label="Back to top">
      ${Icons.arrowUp}
    </button>

    <a href="https://wa.me/${(settings.whatsappNumber || '+201234567890').replace(/[^0-9]/g, '')}" 
       target="_blank" rel="noopener noreferrer"
       class="whatsapp-btn" title="Chat with us on WhatsApp">
      ${Icons.whatsapp}
    </a>
  `;
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Admin Layout Component ───────────────────────────────────────
const adminSidebarItems = [
  { path: '/admin', label: 'Dashboard', icon: 'grid', exact: true },
  { path: '/admin/bookings', label: 'Bookings', icon: 'calendar' },
  { path: '/admin/rooms', label: 'Rooms', icon: 'home' },
  { path: '/admin/calendar', label: 'Rates & Calendar', icon: 'calendar' },
  { path: '/admin/guests', label: 'Guests', icon: 'users' },
  { path: '/admin/tours', label: 'Tours', icon: 'map' },
  { path: '/admin/reviews', label: 'Reviews', icon: 'star' },
  { path: '/admin/offers', label: 'Offers & Coupons', icon: 'tag' },
  { path: '/admin/payments', label: 'Payments', icon: 'creditCard' },
  { path: '/admin/reports', label: 'Reports', icon: 'barChart' },
  { path: '/admin/chat', label: 'Chat', icon: 'messageSquare' },
  { path: '/admin/settings', label: 'Settings', icon: 'settings' },
];

function renderAdminLayout(currentPath, contentHtml) {
  const user = window.Auth.user || { name: 'Admin', role: 'Super Admin' };
  const userInitial = (user.name || 'A')[0].toUpperCase();
  const userAvatar = user.name ? user.name[0].toUpperCase() : 'A';

  let notifications = [];
  try { notifications = JSON.parse(localStorage.getItem('elkhalil_admin_notifications') || '[]'); } catch (e) {}
  if (!notifications.length) {
    notifications = [
      { id: 1, text: 'New Booking by John Doe (Standard Room)', time: '5 mins ago', read: false },
      { id: 2, text: 'New Review received (5 stars) from Sarah', time: '1 hour ago', read: false },
      { id: 3, text: 'Room #103 rates updated for July', time: '2 hours ago', read: true },
    ];
  }
  const unreadCount = notifications.filter(n => !n.read).length;

  const isActive = (item) => item.exact ? currentPath === item.path : currentPath.startsWith(item.path);
  const getBadgeCount = (path) => {
    const bookings = window.getStoredBookings() || [];
    const chats = window.getStoredChats() || [];
    const reviews = window.getStoredReviews() || [];
    const payments = window.getStoredPayments() || [];
    if (path === '/admin/bookings') return bookings.filter(b => b.status === 'Pending').length;
    if (path === '/admin/chat') return chats.filter(c => c.unread > 0).length;
    if (path === '/admin/reviews') return reviews.filter(r => r.status === 'Pending').length;
    if (path === '/admin/payments') return payments.filter(p => p.status === 'Pending').length;
    return 0;
  };

  const navItems = adminSidebarItems.map(item => {
    const active = isActive(item);
    const badge = getBadgeCount(item.path);
    return `
      <a href="#${item.path}" class="admin-nav-item ${active ? 'active' : ''}">
        <span class="admin-nav-icon">${Icons[item.icon] || ''}</span>
        <span class="admin-nav-label">${item.label}</span>
        ${badge > 0 ? `<span class="admin-nav-badge">${badge}</span>` : ''}
      </a>
    `;
  }).join('');

  const notifList = notifications.length === 0
    ? `<div class="notif-empty">No new notifications</div>`
    : notifications.map(n => `
      <div class="notif-item ${!n.read ? 'unread' : ''}">
        <div style="flex:1;padding-right:12px;">
          <div class="notif-item-text">${n.text}</div>
          <div class="notif-item-time">${n.time}</div>
        </div>
        <button style="background:transparent;border:none;color:#9ca3af;cursor:pointer;padding:4px;font-size:14px;" title="Dismiss">${Icons.xsm}</button>
      </div>
    `).join('');

  return `
    <div class="admin-layout">
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="admin-sidebar-header">
          <a href="#/" class="admin-logo">
            <span class="logo-icon-admin">⬡</span>
            <div>
              <div class="admin-logo-name">Elkhalil Hotel</div>
              <div class="admin-logo-sub">Admin Panel</div>
            </div>
          </a>
        </div>

        <nav class="admin-nav">
          ${navItems}
        </nav>

        <div class="admin-sidebar-footer">
          <div class="admin-user-info">
            <div class="admin-user-avatar">${userAvatar}</div>
            <div>
              <div class="admin-user-name">${user.name || 'Admin'}</div>
              <div class="admin-user-role">${user.role || 'Super Admin'}</div>
            </div>
          </div>
          <button class="admin-logout-btn" id="admin-logout-btn">
            ${Icons.logout} Log Out
          </button>
        </div>
      </aside>

      <div class="sidebar-overlay" id="sidebar-overlay"></div>

      <div class="admin-main">
        <header class="admin-topbar">
          <button class="topbar-menu-btn" id="sidebar-toggle">${Icons.menu}</button>
          
          <div class="topbar-right">
            <div class="notif-container">
              <button class="topbar-icon-btn" id="notif-btn" title="Notifications">
                ${Icons.bell}
                ${unreadCount > 0 ? `<span class="notif-badge">${unreadCount}</span>` : ''}
              </button>
              <div class="notif-dropdown" id="notif-dropdown" style="display:none;">
                <div class="notif-header">
                  <h4>Notifications</h4>
                  <div style="display:flex;gap:8px;">
                    ${unreadCount > 0 ? `<button style="font-size:11px;background:none;border:none;color:var(--gold);cursor:pointer;" id="notif-mark-all">Mark all read</button>` : ''}
                    ${notifications.length > 0 ? `<button style="font-size:11px;background:none;border:none;color:#ef4444;cursor:pointer;" id="notif-clear-all">Clear all</button>` : ''}
                  </div>
                </div>
                <div class="notif-list">${notifList}</div>
              </div>
            </div>

            <div class="topbar-user" id="topbar-user">
              <div class="topbar-avatar">${userInitial}</div>
              <span class="topbar-user-name hide-mobile">${user.name ? user.name.split(' ')[0] : 'Admin'}</span>
              ${Icons.chevronDown}
              <div class="topbar-dropdown" id="user-dropdown" style="display:none;">
                <a href="#/admin/settings">Settings</a>
                <button id="topbar-logout-btn">Log Out</button>
              </div>
            </div>
          </div>
        </header>

        <main class="admin-content">
          ${contentHtml}
        </main>
      </div>
    </div>
  `;
}

function initAdminLayout() {
  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebarToggle && sidebar && overlay) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.style.display = 'none';
    });
  }

  // Logout
  const logoutBtn = document.getElementById('admin-logout-btn');
  const topbarLogout = document.getElementById('topbar-logout-btn');
  const doLogout = () => {
    window.Auth.logout();
    window.Router.navigate('/login');
  };
  if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
  if (topbarLogout) topbarLogout.addEventListener('click', doLogout);

  // Notifications
  const notifBtn = document.getElementById('notif-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = notifDropdown.style.display !== 'none';
      notifDropdown.style.display = isOpen ? 'none' : 'block';
    });
  }

  // User dropdown
  const topbarUser = document.getElementById('topbar-user');
  const userDropdown = document.getElementById('user-dropdown');
  if (topbarUser && userDropdown) {
    topbarUser.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = userDropdown.style.display !== 'none';
      userDropdown.style.display = isOpen ? 'none' : 'block';
    });
  }

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    if (notifDropdown) notifDropdown.style.display = 'none';
    if (userDropdown) userDropdown.style.display = 'none';
  });

  // Notification chime (Web Audio API)
  window.playNotificationChime = function() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const playNote = (freq, start, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      };
      const now = ctx.currentTime;
      playNote(523.25, now, 0.35);
      playNote(783.99, now + 0.12, 0.55);
    } catch (e) {}
  };

  // Supabase real-time notifications
  try {
    window.db.channel('admin-bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        const newB = payload.new;
        showAdminToast(`New Booking by ${newB.guest || 'Guest'} (${newB.room || 'Room'})`, 'success');
        window.playNotificationChime && window.playNotificationChime();
      }).subscribe();

    window.db.channel('admin-reviews-notif')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, (payload) => {
        const newR = payload.new;
        showAdminToast(`New Review (${newR.rating || 5}★) from ${newR.guest || 'Guest'}`, 'success');
        window.playNotificationChime && window.playNotificationChime();
      }).subscribe();
  } catch (e) {}
}

// ── Toast Notification ───────────────────────────────────────────
window.showAdminToast = function(message, type = 'success') {
  const existing = document.getElementById('admin-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'admin-toast';
  toast.className = `admin-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
};

// ── Helper: Render a page with Navbar + Footer ───────────────────
window.renderPublicPage = function(contentHtml, currentPath = '/') {
  const app = document.getElementById('app');
  app.innerHTML = renderNavbar(currentPath) + '<div id="page-content">' + contentHtml + '</div>' + renderFooter();
  initNavbar();
  initBackToTop();
  // Listen for storage changes to update footer/navbar
  window.addEventListener('storage', () => {
    const navbar = document.getElementById('main-navbar');
    if (navbar) navbar.outerHTML = renderNavbar(currentPath);
    initNavbar();
  }, { once: true });
};

// ── Helper: Render admin page ────────────────────────────────────
window.renderAdminPage = function(contentHtml, currentPath = '/admin') {
  // Check auth
  if (!window.Auth.isAuthenticated) {
    window.Router.navigate('/login');
    return;
  }
  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout(currentPath, contentHtml);
  initAdminLayout();
};

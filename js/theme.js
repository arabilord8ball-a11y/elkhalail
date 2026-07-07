/**
 * ELKHALIL HOTEL — Theme System
 * Ported from ThemeContext.jsx — supports all 6 themes
 */

const THEMES = {
  'luxury-gold': {
    id: 'luxury-gold', name: 'Luxury Gold', icon: '⚜️',
    description: 'الثيم الأصلي الفاخر بألوان الذهب والليل الداكن',
    preview: ['#C9973A', '#0F0F1A', '#FFFFFF'],
    tags: ['Classic', 'Serif Font', 'Subtle Hover', 'Dark Sidebar'],
    vars: {
      '--primary': '#C9973A', '--primary-light': '#D4A843', '--primary-dark': '#A67C2E',
      '--primary-bg': 'rgba(201, 151, 58, 0.1)', '--primary-bg-hover': 'rgba(201, 151, 58, 0.15)',
      '--primary-shadow': '0 4px 15px rgba(201, 151, 58, 0.3)',
      '--site-bg': '#FFFFFF', '--site-bg-alt': '#F9FAFB', '--site-surface': '#FFFFFF',
      '--site-border': '#E5E7EB', '--site-text': '#1F2937', '--site-text-muted': '#6B7280',
      '--site-heading': '#0A0A12', '--admin-bg': '#0A0A12', '--admin-sidebar': '#0F0F1A',
      '--admin-sidebar-text': 'rgba(255,255,255,0.7)', '--admin-sidebar-active': 'rgba(201, 151, 58, 0.15)',
      '--admin-card': '#14141F', '--admin-card-border': 'rgba(255,255,255,0.06)',
      '--font-main': "'Inter', 'Segoe UI', system-ui, sans-serif",
      '--font-heading': "'Playfair Display', Georgia, serif",
      '--radius-base': '8px', '--anim-speed': '0.3s', '--anim-timing': 'ease',
    },
    bodyClass: 'theme-luxury-gold',
  },
  'ocean-breeze': {
    id: 'ocean-breeze', name: 'Ocean Breeze', icon: '🌊',
    description: 'ثيم أزرق هادئ — زجاجي، أزرار pill، أنيميشن float',
    preview: ['#0EA5E9', '#0F172A', '#F0F9FF'],
    tags: ['Glassmorphism', 'Pill Buttons', 'Float Animation', 'Frosted Navbar'],
    vars: {
      '--primary': '#0EA5E9', '--primary-light': '#38BDF8', '--primary-dark': '#0284C7',
      '--primary-bg': 'rgba(14, 165, 233, 0.1)', '--primary-bg-hover': 'rgba(14, 165, 233, 0.18)',
      '--primary-shadow': '0 4px 15px rgba(14, 165, 233, 0.35)',
      '--site-bg': '#F0F9FF', '--site-bg-alt': '#E0F2FE', '--site-surface': '#FFFFFF',
      '--site-border': '#BAE6FD', '--site-text': '#0C4A6E', '--site-text-muted': '#0369A1',
      '--site-heading': '#0C4A6E', '--admin-bg': '#0C1A2E', '--admin-sidebar': '#0F2740',
      '--admin-sidebar-text': 'rgba(186, 230, 253, 0.8)', '--admin-sidebar-active': 'rgba(14, 165, 233, 0.2)',
      '--admin-card': '#132035', '--admin-card-border': 'rgba(14, 165, 233, 0.12)',
      '--font-main': "'Inter', system-ui, sans-serif",
      '--font-heading': "'Montserrat', Georgia, sans-serif",
      '--radius-base': '12px', '--anim-speed': '0.25s', '--anim-timing': 'ease-out',
    },
    bodyClass: 'theme-ocean-breeze',
  },
  'emerald-forest': {
    id: 'emerald-forest', name: 'Emerald Forest', icon: '🌿',
    description: 'ثيم أخضر طبيعي — كروت بحد أيسر، shimmer buttons، أنيميشن بطيء',
    preview: ['#10B981', '#052E16', '#F0FDF4'],
    tags: ['Organic Cards', 'Border-Left Accent', 'Shimmer Buttons', 'Slow Transitions'],
    vars: {
      '--primary': '#10B981', '--primary-light': '#34D399', '--primary-dark': '#059669',
      '--primary-bg': 'rgba(16, 185, 129, 0.1)', '--primary-bg-hover': 'rgba(16, 185, 129, 0.18)',
      '--primary-shadow': '0 4px 15px rgba(16, 185, 129, 0.35)',
      '--site-bg': '#F0FDF4', '--site-bg-alt': '#DCFCE7', '--site-surface': '#FFFFFF',
      '--site-border': '#BBF7D0', '--site-text': '#14532D', '--site-text-muted': '#166534',
      '--site-heading': '#052E16', '--admin-bg': '#071A10', '--admin-sidebar': '#0A2415',
      '--admin-sidebar-text': 'rgba(187, 247, 208, 0.8)', '--admin-sidebar-active': 'rgba(16, 185, 129, 0.2)',
      '--admin-card': '#0D2E1A', '--admin-card-border': 'rgba(16, 185, 129, 0.12)',
      '--font-main': "'Inter', system-ui, sans-serif",
      '--font-heading': "'Lora', Georgia, serif",
      '--radius-base': '6px', '--anim-speed': '0.4s', '--anim-timing': 'ease-in-out',
    },
    bodyClass: 'theme-emerald-forest',
  },
  'royal-purple': {
    id: 'royal-purple', name: 'Royal Purple', icon: '👑',
    description: 'ثيم بنفسجي ملكي — neon glow، bounce animations، dark mode كامل',
    preview: ['#8B5CF6', '#1E1B4B', '#FAF5FF'],
    tags: ['Neon Glow', 'Bounce Animations', 'Full Dark Admin', 'Cinzel Font'],
    vars: {
      '--primary': '#8B5CF6', '--primary-light': '#A78BFA', '--primary-dark': '#7C3AED',
      '--primary-bg': 'rgba(139, 92, 246, 0.1)', '--primary-bg-hover': 'rgba(139, 92, 246, 0.18)',
      '--primary-shadow': '0 4px 15px rgba(139, 92, 246, 0.4)',
      '--site-bg': '#FAF5FF', '--site-bg-alt': '#F3E8FF', '--site-surface': '#FFFFFF',
      '--site-border': '#DDD6FE', '--site-text': '#2E1065', '--site-text-muted': '#5B21B6',
      '--site-heading': '#1E1B4B', '--admin-bg': '#120B2E', '--admin-sidebar': '#1A1040',
      '--admin-sidebar-text': 'rgba(221, 214, 254, 0.8)', '--admin-sidebar-active': 'rgba(139, 92, 246, 0.2)',
      '--admin-card': '#1E1545', '--admin-card-border': 'rgba(139, 92, 246, 0.15)',
      '--font-main': "'Inter', system-ui, sans-serif",
      '--font-heading': "'Cinzel', Georgia, serif",
      '--radius-base': '16px', '--anim-speed': '0.35s', '--anim-timing': "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
    bodyClass: 'theme-royal-purple',
  },
  'rose-luxe': {
    id: 'rose-luxe', name: 'Rose Luxe', icon: '🌹',
    description: 'ثيم وردي فاخر — أشكال pill، كروت عائمة، خط Cormorant Garamond',
    preview: ['#F43F5E', '#4C0519', '#FFF1F2'],
    tags: ['Pill Shapes', 'Floating Cards', 'Cormorant Font', 'Soft Shadows'],
    vars: {
      '--primary': '#F43F5E', '--primary-light': '#FB7185', '--primary-dark': '#E11D48',
      '--primary-bg': 'rgba(244, 63, 94, 0.08)', '--primary-bg-hover': 'rgba(244, 63, 94, 0.15)',
      '--primary-shadow': '0 4px 15px rgba(244, 63, 94, 0.35)',
      '--site-bg': '#FFF1F2', '--site-bg-alt': '#FFE4E6', '--site-surface': '#FFFFFF',
      '--site-border': '#FECDD3', '--site-text': '#4C0519', '--site-text-muted': '#9F1239',
      '--site-heading': '#4C0519', '--admin-bg': '#1A0510', '--admin-sidebar': '#260818',
      '--admin-sidebar-text': 'rgba(254, 205, 211, 0.8)', '--admin-sidebar-active': 'rgba(244, 63, 94, 0.2)',
      '--admin-card': '#2D0A1E', '--admin-card-border': 'rgba(244, 63, 94, 0.12)',
      '--font-main': "'Inter', system-ui, sans-serif",
      '--font-heading': "'Cormorant Garamond', Georgia, serif",
      '--radius-base': '20px', '--anim-speed': '0.3s', '--anim-timing': 'ease',
    },
    bodyClass: 'theme-rose-luxe',
  },
  'midnight-slate': {
    id: 'midnight-slate', name: 'Midnight Slate', icon: '🌙',
    description: 'ثيم رمادي احترافي — flat design، حواف حادة، أسرع الأنيميشنات',
    preview: ['#64748B', '#0F172A', '#F8FAFC'],
    tags: ['Flat Design', 'Sharp Corners', 'Corporate Style', 'Fast Transitions'],
    vars: {
      '--primary': '#64748B', '--primary-light': '#94A3B8', '--primary-dark': '#475569',
      '--primary-bg': 'rgba(100, 116, 139, 0.1)', '--primary-bg-hover': 'rgba(100, 116, 139, 0.18)',
      '--primary-shadow': '0 4px 15px rgba(100, 116, 139, 0.3)',
      '--site-bg': '#F8FAFC', '--site-bg-alt': '#F1F5F9', '--site-surface': '#FFFFFF',
      '--site-border': '#CBD5E1', '--site-text': '#0F172A', '--site-text-muted': '#475569',
      '--site-heading': '#0F172A', '--admin-bg': '#0A0F1A', '--admin-sidebar': '#0F1729',
      '--admin-sidebar-text': 'rgba(203, 213, 225, 0.8)', '--admin-sidebar-active': 'rgba(100, 116, 139, 0.2)',
      '--admin-card': '#141E2E', '--admin-card-border': 'rgba(100, 116, 139, 0.12)',
      '--font-main': "'Inter', system-ui, sans-serif",
      '--font-heading': "'Space Grotesk', Georgia, sans-serif",
      '--radius-base': '4px', '--anim-speed': '0.2s', '--anim-timing': 'ease-out',
    },
    bodyClass: 'theme-midnight-slate',
  },
};

const DEFAULT_THEME = 'luxury-gold';

const ThemeSystem = {
  current: localStorage.getItem('elkhalil_theme') || DEFAULT_THEME,
  themes: THEMES,

  applyTheme(id) {
    const theme = THEMES[id] || THEMES[DEFAULT_THEME];
    const root = document.documentElement;

    Object.entries(theme.vars).forEach(([key, value]) => root.style.setProperty(key, value));

    Object.values(THEMES).forEach(t => document.body.classList.remove(t.bodyClass));
    document.body.classList.add(theme.bodyClass);

    // Legacy bridge vars
    root.style.setProperty('--gold', theme.vars['--primary']);
    root.style.setProperty('--gold-light', theme.vars['--primary-light']);
    root.style.setProperty('--gold-dark', theme.vars['--primary-dark']);
    root.style.setProperty('--gold-bg', theme.vars['--primary-bg']);
    root.style.setProperty('--gold-bg-hover', theme.vars['--primary-bg-hover']);
    root.style.setProperty('--shadow-gold', theme.vars['--primary-shadow']);
    root.style.setProperty('--font-main', theme.vars['--font-main']);
    root.style.setProperty('--font-heading', theme.vars['--font-heading']);
    root.style.setProperty('--radius-md', theme.vars['--radius-base']);
    root.style.setProperty('--transition', `all ${theme.vars['--anim-speed']} ${theme.vars['--anim-timing']}`);
    root.style.setProperty('--transition-slow', `all calc(${theme.vars['--anim-speed']} * 1.5) ${theme.vars['--anim-timing']}`);
  },

  changeTheme(id) {
    if (!THEMES[id]) return;
    this.current = id;
    localStorage.setItem('elkhalil_theme', id);
    this.applyTheme(id);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { themeId: id } }));
  },

  init() {
    this.applyTheme(this.current);
  }
};

window.ThemeSystem = ThemeSystem;
window.THEMES = THEMES;
ThemeSystem.init();

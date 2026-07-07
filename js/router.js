/**
 * ELKHALIL HOTEL — SPA Router
 * Hash-based routing for file:// compatibility
 * Supports History API with hash fallback
 */

const Router = {
  routes: {},
  currentPath: '/',

  // Register a route handler
  on(path, handler) {
    this.routes[path] = handler;
    return this;
  },

  // Navigate to a path
  navigate(path, pushState = true) {
    // Normalize path
    path = path || '/';
    if (!path.startsWith('/')) path = '/' + path;

    this.currentPath = path;

    if (pushState && window.history && window.history.pushState) {
      window.history.pushState({ path }, '', '#' + path);
    }

    window.scrollTo(0, 0);
    this._dispatch(path);
    this._updateNavLinks(path);
  },

  // Handle back/forward
  _onPopState(e) {
    const path = e.state?.path || this._getPathFromHash();
    Router.currentPath = path;
    Router._dispatch(path);
    Router._updateNavLinks(path);
    window.scrollTo(0, 0);
  },

  _getPathFromHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#/')) return hash.slice(1);
    return '/';
  },

  // Dispatch to matching route
  _dispatch(path) {
    // Try exact match first
    if (this.routes[path]) {
      this.routes[path](path, {});
      return;
    }

    // Try dynamic segments
    for (const pattern of Object.keys(this.routes)) {
      const params = this._matchRoute(pattern, path);
      if (params !== null) {
        this.routes[pattern](path, params);
        return;
      }
    }

    // 404
    if (this.routes['*']) {
      this.routes['*'](path, {});
    } else {
      document.getElementById('app').innerHTML = '<div style="padding:100px;text-align:center;"><h1>Page Not Found</h1><a href="#/">Go Home</a></div>';
    }
  },

  // Match route patterns like /rooms/:slug
  _matchRoute(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  },

  // Update active nav links
  _updateNavLinks(path) {
    document.querySelectorAll('.nav-link, .mobile-nav-link, .admin-nav-item').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (!href) return;
      const linkPath = href.startsWith('#') ? href.slice(1) : href;
      if (linkPath === path || (linkPath !== '/' && path.startsWith(linkPath))) {
        link.classList.add('active');
      } else if (linkPath === '/' && path === '/') {
        link.classList.add('active');
      }
    });
  },

  // Initialize router
  init() {
    window.addEventListener('popstate', this._onPopState.bind(this));

    // Intercept all link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('https://wa.me')) return;

      if (href.startsWith('#/') || href.startsWith('/')) {
        e.preventDefault();
        const path = href.startsWith('#/') ? href.slice(1) : href;
        this.navigate(path);
      }
    });

    // Load initial route
    const initialPath = this._getPathFromHash();
    this.currentPath = initialPath;
    this._dispatch(initialPath);
    this._updateNavLinks(initialPath);
  },

  // Helper: get query params from URL
  getQueryParams() {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex === -1) return {};
    const queryString = hash.slice(queryIndex + 1);
    const params = {};
    new URLSearchParams(queryString).forEach((value, key) => { params[key] = value; });
    return params;
  }
};

window.Router = Router;

// Helper: navigate programmatically
window.navigateTo = function(path) {
  Router.navigate(path);
};

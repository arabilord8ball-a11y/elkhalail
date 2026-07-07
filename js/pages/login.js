/**
 * ELKHALIL HOTEL — Login Page
 * Ported from Login.jsx
 */

window.renderLoginPage = function() {
  // Redirect if already authenticated
  if (window.Auth.isAuthenticated) {
    window.Router.navigate('/admin');
    return;
  }

  const html = `
    <div class="login-page">
      <div class="login-bg">
        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80" alt="Hotel Background">
      </div>
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <a href="#/" class="login-logo">
              <span class="logo-icon-login">⬡</span>
              <h2>Elkhalil Hotel</h2>
            </a>
            <p>Admin Portal Authentication</p>
          </div>

          <div id="login-error" style="display:none;" class="login-error">
            ${window.Icons.alertCircle}
            <span id="login-error-msg">Invalid username or password.</span>
          </div>

          <form id="login-form" class="login-form" onsubmit="handleLoginSubmit(event)">
            <div class="form-group">
              <label class="form-label">Username</label>
              <div class="input-with-icon">
                <span class="input-icon">${window.Icons.user}</span>
                <input type="text" class="form-input" id="login-username" placeholder="Enter admin username" required autocomplete="username">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-with-icon">
                <span class="input-icon">${window.Icons.lock}</span>
                <input type="password" class="form-input" id="login-password" placeholder="Enter password" required autocomplete="current-password">
              </div>
            </div>
            <button type="submit" class="btn btn-primary login-btn" id="login-submit">
              LOG IN TO DASHBOARD
            </button>
          </form>

          <div class="login-footer">
            <a href="#/">← Back to Public Website</a>
          </div>
        </div>
      </div>
    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = html;
  document.title = 'Admin Login — Elkhalil Hotel';

  // Focus username field
  setTimeout(() => { document.getElementById('login-username')?.focus(); }, 100);
};

window.handleLoginSubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('login-username')?.value?.trim();
  const password = document.getElementById('login-password')?.value?.trim();
  const submitBtn = document.getElementById('login-submit');
  const errorDiv = document.getElementById('login-error');
  const errorMsg = document.getElementById('login-error-msg');

  if (!username || !password) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Authenticating...';
  if (errorDiv) errorDiv.style.display = 'none';

  try {
    const success = await window.Auth.login(username, password);
    if (success) {
      window.Router.navigate('/admin');
    } else {
      if (errorDiv) errorDiv.style.display = 'flex';
      if (errorMsg) errorMsg.textContent = 'Invalid username or password.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'LOG IN TO DASHBOARD';
    }
  } catch (err) {
    if (errorDiv) errorDiv.style.display = 'flex';
    if (errorMsg) errorMsg.textContent = 'Connection error. Please try again.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'LOG IN TO DASHBOARD';
  }
};

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(username, password);
    setLoading(false);
    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80" alt="Hotel Background" />
        <div className="login-overlay" />
      </div>

      <div className="login-container">
        <div className="login-card card">
          <div className="login-header">
            <Link to="/" className="login-logo">
              <span className="logo-icon-login">⬡</span>
              <h2>Elkhalil Hotel</h2>
            </Link>
            <p>Admin Portal Authentication</p>
          </div>

          {error && (
            <div className="login-error">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter admin username"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'LOG IN TO DASHBOARD'}
            </button>
          </form>

          <div className="login-footer">
            <Link to="/">← Back to Public Website</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { FiMail, FiLock, FiUser, FiPhone, FiGlobe, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { supabase } from '../../utils/supabaseClient';
import './GuestPortal.css';

const countriesList = [
  { name: 'Egypt', flag: '🇪🇬', code: 'EG', dial: '+20', minLen: 10, maxLen: 11 },
  { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA', dial: '+966', minLen: 9, maxLen: 9 },
  { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE', dial: '+971', minLen: 9, maxLen: 9 },
  { name: 'Kuwait', flag: '🇰🇼', code: 'KW', dial: '+965', minLen: 8, maxLen: 8 },
  { name: 'Qatar', flag: '🇶🇦', code: 'QA', dial: '+974', minLen: 8, maxLen: 8 },
  { name: 'Bahrain', flag: '🇧🇭', code: 'BH', dial: '+973', minLen: 8, maxLen: 8 },
  { name: 'Oman', flag: '🇴🇲', code: 'OM', dial: '+968', minLen: 8, maxLen: 8 },
  { name: 'Jordan', flag: '🇯🇴', code: 'JO', dial: '+962', minLen: 9, maxLen: 9 },
  { name: 'Lebanon', flag: '🇱🇧', code: 'LB', dial: '+961', minLen: 7, maxLen: 8 },
  { name: 'Iraq', flag: '🇮🇶', code: 'IQ', dial: '+964', minLen: 10, maxLen: 10 },
  { name: 'Yemen', flag: '🇾🇪', code: 'YE', dial: '+967', minLen: 9, maxLen: 9 },
  { name: 'Syria', flag: '🇸🇾', code: 'SY', dial: '+963', minLen: 9, maxLen: 9 },
  { name: 'Palestine', flag: '🇵🇸', code: 'PS', dial: '+970', minLen: 9, maxLen: 9 },
  { name: 'Libya', flag: '🇱🇾', code: 'LY', dial: '+218', minLen: 9, maxLen: 9 },
  { name: 'Tunisia', flag: '🇹🇳', code: 'TN', dial: '+216', minLen: 8, maxLen: 8 },
  { name: 'Algeria', flag: '🇩🇿', code: 'DZ', dial: '+213', minLen: 9, maxLen: 9 },
  { name: 'Morocco', flag: '🇲🇦', code: 'MA', dial: '+212', minLen: 9, maxLen: 9 },
  { name: 'Sudan', flag: '🇸🇩', code: 'SD', dial: '+249', minLen: 9, maxLen: 9 },
  { name: 'United States', flag: '🇺🇸', code: 'US', dial: '+1', minLen: 10, maxLen: 10 },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GB', dial: '+44', minLen: 10, maxLen: 10 },
  { name: 'Canada', flag: '🇨🇦', code: 'CA', dial: '+1', minLen: 10, maxLen: 10 },
  { name: 'Germany', flag: '🇩🇪', code: 'DE', dial: '+49', minLen: 10, maxLen: 11 },
  { name: 'France', flag: '🇫🇷', code: 'FR', dial: '+33', minLen: 9, maxLen: 9 },
  { name: 'Italy', flag: '🇮🇹', code: 'IT', dial: '+39', minLen: 10, maxLen: 10 },
  { name: 'Spain', flag: '🇪🇸', code: 'ES', dial: '+34', minLen: 9, maxLen: 9 },
  { name: 'Russia', flag: '🇷🇺', code: 'RU', dial: '+7', minLen: 10, maxLen: 10 },
  { name: 'China', flag: '🇨🇳', code: 'CN', dial: '+86', minLen: 11, maxLen: 11 },
  { name: 'Japan', flag: '🇯🇵', code: 'JP', dial: '+81', minLen: 10, maxLen: 10 },
  { name: 'India', flag: '🇮🇳', code: 'IN', dial: '+91', minLen: 10, maxLen: 10 },
  { name: 'Brazil', flag: '🇧🇷', code: 'BR', dial: '+55', minLen: 10, maxLen: 11 },
  { name: 'Turkey', flag: '🇹🇷', code: 'TR', dial: '+90', minLen: 10, maxLen: 10 },
  { name: 'Australia', flag: '🇦🇺', code: 'AU', dial: '+61', minLen: 9, maxLen: 9 },
  { name: 'Netherlands', flag: '🇳🇱', code: 'NL', dial: '+31', minLen: 9, maxLen: 9 },
  { name: 'Sweden', flag: '🇸🇪', code: 'SE', dial: '+46', minLen: 7, maxLen: 9 },
  { name: 'Switzerland', flag: '🇨🇭', code: 'CH', dial: '+41', minLen: 9, maxLen: 9 },
  { name: 'Belgium', flag: '🇧🇪', code: 'BE', dial: '+32', minLen: 9, maxLen: 9 },
  { name: 'Austria', flag: '🇦🇹', code: 'AT', dial: '+43', minLen: 10, maxLen: 13 },
  { name: 'Greece', flag: '🇬🇷', code: 'GR', dial: '+30', minLen: 10, maxLen: 10 },
  { name: 'Portugal', flag: '🇵🇹', code: 'PT', dial: '+351', minLen: 9, maxLen: 9 },
  { name: 'Ireland', flag: '🇮🇪', code: 'IE', dial: '+353', minLen: 9, maxLen: 9 },
  { name: 'Poland', flag: '🇵🇱', code: 'PL', dial: '+48', minLen: 9, maxLen: 9 },
  { name: 'Norway', flag: '🇳🇴', code: 'NO', dial: '+47', minLen: 8, maxLen: 8 },
  { name: 'Denmark', flag: '🇩🇰', code: 'DK', dial: '+45', minLen: 8, maxLen: 8 },
  { name: 'Finland', flag: '🇫🇮', code: 'FI', dial: '+358', minLen: 5, maxLen: 10 },
  { name: 'South Africa', flag: '🇿🇦', code: 'ZA', dial: '+27', minLen: 9, maxLen: 9 },
  { name: 'Nigeria', flag: '🇳🇬', code: 'NG', dial: '+234', minLen: 10, maxLen: 10 },
  { name: 'Kenya', flag: '🇰🇪', code: 'KE', dial: '+254', minLen: 9, maxLen: 10 },
  { name: 'South Korea', flag: '🇰🇷', code: 'KR', dial: '+82', minLen: 9, maxLen: 11 },
  { name: 'Singapore', flag: '🇸🇬', code: 'SG', dial: '+65', minLen: 8, maxLen: 8 },
  { name: 'Malaysia', flag: '🇲🇾', code: 'MY', dial: '+60', minLen: 9, maxLen: 10 },
  { name: 'Indonesia', flag: '🇮🇩', code: 'ID', dial: '+62', minLen: 10, maxLen: 12 },
  { name: 'Thailand', flag: '🇹🇭', code: 'TH', dial: '+66', minLen: 9, maxLen: 9 },
  { name: 'Pakistan', flag: '🇵🇰', code: 'PK', dial: '+92', minLen: 10, maxLen: 10 },
  { name: 'Bangladesh', flag: '🇧🇩', code: 'BD', dial: '+880', minLen: 10, maxLen: 10 },
  { name: 'Argentina', flag: '🇦🇷', code: 'AR', dial: '+54', minLen: 10, maxLen: 10 },
  { name: 'Mexico', flag: '🇲🇽', code: 'MX', dial: '+52', minLen: 10, maxLen: 10 },
  { name: 'Colombia', flag: '🇨🇴', code: 'CO', dial: '+57', minLen: 10, maxLen: 10 },
  { name: 'Peru', flag: '🇵🇪', code: 'PE', dial: '+51', minLen: 9, maxLen: 9 },
  { name: 'Chile', flag: '🇨🇱', code: 'CL', dial: '+56', minLen: 9, maxLen: 9 },
  { name: 'New Zealand', flag: '🇳🇿', code: 'NZ', dial: '+64', minLen: 8, maxLen: 10 },
];

function detectUserCountry(countries) {
  try {
    const lang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    const parts = lang.split('-');
    const region = parts[1] ? parts[1].toUpperCase() : '';
    
    if (region) {
      const match = countries.find(c => c.code === region);
      if (match) return match;
    }

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Cairo')) return countries.find(c => c.code === 'EG');
    if (tz.includes('Riyadh')) return countries.find(c => c.code === 'SA');
    if (tz.includes('Dubai') || tz.includes('Abu_Dhabi')) return countries.find(c => c.code === 'AE');
    if (tz.includes('London')) return countries.find(c => c.code === 'GB');
    if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles')) return countries.find(c => c.code === 'US');
    if (tz.includes('Paris')) return countries.find(c => c.code === 'FR');
    if (tz.includes('Berlin')) return countries.find(c => c.code === 'DE');
    if (tz.includes('Madrid')) return countries.find(c => c.code === 'ES');
    if (tz.includes('Rome')) return countries.find(c => c.code === 'IT');
  } catch (e) {
    console.error('Failed to auto-detect country:', e);
  }
  return countries.find(c => c.code === 'EG') || countries[0];
}

export default function GuestPortal() {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('Egypt');
  const [regDialCode, setRegDialCode] = useState('+20');
  
  // Password toggles states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in + detect user country/dial code
  useEffect(() => {
    const active = localStorage.getItem('elkhalil_active_guest');
    if (active && active !== 'undefined') {
      navigate('/guest/dashboard');
    }
    
    // Auto detect country
    const detected = detectUserCountry(countriesList);
    if (detected) {
      setRegCountry(detected.name);
      setRegDialCode(detected.dial);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .eq('password', password)
        .maybeSingle();

      setLoading(false);

      if (!error && data) {
        localStorage.setItem('elkhalil_active_guest', JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          country: data.country,
          password: data.password,
          avatar: data.avatar || data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }));
        window.dispatchEvent(new Event('guest-auth-change'));
        navigate('/guest/dashboard');
      } else {
        if (email.toLowerCase().trim() === 'guest@mail.com' && password === 'guest123') {
          const demoGuest = {
            id: 'GST-999',
            name: 'Sophia Martin',
            email: 'guest@mail.com',
            phone: '+20 100 123 4567',
            country: 'Egypt',
            avatar: 'SM'
          };
          localStorage.setItem('elkhalil_active_guest', JSON.stringify(demoGuest));
          window.dispatchEvent(new Event('guest-auth-change'));
          navigate('/guest/dashboard');
        } else {
          setError('Error: Invalid email or password. (Hint: guest@mail.com / guest123)');
        }
      }
    } catch (err) {
      setLoading(false);
      setError('Connection error. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: exists, error: checkError } = await supabase
        .from('guests')
        .select('id')
        .eq('email', regEmail.trim().toLowerCase())
        .maybeSingle();

      if (exists) {
        setLoading(false);
        setError('Error: This email address is already registered.');
        return;
      }

      // Strict Phone number length validation based on chosen country
      const cleanPhoneDigits = regPhone.replace(/\D/g, '');
      const countryConfig = countriesList.find(c => c.dial === regDialCode);
      if (countryConfig && regPhone.trim()) {
        const { minLen, maxLen, name } = countryConfig;
        if (cleanPhoneDigits.length < minLen || cleanPhoneDigits.length > maxLen) {
          setLoading(false);
          setError(`Error: Phone number for ${name} must be between ${minLen} and ${maxLen} digits.`);
          return;
        }
      }

      const initials = regName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const newGuestId = `GST-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const fullPhone = regPhone.trim() ? `${regDialCode} ${regPhone.trim()}` : 'N/A';
      
      const newGuestObj = {
        id: newGuestId,
        name: regName,
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        phone: fullPhone,
        country: regCountry,
        avatar: initials || 'G',
        bookings: [],
        joined_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        spent: 0,
        bookings_count: 0
      };

      const { error: insertError } = await supabase
        .from('guests')
        .insert(newGuestObj);

      setLoading(false);

      if (!insertError) {
        localStorage.setItem('elkhalil_active_guest', JSON.stringify(newGuestObj));
        window.dispatchEvent(new Event('guest-auth-change'));
        navigate('/guest/dashboard');
      } else {
        setError('Error registering guest: ' + insertError.message);
      }
    } catch (err) {
      setLoading(false);
      setError('Registration error. Please check your network.');
    }
  };

  return (
    <div className="guest-portal-page">
      <Navbar />
      
      <div className="guest-portal-container">
        <div className="guest-portal-card card">
          <div className="guest-portal-header">
            <h2>Guest Portal</h2>
            <p>Sign in to manage bookings, print invoices, and chat with reception</p>
          </div>

          <div className="guest-tabs">
            <button 
              className={`guest-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => { setActiveTab('login'); setError(''); }}
            >
              Sign In
            </button>
            <button 
              className={`guest-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => { setActiveTab('register'); setError(''); }}
            >
              New Account
            </button>
          </div>

          {error && (
            <div className="guest-alert-error">
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="guest-portal-form">
              <div className="guest-form-group">
                <label className="guest-label">Email Address</label>
                <div className="guest-input-wrapper">
                  <FiMail className="guest-input-icon" />
                  <input 
                    type="email" 
                    className="guest-input" 
                    placeholder="example@mail.com" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="guest-form-group">
                <label className="guest-label">Password</label>
                <div className="guest-input-wrapper">
                  <FiLock className="guest-input-icon" />
                  <input 
                    type={showLoginPassword ? 'text' : 'password'} 
                    className="guest-input guest-input-password" 
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="guest-submit-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'SIGN IN'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="guest-portal-form">
              <div className="guest-form-group">
                <label className="guest-label">Full Name *</label>
                <div className="guest-input-wrapper">
                  <FiUser className="guest-input-icon" />
                  <input 
                    type="text" 
                    className="guest-input" 
                    placeholder="Enter your full name" 
                    required 
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                  />
                </div>
              </div>

              <div className="guest-form-group">
                <label className="guest-label">Email Address *</label>
                <div className="guest-input-wrapper">
                  <FiMail className="guest-input-icon" />
                  <input 
                    type="email" 
                    className="guest-input" 
                    placeholder="example@mail.com" 
                    required 
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="guest-form-group">
                <label className="guest-label">Phone Number</label>
                <div className="phone-input-split">
                  <select 
                    className="dial-code-select" 
                    value={regDialCode} 
                    onChange={e => {
                      const dial = e.target.value;
                      setRegDialCode(dial);
                      // Sync country choice if matching dial code uniquely
                      const found = countriesList.find(c => c.dial === dial);
                      if (found) setRegCountry(found.name);
                    }}
                  >
                    {countriesList.map((c, i) => (
                      <option key={i} value={c.dial}>
                        {c.flag} {c.dial}
                      </option>
                    ))}
                  </select>
                  <div className="guest-input-wrapper phone-number-field" style={{ margin: 0 }}>
                    <FiPhone className="guest-input-icon" />
                    <input 
                      type="tel" 
                      className="guest-input" 
                      placeholder="100 000 0000" 
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="guest-form-group">
                <label className="guest-label">Country</label>
                <div className="guest-input-wrapper">
                  <span className="guest-input-flag-icon">
                    {countriesList.find(c => c.name === regCountry)?.flag || '🏳️'}
                  </span>
                  <select 
                    className="guest-input guest-input-with-flag" 
                    style={{ height: '42px', background: '#fff' }}
                    value={regCountry}
                    onChange={e => {
                      const countryName = e.target.value;
                      setRegCountry(countryName);
                      // Sync dial code
                      const found = countriesList.find(c => c.name === countryName);
                      if (found) setRegDialCode(found.dial);
                    }}
                  >
                    {countriesList.map((c, i) => (
                      <option key={i} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="guest-form-group">
                <label className="guest-label">Password *</label>
                <div className="guest-input-wrapper">
                  <FiLock className="guest-input-icon" />
                  <input 
                    type={showRegPassword ? 'text' : 'password'} 
                    className="guest-input guest-input-password" 
                    placeholder="Choose a strong password" 
                    required 
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                  >
                    {showRegPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="guest-submit-btn" disabled={loading}>
                {loading ? 'Creating account...' : 'REGISTER ACCOUNT'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
            <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>← Back to Home Page</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

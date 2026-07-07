import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStoredSettings, getStoredContactMessages, saveStoredContactMessages } from '../../utils/storage';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [settings, setSettings] = useState(() => getStoredSettings());

  useEffect(() => {
    const handleStorage = () => setSettings(getStoredSettings());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save to Supabase via reactive storage
    const messages = getStoredContactMessages();
    
    const newMsg = {
      id: 'MSG-' + Math.floor(1000 + Math.random() * 9000),
      name: form.name,
      email: form.email,
      phone: form.phone || 'N/A',
      subject: form.subject,
      message: form.message,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, newMsg];
    saveStoredContactMessages(updated);

    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div>
      <Navbar />
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src={settings.imgContactHero || "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80"} alt="Contact" />
          <div className="page-hero-overlay" />
        </div>
        <div className="container page-hero-content">
          <nav className="breadcrumb white-breadcrumb">
            <Link to="/">Home</Link><span>›</span><span>Contact</span>
          </nav>
          <h1>Contact Us</h1>
          <p>We'd love to hear from you</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-layout">
            {/* Info */}
            <div className="contact-info">
              <div className="section-tag">GET IN TOUCH</div>
              <h2 className="section-title">We're Here to Help</h2>
              <p className="section-subtitle">Have a question or need assistance? Our team is always ready to help you plan the perfect stay.</p>

              <div className="contact-items">
                {[
                  { icon: FiMapPin, title: 'Address', lines: [settings.address] },
                  { icon: FiPhone, title: 'Phone', lines: [settings.phone, '+20 100 123 4567'] },
                  { icon: FiMail, title: 'Email', lines: [settings.email, 'reservations@elkhalilhotel.com'] },
                  { icon: FiClock, title: 'Hours', lines: [`Check-in: ${settings.checkIn}`, `Check-out: ${settings.checkOut}`, 'Front Desk: 24/7'] },
                ].map((item, i) => (
                  <div key={i} className="contact-item">
                    <div className="contact-item-icon">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      {item.lines.map((line, j) => <p key={j}>{line}</p>)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Google Map Embed */}
              <div className="map-placeholder" style={{ height: '300px', padding: 0, overflow: 'hidden' }}>
                <iframe
                  title="Elkhalil Hotel Location"
                  src={settings.googleMapsUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.0963840742183!2d31.13197027581177!3d29.977287974958172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458459203a9ad3d%3A0xe543e49818817268!2sGreat%20Sphinx%20of%20Giza!5e0!3m2!1sen!2seg!4v1719999999999!5m2!1sen!2seg"}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            {/* Form */}
            <div className="contact-form-card card">
              <h3>Send Us a Message</h3>
              {sent && (
                <div className="success-banner">
                  ✅ Message sent successfully! We'll get back to you shortly.
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" placeholder="Your full name" required
                      value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" placeholder="your@email.com" required
                      value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" placeholder="+20 000 000 0000"
                      value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <select className="form-input" required value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                      <option value="">Select subject</option>
                      <option>Room Reservation</option>
                      <option>Tour Booking</option>
                      <option>General Inquiry</option>
                      <option>Complaint</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="form-input" rows={6} placeholder="How can we help you?" required
                    value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
                  <FiSend /> SEND MESSAGE
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

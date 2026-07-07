import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStoredSettings } from '../../utils/storage';
import { FiMapPin, FiPhone, FiMail, FiClock, FiStar, FiUsers, FiHome, FiAward } from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './About.css';

const team = [
  { name: 'Mohamed Elkhalil', role: 'General Manager', avatar: 'ME', desc: '15 years of experience in luxury hospitality.' },
  { name: 'Sara Ahmed', role: 'Front Desk Manager', avatar: 'SA', desc: 'Expert in guest relations and customer service.' },
  { name: 'Omar Hassan', role: 'Head Concierge', avatar: 'OH', desc: 'Your guide to the best experiences in Egypt.' },
  { name: 'Nadia Ali', role: 'Executive Chef', avatar: 'NA', desc: 'Passionate about authentic Egyptian cuisine.' },
];

export default function About() {
  const [settings, setSettings] = useState(() => getStoredSettings());

  useEffect(() => {
    const handleStorage = () => setSettings(getStoredSettings());
    handleStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div>
      <Navbar />
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src={settings.imgRoomsHero || "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80"} alt="About Us" />
          <div className="page-hero-overlay" />
        </div>
        <div className="container page-hero-content">
          <nav className="breadcrumb white-breadcrumb">
            <Link to="/">Home</Link><span>›</span><span>About Us</span>
          </nav>
          <h1>About {settings.hotelName}</h1>
          <p>Your home away from home in Egypt</p>
        </div>
      </div>

      {/* Story */}
      <section className="section">
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-img">
              <img src={settings.imgAboutStory || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=700&q=80"} alt="Hotel" />
              <div className="about-story-badge">
                <div className="about-badge-year">2009</div>
                <div className="about-badge-label">Est. Year</div>
              </div>
            </div>
            <div className="about-story-text">
              <div className="section-tag">OUR STORY</div>
              <h2 className="section-title">A Legacy of Egyptian Hospitality</h2>
              <p>Founded in 2009, Elkhalil Hotel has been welcoming guests from around the world with authentic Egyptian hospitality. Located in the heart of Giza, just minutes from the iconic Pyramids, we offer a unique blend of comfort, culture, and warmth.</p>
              <p style={{ marginTop: '16px' }}>Our mission is simple: to make every guest feel at home while providing unforgettable experiences that showcase the beauty and richness of Egypt. From our comfortable rooms to our carefully curated tours, every detail is designed with your enjoyment in mind.</p>
              <div className="about-stats-row">
                {[
                  { value: '15+', label: 'Years Experience' },
                  { value: '5000+', label: 'Happy Guests' },
                  { value: '4.7★', label: 'Average Rating' },
                  { value: '10', label: 'Rooms' },
                ].map(s => (
                  <div key={s.label} className="about-stat">
                    <div className="about-stat-value">{s.value}</div>
                    <div className="about-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section about-values-section">
        <div className="container">
          <div className="about-values-header">
            <div className="section-tag">OUR VALUES</div>
            <h2 className="section-title">What Makes Us Special</h2>
          </div>
          <div className="values-grid">
            {[
              { icon: FiHome, title: 'Comfortable Rooms', desc: 'Each room is thoughtfully designed for maximum comfort and elegance.' },
              { icon: FiUsers, title: 'Friendly Staff', desc: 'Our team is dedicated to making your stay exceptional at every moment.' },
              { icon: FiMapPin, title: 'Prime Location', desc: 'Steps away from the Pyramids and main Cairo attractions.' },
              { icon: FiAward, title: 'Quality Service', desc: 'We maintain the highest standards of service and hospitality.' },
            ].map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon">
                  <v.icon size={26} />
                </div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <div className="about-values-header">
            <div className="section-tag">OUR TEAM</div>
            <h2 className="section-title">Meet Our Staff</h2>
          </div>
          <div className="team-grid">
            {team.map((m, i) => (
              <div key={i} className="team-card card">
                <div className="team-avatar">{m.avatar}</div>
                <h3>{m.name}</h3>
                <div className="team-role">{m.role}</div>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

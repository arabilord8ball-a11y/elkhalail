import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStoredSettings } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function TermsConditions() {
  const [settings, setSettings] = useState(() => getStoredSettings());

  useEffect(() => {
    const handleStorage = () => setSettings(getStoredSettings());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div>
      <Navbar />
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src={settings.imgRoomsHero || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"} alt="Terms & Conditions" />
          <div className="page-hero-overlay" />
        </div>
        <div className="container page-hero-content">
          <nav className="breadcrumb white-breadcrumb">
            <Link to="/">Home</Link><span>›</span><span>Terms & Conditions</span>
          </nav>
          <h1>Terms & Conditions</h1>
          <p>Read the terms and rules of staying at our hotel</p>
        </div>
      </div>

      <section className="section" style={{ background: '#fafafa' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="card" style={{ padding: '40px', background: 'var(--white)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>1. Agreement to Terms</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '24px', lineHeight: '1.8' }}>
              By accessing our website and using our online reservation portal, you agree to comply with and be bound by these Terms and Conditions. These terms apply to all visitors, users, guests, and others who access or use our services at <strong>{settings.hotelName}</strong>.
            </p>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>2. Booking & Reservation Policies</h2>
            <ul style={{ color: 'var(--gray-600)', listStyleType: 'disc', paddingLeft: '20px', marginBottom: '24px', lineHeight: '1.8' }}>
              <li><strong>Reservation Guarantee:</strong> A valid credit/debit card is required to secure a reservation.</li>
              <li><strong>Rates:</strong> Rates displayed on our website are subject to currency conversion fees and local taxes unless explicitly stated otherwise.</li>
              <li><strong>Age Requirement:</strong> Guests must be at least 18 years of age to book a room and check in without a legal guardian.</li>
            </ul>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>3. Check-In & Check-Out Rules</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '12px', lineHeight: '1.8' }}>
              To ensure smooth operations, guests must adhere to our check-in and check-out timelines:
            </p>
            <ul style={{ color: 'var(--gray-600)', listStyleType: 'disc', paddingLeft: '20px', marginBottom: '24px', lineHeight: '1.8' }}>
              <li><strong>Check-in Time:</strong> From {settings.checkIn}. Guests must show a valid passport (for international guests) or national ID (for Egyptian citizens) upon arrival.</li>
              <li><strong>Check-out Time:</strong> By {settings.checkOut}. Late check-outs may incur additional fees unless pre-arranged and approved by the front desk.</li>
            </ul>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>4. Cancellation & Refund Policy</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '24px', lineHeight: '1.8' }}>
              Cancellations made up to 24 hours prior to the scheduled arrival date will receive a full refund, except for non-refundable booking promotions. Cancellations made within 24 hours of check-in, or in the case of a no-show, will be charged for the first night's stay.
            </p>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>5. Hotel Code of Conduct</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '12px', lineHeight: '1.8' }}>
              Guests are expected to respect hotel property and other guests:
            </p>
            <ul style={{ color: 'var(--gray-600)', listStyleType: 'disc', paddingLeft: '20px', marginBottom: '24px', lineHeight: '1.8' }}>
              <li><strong>Damages:</strong> Any damage caused to hotel property, furniture, or equipment will be charged directly to the guest's credit card.</li>
              <li><strong>Smoking Policy:</strong> Smoking inside non-smoking guest rooms is strictly prohibited. Dedicated outdoor smoking areas are available.</li>
              <li><strong>Disturbances:</strong> Loud noises, offensive behavior, or disturbances to other guests may result in immediate eviction from the hotel premises without a refund.</li>
            </ul>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>6. Liability Disclaimer</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '24px', lineHeight: '1.8' }}>
              <strong>{settings.hotelName}</strong> is not liable for the loss of money, jewelry, or other valuables left in guest rooms. Safety deposit boxes are available at the front desk for secure storage.
            </p>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>7. Governing Law</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '24px', lineHeight: '1.8' }}>
              These terms and conditions are governed by and construed in accordance with the laws of the Arab Republic of Egypt, and any disputes will be subject to the exclusive jurisdiction of the courts of Giza/Cairo.
            </p>

            <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '20px', marginTop: '30px', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>Last Updated: July 2026</span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStoredSettings } from '../../utils/storage';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function PrivacyPolicy() {
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
          <img src={settings.imgRoomsHero || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"} alt="Privacy Policy" />
          <div className="page-hero-overlay" />
        </div>
        <div className="container page-hero-content">
          <nav className="breadcrumb white-breadcrumb">
            <Link to="/">Home</Link><span>›</span><span>Privacy Policy</span>
          </nav>
          <h1>Privacy Policy</h1>
          <p>How we protect and manage your personal data</p>
        </div>
      </div>

      <section className="section" style={{ background: '#fafafa' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="card" style={{ padding: '40px', background: 'var(--white)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>1. Introduction</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '24px', lineHeight: '1.8' }}>
              Welcome to the Privacy Policy page of <strong>{settings.hotelName}</strong>. Your privacy is of paramount importance to us. This policy details how we collect, process, protect, and use the information you share with us when you use our website, book rooms, or stay at our hotel.
            </p>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>2. Information We Collect</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '12px', lineHeight: '1.8' }}>
              We collect information that is necessary to facilitate your reservation, check-in, and provide you with premium hospitality services:
            </p>
            <ul style={{ color: 'var(--gray-600)', listStyleType: 'disc', paddingLeft: '20px', marginBottom: '24px', lineHeight: '1.8' }}>
              <li>Personal identifiers: Full Name, email address, phone number, and physical address.</li>
              <li>Identification documents: Passport details or national ID card copy (required by local Egyptian regulations during check-in).</li>
              <li>Transaction data: Credit/debit card numbers, payment billing address, and booking histories.</li>
              <li>Preference information: Room preferences, special dietary requests, and guest feedback.</li>
            </ul>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>3. How We Use Your Data</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '12px', lineHeight: '1.8' }}>
              Your personal information is used strictly to deliver an exceptional hospitality experience:
            </p>
            <ul style={{ color: 'var(--gray-600)', listStyleType: 'disc', paddingLeft: '20px', marginBottom: '24px', lineHeight: '1.8' }}>
              <li>Processing and confirming your room reservations and special tour packages.</li>
              <li>Managing check-in, billing, and payment processing safely.</li>
              <li>Communicating with you regarding your stay, promotions, or emergency notifications.</li>
              <li>Complying with regulatory obligations and legal requirements in Egypt.</li>
            </ul>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>4. Data Security & Storage</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '24px', lineHeight: '1.8' }}>
              We implement industry-standard administrative, physical, and electronic security measures to safeguard your personal data from unauthorized access, misuse, or alteration. Online payment transactions are encrypted using secure protocols via certified payment gateways.
            </p>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>5. Sharing of Information</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '24px', lineHeight: '1.8' }}>
              We do not sell, rent, or trade your personal information to third parties. Your details are only shared with trusted partners (such as bank card processors, and authorized tour guides) as needed to complete your requested services, or with government authorities under strict compliance with Egyptian law.
            </p>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark-600)', marginBottom: '16px' }}>6. Your Rights</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '24px', lineHeight: '1.8' }}>
              You have the right to request access to the personal data we hold about you, request corrections to any inaccuracies, or request deletion of non-regulatory information. You can reach out directly to us at <strong>{settings.email}</strong> or call <strong>{settings.phone}</strong> for any queries.
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

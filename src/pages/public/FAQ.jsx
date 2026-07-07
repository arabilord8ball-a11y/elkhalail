import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { FiSearch, FiChevronDown, FiPhone, FiMail } from 'react-icons/fi';
import { getStoredSettings, getStoredFaqs } from '../../utils/storage';
import './NewPages.css';

const DEFAULT_FAQS = [
  { id: 1, category: 'Booking', question: 'How do I make a reservation?', answer: 'You can book directly through our website by selecting your room, choosing dates, and completing the checkout process. You can also call us or send an email.' },
  { id: 2, category: 'Booking', question: 'Can I modify or cancel my booking?', answer: 'Yes. You can modify or cancel your booking up to 24 hours before check-in through your guest portal, or by contacting us directly. Cancellation policies may apply.' },
  { id: 3, category: 'Payment', question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, bank transfer, and cash on arrival. All online payments are secured with SSL encryption.' },
  { id: 4, category: 'Payment', question: 'Is there a deposit required?', answer: 'A deposit of 20% of the total booking amount may be required for reservations longer than 3 nights. This will be communicated at the time of booking.' },
  { id: 5, category: 'Check-in', question: 'What are the check-in and check-out times?', answer: 'Standard check-in is at 2:00 PM and check-out is at 12:00 PM (noon). Early check-in and late check-out may be available upon request, subject to availability.' },
  { id: 6, category: 'Check-in', question: 'Is airport transfer available?', answer: 'Yes, we offer airport transfer services. Please inform us of your flight details at least 24 hours in advance and we will arrange transportation to and from the airport.' },
  { id: 7, category: 'Rooms', question: 'Do the rooms have Wi-Fi?', answer: 'Yes, all rooms have complimentary high-speed Wi-Fi included. The connection is available throughout the hotel including common areas.' },
  { id: 8, category: 'Rooms', question: 'Are pets allowed?', answer: 'We are sorry, but we do not allow pets in our hotel rooms or common areas to ensure a comfortable stay for all guests.' },
  { id: 9, category: 'Rooms', question: 'Is breakfast included?', answer: 'Breakfast availability depends on your chosen package. Some room rates include breakfast. Please check your booking details or contact us to add breakfast to your stay.' },
  { id: 10, category: 'Tours', question: 'What tours do you offer?', answer: 'We offer a variety of tours including the Pyramids of Giza & Sphinx, Cairo City Tour, Nile Dinner Cruise, Egyptian Museum, and day trips to Luxor and Aswan. Check our Tours page for full details.' },
  { id: 11, category: 'Tours', question: 'Can I book a tour without staying at the hotel?', answer: 'Yes! Our tours are open to all guests, not just hotel residents. Simply visit our Tours page and book your preferred tour.' },
  { id: 12, category: 'Facilities', question: 'What facilities are available?', answer: 'Our hotel features free Wi-Fi, 24/7 reception, daily housekeeping, room service, a shared lounge, garden, terrace, free private parking, and tour desk services.' },
];

const CATEGORIES = ['All', 'Booking', 'Payment', 'Check-in', 'Rooms', 'Tours', 'Facilities'];

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState(() => getStoredSettings());

  useEffect(() => {
    document.title = 'FAQ | Elkhalil Hotel';
    // Load FAQs from storage (admin-managed) or use defaults
    const stored = getStoredFaqs();
    setFaqs(stored && stored.length > 0 ? stored : DEFAULT_FAQS);

    // Also listen for future storage changes (reactive sync)
    const handleSync = () => {
      const updated = getStoredFaqs();
      setFaqs(updated && updated.length > 0 ? updated : DEFAULT_FAQS);
      setSettings(getStoredSettings());
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const filtered = faqs.filter(f => {
    const matchCat = category === 'All' || f.category === category;
    const matchSearch = !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <div className="faq-page">
      <Navbar />

      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80" alt="FAQ" />
          <div className="page-hero-overlay" />
        </div>
        <div className="container page-hero-content">
          <nav className="breadcrumb white-breadcrumb">
            <Link to="/">Home</Link><span>›</span><span>FAQ</span>
          </nav>
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about your stay</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Search */}
          <div className="faq-search-box">
            <FiSearch className="faq-search-icon" />
            <input
              className="faq-search-input"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="faq-categories">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`faq-cat-btn ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          {filtered.length === 0 ? (
            <div className="faq-no-results">
              🔍 No questions found. Try a different search term.
            </div>
          ) : (
            <div className="faq-list">
              {filtered.map(faq => (
                <div key={faq.id} className={`faq-item ${openId === faq.id ? 'open' : ''}`}>
                  <button className="faq-question" onClick={() => toggle(faq.id)}>
                    <span className="faq-q-text">{faq.question}</span>
                    <FiChevronDown className="faq-chevron" />
                  </button>
                  <div className="faq-answer">
                    <div className="faq-answer-inner">{faq.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="faq-cta">
            <h3>Still Have Questions?</h3>
            <p>Our team is here to help you 24/7. Reach out and we'll get back to you shortly.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn" style={{ background: '#fff', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiMail /> Send a Message
              </Link>
              <a href={`tel:${settings.phone}`} className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiPhone /> {settings.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

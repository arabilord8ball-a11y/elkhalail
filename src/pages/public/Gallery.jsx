import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getStoredSettings, getStoredGallery } from '../../utils/storage';
import './NewPages.css';

const DEFAULT_GALLERY = [
  { id: 1, url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', title: 'Hotel Exterior', category: 'Exterior' },
  { id: 2, url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', title: 'Deluxe Room', category: 'Rooms' },
  { id: 3, url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', title: 'Hotel Lobby', category: 'Lobby' },
  { id: 4, url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80', title: 'Superior Room', category: 'Rooms' },
  { id: 5, url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80', title: 'Pool Area', category: 'Pool' },
  { id: 6, url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', title: 'Restaurant', category: 'Dining' },
  { id: 7, url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80', title: 'Family Room', category: 'Rooms' },
  { id: 8, url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80', title: 'Pyramids View', category: 'Exterior' },
  { id: 9, url: 'https://images.unsplash.com/photo-1551882547-ff40c4a49af8?w=800&q=80', title: 'Hotel Terrace', category: 'Exterior' },
  { id: 10, url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80', title: 'Bathroom', category: 'Rooms' },
  { id: 11, url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80', title: 'Hotel Bar', category: 'Dining' },
  { id: 12, url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', title: 'Garden', category: 'Exterior' },
];

const CATEGORIES = ['All', 'Rooms', 'Exterior', 'Lobby', 'Pool', 'Dining'];

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null); // index of open image
  const [settings, setSettings] = useState(() => getStoredSettings());

  useEffect(() => {
    document.title = 'Gallery | Elkhalil Hotel';
    const stored = getStoredGallery();
    setImages(stored && stored.length > 0 ? stored : DEFAULT_GALLERY);

    const handleSync = () => {
      const updated = getStoredGallery();
      setImages(updated && updated.length > 0 ? updated : DEFAULT_GALLERY);
      setSettings(getStoredSettings());
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const filtered = category === 'All' ? images : images.filter(img => img.category === category);

  const openLightbox = (idx) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);

  const prevImg = useCallback(() => {
    setLightbox(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
  }, [filtered.length]);

  const nextImg = useCallback(() => {
    setLightbox(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
  }, [filtered.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prevImg();
      if (e.key === 'ArrowRight') nextImg();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, prevImg, nextImg]);

  return (
    <div className="gallery-page">
      <Navbar />

      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src={images[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80'} alt="Gallery" />
          <div className="page-hero-overlay" />
        </div>
        <div className="container page-hero-content">
          <nav className="breadcrumb white-breadcrumb">
            <Link to="/">Home</Link><span>›</span><span>Gallery</span>
          </nav>
          <h1>Our Gallery</h1>
          <p>A visual journey through Elkhalil Hotel</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Category Filter */}
          <div className="gallery-filter-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-tab ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat === 'All' ? `All (${images.length})` : cat}
              </button>
            ))}
          </div>

          {/* Masonry Grid */}
          <div className="gallery-grid">
            {filtered.map((img, idx) => (
              <div key={img.id} className="gallery-item" onClick={() => openLightbox(idx)}>
                <img src={img.url} alt={img.title} loading="lazy" />
                <div className="gallery-item-overlay">
                  <span className="gallery-item-label">🔍 {img.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}><FiX /></button>
          <button className="lightbox-nav lightbox-prev" onClick={e => { e.stopPropagation(); prevImg(); }}>
            <FiChevronLeft />
          </button>
          <img
            className="lightbox-img"
            src={filtered[lightbox].url}
            alt={filtered[lightbox].title}
            onClick={e => e.stopPropagation()}
          />
          <button className="lightbox-nav lightbox-next" onClick={e => { e.stopPropagation(); nextImg(); }}>
            <FiChevronRight />
          </button>
          <div className="lightbox-caption">
            {filtered[lightbox].title} · {lightbox + 1} / {filtered.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

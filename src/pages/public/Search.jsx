import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { FiSearch, FiX } from 'react-icons/fi';
import { getStoredRooms, getStoredTours, getRoomCalendar } from '../../utils/storage';
import './NewPages.css';

export default function Search() {
  const getTodayPrice = (roomId, basePrice) => {
    const calendar = getRoomCalendar(roomId) || {};
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    if (calendar[dateStr] && calendar[dateStr].price !== undefined) {
      return calendar[dateStr].price;
    }
    return basePrice;
  };

  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [results, setResults] = useState({ rooms: [], tours: [] });

  useEffect(() => {
    document.title = query ? `"${query}" — Search | Elkhalil Hotel` : 'Search | Elkhalil Hotel';
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ rooms: [], tours: [] });
      return;
    }
    const q = query.toLowerCase();
    const rooms = getStoredRooms().filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q)
    );
    const tours = getStoredTours().filter(t =>
      t.name?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    );
    setResults({ rooms, tours });
  }, [query]);

  const total = results.rooms.length + results.tours.length;

  return (
    <div className="search-page">
      <Navbar />

      {/* Search Hero Bar */}
      <div className="search-hero-bar">
        <div className="container">
          <div className="search-box" style={{ maxWidth: 600, position: 'relative' }}>
            <FiSearch className="search-icon" />
            <input
              className="form-input"
              style={{ paddingLeft: 44, paddingRight: query ? 44 : 16, fontSize: 16 }}
              placeholder="Search rooms, tours, facilities..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 18 }}
              >
                <FiX />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="search-results-section">
        <div className="container">
          {!query && (
            <div className="no-results">
              <span style={{ fontSize: 48 }}>🔍</span>
              <p>Type something to search rooms, tours, and more...</p>
            </div>
          )}

          {query && total === 0 && (
            <div className="no-results">
              <span style={{ fontSize: 48 }}>😔</span>
              <p>No results found for <strong>"{query}"</strong></p>
              <Link to="/rooms" className="btn btn-primary" style={{ marginTop: 8 }}>Browse All Rooms</Link>
            </div>
          )}

          {query && total > 0 && (
            <>
              <p className="results-count" style={{ marginBottom: 32 }}>
                Found <strong>{total}</strong> results for <strong>"{query}"</strong>
              </p>

              {results.rooms.length > 0 && (
                <>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'var(--dark-600)' }}>
                    🛏️ Rooms ({results.rooms.length})
                  </h2>
                  <div className="search-results-grid" style={{ marginBottom: 40 }}>
                    {results.rooms.map(room => (
                      <Link key={room.id} to={`/rooms/${room.slug}`} className="card" style={{ textDecoration: 'none', overflow: 'hidden' }}>
                        <div style={{ height: 180, overflow: 'hidden' }}>
                          <img src={room.images?.[0] || room.image} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '16px' }}>
                          <span className="search-result-type room">Room</span>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--dark-600)', marginBottom: 6 }}>{room.name}</h3>
                          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 8 }}>{room.description?.slice(0, 80)}...</p>
                          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>${getTodayPrice(room.id, room.price)}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--gray-400)' }}>/night</span></span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {results.tours.length > 0 && (
                <>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'var(--dark-600)' }}>
                    🗺️ Tours ({results.tours.length})
                  </h2>
                  <div className="search-results-grid">
                    {results.tours.map(tour => (
                      <Link key={tour.id} to={`/tours/${tour.slug}`} className="card" style={{ textDecoration: 'none', overflow: 'hidden' }}>
                        <div style={{ height: 180, overflow: 'hidden' }}>
                          <img src={tour.images?.[0] || tour.image} alt={tour.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '16px' }}>
                          <span className="search-result-type tour">Tour</span>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--dark-600)', marginBottom: 6 }}>{tour.name}</h3>
                          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 8 }}>{tour.description?.slice(0, 80)}...</p>
                          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>${tour.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--gray-400)' }}>/person</span></span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

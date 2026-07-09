import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import BottomNav from './components/layout/BottomNav';

// Public Pages
import Home from './pages/public/Home';
import Rooms from './pages/public/Rooms';
import RoomDetail from './pages/public/RoomDetail';
import Tours from './pages/public/Tours';
import TourDetail from './pages/public/TourDetail';
import Offers from './pages/public/Offers';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsConditions from './pages/public/TermsConditions';
import GuestPortal from './pages/public/GuestPortal';
import GuestDashboard from './pages/public/GuestDashboard';
import Checkout from './pages/public/Checkout';
import BookingSuccess from './pages/public/BookingSuccess';
import FAQ from './pages/public/FAQ';
import Gallery from './pages/public/Gallery';
import Search from './pages/public/Search';
import NotFound from './pages/public/NotFound';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Bookings from './pages/admin/Bookings';
import AdminRooms from './pages/admin/Rooms';
import Calendar from './pages/admin/Calendar';
import Guests from './pages/admin/Guests';
import AdminTours from './pages/admin/Tours';
import Reviews from './pages/admin/Reviews';
import AdminOffers from './pages/admin/Offers';
import Payments from './pages/admin/Payments';
import Reports from './pages/admin/Reports';
import Chat from './pages/admin/Chat';
import Settings from './pages/admin/Settings';

// Styles
import './styles/index.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:slug" element={<RoomDetail />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:slug" element={<TourDetail />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/guest/portal" element={<GuestPortal />} />
          <Route path="/guest/dashboard" element={<GuestDashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/search" element={<Search />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/admin/rooms" element={<ProtectedRoute><AdminRooms /></ProtectedRoute>} />
          <Route path="/admin/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/admin/guests" element={<ProtectedRoute><Guests /></ProtectedRoute>} />
          <Route path="/admin/tours" element={<ProtectedRoute><AdminTours /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
          <Route path="/admin/offers" element={<ProtectedRoute><AdminOffers /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/admin/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/admin/website" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}


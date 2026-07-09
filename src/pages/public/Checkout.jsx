import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser, FiMail, FiPhone, FiGlobe, FiCreditCard, FiLock,
  FiCalendar, FiShield, FiCheckCircle, FiArrowLeft, FiUsers, FiPlus, FiBriefcase, FiAward, FiInfo, FiPrinter, FiCheck, FiChevronRight
} from 'react-icons/fi';
import { FaBed } from 'react-icons/fa';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { 
  getStoredSettings, 
  checkRoomAvailability,
  getStoredBookings,
  saveStoredBookings,
  getStoredPayments,
  saveStoredPayments,
  registerGuestBooking,
  getStoredOffers,
  getStoredTours
} from '../../utils/storage';
import './Checkout.css';

const generateBookingId = () =>
  'BKG-' + Math.floor(1000 + Math.random() * 9000);

export default function Checkout() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Traveler Details, 2: Add-ons & Extras, 3: Payment, 4: Confirmation
  const [bookingResult, setBookingResult] = useState(null);
  const settings = getStoredSettings();

  // Step 1: Traveler details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCountry, setGuestCountry] = useState('Egypt');
  const [nationality, setNationality] = useState('');
  const [passportId, setPassportId] = useState('');
  const [arrivalTime, setArrivalTime] = useState('Standard (12:00 - 16:00)');
  const [specialRequests, setSpecialRequests] = useState('');

  // Step 2: Add-ons & Extras
  const [breakfast, setBreakfast] = useState(false);
  const [airportShuttle, setAirportShuttle] = useState(false);
  const [extraBed, setExtraBed] = useState(false);
  const [selectedTours, setSelectedTours] = useState([]); // array of tour IDs
  const [allTours, setAllTours] = useState([]);

  // Step 3: Payment Details
  const [payMethod, setPayMethod] = useState('arrival'); // ONLY 'arrival' is enabled

  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discount, setDiscount] = useState(0);

  // Load pending booking details
  useEffect(() => {
    const raw = localStorage.getItem('elkhalil_pending_booking');
    if (!raw) {
      navigate('/rooms');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setPending(parsed);
    } catch (e) {
      navigate('/rooms');
      return;
    }

    // Pre-fill from logged-in guest
    const session = localStorage.getItem('elkhalil_active_guest');
    if (session) {
      try {
        const g = JSON.parse(session);
        if (g) {
          setGuestName(g.name || '');
          setGuestEmail(g.email || '');
          setGuestPhone(g.phone || '');
          setGuestCountry(g.country || 'Egypt');
        }
      } catch (e) {}
    }

    // Load tours for add-ons
    setAllTours(getStoredTours() || []);
  }, [navigate]);

  // Check URL query parameters for auto-applied promo
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('promo');
    if (code) {
      setPromoInput(code.toUpperCase());
    }
  }, []);

  const handleApplyPromo = (e) => {
    if (e) e.preventDefault();
    if (!promoInput.trim() || !pending) return;
    const code = promoInput.trim().toUpperCase();

    // Load active offers from Supabase
    const activeOffers = getStoredOffers().filter(o => o.status === 'Active');

    const found = activeOffers.find(o => o.code === code);
    if (!found) {
      alert('Invalid promo code.');
      return;
    }

    let discountVal = 0;
    const subtotal = getSubtotal();
    if (found.type === 'Percentage' || found.discount.includes('%')) {
      const pct = parseInt(found.discount) || 0;
      discountVal = Math.round((subtotal * pct) / 100);
    } else {
      discountVal = parseInt(found.discount.replace('$', '')) || 0;
    }

    setDiscount(discountVal);
    setAppliedPromo(found);
  };

  // Calculations
  const getRoomCost = () => {
    return pending ? pending.total : 0;
  };

  const getExtrasCost = () => {
    if (!pending) return 0;
    let cost = 0;
    if (breakfast) {
      cost += 15 * pending.guests * pending.nights;
    }
    if (airportShuttle) {
      cost += 25;
    }
    if (extraBed) {
      cost += 20 * pending.nights;
    }
    // Tour costs
    selectedTours.forEach(tourId => {
      const t = allTours.find(item => item.id === tourId);
      if (t) {
        cost += t.price * pending.guests;
      }
    });
    return cost;
  };

  const getSubtotal = () => {
    return getRoomCost() + getExtrasCost();
  };

  const getTotal = () => {
    return Math.max(0, getSubtotal() - discount);
  };

  const formatDate = (str) => {
    if (!str) return '—';
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
        alert('Please fill in all required guest details (*)');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const toggleTour = (tourId) => {
    if (selectedTours.includes(tourId)) {
      setSelectedTours(selectedTours.filter(id => id !== tourId));
    } else {
      setSelectedTours([...selectedTours, tourId]);
    }
  };

  const handleCompleteBooking = (e) => {
    e.preventDefault();
    if (!pending) return;

    setProcessing(true);

    // Availability validation check
    const isAvailable = checkRoomAvailability(pending.roomId, pending.checkIn, pending.checkOut);
    if (!isAvailable) {
      alert('We are sorry, but this room is already booked for your selected dates. Please choose different dates.');
      setProcessing(false);
      return;
    }

    setTimeout(async () => {
      const bookingId = generateBookingId();
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // Assemble selected extras list
      const extrasList = [];
      if (breakfast) extrasList.push('Breakfast Buffet');
      if (airportShuttle) extrasList.push('Airport Shuttle Service');
      if (extraBed) extrasList.push('Extra Bed');
      
      // Build detailed tour info for invoice
      const selectedTourDetails = selectedTours.map(tourId => {
        const t = allTours.find(item => item.id === tourId);
        if (!t) return null;
        extrasList.push(`Tour: ${t.name}`);
        return {
          id: t.id,
          name: t.name,
          price: t.price,
          guests: pending.guests,
          total: t.price * pending.guests,
        };
      }).filter(Boolean);

      // Create booking object
      const finalBooking = {
        id: bookingId,
        guest: guestName,
        email: guestEmail,
        phone: guestPhone,
        country: guestCountry,
        nationality: nationality || 'N/A',
        passportId: passportId || 'N/A',
        arrivalTime,
        specialRequests: specialRequests || 'None',
        room: pending.roomName,
        roomId: pending.roomId,
        roomSlug: pending.roomSlug,
        roomType: pending.roomType,
        checkIn: pending.checkIn,
        checkOut: pending.checkOut,
        nights: pending.nights,
        guests: pending.guests,
        price: getTotal(),
        roomPrice: getRoomCost(),
        extrasPrice: getExtrasCost(),
        pricePerNight: pending.pricePerNight,
        status: 'Confirmed',
        payment: 'Unpaid',
        paymentMethod: 'Pay at Hotel',
        createdAt: today,
        avatar: guestName[0]?.toUpperCase() || 'G',
        extras: extrasList,
        // Invoice details
        hasBreakfast: breakfast,
        hasAirportShuttle: airportShuttle,
        hasExtraBed: extraBed,
        selectedTourDetails,
        discount,
        appliedPromoCode: appliedPromo?.code || null,
      };

      // Save booking to storage
      const storedBookings = getStoredBookings();
      storedBookings.unshift(finalBooking);
      saveStoredBookings(storedBookings);

      // Save payment transaction
      const storedPayments = getStoredPayments();
      const newPayment = {
        id: 'PAY-' + Math.floor(1000 + Math.random() * 9000),
        guest: guestName,
        booking: bookingId,
        amount: getTotal(),
        method: 'Pay at Hotel',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Pending',
        avatar: guestName[0]?.toUpperCase() || 'G'
      };
      storedPayments.unshift(newPayment);
      saveStoredPayments(storedPayments);

      // Create/update guest account
      const guestId = await registerGuestBooking(bookingId, guestName, guestEmail, guestPhone, guestCountry, getTotal());

      // Auto-login guest
      const sessionObj = {
        id: guestId,
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
        country: guestCountry,
        password: 'guest123',
        joinedAt: today,
        avatar: guestName[0]?.toUpperCase() || 'G'
      };
      localStorage.setItem('elkhalil_active_guest', JSON.stringify(sessionObj));
      window.dispatchEvent(new Event('guest-auth-change'));

      // Create email log entries
      const emailLogs = JSON.parse(localStorage.getItem('elkhalil_email_logs') || '[]');
      emailLogs.unshift({
        id: Date.now(),
        guestEmail,
        guestName,
        type: 'confirm',
        subject: `Booking Confirmed – ${bookingId}`,
        body: `Dear ${guestName},\n\nYour booking at ${settings.hotelName || 'El Khalil Hotel'} has been confirmed.\n\nBooking ID: ${bookingId}\nRoom: ${pending.roomName}\nCheck-in: ${formatDate(pending.checkIn)}\nCheck-out: ${formatDate(pending.checkOut)}\nTotal: $${getTotal()}\nPayment Method: Pay at Hotel\n\nWe look forward to welcoming you!\nThe El Khalil Hotel Team`,
        sentAt: new Date().toLocaleString(),
      });
      localStorage.setItem('elkhalil_email_logs', JSON.stringify(emailLogs));

      localStorage.removeItem('elkhalil_pending_booking');
      localStorage.setItem('elkhalil_last_booking', JSON.stringify(finalBooking));

      setBookingResult(finalBooking);
      setProcessing(false);
      // Scroll to top
      window.scrollTo(0, 0);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!pending) return null;

  // Render printable Invoice Layout directly in successful state
  if (bookingResult) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="success-invoice-container">
          <div className="invoice-badge-success">
            <FiCheckCircle size={32} />
            <h2>Reservation Confirmed Successfully!</h2>
            <p>Your Booking Reference is <strong>{bookingResult.id}</strong>. A copy of this invoice has been saved to your dashboard.</p>
          </div>

          {/* Printable Professional Invoice */}
          <div className="professional-invoice" id="printable-invoice">
            <div className="invoice-header">
              <div className="invoice-logo">
                <span className="gold-seal">⚜</span>
                <div>
                  <h2>{settings.hotelName || 'EL KHALIL'}</h2>
                  <p>Boutique Hotel &amp; Pyramids View</p>
                </div>
              </div>
              <div className="invoice-meta">
                <h3>INVOICE</h3>
                <div><strong>Invoice No:</strong> INV-{bookingResult.id.split('-')[1] || '9982'}</div>
                <div><strong>Date:</strong> {bookingResult.createdAt}</div>
                <div><strong>Status:</strong> <span className="status-unpaid">Pay on Arrival</span></div>
              </div>
            </div>

            <hr className="invoice-divider" />

            <div className="invoice-billing-row">
              <div className="billing-col">
                <h4>HOTEL DETAILS</h4>
                <div><strong>{settings.hotelName || 'El Khalil Hotel'}</strong></div>
                <div>Giza Pyramids Area, Cairo, Egypt</div>
                <div>Phone: {settings.phone}</div>
                <div>Email: {settings.email}</div>
              </div>
              <div className="billing-col">
                <h4>GUEST DETAILS</h4>
                <div><strong>{bookingResult.guest}</strong></div>
                <div>Email: {bookingResult.email}</div>
                <div>Phone: {bookingResult.phone}</div>
                <div>Nationality: {bookingResult.nationality} | Country: {bookingResult.country}</div>
              </div>
            </div>

            <div className="invoice-details-table">
              <div className="table-header-row">
                <span>Description</span>
                <span className="txt-center">Qty / Nights</span>
                <span className="txt-right">Rate</span>
                <span className="txt-right">Total</span>
              </div>

              {/* Room booking item */}
              <div className="table-data-row">
                <div>
                  <strong>Room Reservation: {bookingResult.room}</strong>
                  <p className="item-sub">Check-in: {formatDate(bookingResult.checkIn)} | Check-out: {formatDate(bookingResult.checkOut)}</p>
                </div>
                <span className="txt-center">{bookingResult.nights} Nights</span>
                <span className="txt-right">${bookingResult.pricePerNight}</span>
                <span className="txt-right">${bookingResult.roomPrice}</span>
              </div>

              {/* Selected extras - use stored booking data */}
              {bookingResult.hasBreakfast && (
                <div className="table-data-row">
                  <div>
                    <strong>Breakfast Buffet</strong>
                    <p className="item-sub">Daily buffet breakfast for {bookingResult.guests} guests</p>
                  </div>
                  <span className="txt-center">{bookingResult.nights} Days</span>
                  <span className="txt-right">${15 * bookingResult.guests}</span>
                  <span className="txt-right">${15 * bookingResult.guests * bookingResult.nights}</span>
                </div>
              )}

              {bookingResult.hasAirportShuttle && (
                <div className="table-data-row">
                  <div>
                    <strong>Airport Pick-up Shuttle</strong>
                    <p className="item-sub">Private airport transfer service</p>
                  </div>
                  <span className="txt-center">1 Transfer</span>
                  <span className="txt-right">$25</span>
                  <span className="txt-right">$25</span>
                </div>
              )}

              {bookingResult.hasExtraBed && (
                <div className="table-data-row">
                  <div>
                    <strong>Extra Rollaway Bed</strong>
                    <p className="item-sub">Added to room layout</p>
                  </div>
                  <span className="txt-center">{bookingResult.nights} Nights</span>
                  <span className="txt-right">$20</span>
                  <span className="txt-right">${20 * bookingResult.nights}</span>
                </div>
              )}

              {/* Selected Tours - from stored booking data */}
              {(bookingResult.selectedTourDetails || []).map(tourItem => (
                <div className="table-data-row" key={tourItem.id}>
                  <div>
                    <strong>Tour Package: {tourItem.name}</strong>
                    <p className="item-sub">Guided excursion for {tourItem.guests} guests</p>
                  </div>
                  <span className="txt-center">{tourItem.guests} Pax</span>
                  <span className="txt-right">${tourItem.price}</span>
                  <span className="txt-right">${tourItem.total}</span>
                </div>
              ))}
            </div>

            <div className="invoice-total-section">
              <div className="total-lines">
                <div className="total-line">
                  <span>Subtotal:</span>
                  <span>${bookingResult.roomPrice + bookingResult.extrasPrice}</span>
                </div>
                {(bookingResult.discount > 0) && (
                  <div className="total-line discount-line">
                    <span>Discount Code ({bookingResult.appliedPromoCode}):</span>
                    <span>-${bookingResult.discount}</span>
                  </div>
                )}
                <div className="total-line final-total">
                  <span>Amount Due on Arrival:</span>
                  <span>${bookingResult.price}</span>
                </div>
              </div>
            </div>

            <div className="invoice-footer-notes">
              <p><strong>Note:</strong> Note: No advance payment has been processed. The total invoice amount of <strong>${bookingResult.price} USD</strong> is due in full at the hotel front desk during check-in. We accept cash (USD, EUR, EGP) and major credit cards.</p>
              <p className="thank-you-note">⚜ Thank you for choosing El Khalil Boutique Hotel! We look forward to your stay. ⚜</p>
            </div>
          </div>

          <div className="invoice-actions no-print">
            <button onClick={handlePrint} className="btn btn-primary">
              <FiPrinter /> Print Invoice / Receipt
            </button>
            <button onClick={() => navigate('/guest/dashboard')} className="btn btn-outline">
              Go to Guest Dashboard
            </button>
            <button onClick={() => navigate('/')} className="btn btn-outline">
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />

      <div className="checkout-wrapper">
        <button
          onClick={() => {
            if (currentStep > 1) {
              handlePrevStep();
            } else {
              navigate(-1);
            }
          }}
          className="back-step-btn"
        >
          <FiArrowLeft /> Back {currentStep > 1 && `to Step ${currentStep - 1}`}
        </button>

        <div className="checkout-header">
          <h1>Complete Your Reservation</h1>
          <p>Complete the 4 simple steps to secure your premium pyramids stay.</p>
        </div>

        {/* 4 Steps Indicator */}
        <div className="checkout-steps">
          <div className={`checkout-step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'done' : ''}`}>
            <div className="step-num">{currentStep > 1 ? <FiCheck size={14} /> : '1'}</div>
            <span>Traveler Details</span>
          </div>
          <div className="step-divider" />
          <div className={`checkout-step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'done' : ''}`}>
            <div className="step-num">{currentStep > 2 ? <FiCheck size={14} /> : '2'}</div>
            <span>Add-ons &amp; Extras</span>
          </div>
          <div className="step-divider" />
          <div className={`checkout-step ${currentStep === 3 ? 'active' : currentStep > 3 ? 'done' : ''}`}>
            <div className="step-num">{currentStep > 3 ? <FiCheck size={14} /> : '3'}</div>
            <span>Payment Method</span>
          </div>
          <div className="step-divider" />
          <div className={`checkout-step ${currentStep === 4 ? 'active' : ''}`}>
            <div className="step-num">4</div>
            <span>Confirmation</span>
          </div>
        </div>

        <div className="checkout-grid">
          {/* LEFT COLUMN: ACTIVE STEP FORM */}
          <div className="checkout-main-content">
            
            {/* STEP 1: TRAVELER DETAILS */}
            {currentStep === 1 && (
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <FiUser size={18} />
                  <h3>1. Traveler Details &amp; Registration</h3>
                </div>
                <div className="checkout-card-body">
                  <p className="step-instructions">Please provide your identification and contact details to register your booking.</p>
                  
                  <div className="co-form-row">
                    <div className="co-field">
                      <label>Full Name *</label>
                      <div className="input-with-icon">
                        <FiUser size={14} />
                        <input
                          type="text"
                          placeholder="e.g. John Smith"
                          required
                          value={guestName}
                          onChange={e => setGuestName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="co-field">
                      <label>Email Address *</label>
                      <div className="input-with-icon">
                        <FiMail size={14} />
                        <input
                          type="email"
                          placeholder="john@example.com"
                          required
                          value={guestEmail}
                          onChange={e => setGuestEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="co-form-row">
                    <div className="co-field">
                      <label>Phone Number *</label>
                      <div className="input-with-icon">
                        <FiPhone size={14} />
                        <input
                          type="tel"
                          placeholder="+20 100 000 0000"
                          required
                          value={guestPhone}
                          onChange={e => setGuestPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="co-field">
                      <label>Country of Residence</label>
                      <div className="input-with-icon">
                        <FiGlobe size={14} />
                        <select value={guestCountry} onChange={e => setGuestCountry(e.target.value)}>
                          {['Egypt', 'Saudi Arabia', 'UAE', 'Jordan', 'Kuwait', 'Qatar', 'Bahrain', 'Oman', 'United Kingdom', 'United States', 'Germany', 'France', 'Italy', 'Canada', 'Australia', 'Other'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <hr className="inner-divider" />

                  <div className="co-form-row">
                    <div className="co-field">
                      <label>Nationality *</label>
                      <div className="input-with-icon">
                        <FiGlobe size={14} />
                        <input
                          type="text"
                          placeholder="e.g. British / Egyptian"
                          required
                          value={nationality}
                          onChange={e => setNationality(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="co-field">
                      <label>Passport / National ID Number *</label>
                      <div className="input-with-icon">
                        <FiAward size={14} />
                        <input
                          type="text"
                          placeholder="Passport or ID Number"
                          required
                          value={passportId}
                          onChange={e => setPassportId(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="co-form-row single">
                    <div className="co-field">
                      <label>Expected Arrival Time *</label>
                      <div className="arrival-cards-grid">
                        {[
                          { time: 'Morning (08:00 - 12:00)', desc: 'Early Check-in (Subject to availability)' },
                          { time: 'Standard (12:00 - 16:00)', desc: 'Regular Check-in hours' },
                          { time: 'Evening (16:00 - 20:00)', desc: 'Late afternoon arrival' },
                          { time: 'Night (20:00 - 00:00)', desc: 'Late night Check-in' }
                        ].map(opt => (
                          <div 
                            key={opt.time}
                            className={`arrival-card-option ${arrivalTime === opt.time ? 'selected' : ''}`}
                            onClick={() => setArrivalTime(opt.time)}
                          >
                            <span className="arrival-card-time">{opt.time}</span>
                            <span className="arrival-card-desc">{opt.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="co-form-row single">
                    <div className="co-field">
                      <label>Special Requests / Room Preferences</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. High floor, quiet room, dietary restrictions, Pyramids View preferences..."
                        value={specialRequests}
                        onChange={e => setSpecialRequests(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="step-action-row">
                    <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                      Continue to Add-ons &amp; Extras <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ADD-ONS & EXTRAS */}
            {currentStep === 2 && (
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <FiBriefcase size={18} />
                  <h3>2. Enhance Your Stay (Add-ons &amp; Excursions)</h3>
                </div>
                <div className="checkout-card-body">
                  <p className="step-instructions">Add premium extras or select from our verified Pyramids tours to make your Egypt journey unforgettable.</p>

                  <h4 className="section-subtitle-checkout">Hotel Services &amp; Upgrades</h4>
                  <div className="addons-grid-vertical">
                    
                    <div className={`addon-selection-card ${breakfast ? 'selected' : ''}`} onClick={() => setBreakfast(!breakfast)}>
                      <input type="checkbox" checked={breakfast} readOnly />
                      <div className="addon-info">
                        <strong>Daily Breakfast Buffet</strong>
                        <span>Fresh traditional Egyptian and international dishes cooked fresh daily.</span>
                      </div>
                      <div className="addon-price">
                        <strong>$15</strong>
                        <span>/ person / day</span>
                      </div>
                    </div>

                    <div className={`addon-selection-card ${airportShuttle ? 'selected' : ''}`} onClick={() => setAirportShuttle(!airportShuttle)}>
                      <input type="checkbox" checked={airportShuttle} readOnly />
                      <div className="addon-info">
                        <strong>Airport Pick-up Service</strong>
                        <span>Private air-conditioned car directly from Cairo International Airport to our hotel entrance.</span>
                      </div>
                      <div className="addon-price">
                        <strong>$25</strong>
                        <span>flat rate</span>
                      </div>
                    </div>

                    <div className={`addon-selection-card ${extraBed ? 'selected' : ''}`} onClick={() => setExtraBed(!extraBed)}>
                      <input type="checkbox" checked={extraBed} readOnly />
                      <div className="addon-info">
                        <strong>Extra Bed in Room</strong>
                        <span>Add an extra single rollaway bed to your room.</span>
                      </div>
                      <div className="addon-price">
                        <strong>$20</strong>
                        <span>/ night</span>
                      </div>
                    </div>
                  </div>

                  {allTours.length > 0 && (
                    <>
                      <h4 className="section-subtitle-checkout" style={{ marginTop: '28px' }}>Recommended Guided Tours</h4>
                      <div className="tours-extras-grid">
                        {allTours.map(tour => {
                          const isSelected = selectedTours.includes(tour.id);
                          return (
                            <div 
                              key={tour.id} 
                              className={`tour-extra-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => toggleTour(tour.id)}
                            >
                              <div className="tour-extra-img">
                                <img src={tour.images?.[0] || 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=300&q=80'} alt={tour.name} />
                                <div className="tour-extra-price">${tour.price} / person</div>
                              </div>
                              <div className="tour-extra-content">
                                <h5>{tour.name}</h5>
                                <p>{tour.duration} · Guided in {tour.language}</p>
                                <button type="button" className={`btn-select-addon-tour ${isSelected ? 'added' : ''}`}>
                                  {isSelected ? '✓ Added' : '+ Add Tour'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <div className="step-action-row split">
                    <button type="button" className="btn btn-outline" onClick={handlePrevStep}>
                      Back to Guest Details
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                      Continue to Payment <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT METHOD */}
            {currentStep === 3 && (
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <FiCreditCard size={18} />
                  <h3>3. Select Payment Method</h3>
                </div>
                <div className="checkout-card-body">
                  <p className="step-instructions">Due to recent policy updates, online payment channels are currently undergoing upgrades. Please select Pay at Hotel.</p>

                  <div className="checkout-payment-methods">
                    
                    {/* Pay at Hotel (Active) */}
                    <div className="pay-method-card active-method">
                      <div className="pay-method-radio">
                        <input type="radio" checked={payMethod === 'arrival'} readOnly />
                        <div className="radio-dot" />
                      </div>
                      <div className="pay-method-info">
                        <strong>Pay at Hotel (Cash / Card on Check-in)</strong>
                        <p>No deposit needed. Reserve your room instantly and pay the full total of <strong>${getTotal()}</strong> when you arrive at our front desk.</p>
                        <span className="secured-pill">✓ Fully Guaranteed</span>
                      </div>
                    </div>

                    {/* Credit Card (Coming Soon) */}
                    <div className="pay-method-card disabled-method">
                      <div className="pay-method-radio">
                        <input type="radio" checked={false} disabled />
                        <div className="radio-dot disabled" />
                      </div>
                      <div className="pay-method-info">
                        <strong>Credit / Debit Card Online <span className="coming-soon-badge">Coming Soon</span></strong>
                        <p>Visa, Mastercard, American Express checkout online.</p>
                      </div>
                    </div>

                    {/* PayPal (Coming Soon) */}
                    <div className="pay-method-card disabled-method">
                      <div className="pay-method-radio">
                        <input type="radio" checked={false} disabled />
                        <div className="radio-dot disabled" />
                      </div>
                      <div className="pay-method-info">
                        <strong>PayPal Online Checkout <span className="coming-soon-badge">Coming Soon</span></strong>
                        <p>Pay instantly through your secure PayPal account.</p>
                      </div>
                    </div>

                    {/* Bank Transfer (Coming Soon) */}
                    <div className="pay-method-card disabled-method">
                      <div className="pay-method-radio">
                        <input type="radio" checked={false} disabled />
                        <div className="radio-dot disabled" />
                      </div>
                      <div className="pay-method-info">
                        <strong>Direct Bank Wire Transfer <span className="coming-soon-badge">Coming Soon</span></strong>
                        <p>Direct wire transfer details will be updated shortly.</p>
                      </div>
                    </div>
                  </div>

                  <div className="step-action-row split">
                    <button type="button" className="btn btn-outline" onClick={handlePrevStep}>
                      Back to Add-ons
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                      Go to Confirmation <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CONFIRMATION & REVIEW */}
            {currentStep === 4 && (
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <FiCheckCircle size={18} />
                  <h3>4. Review &amp; Confirm Booking</h3>
                </div>
                <div className="checkout-card-body">
                  <p className="step-instructions">Please double-check your booking and traveler details below before completing the reservation.</p>

                  <div className="confirmation-summary-block">
                    <h4>Guest &amp; Traveler Information</h4>
                    <div className="summary-list">
                      <div><span>Guest Name:</span> <strong>{guestName}</strong></div>
                      <div><span>Email:</span> <strong>{guestEmail}</strong></div>
                      <div><span>Phone:</span> <strong>{guestPhone}</strong></div>
                      <div><span>Country:</span> <strong>{guestCountry}</strong></div>
                      <div><span>Nationality:</span> <strong>{nationality || 'N/A'}</strong></div>
                      <div><span>Passport / ID:</span> <strong>{passportId || 'N/A'}</strong></div>
                      <div><span>Arrival Time:</span> <strong>{arrivalTime}</strong></div>
                      {specialRequests && <div className="full-width"><span>Special Requests:</span> <p>{specialRequests}</p></div>}
                    </div>
                  </div>

                  <div className="confirmation-summary-block" style={{ marginTop: '20px' }}>
                    <h4>Extras Selected</h4>
                    <div className="summary-list">
                      <div><span>Breakfast Buffet:</span> <strong>{breakfast ? 'Yes (Daily Buffet)' : 'No'}</strong></div>
                      <div><span>Airport Pickup:</span> <strong>{airportShuttle ? 'Yes' : 'No'}</strong></div>
                      <div><span>Extra Rollaway Bed:</span> <strong>{extraBed ? 'Yes' : 'No'}</strong></div>
                      {selectedTours.length > 0 && (
                        <div className="full-width">
                          <span>Guided Tours:</span>
                          <ul className="tours-confirm-list">
                            {selectedTours.map(tourId => {
                              const t = allTours.find(item => item.id === tourId);
                              return t ? <li key={tourId}>• {t.name} (${t.price} / person)</li> : null;
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="guaranteed-pay-note" style={{ display: 'flex', gap: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid #10b981', padding: '16px', borderRadius: '8px', marginTop: '24px' }}>
                    <FiShield size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-h)', lineHeight: '1.5' }}>
                      <strong>Your Booking is Guaranteed!</strong> You will pay a total of <strong>${getTotal()}</strong> at the front desk when checking in. Cancellation is free up to 24 hours before check-in.
                    </p>
                  </div>

                  <div className="step-action-row split" style={{ marginTop: '24px' }}>
                    <button type="button" className="btn btn-outline" onClick={handlePrevStep} disabled={processing}>
                      Back to Payment Method
                    </button>
                    <button type="button" className="btn btn-primary btn-booking-submit" onClick={handleCompleteBooking} disabled={processing}>
                      {processing ? (
                        <>
                          <div className="processing-spinner" /> Confirming Reservation...
                        </>
                      ) : (
                        <>
                          Confirm &amp; Book Room (${getTotal()})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: BOOKING RECAP / BASKET SUMMARY */}
          <div className="checkout-summary-column">
            <div className="co-summary-card">
              {pending.roomImage ? (
                <img src={pending.roomImage} alt={pending.roomName} className="co-summary-img" />
              ) : (
                <div className="co-summary-img-placeholder">🏨</div>
              )}
              <div className="co-summary-body">
                <span className="co-summary-type">{pending.roomType}</span>
                <h4 className="co-summary-name">{pending.roomName}</h4>

                <div className="co-summary-date-box">
                  <div className="co-date-item">
                    <span className="co-date-label">Check-in</span>
                    <span className="co-date-value">{formatDate(pending.checkIn)}</span>
                  </div>
                  <div className="co-date-item">
                    <span className="co-date-label">Check-out</span>
                    <span className="co-date-value">{formatDate(pending.checkOut)}</span>
                  </div>
                </div>

                <div className="co-summary-row">
                  <span>Nights:</span>
                  <strong>{pending.nights} Night{pending.nights > 1 ? 's' : ''}</strong>
                </div>
                <div className="co-summary-row">
                  <span>Guests:</span>
                  <strong>{pending.guests} Guest{pending.guests > 1 ? 's' : ''}</strong>
                </div>
                <div className="co-summary-row">
                  <span>Room Cost:</span>
                  <strong>${getRoomCost()}</strong>
                </div>

                {/* Extras Cost Line */}
                {getExtrasCost() > 0 && (
                  <div className="co-summary-row highlight-row">
                    <span>Selected Extras:</span>
                    <strong>+${getExtrasCost()}</strong>
                  </div>
                )}

                {/* Promo Code input */}
                <div className="checkout-promo-box">
                  <div className="promo-input-row">
                    <input
                      type="text"
                      placeholder="PROMO CODE"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                    />
                    <button type="button" onClick={handleApplyPromo}>Apply</button>
                  </div>
                  {appliedPromo && (
                    <span className="promo-success-msg">Code "{appliedPromo.code}" applied successfully!</span>
                  )}
                </div>

                <hr className="co-summary-divider" />

                {discount > 0 && (
                  <div className="co-summary-row discount-row">
                    <span>Discount:</span>
                    <strong>-${discount}</strong>
                  </div>
                )}

                <div className="co-summary-row total">
                  <span>Total Amount Due:</span>
                  <strong>${getTotal()}</strong>
                </div>

                <div className="guaranteed-seal-row">
                  <FiLock /> Secure Checkout · No Payment Due Now
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

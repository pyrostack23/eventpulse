import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, registrationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Breadcrumbs from '../components/Breadcrumbs';
import EventTicketQR from '../components/EventTicketQR';
import CreditCardPayment from '../components/CreditCardPayment';
import SuccessAnimation from '../components/SuccessAnimation';
import './EventDetailPage.css';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { joinEventRoom, leaveEventRoom, on, off } = useSocket();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    loadEvent();
    
    return () => {
      if (id) {
        leaveEventRoom(id);
      }
    };
  }, [id]);

  useEffect(() => {
    if (event) {
      joinEventRoom(event._id);
      
      // Listen for live updates
      on('event:update', handleLiveUpdate);
      
      return () => {
        off('event:update', handleLiveUpdate);
      };
    }
  }, [event]);

  const handleLiveUpdate = (update) => {
    setLiveUpdates(prev => [update, ...prev]);
    toast.info('New event update!');
  };

  const loadEvent = async () => {
    try {
      const response = await eventsAPI.getById(id);
      setEvent(response.data.event);
      setLiveUpdates(response.data.event.liveUpdates || []);
      
      // Check if user is registered
      if (isAuthenticated) {
        const registrations = await registrationsAPI.getMyRegistrations();
        const userRegistration = registrations.data.registrations?.find(
          r => r.event?._id === id
        );
        if (userRegistration) {
          setIsRegistered(true);
          setRegistration(userRegistration);
        }
      }
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to register for events');
      navigate('/login');
      return;
    }

    // If event has a price, show payment modal
    if (event.price > 0) {
      setShowPaymentModal(true);
      return;
    }

    // Free event - register directly
    setRegistering(true);
    try {
      const response = await registrationsAPI.register(event._id, {});
      setRegistration(response.data.registration);
      toast.success('Successfully registered for event!');
      setIsRegistered(true);
      loadEvent(); // Reload to update capacity
    } catch (error) {
      console.error('Error registering:', error);
      toast.error(error.response?.data?.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handlePaymentSuccess = async (payment) => {
    setPaymentDetails(payment);
    setShowPaymentModal(false);
    setRegistering(true);

    try {
      // Register for the event after successful payment
      const response = await registrationsAPI.register(event._id, {
        paymentDetails: payment
      });
      setRegistration(response.data.registration);
      setIsRegistered(true);
      setShowSuccess(true);
      loadEvent(); // Reload to update capacity
    } catch (error) {
      console.error('Error registering:', error);
      toast.error(error.response?.data?.message || 'Failed to complete registration');
    } finally {
      setRegistering(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  const getCategoryColor = (category) => {
    const colors = {
      Sports: '#f59e0b',
      Academic: '#3b82f6',
      Cultural: '#ec4899',
      Exhibition: '#8b5cf6',
      Debate: '#10b981',
      Workshop: '#f97316',
      Social: '#06b6d4',
      Other: '#6366f1'
    };
    return colors[category] || colors.Other;
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Event not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/events')}>
          Browse Events
        </button>
      </div>
    );
  }

  const availableSlots = event.capacity - event.registeredCount;
  const isAlmostFull = availableSlots <= event.capacity * 0.2 && availableSlots > 0;
  const isFull = availableSlots <= 0;

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Events', path: '/events' },
    { label: event.title, path: `/events/${event._id}` }
  ];

  return (
    <div className="event-detail-page">
      <div className="container">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      {/* Hero Section */}
      <div className="event-hero">
        <div className="event-hero-image">
          {event.image ? (
            <img src={event.image} alt={event.title} />
          ) : (
            <div className="hero-placeholder" style={{ background: getCategoryColor(event.category) }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="hero-overlay"></div>
        </div>
        
        <div className="container">
          <div className="event-hero-content">
            <div className="event-badges">
              <span className="badge badge-primary">{event.category}</span>
              {event.status === 'ongoing' && <span className="badge badge-success">Live Now</span>}
              {event.isFeatured && <span className="badge badge-warning">Featured</span>}
            </div>
            <h1>{event.title}</h1>
            <div className="event-meta-row">
              <div className="meta-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {format(new Date(event.startDate), 'PPP')}
              </div>
              <div className="meta-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {format(new Date(event.startDate), 'p')}
              </div>
              <div className="meta-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {event.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="event-detail-grid">
          {/* Main Content */}
          <div className="event-main-content">
            {/* Description */}
            <section className="content-section">
              <h2>About This Event</h2>
              <p className="event-description">{event.description}</p>
            </section>

            {/* Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <section className="content-section">
                <h2>Event Highlights</h2>
                <div className="highlights-list">
                  {event.highlights.map((highlight, index) => (
                    <div key={index} className="highlight-item">
                      <div className="highlight-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div>
                        <h4>{highlight.title}</h4>
                        <p>{highlight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Live Updates */}
            {liveUpdates.length > 0 && (
              <section className="content-section">
                <h2>Live Updates</h2>
                <div className="live-updates-list">
                  {liveUpdates.map((update, index) => (
                    <div key={index} className="live-update-item">
                      <div className="update-time">
                        {format(new Date(update.timestamp), 'p')}
                      </div>
                      <div className="update-content">
                        <p>{update.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {event.images && event.images.length > 0 && (
              <section className="content-section">
                <h2>Gallery</h2>
                <div className="event-gallery">
                  {event.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="gallery-item"
                      onClick={() => {
                        setSelectedImage(index);
                        setShowGallery(true);
                      }}
                    >
                      <img src={image} alt={`Event ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="event-sidebar">
            {/* Registration Card */}
            <div className="sidebar-card">
              <div className="capacity-info">
                <div className="capacity-header">
                  <span className="capacity-label">Availability</span>
                  <span className="capacity-count">
                    {event.registeredCount} / {event.capacity}
                  </span>
                </div>
                <div className="capacity-bar">
                  <div 
                    className="capacity-fill"
                    style={{ 
                      width: `${(event.registeredCount / event.capacity) * 100}%`,
                      background: isFull ? '#ef4444' : isAlmostFull ? '#f59e0b' : 'var(--primary-gradient)'
                    }}
                  ></div>
                </div>
                {isAlmostFull && !isFull && (
                  <p className="capacity-warning">Only {availableSlots} spots left!</p>
                )}
              </div>

              {event.requiresRegistration && (
                <>
                  {isRegistered ? (
                    <div className="registered-badge">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {event.price > 0 ? 'Already Registered & Paid' : "You're registered!"}
                    </div>
                  ) : (
                    <button 
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%' }}
                      onClick={handleRegister}
                      disabled={registering || isFull || !isAuthenticated}
                    >
                      {registering ? (
                        <>
                          <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                          {event.price > 0 ? 'Processing Payment...' : 'Registering...'}
                        </>
                      ) : isFull ? (
                        'Event Full'
                      ) : event.price > 0 ? (
                        <>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Pay Now - ${event.price.toFixed(2)}
                        </>
                      ) : (
                        'Register Now'
                      )}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Event Ticket QR */}
            {registration && (
              <EventTicketQR
                registration={registration}
              />
            )}

            {/* Event Info */}
            <div className="sidebar-card">
              <h3>Event Details</h3>
              <div className="info-list">
                <div className="info-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <span className="info-label">Organizer</span>
                    <span className="info-value">{event.organizer?.name || 'School Admin'}</span>
                  </div>
                </div>
                {event.venue && (
                  <div className="info-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <span className="info-label">Venue</span>
                      <span className="info-value">{event.venue}</span>
                    </div>
                  </div>
                )}
                {event.price > 0 && (
                  <div className="info-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <span className="info-label">Price</span>
                      <span className="info-value">${event.price}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="sidebar-card">
                <h3>Tags</h3>
                <div className="tags-list">
                  {event.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="gallery-modal" onClick={() => setShowGallery(false)}>
          <button className="gallery-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={event.images[selectedImage]} alt="Gallery" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay" onClick={handlePaymentCancel}>
          <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handlePaymentCancel}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <CreditCardPayment
              eventTitle={event.title}
              eventPrice={event.price}
              onPaymentSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}

      {/* Success Animation */}
      {showSuccess && (
        <SuccessAnimation
          message="Payment Successful! You're registered for the event."
          onComplete={() => {
            setShowSuccess(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          duration={3000}
        />
      )}
    </div>
  );
};

export default EventDetailPage;


import React, { useEffect, useState } from 'react';
import { registrationsAPI } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import EventTicketQR from '../components/EventTicketQR';
import './MyEventsPage.css';

const MyEventsPage = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      const response = await registrationsAPI.getMyRegistrations();
      setRegistrations(response.data.registrations || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
      toast.error('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    try {
      await registrationsAPI.cancel(registrationId);
      toast.success('Registration cancelled successfully');
      loadRegistrations();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error('Failed to cancel registration');
    }
  };

  const handleShowQR = (registration) => {
    setSelectedRegistration(registration);
  };

  const filterRegistrations = (status) => {
    const now = new Date();
    return registrations.filter(reg => {
      const eventDate = new Date(reg.event?.startDate);
      
      switch(status) {
        case 'upcoming':
          return eventDate > now && !reg.attended;
        case 'attended':
          return reg.attended;
        case 'past':
          return eventDate < now && !reg.attended;
        default:
          return true;
      }
    });
  };

  const filteredRegistrations = filterRegistrations(activeTab);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="my-events-page">
      <div className="page-header">
        <div className="container">
          <h1>My Events</h1>
          <p>Manage your event registrations and attendance</p>
        </div>
      </div>

      <div className="container">
        {/* Tabs */}
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Upcoming
            <span className="tab-count">{filterRegistrations('upcoming').length}</span>
          </button>
          <button 
            className={`tab ${activeTab === 'attended' ? 'active' : ''}`}
            onClick={() => setActiveTab('attended')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Attended
            <span className="tab-count">{filterRegistrations('attended').length}</span>
          </button>
          <button 
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Past
            <span className="tab-count">{filterRegistrations('past').length}</span>
          </button>
        </div>

        {/* Events List */}
        {filteredRegistrations.length > 0 ? (
          <div className="events-list">
            {filteredRegistrations.map((registration) => (
              <div key={registration._id} className="event-item">
                <div className="event-item-image">
                  {registration.event?.image ? (
                    <img src={registration.event.image} alt={registration.event.title} />
                  ) : (
                    <div className="event-placeholder">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="event-item-content">
                  <div className="event-item-header">
                    <div>
                      <span className="event-category">{registration.event?.category}</span>
                      <h3>{registration.event?.title}</h3>
                    </div>
                    <span className={`badge ${registration.attended ? 'badge-success' : 'badge-info'}`}>
                      {registration.attended ? 'Attended' : 'Registered'}
                    </span>
                  </div>

                  <p className="event-description">{registration.event?.description}</p>

                  <div className="event-item-meta">
                    <div className="meta-item">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(new Date(registration.event?.startDate), 'PPP')}
                    </div>
                    <div className="meta-item">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {format(new Date(registration.event?.startDate), 'p')}
                    </div>
                    <div className="meta-item">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {registration.event?.location}
                    </div>
                  </div>

                  <div className="event-item-actions">
                    {activeTab === 'upcoming' && (
                      <>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleShowQR(registration)}
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          Show QR Code
                        </button>
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => handleCancelRegistration(registration._id)}
                        >
                          Cancel Registration
                        </button>
                      </>
                    )}
                    {registration.attended && (
                      <div className="attended-badge">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        You attended this event
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3>No {activeTab} events</h3>
            <p>You don't have any {activeTab} events at the moment</p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedRegistration && (
        <div className="modal-overlay" onClick={() => setSelectedRegistration(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Event Ticket</h3>
              <button className="modal-close" onClick={() => setSelectedRegistration(null)}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <EventTicketQR
                userId={user._id}
                eventId={selectedRegistration.event._id}
                registrationId={selectedRegistration._id}
                eventTitle={selectedRegistration.event.title}
                eventDate={selectedRegistration.event.startDate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;



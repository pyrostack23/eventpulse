import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import EventCard from '../components/Events/EventCard';
import { EventsGridSkeleton } from '../components/Loading/LoadingSkeleton';
import './HomePage.css';

// Main landing page component

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Load featured and upcoming events on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch both featured and upcoming events in parallel
      const [featured, upcoming] = await Promise.all([
        eventsAPI.getFeatured(),
        eventsAPI.getUpcoming({ limit: 6 })
      ]);
      
      setFeaturedEvents(featured.data.events || []);
      setUpcomingEvents(upcoming.data.events || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    
    // Navigate to events page with search query
    if (q) {
      navigate(`/events?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <h1 className="hero-title">
              Discover Amazing <span className="accent">School Events</span>
            </h1>
            <p className="hero-subtitle">
              Stay connected with your school community. Never miss an event, competition, or celebration.
            </p>
            <div className="hero-actions">
              <Link to="/events" className="btn btn-primary btn-lg">Browse Events</Link>
              <Link to="/register" className="btn btn-outline btn-lg">Get Started</Link>
            </div>

            <div className="hero-search">
              <form onSubmit={onSearch}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events, categories, competitions..."
                />
                <button type="submit">Search</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section metrics">
        <div className="container">
          <div className="metrics-grid">
            <div className="metric">
              <div className="metric-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <strong>500+</strong>
                <div><span>Events Hosted</span></div>
              </div>
            </div>
            <div className="metric">
              <div className="metric-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <strong>2,000+</strong>
                <div><span>Active Students</span></div>
              </div>
            </div>
            <div className="metric">
              <div className="metric-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <strong>95%</strong>
                <div><span>Satisfaction</span></div>
              </div>
            </div>
            <div className="metric">
              <div className="metric-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <strong>24/7</strong>
                <div><span>Live Updates</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured Events</h2>
              <div className="section-actions">
                <Link to="/events" className="btn btn-ghost">View All</Link>
              </div>
            </div>
            <div className="events-grid">
              {featuredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Upcoming Events</h2>
            <div className="section-actions">
              <Link to="/events" className="btn btn-ghost">View All</Link>
            </div>
          </div>

          {loading ? (
            <EventsGridSkeleton count={6} />
          ) : upcomingEvents.length > 0 ? (
            <div className="events-grid">
              {upcomingEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3>No upcoming events</h3>
              <p>Check back later for new events</p>
            </div>
          )}
        </div>
      </section>

      {/* Event Categories Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Event Categories</h2>
          </div>
          <div className="categories-grid">
            {['Sports', 'Academic', 'Cultural', 'Exhibition', 'Debate', 'Workshop'].map((category) => (
              <Link key={category} to={`/events?category=${category}`} className="category-card">
                <div className="category-icon">
                  {getCategoryIcon(category)}
                </div>
                <h3>{category}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How it works</h2>
          </div>
          <div className="how-grid">
            <div className="step-card">
              <div className="step-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h4>Discover</h4>
              <p>Browse events by category, date, and popularity.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 3 3 5 3 5s3-2 3-5c0-1.657-1.343-3-3-3z" />
                </svg>
              </div>
              <h4>Register</h4>
              <p>Secure your spot in a few clicks. QR ready.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h4>Enjoy</h4>
              <p>Get real-time updates and enjoy the experience.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper function to get icon for each category
const getCategoryIcon = (category) => {
  const icons = {
    Sports: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Academic: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    Cultural: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
    Exhibition: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Debate: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    Workshop: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
  };
  return icons[category] || icons.Sports;
};

export default HomePage;


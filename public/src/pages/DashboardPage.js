import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI, registrationsAPI } from '../services/api';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import EventCard from '../components/Events/EventCard';
import './DashboardPage.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    registeredEvents: 0,
    attendedEvents: 0,
    points: 0
  });
  const [displayStats, setDisplayStats] = useState({
    totalEvents: 0,
    registeredEvents: 0,
    attendedEvents: 0,
    points: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Count-up animation for stats
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;

    Object.keys(stats).forEach(key => {
      let current = 0;
      const target = stats[key];
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setDisplayStats(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, stepDuration);
    });
  }, [stats]);

  const loadDashboardData = async () => {
    try {
      const [registrations, upcoming] = await Promise.all([
        registrationsAPI.getMyRegistrations(),
        eventsAPI.getUpcoming({ limit: 6 })
      ]);

      const regs = registrations.data.registrations || [];
      setMyRegistrations(regs);
      setUpcomingEvents(upcoming.data.events || []);
      
      setStats({
        totalEvents: upcoming.data.total || 0,
        registeredEvents: regs.length || 0,
        attendedEvents: regs.filter(r => r.status === 'attended').length || 0,
        points: user?.points || 0
      });

      // Mock activity timeline
      setActivities([
        { id: 1, type: 'registration', title: 'Registered for Science Fair', time: '2 hours ago', icon: '📝' },
        { id: 2, type: 'attendance', title: 'Attended Sports Day', time: '1 day ago', icon: '✅' },
        { id: 3, type: 'badge', title: 'Earned "Event Enthusiast" badge', time: '2 days ago', icon: '🏆' },
        { id: 4, type: 'registration', title: 'Registered for Music Concert', time: '3 days ago', icon: '📝' }
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const participationData = {
    labels: ['Attended', 'Registered', 'Available'],
    datasets: [{
      data: [displayStats.attendedEvents, displayStats.registeredEvents - displayStats.attendedEvents, displayStats.totalEvents - displayStats.registeredEvents],
      backgroundColor: ['#10b981', '#6366f1', '#e5e7eb'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const activityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Events',
      data: [3, 5, 2, 8, 4, 6, 3],
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 8,
      barThickness: 30
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  };

  // Carousel navigation
  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % Math.ceil(upcomingEvents.length / 3));
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + Math.ceil(upcomingEvents.length / 3)) % Math.ceil(upcomingEvents.length / 3));
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="welcome-section">
            <div className="welcome-content">
              <h1>Welcome back, {user?.name}!</h1>
              <p>Here's what's happening with your events today.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Animated Stats Grid */}
        <div className="dashboard-stats">
          <div className="stat-card" style={{ animationDelay: '0s' }}>
            <div className="stat-icon gradient-purple">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="count-up">{displayStats.registeredEvents}</h3>
              <p>Registered Events</p>
            </div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon gradient-green">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="count-up">{displayStats.attendedEvents}</h3>
              <p>Events Attended</p>
            </div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon gradient-yellow">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="count-up">{displayStats.points}</h3>
              <p>Total Points</p>
            </div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon gradient-blue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="count-up">{displayStats.totalEvents}</h3>
              <p>Available Events</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Charts Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Analytics Overview</h2>
            </div>
            
            <div className="charts-grid">
              <div className="chart-container">
                <h3>Participation</h3>
                <div className="chart-wrapper">
                  <Doughnut data={participationData} options={chartOptions} />
                </div>
              </div>
              
              <div className="chart-container">
                <h3>Weekly Activity</h3>
                <div className="chart-wrapper">
                  <Bar data={activityData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
            </div>
            
            <div className="activity-timeline">
              {activities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="timeline-item fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="timeline-icon">{activity.icon}</div>
                  <div className="timeline-content">
                    <p className="timeline-title">{activity.title}</p>
                    <span className="timeline-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events Carousel */}
        <div className="dashboard-section full-width">
          <div className="section-header">
            <h2>Recommended For You</h2>
            <div className="carousel-controls">
              <button onClick={prevSlide} className="carousel-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={nextSlide} className="carousel-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="events-carousel" ref={carouselRef}>
              <div 
                className="carousel-track"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {upcomingEvents.map((event) => (
                  <div key={event._id} className="carousel-slide">
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3>No events available</h3>
              <p>Check back later for new events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;



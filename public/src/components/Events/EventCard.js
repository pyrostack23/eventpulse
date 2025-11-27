import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { toast } from 'react-toastify';
import './EventCard.css';

const EventCard = ({ event }) => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showActions, setShowActions] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  // Live countdown with seconds
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const eventDate = new Date(event.startDate);
      const days = differenceInDays(eventDate, now);
      const hours = differenceInHours(eventDate, now) % 24;
      const minutes = differenceInMinutes(eventDate, now) % 60;
      const seconds = differenceInSeconds(eventDate, now) % 60;

      setCountdown({ days, hours, minutes, seconds });
    };

    if (event.status === 'upcoming') {
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [event.startDate, event.status]);

  // 3D tilt effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setShowActions(false);
  };

  const isNew = () => {
    const createdDate = new Date(event.createdAt);
    const daysSinceCreated = differenceInDays(new Date(), createdDate);
    return daysSinceCreated <= 7;
  };

  const handleShare = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(window.location.origin + `/events/${event._id}`);
    toast.success('Link copied to clipboard!');
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Event removed from bookmarks!' : 'Event bookmarked!');
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { class: 'badge-info', label: 'Upcoming' },
      ongoing: { class: 'badge-success', label: 'Live Now' },
      completed: { class: 'badge-error', label: 'Completed' },
      cancelled: { class: 'badge-error', label: 'Cancelled' }
    };
    return badges[status] || badges.upcoming;
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

  const statusBadge = getStatusBadge(event.status);
  const availableSlots = event.capacity - event.registeredCount;
  const isAlmostFull = availableSlots <= event.capacity * 0.2 && availableSlots > 0;
  const capacityPercentage = (event.registeredCount / event.capacity) * 100;

  return (
    <Link 
      to={`/events/${event._id}`} 
      className="event-card"
      ref={cardRef}
      style={{ 
        borderLeft: `4px solid ${getCategoryColor(event.category)}`,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="event-card-image">
        {event.image ? (
          <img src={event.image} alt={event.title} />
        ) : (
          <div className="event-card-placeholder" style={{ background: getCategoryColor(event.category) }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="event-card-gradient-overlay"></div>
        
        <div className="event-card-badges">
          {isNew() && <span className="badge badge-new">New</span>}
          <span className={`badge ${statusBadge.class}`}>{statusBadge.label}</span>
          {event.isFeatured && <span className="badge badge-warning">Featured</span>}
        </div>

        {showActions && (
          <div className="event-quick-actions">
            <button className="quick-action-btn" onClick={handleShare} title="Share">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button 
              className={`quick-action-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`} 
              onClick={handleSave} 
              title="Save"
            >
              <svg fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        )}

        {/* Quick preview on hover */}
        {showActions && (
          <div className="event-quick-preview">
            <div className="preview-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{event.views || 0} views</span>
            </div>
            <div className="preview-item">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{format(new Date(event.startDate), 'h:mm a')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="event-card-content">
        {event.status === 'upcoming' && countdown.days >= 0 && (
          <div className="event-countdown-live">
            <div className="countdown-pulse"></div>
            <div className="countdown-items">
              {countdown.days > 0 && (
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.days}</span>
                  <span className="countdown-label">d</span>
                </div>
              )}
              <div className="countdown-item">
                <span className="countdown-value">{countdown.hours}</span>
                <span className="countdown-label">h</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-value">{countdown.minutes}</span>
                <span className="countdown-label">m</span>
              </div>
              <div className="countdown-item pulse-seconds">
                <span className="countdown-value">{countdown.seconds}</span>
                <span className="countdown-label">s</span>
              </div>
            </div>
          </div>
        )}

        <div className="event-card-header">
          <span className="event-category" style={{ color: getCategoryColor(event.category) }}>
            {event.category}
          </span>
          <div className="event-date">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {format(new Date(event.startDate), 'MMM dd, yyyy')}
          </div>
        </div>

        <h3 className="event-card-title">{event.title}</h3>
        
        <p className="event-card-description">
          {event.description.length > 100 
            ? `${event.description.substring(0, 100)}...` 
            : event.description}
        </p>

        <div className="event-card-meta">
          <div className="event-meta-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </div>
          <div className="event-meta-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {event.registeredCount} / {event.capacity}
          </div>
        </div>

        {event.requiresRegistration && (
          <div className="event-card-footer">
            {availableSlots > 0 ? (
              <div className={`event-availability ${isAlmostFull ? 'almost-full' : ''}`}>
                <div className="availability-bar">
                  <div 
                    className="availability-fill animated-fill" 
                    style={{ 
                      width: `${capacityPercentage}%`,
                      background: isAlmostFull 
                        ? 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)'
                        : 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
                    }}
                  >
                    <div className="fill-shimmer"></div>
                  </div>
                </div>
                <span className="availability-text">
                  {isAlmostFull ? `Only ${availableSlots} spots left!` : `${availableSlots} spots available`}
                </span>
              </div>
            ) : (
              <div className="event-full">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Event Full
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default EventCard;

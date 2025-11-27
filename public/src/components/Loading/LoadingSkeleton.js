import React from 'react';
import './LoadingSkeleton.css';

export const CardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text short"></div>
    </div>
  </div>
);

export const EventCardSkeleton = () => (
  <div className="event-card-skeleton">
    <div className="skeleton-event-image"></div>
    <div className="skeleton-event-content">
      <div className="skeleton-line skeleton-category"></div>
      <div className="skeleton-line skeleton-event-title"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-meta">
        <div className="skeleton-line skeleton-meta-item"></div>
        <div className="skeleton-line skeleton-meta-item"></div>
      </div>
    </div>
  </div>
);

export const EventsGridSkeleton = ({ count = 6 }) => (
  <div className="events-grid">
    {Array.from({ length: count }).map((_, index) => (
      <EventCardSkeleton key={index} />
    ))}
  </div>
);

export default { CardSkeleton, EventCardSkeleton, EventsGridSkeleton };

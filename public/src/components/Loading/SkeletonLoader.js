import React from 'react';
import './SkeletonLoader.css';

// Event Card Skeleton
export const EventCardSkeleton = () => (
  <div className="skeleton-event-card">
    <div className="skeleton skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton skeleton-badge"></div>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short"></div>
      <div className="skeleton-footer">
        <div className="skeleton skeleton-meta"></div>
        <div className="skeleton skeleton-meta"></div>
      </div>
    </div>
  </div>
);

// Events Grid Skeleton
export const EventsGridSkeleton = ({ count = 6 }) => (
  <div className="events-grid">
    {Array.from({ length: count }).map((_, index) => (
      <EventCardSkeleton key={index} />
    ))}
  </div>
);

// Dashboard Card Skeleton
export const DashboardCardSkeleton = () => (
  <div className="skeleton-dashboard-card">
    <div className="skeleton skeleton-icon"></div>
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-number"></div>
    <div className="skeleton skeleton-text short"></div>
  </div>
);

// Profile Skeleton
export const ProfileSkeleton = () => (
  <div className="skeleton-profile">
    <div className="skeleton skeleton-avatar-large"></div>
    <div className="skeleton skeleton-title center"></div>
    <div className="skeleton skeleton-text center short"></div>
    <div className="skeleton-divider"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text short"></div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="skeleton-table-row">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index}>
        <div className="skeleton skeleton-text"></div>
      </td>
    ))}
  </tr>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <table className="skeleton-table">
    <tbody>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRowSkeleton key={index} columns={columns} />
      ))}
    </tbody>
  </table>
);

// List Item Skeleton
export const ListItemSkeleton = () => (
  <div className="skeleton-list-item">
    <div className="skeleton skeleton-avatar"></div>
    <div className="skeleton-list-content">
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short"></div>
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton = ({ count = 5 }) => (
  <div className="skeleton-list">
    {Array.from({ length: count }).map((_, index) => (
      <ListItemSkeleton key={index} />
    ))}
  </div>
);

// Form Skeleton
export const FormSkeleton = () => (
  <div className="skeleton-form">
    <div className="skeleton skeleton-input"></div>
    <div className="skeleton skeleton-input"></div>
    <div className="skeleton skeleton-input"></div>
    <div className="skeleton skeleton-button"></div>
  </div>
);

// Page Header Skeleton
export const PageHeaderSkeleton = () => (
  <div className="skeleton-page-header">
    <div className="skeleton skeleton-title large"></div>
    <div className="skeleton skeleton-text"></div>
  </div>
);

// Full Page Skeleton
export const FullPageSkeleton = () => (
  <div className="skeleton-full-page">
    <PageHeaderSkeleton />
    <div className="skeleton-content-grid">
      <EventsGridSkeleton count={6} />
    </div>
  </div>
);

export default {
  EventCardSkeleton,
  EventsGridSkeleton,
  DashboardCardSkeleton,
  ProfileSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  ListItemSkeleton,
  ListSkeleton,
  FormSkeleton,
  PageHeaderSkeleton,
  FullPageSkeleton
};

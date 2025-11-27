import React from 'react';
import './EmptyState.css';

const EmptyState = ({ 
  icon = '📭', 
  title = 'No data found', 
  message = 'Try adjusting your filters or search criteria',
  action,
  actionLabel = 'Clear Filters'
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <button className="btn btn-primary" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

// Event categories
exports.EVENT_CATEGORIES = [
  'Sports',
  'Academic',
  'Cultural',
  'Exhibition',
  'Debate',
  'Workshop',
  'Social',
  'Other'
];

// Event statuses
exports.EVENT_STATUSES = [
  'upcoming',
  'ongoing',
  'completed',
  'cancelled'
];

// User roles
exports.USER_ROLES = [
  'admin',
  'teacher',
  'student',
  'parent'
];

// Registration statuses
exports.REGISTRATION_STATUSES = [
  'registered',
  'attended',
  'cancelled',
  'no-show'
];

// Notification types
exports.NOTIFICATION_TYPES = [
  'event_reminder',
  'event_update',
  'registration_confirmed',
  'event_cancelled',
  'system',
  'achievement'
];

// Notification priorities
exports.NOTIFICATION_PRIORITIES = [
  'low',
  'medium',
  'high',
  'urgent'
];

// Houses
exports.HOUSES = [
  'Red',
  'Blue',
  'Green',
  'Yellow'
];

// Grades
exports.GRADES = [
  '6', '7', '8', '9', '10', '11', '12', '13'
];

// Target audiences
exports.TARGET_AUDIENCES = [
  'students',
  'teachers',
  'parents',
  'all'
];

// Badge types
exports.BADGE_TYPES = {
  FIRST_EVENT: {
    name: 'First Event',
    icon: '🎉',
    description: 'Attended your first event'
  },
  FIVE_EVENTS: {
    name: 'Event Enthusiast',
    icon: '⭐',
    description: 'Attended 5 events'
  },
  TEN_EVENTS: {
    name: 'Event Master',
    icon: '🏆',
    description: 'Attended 10 events'
  },
  EARLY_BIRD: {
    name: 'Early Bird',
    icon: '🐦',
    description: 'Registered early for an event'
  },
  PERFECT_ATTENDANCE: {
    name: 'Perfect Attendance',
    icon: '💯',
    description: 'Never missed a registered event'
  }
};

// Points system
exports.POINTS = {
  EVENT_REGISTRATION: 10,
  EVENT_ATTENDANCE: 50,
  EVENT_CREATION: 100,
  EARLY_REGISTRATION: 20
};

// File upload limits
exports.FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
};

// Pagination defaults
exports.PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100
};

// Date formats
exports.DATE_FORMATS = {
  DISPLAY: 'MMMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMMM DD, YYYY hh:mm A',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss'
};

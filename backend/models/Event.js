const mongoose = require('mongoose');

// Event model for managing school events

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide an event category'],
    enum: ['Sports', 'Academic', 'Cultural', 'Exhibition', 'Debate', 'Workshop', 'Social', 'Other'] // event types
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date'],
    validate: {
      validator: function(value) {
        // Skip validation during updates if startDate is not being modified
        if (!this.startDate) return true;
        return value >= this.startDate; // end can't be before start
      },
      message: 'End date must be after start date'
    }
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true
  },
  venue: {
    type: String,
    trim: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // reference to User model
    required: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide event capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  registeredCount: {
    type: Number,
    default: 0 // track how many registered
  },
  attendedCount: {
    type: Number,
    default: 0 // track actual attendance
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  image: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  targetAudience: [{
    type: String,
    enum: ['students', 'teachers', 'all'] // who can attend
  }],
  grades: [{
    type: String
  }],
  requiresRegistration: {
    type: Boolean,
    default: true
  },
  registrationDeadline: {
    type: Date
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  highlights: [{
    title: String,
    description: String,
    timestamp: Date // key moments during event
  }],
  liveUpdates: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // who posted the update
    }
  }],
  resources: [{
    name: String,
    url: String,
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false // show on homepage
  },
  views: {
    type: Number,
    default: 0 // page view counter
  }
}, {
  timestamps: true
});

// Text search index for finding events
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Index for date-based queries (improves performance)
eventSchema.index({ startDate: 1, endDate: 1 });

// Calculate available slots dynamically
eventSchema.virtual('availableSlots').get(function() {
  return this.capacity - this.registeredCount;
});

// Check if event is at capacity
eventSchema.virtual('isFull').get(function() {
  return this.registeredCount >= this.capacity;
});

// Check if users can still register for this event
eventSchema.methods.isRegistrationOpen = function() {
  const now = new Date();
  
  if (!this.requiresRegistration) return false;
  if (this.status === 'cancelled') return false;
  if (this.isFull) return false;
  
  // Check registration deadline if one is set
  if (this.registrationDeadline) {
    return now <= this.registrationDeadline;
  }
  
  // Otherwise, allow registration until event ends
  // (more flexible than closing at start time)
  return now < this.endDate;
};

// Auto-update event status based on current time
eventSchema.methods.updateStatus = function() {
  const now = new Date();
  
  // Don't change status if event is cancelled
  if (this.status === 'cancelled') return;
  
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'ongoing';
  } else {
    this.status = 'completed';
  }
};

// Automatically update status before saving
eventSchema.pre('save', function(next) {
  this.updateStatus();
  next();
});

module.exports = mongoose.model('Event', eventSchema);

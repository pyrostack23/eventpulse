const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'cancelled', 'no-show'],
    default: 'registered'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  attendedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  checkInMethod: {
    type: String,
    enum: ['qr', 'manual', ''],
    default: ''
  },
  notes: {
    type: String
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'not_required'],
    default: 'not_required'
  },
  paymentAmount: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'free', ''],
    default: ''
  },
  paymentDetails: {
    transactionId: String,
    cardLast4: String,
    paymentDate: Date
  },
  ticketNumber: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate unique ticket number before saving
registrationSchema.pre('save', function(next) {
  if (this.isNew && !this.ticketNumber) {
    // Generate ticket number: EVT-YYYYMMDD-XXXXX
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.ticketNumber = `EVT-${date}-${random}`;
  }
  next();
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

// Index for status queries
registrationSchema.index({ status: 1 });

// Index for payment status
registrationSchema.index({ paymentStatus: 1 });

// Note: qrCode and ticketNumber already have unique indexes from schema definition

// Method to check if ticket is valid (not expired)
registrationSchema.methods.isTicketValid = async function() {
  if (this.status === 'cancelled') return false;
  
  // Populate event if not already populated
  if (!this.event.endDate) {
    await this.populate('event');
  }
  
  const now = new Date();
  const eventEndDate = new Date(this.event.endDate);
  
  // Ticket is valid until event end date
  return now <= eventEndDate;
};

// Method to mark as attended
registrationSchema.methods.markAttended = async function(method = 'qr') {
  // Check if ticket is still valid
  const isValid = await this.isTicketValid();
  if (!isValid) {
    throw new Error('Ticket has expired or been cancelled');
  }
  
  this.status = 'attended';
  this.attendedAt = new Date();
  this.checkInMethod = method;
  return this.save();
};

// Method to cancel registration
registrationSchema.methods.cancel = async function(reason = '') {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  
  // If payment was made, mark for refund
  if (this.paymentStatus === 'completed') {
    this.paymentStatus = 'refunded';
  }
  
  return this.save();
};

// Method to complete payment
registrationSchema.methods.completePayment = function(paymentData) {
  this.paymentStatus = 'completed';
  this.paymentAmount = paymentData.amount;
  this.paymentMethod = paymentData.method || 'card';
  this.paymentDetails = {
    transactionId: paymentData.transactionId,
    cardLast4: paymentData.cardLast4,
    paymentDate: new Date()
  };
  return this.save();
};

// Static method to get registration stats for an event
registrationSchema.statics.getEventStats = async function(eventId) {
  const stats = await this.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    registered: 0,
    attended: 0,
    cancelled: 0,
    noShow: 0
  };
  
  stats.forEach(stat => {
    result.total += stat.count;
    if (stat._id === 'registered') result.registered = stat.count;
    if (stat._id === 'attended') result.attended = stat.count;
    if (stat._id === 'cancelled') result.cancelled = stat.count;
    if (stat._id === 'no-show') result.noShow = stat.count;
  });
  
  return result;
};

module.exports = mongoose.model('Registration', registrationSchema);

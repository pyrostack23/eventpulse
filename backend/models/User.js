const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // for generating unique QR codes

// User schema definition
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'student'
  },
  studentId: {
    type: String,
    sparse: true, // allows multiple null values
    unique: true,
    trim: true,
    required: function() {
      return this.role === 'student';
    },
    validate: {
      validator: function(v) {
        if (this.role !== 'student') return true; // only validate for students
        return /^\d{6}$/.test(v); // exactly 6 digits
      },
      message: 'Student ID must be exactly 6 digits'
    }
  },
  grade: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  house: {
    type: String,
    enum: ['Marsh', 'Reed', 'Boake', 'Harward', 'Hartley', ''], // school houses
    default: '',
    trim: true,
    set: function(v) {
      return v ? v.trim() : '';
    }
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    categories: [String] // preferred event categories
  },
  points: {
    type: Number,
    default: 0 // gamification points
  },
  badges: [{
    name: String,
    icon: String,
    earnedAt: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  qrCode: {
    type: String,
    unique: true,
    sparse: true // unique QR code for each user
  }
}, {
  timestamps: true
});

// Pre-save hook to handle QR code generation and password hashing
userSchema.pre('save', async function(next) {
  // Generate unique QR code for new users
  if (this.isNew && !this.qrCode) {
    this.qrCode = crypto.randomBytes(16).toString('hex');
  }
  
  // Only hash password if it's been modified
  if (!this.isModified('password')) {
    return next();
  }
  
  // Hash the password with bcrypt
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Return user object without sensitive data
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password; // never send password to client
  return user;
};

module.exports = mongoose.model('User', userSchema);

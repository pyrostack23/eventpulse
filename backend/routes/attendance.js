const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/attendance/mark
// @desc    Mark attendance using QR code
// @access  Admin only
router.post('/mark', protect, authorize('admin', 'organizer'), async (req, res) => {
  try {
    const { registrationId } = req.body;

    const registration = await Registration.findById(registrationId)
      .populate('user', 'name email')
      .populate('event', 'title startDate');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if already attended
    if (registration.attended) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in',
        attendedAt: registration.attendedAt
      });
    }

    // Check if event has started
    const now = new Date();
    const eventStart = new Date(registration.event.startDate);
    const checkInWindow = 30 * 60 * 1000; // 30 minutes before event

    if (now < eventStart - checkInWindow) {
      return res.status(400).json({
        success: false,
        message: 'Check-in not available yet. Please try 30 minutes before the event.'
      });
    }

    // Mark attendance
    registration.attended = true;
    registration.attendedAt = new Date();
    await registration.save();

    // Update event attendance count
    await Event.findByIdAndUpdate(registration.event._id, {
      $inc: { attendanceCount: 1 }
    });

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      userName: registration.user.name,
      eventName: registration.event.title,
      attendedAt: registration.attendedAt
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/attendance/event/:eventId
// @desc    Get attendance list for an event
// @access  Admin/Organizer
router.get('/event/:eventId', protect, authorize('admin', 'organizer'), async (req, res) => {
  try {
    const registrations = await Registration.find({ 
      event: req.params.eventId 
    })
    .populate('user', 'name email')
    .sort({ attendedAt: -1 });

    const attendanceList = registrations.map(reg => ({
      userId: reg.user._id,
      userName: reg.user.name,
      userEmail: reg.user.email,
      registeredAt: reg.createdAt,
      attended: reg.attended,
      attendedAt: reg.attendedAt,
      paymentStatus: reg.paymentStatus
    }));

    const stats = {
      totalRegistrations: registrations.length,
      totalAttended: registrations.filter(r => r.attended).length,
      attendanceRate: registrations.length > 0 
        ? ((registrations.filter(r => r.attended).length / registrations.length) * 100).toFixed(2)
        : 0
    };

    res.json({
      success: true,
      attendanceList,
      stats
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/attendance/user/:userId
// @desc    Get user's attendance history
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    // Users can only view their own attendance
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const registrations = await Registration.find({ 
      user: req.params.userId,
      attended: true
    })
    .populate('event', 'title startDate category')
    .sort({ attendedAt: -1 });

    res.json({
      success: true,
      attendanceHistory: registrations.map(reg => ({
        eventId: reg.event._id,
        eventTitle: reg.event.title,
        eventDate: reg.event.startDate,
        category: reg.event.category,
        attendedAt: reg.attendedAt
      }))
    });

  } catch (error) {
    console.error('Get user attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

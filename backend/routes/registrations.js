const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId, validateEventId, validate } = require('../middleware/validation');
const { generateQRCode } = require('../services/qrService');
const { sendRegistrationEmail } = require('../services/emailService');

// @route   POST /api/registrations/:eventId
// @desc    Register for an event
// @access  Private
router.post('/:eventId', protect, validateEventId, validate, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registration is open
    if (!event.isRegistrationOpen()) {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed for this event'
      });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      event: req.params.eventId,
      user: req.user.id
    });

    if (existingRegistration && existingRegistration.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Generate unique QR code
    const qrCode = crypto.randomBytes(16).toString('hex');

    // Determine payment status based on event price
    const paymentStatus = event.price > 0 ? 'pending' : 'not_required';
    const paymentMethod = event.price === 0 ? 'free' : '';

    // Create registration
    const registration = await Registration.create({
      event: req.params.eventId,
      user: req.user.id,
      qrCode,
      status: 'registered',
      paymentStatus,
      paymentAmount: event.price,
      paymentMethod
    });

    // If payment is provided (for paid events)
    if (event.price > 0 && req.body.paymentDetails) {
      await registration.completePayment({
        amount: event.price,
        method: req.body.paymentDetails.method || 'card',
        transactionId: req.body.paymentDetails.transactionId,
        cardLast4: req.body.paymentDetails.cardLast4
      });
    }

    // Update event registered count
    event.registeredCount += 1;
    await event.save();

    // Send confirmation email
    await sendRegistrationEmail(req.user, event, qrCode);

    // Emit socket event
    const io = req.app.get('io');
    io.emit('registration:new', {
      eventId: event._id,
      registeredCount: event.registeredCount
    });

    // Populate registration with event and user details
    await registration.populate('event');
    await registration.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: event.price > 0 
        ? 'Payment successful! Check your email for your ticket.'
        : 'Registration successful! Check your email for your ticket.',
      registration
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/registrations/my-registrations
// @desc    Get current user's registrations
// @access  Private
router.get('/my-registrations', protect, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;

    const registrations = await Registration.find(query)
      .populate('event')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Registration.countDocuments(query);

    res.json({
      success: true,
      registrations,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/registrations/event/:eventId
// @desc    Get all registrations for an event
// @access  Private (Owner/Admin)
router.get('/event/:eventId', protect, validateObjectId, validate, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check authorization
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view registrations'
      });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('user', 'name email role grade house')
      .sort({ createdAt: -1 });

    const stats = await Registration.getEventStats(req.params.eventId);

    res.json({
      success: true,
      registrations,
      stats
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/registrations/:id/cancel
// @desc    Cancel a registration
// @access  Private
router.put('/:id/cancel', protect, validateObjectId, validate, async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check ownership
    if (registration.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this registration'
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is already cancelled'
      });
    }

    await registration.cancel(req.body.reason);

    // Update event registered count
    const event = await Event.findById(registration.event);
    if (event) {
      event.registeredCount = Math.max(0, event.registeredCount - 1);
      await event.save();
    }

    res.json({
      success: true,
      message: 'Registration cancelled successfully',
      registration
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/registrations/check-in/:qrCode
// @desc    Check in using QR code
// @access  Private (Admin/Teacher)
router.post('/check-in/:qrCode', protect, authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const registration = await Registration.findOne({ qrCode: req.params.qrCode })
      .populate('user', 'name email grade house studentId phone role avatar')
      .populate('event', 'title startDate endDate location venue');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    // Check if ticket is valid (not expired)
    const isValid = await registration.isTicketValid();
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Ticket has expired. Event has ended.',
        registration
      });
    }

    if (registration.status === 'attended') {
      return res.status(400).json({
        success: false,
        message: 'Already checked in',
        registration,
        userDetails: registration.user
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration was cancelled',
        registration
      });
    }

    // Check payment status for paid events
    if (registration.paymentStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed. Please complete payment first.',
        registration
      });
    }

    await registration.markAttended('qr');

    // Update event attended count
    const event = await Event.findById(registration.event);
    if (event) {
      event.attendedCount += 1;
      await event.save();
    }

    res.json({
      success: true,
      message: 'Check-in successful',
      registration,
      userDetails: {
        name: registration.user.name,
        email: registration.user.email,
        role: registration.user.role,
        grade: registration.user.grade,
        house: registration.user.house,
        studentId: registration.user.studentId,
        phone: registration.user.phone,
        avatar: registration.user.avatar
      },
      ticketDetails: {
        ticketNumber: registration.ticketNumber,
        qrCode: registration.qrCode,
        registeredAt: registration.registeredAt,
        paymentStatus: registration.paymentStatus,
        paymentAmount: registration.paymentAmount
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res, next) => {
  try {
    // Total counts
    const totalEvents = await Event.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRegistrations = await Registration.countDocuments();

    // Events by status
    const eventsByStatus = await Event.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Events by category
    const eventsByCategory = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent events
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category startDate registeredCount capacity');

    // Top events by registration
    const topEvents = await Event.find()
      .sort({ registeredCount: -1 })
      .limit(5)
      .select('title category registeredCount capacity');

    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrends = await Registration.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        totals: {
          events: totalEvents,
          users: totalUsers,
          registrations: totalRegistrations
        },
        eventsByStatus,
        eventsByCategory,
        recentEvents,
        topEvents,
        usersByRole,
        registrationTrends
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/event/:eventId
// @desc    Get analytics for specific event
// @access  Private (Owner/Admin)
router.get('/event/:eventId', protect, async (req, res, next) => {
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
        message: 'Not authorized'
      });
    }

    // Registration stats
    const registrationStats = await Registration.getEventStats(req.params.eventId);

    // Registrations by grade
    const registrationsByGrade = await Registration.aggregate([
      { $match: { event: event._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $group: {
          _id: '$userInfo.grade',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Registrations by house
    const registrationsByHouse = await Registration.aggregate([
      { $match: { event: event._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $group: {
          _id: '$userInfo.house',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Registration timeline
    const registrationTimeline = await Registration.aggregate([
      { $match: { event: event._id } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        event: {
          title: event.title,
          capacity: event.capacity,
          views: event.views
        },
        registrationStats,
        registrationsByGrade,
        registrationsByHouse,
        registrationTimeline
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

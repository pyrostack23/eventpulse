const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { createEventValidation, updateEventValidation, validateObjectId, validate, paginationValidation } = require('../middleware/validation');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/events';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   GET /api/events/upcoming
// @desc    Get upcoming events
// @access  Public
router.get('/upcoming', optionalAuth, async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const events = await Event.find({
      isPublished: true,
      status: 'upcoming',
      startDate: { $gte: new Date() }
    })
      .populate('organizer', 'name email role')
      .limit(parseInt(limit))
      .sort('startDate');

    res.json({
      success: true,
      events,
      total: events.length
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/events/featured
// @desc    Get featured events
// @access  Public
router.get('/featured', optionalAuth, async (req, res, next) => {
  try {
    const events = await Event.find({
      isPublished: true,
      isFeatured: true
    })
      .populate('organizer', 'name email role')
      .limit(6)
      .sort('-createdAt');

    res.json({
      success: true,
      events
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/events/past
// @desc    Get past events
// @access  Public
router.get('/past', optionalAuth, async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const events = await Event.find({
      isPublished: true,
      status: 'completed',
      endDate: { $lt: new Date() }
    })
      .populate('organizer', 'name email role')
      .limit(parseInt(limit))
      .sort('-endDate');

    res.json({
      success: true,
      events,
      total: events.length
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/events/category/:category
// @desc    Get events by category
// @access  Public
router.get('/category/:category', optionalAuth, async (req, res, next) => {
  try {
    const events = await Event.find({
      isPublished: true,
      category: req.params.category
    })
      .populate('organizer', 'name email role')
      .sort('-createdAt');

    res.json({
      success: true,
      events
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/events/search
// @desc    Search events
// @access  Public
router.get('/search', optionalAuth, async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const events = await Event.find({
      isPublished: true,
      $text: { $search: q }
    })
      .populate('organizer', 'name email role')
      .sort({ score: { $meta: 'textScore' } });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/events
// @desc    Get all events with filtering
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      status,
      search,
      startDate,
      endDate,
      featured,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured) query.isFeatured = featured === 'true';
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    // Execute query
    const events = await Event.find(query)
      .populate('organizer', 'name email role')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort(sort);

    const count = await Event.countDocuments(query);

    res.json({
      success: true,
      events,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', validateObjectId, validate, optionalAuth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email role')
      .populate('liveUpdates.author', 'name role');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment view count
    event.views += 1;
    await event.save();

    // Check if user is registered (if authenticated)
    let isRegistered = false;
    if (req.user) {
      const registration = await Registration.findOne({
        event: event._id,
        user: req.user._id,
        status: { $in: ['registered', 'attended'] }
      });
      isRegistered = !!registration;
    }

    res.json({
      success: true,
      event,
      isRegistered
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Teacher/Admin)
router.post('/', protect, authorize('teacher', 'admin'), createEventValidation, validate, async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user.id
    };

    const event = await Event.create(eventData);

    // Emit socket event for new event
    const io = req.app.get('io');
    io.emit('event:created', event);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Owner/Admin)
router.put('/:id', protect, validateObjectId, updateEventValidation, validate, async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email role');

    // Emit socket event for event update
    const io = req.app.get('io');
    io.emit('event:updated', event);

    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Owner/Admin)
router.delete('/:id', protect, validateObjectId, validate, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await event.deleteOne();

    // Delete all registrations for this event
    await Registration.deleteMany({ event: req.params.id });

    // Emit socket event
    const io = req.app.get('io');
    io.emit('event:deleted', { eventId: req.params.id });

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/events/:id/live-update
// @desc    Add live update to event
// @access  Private (Owner/Admin)
router.post('/:id/live-update', protect, validateObjectId, validate, async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    event.liveUpdates.push({
      message,
      author: req.user.id,
      timestamp: new Date()
    });

    await event.save();

    // Emit socket event for live update
    const io = req.app.get('io');
    io.to(`event:${event._id}`).emit('event:liveUpdate', {
      eventId: event._id,
      update: event.liveUpdates[event.liveUpdates.length - 1]
    });

    res.json({
      success: true,
      message: 'Live update added successfully',
      event
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/events/:id/upload-image
// @desc    Upload event image
// @access  Private (Owner/Admin)
router.post('/:id/upload-image', protect, validateObjectId, validate, upload.single('image'), async (req, res, next) => {
  try {
    console.log('Image upload request received for event:', req.params.id);
    console.log('File info:', req.file);

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      console.log('Event not found:', req.params.id);
      // Delete uploaded file if event not found
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      console.log('Not authorized');
      // Delete uploaded file if not authorized
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Delete old image if exists
    if (event.image) {
      try {
        const oldImagePath = path.join(__dirname, '..', event.image.replace('/uploads/', 'uploads/'));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Deleted old image:', oldImagePath);
        }
      } catch (err) {
        console.log('Error deleting old image:', err.message);
      }
    }

    // Construct image URL
    const imagePath = req.file.path.replace(/\\/g, '/');
    const imageUrl = `/${imagePath}`;
    
    console.log('New image URL:', imageUrl);

    // Update event with new image path - use direct update to avoid validation
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: { image: imageUrl } },
      { new: true, runValidators: false }
    );

    console.log('Event updated successfully with image:', updatedEvent.image);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: imageUrl
    });
  } catch (error) {
    console.error('Image upload error:', error);
    // Delete uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    next(error);
  }
});

module.exports = router;

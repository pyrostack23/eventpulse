const cron = require('node-cron');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendReminderEmail } = require('./emailService');
const { sendEventReminders } = require('./notificationService');

// Update event statuses every hour
const updateEventStatuses = cron.schedule('0 * * * *', async () => {
  try {
    console.log('🔄 Running event status update job...');
    
    const events = await Event.find({ status: { $ne: 'cancelled' } });
    
    for (const event of events) {
      const oldStatus = event.status;
      event.updateStatus();
      
      if (oldStatus !== event.status) {
        await event.save();
        console.log(`✅ Updated event ${event.title} status: ${oldStatus} -> ${event.status}`);
      }
    }
    
    console.log('✅ Event status update job completed');
  } catch (error) {
    console.error('❌ Error in event status update job:', error);
  }
});

// Send event reminders daily at 9 AM
const sendDailyReminders = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('🔄 Running daily reminder job...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    // Find events happening tomorrow
    const upcomingEvents = await Event.find({
      startDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      status: 'upcoming'
    });
    
    for (const event of upcomingEvents) {
      // Get all registrations for this event
      const registrations = await Registration.find({
        event: event._id,
        status: 'registered',
        reminderSent: false
      }).populate('user');
      
      if (registrations.length === 0) continue;
      
      // Send email reminders
      for (const registration of registrations) {
        await sendReminderEmail(registration.user, event);
        
        // Mark reminder as sent
        registration.reminderSent = true;
        registration.reminderSentAt = new Date();
        await registration.save();
      }
      
      // Send in-app notifications
      await sendEventReminders(event, registrations);
      
      console.log(`✅ Sent reminders for event: ${event.title} (${registrations.length} users)`);
    }
    
    console.log('✅ Daily reminder job completed');
  } catch (error) {
    console.error('❌ Error in daily reminder job:', error);
  }
});

// Clean up expired notifications daily at midnight
const cleanupExpiredNotifications = cron.schedule('0 0 * * *', async () => {
  try {
    console.log('🔄 Running notification cleanup job...');
    
    const result = await Notification.deleteExpired();
    
    console.log(`✅ Deleted ${result.deletedCount} expired notifications`);
  } catch (error) {
    console.error('❌ Error in notification cleanup job:', error);
  }
});

// Mark no-shows after event ends (runs every hour)
const markNoShows = cron.schedule('0 * * * *', async () => {
  try {
    console.log('🔄 Running no-show marking job...');
    
    const now = new Date();
    
    // Find events that ended in the last hour
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentlyEndedEvents = await Event.find({
      endDate: {
        $gte: oneHourAgo,
        $lt: now
      },
      status: 'completed'
    });
    
    for (const event of recentlyEndedEvents) {
      const result = await Registration.updateMany(
        {
          event: event._id,
          status: 'registered' // Still registered but didn't attend
        },
        {
          $set: { status: 'no-show' }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Marked ${result.modifiedCount} no-shows for event: ${event.title}`);
      }
    }
    
    console.log('✅ No-show marking job completed');
  } catch (error) {
    console.error('❌ Error in no-show marking job:', error);
  }
});

// Start all scheduled jobs
exports.startScheduledJobs = () => {
  console.log('🚀 Starting scheduled jobs...');
  
  updateEventStatuses.start();
  sendDailyReminders.start();
  cleanupExpiredNotifications.start();
  markNoShows.start();
  
  console.log('✅ All scheduled jobs started');
};

// Stop all scheduled jobs
exports.stopScheduledJobs = () => {
  console.log('🛑 Stopping scheduled jobs...');
  
  updateEventStatuses.stop();
  sendDailyReminders.stop();
  cleanupExpiredNotifications.stop();
  markNoShows.stop();
  
  console.log('✅ All scheduled jobs stopped');
};

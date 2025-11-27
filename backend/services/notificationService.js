const Notification = require('../models/Notification');

// Create notification
exports.createNotification = async (recipientId, type, title, message, options = {}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      ...options
    });

    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return null;
  }
};

// Create bulk notifications
exports.createBulkNotifications = async (recipientIds, type, title, message, options = {}) => {
  try {
    const notifications = recipientIds.map(recipientId => ({
      recipient: recipientId,
      type,
      title,
      message,
      ...options
    }));

    await Notification.insertMany(notifications);
    console.log(`✅ Created ${notifications.length} notifications`);
    return true;
  } catch (error) {
    console.error('❌ Error creating bulk notifications:', error);
    return false;
  }
};

// Send event reminder notifications
exports.sendEventReminders = async (event, registrations) => {
  try {
    const recipientIds = registrations.map(reg => reg.user);
    
    await exports.createBulkNotifications(
      recipientIds,
      'event_reminder',
      `Reminder: ${event.title}`,
      `Don't forget! ${event.title} is happening tomorrow at ${event.location}`,
      {
        relatedEvent: event._id,
        priority: 'high',
        actionUrl: `/events/${event._id}`,
        actionText: 'View Event'
      }
    );

    return true;
  } catch (error) {
    console.error('❌ Error sending event reminders:', error);
    return false;
  }
};

// Send event update notification
exports.sendEventUpdateNotification = async (event, registrations, updateMessage) => {
  try {
    const recipientIds = registrations.map(reg => reg.user);
    
    await exports.createBulkNotifications(
      recipientIds,
      'event_update',
      `Update: ${event.title}`,
      updateMessage,
      {
        relatedEvent: event._id,
        priority: 'medium',
        actionUrl: `/events/${event._id}`,
        actionText: 'View Event'
      }
    );

    return true;
  } catch (error) {
    console.error('❌ Error sending event update notifications:', error);
    return false;
  }
};

// Send event cancellation notification
exports.sendEventCancellationNotification = async (event, registrations, reason) => {
  try {
    const recipientIds = registrations.map(reg => reg.user);
    
    await exports.createBulkNotifications(
      recipientIds,
      'event_cancelled',
      `Cancelled: ${event.title}`,
      `Unfortunately, ${event.title} has been cancelled. ${reason ? 'Reason: ' + reason : ''}`,
      {
        relatedEvent: event._id,
        priority: 'urgent',
        actionUrl: `/events`,
        actionText: 'Browse Events'
      }
    );

    return true;
  } catch (error) {
    console.error('❌ Error sending cancellation notifications:', error);
    return false;
  }
};

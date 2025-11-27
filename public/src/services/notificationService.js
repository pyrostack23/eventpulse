// Notification Service for Event Reminders

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.checkPermission();
  }

  async checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }
    return this.permission === 'granted';
  }

  async scheduleEventReminder(event, minutesBefore = 60) {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    const granted = await this.requestPermission();
    if (!granted) return;

    const eventTime = new Date(event.startDate).getTime();
    const reminderTime = eventTime - (minutesBefore * 60 * 1000);
    const now = Date.now();

    if (reminderTime > now) {
      const timeout = reminderTime - now;
      
      setTimeout(() => {
        this.showNotification(
          `Event Starting Soon: ${event.title}`,
          {
            body: `${event.title} starts in ${minutesBefore} minutes at ${event.location}`,
            icon: event.image || '/logo192.png',
            badge: '/logo192.png',
            tag: `event-${event._id}`,
            requireInteraction: true,
            data: { eventId: event._id, url: `/events/${event._id}` }
          }
        );
      }, timeout);

      // Store in localStorage for persistence
      this.saveScheduledReminder(event._id, reminderTime);
    }
  }

  showNotification(title, options) {
    if (this.permission === 'granted') {
      const notification = new Notification(title, options);
      
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
        notification.close();
      };

      return notification;
    }
  }

  saveScheduledReminder(eventId, time) {
    const reminders = JSON.parse(localStorage.getItem('eventReminders') || '{}');
    reminders[eventId] = time;
    localStorage.setItem('eventReminders', JSON.stringify(reminders));
  }

  removeScheduledReminder(eventId) {
    const reminders = JSON.parse(localStorage.getItem('eventReminders') || '{}');
    delete reminders[eventId];
    localStorage.setItem('eventReminders', JSON.stringify(reminders));
  }

  async sendEmailReminder(eventId, email) {
    try {
      // API call to backend to schedule email reminder
      const response = await fetch('/api/notifications/schedule-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, email })
      });
      return response.ok;
    } catch (error) {
      console.error('Error scheduling email reminder:', error);
      return false;
    }
  }
}

export default new NotificationService();

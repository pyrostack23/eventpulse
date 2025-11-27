import { io } from 'socket.io-client';

// Get Socket URL from environment or window config
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 
                   (window.EVENTPULSE_CONFIG && window.EVENTPULSE_CONFIG.SOCKET_URL) || 
                   'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  /**
   * Initialize socket connection
   */
  connect(token) {
    if (this.socket && this.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    console.log('Connecting to Socket.IO server...');

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token || localStorage.getItem('token')
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
      this.connected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket.IO reconnected after ${attemptNumber} attempts`);
      this.connected = true;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Socket.IO reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket.IO reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Socket.IO reconnection failed');
    });

    return this.socket;
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting Socket.IO...');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  /**
   * Emit event to server
   */
  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }

  /**
   * Listen to event from server
   */
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      this.listeners.delete(event);
    }
  }

  // ============================================
  // EVENT-SPECIFIC METHODS
  // ============================================

  /**
   * Join event room for real-time updates
   */
  joinEventRoom(eventId) {
    this.emit('join-event', { eventId });
  }

  /**
   * Leave event room
   */
  leaveEventRoom(eventId) {
    this.emit('leave-event', { eventId });
  }

  /**
   * Listen for new event notifications
   */
  onNewEvent(callback) {
    this.on('new-event', callback);
  }

  /**
   * Listen for event updates
   */
  onEventUpdate(callback) {
    this.on('event-updated', callback);
  }

  /**
   * Listen for event deletion
   */
  onEventDelete(callback) {
    this.on('event-deleted', callback);
  }

  /**
   * Listen for new registrations
   */
  onNewRegistration(callback) {
    this.on('new-registration', callback);
  }

  /**
   * Listen for registration cancellations
   */
  onRegistrationCancelled(callback) {
    this.on('registration-cancelled', callback);
  }

  /**
   * Listen for notifications
   */
  onNotification(callback) {
    this.on('notification', callback);
  }

  /**
   * Listen for event reminders
   */
  onEventReminder(callback) {
    this.on('event-reminder', callback);
  }

  /**
   * Listen for capacity warnings
   */
  onCapacityWarning(callback) {
    this.on('capacity-warning', callback);
  }

  /**
   * Send typing indicator (for chat features)
   */
  sendTyping(eventId, isTyping) {
    this.emit('typing', { eventId, isTyping });
  }

  /**
   * Listen for typing indicators
   */
  onTyping(callback) {
    this.on('typing', callback);
  }

  /**
   * Send message (for chat features)
   */
  sendMessage(eventId, message) {
    this.emit('message', { eventId, message });
  }

  /**
   * Listen for messages
   */
  onMessage(callback) {
    this.on('message', callback);
  }

  /**
   * Request real-time analytics update
   */
  requestAnalyticsUpdate(eventId) {
    this.emit('request-analytics', { eventId });
  }

  /**
   * Listen for analytics updates
   */
  onAnalyticsUpdate(callback) {
    this.on('analytics-update', callback);
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

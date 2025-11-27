let io;

exports.initializeSocketIO = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    // Join event room
    socket.on('join:event', (eventId) => {
      socket.join(`event:${eventId}`);
      console.log(`User ${socket.id} joined event room: ${eventId}`);
    });

    // Leave event room
    socket.on('leave:event', (eventId) => {
      socket.leave(`event:${eventId}`);
      console.log(`User ${socket.id} left event room: ${eventId}`);
    });

    // Join user room (for personal notifications)
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${socket.id} joined user room: ${userId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

// Emit event to specific room
exports.emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

// Emit event to all clients
exports.emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Emit notification to specific user
exports.emitNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notification);
  }
};

// Emit live update to event room
exports.emitLiveUpdateToEvent = (eventId, update) => {
  if (io) {
    io.to(`event:${eventId}`).emit('event:liveUpdate', update);
  }
};

// Get Socket.IO instance
exports.getIO = () => io;

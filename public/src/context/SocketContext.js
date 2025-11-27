import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only initialize socket if explicitly enabled
    const socketEnabled = process.env.REACT_APP_ENABLE_SOCKET === 'true';
    
    if (!socketEnabled) {
      // Socket disabled - app works without real-time features
      return;
    }

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: false, // Disable auto-reconnection
      timeout: 3000
    });

    newSocket.on('connect', () => {
      setConnected(true);

      // Join user room if authenticated
      if (user) {
        newSocket.emit('join:user', user._id);
      }
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('connect_error', () => {
      // Silently handle connection errors - socket is optional
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Join event room
  const joinEventRoom = (eventId) => {
    if (socket && connected) {
      socket.emit('join:event', eventId);
    }
  };

  // Leave event room
  const leaveEventRoom = (eventId) => {
    if (socket && connected) {
      socket.emit('leave:event', eventId);
    }
  };

  // Subscribe to event
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  // Unsubscribe from event
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    connected,
    joinEventRoom,
    leaveEventRoom,
    on,
    off
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // Scroll progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollable = documentHeight - windowHeight;
      const progress = (scrollTop / scrollable) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      loadNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setShowUserMenu(false);
    setShowNotifications(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showUserMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications]);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data.notifications.slice(0, 5));
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/login');
  };

  const handleMenuItemClick = () => {
    setShowUserMenu(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      loadUnreadCount();
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
      
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">⚡</span>
            <span className="brand-text">EventPulse</span>
          </Link>
        </div>

        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              {/* Notifications Dropdown */}
              <div className="navbar-notifications" ref={notifRef}>
                <button 
                  className="navbar-icon-btn"
                  onClick={toggleNotifications}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="notification-badge pulse">{unreadCount}</span>
                  )}
                </button>

                {showNotifications && (
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="unread-count">{unreadCount} new</span>
                      )}
                    </div>
                    
                    <div className="notifications-list">
                      {notifications.length > 0 ? (
                        notifications.map((notif, index) => (
                          <div 
                            key={notif._id} 
                            className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                            onClick={() => !notif.isRead && markAsRead(notif._id)}
                          >
                            <div className="notification-icon">
                              {notif.type === 'event_reminder' && '⏰'}
                              {notif.type === 'event_update' && '📢'}
                              {notif.type === 'registration_confirmed' && '✅'}
                              {notif.type === 'event_cancelled' && '❌'}
                              {notif.type === 'system' && 'ℹ️'}
                            </div>
                            <div className="notification-content">
                              <p className="notification-title">{notif.title}</p>
                              <p className="notification-message">{notif.message}</p>
                              <span className="notification-time">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!notif.isRead && <div className="unread-dot"></div>}
                          </div>
                        ))
                      ) : (
                        <div className="no-notifications">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p>No notifications yet</p>
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <Link 
                        to="/notifications" 
                        className="view-all-link"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all notifications
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="navbar-user" ref={menuRef}>
                <button 
                  className="user-avatar"
                  onClick={toggleUserMenu}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user?.name?.charAt(0).toUpperCase()}</span>
                  )}
                </button>

                {showUserMenu && (
                  <div className="user-menu">
                    <div className="user-menu-header">
                      <p className="user-name">{user?.name}</p>
                      <p className="user-email">{user?.email}</p>
                      <span className="user-role">{user?.role}</span>
                    </div>
                    <div className="user-menu-divider"></div>
                    
                    {isAdmin && (
                      <>
                        <Link to="/admin" className="user-menu-item admin-item" onClick={handleMenuItemClick}>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Panel
                        </Link>
                        <div className="user-menu-divider"></div>
                      </>
                    )}
                    
                    <Link to="/dashboard" className="user-menu-item" onClick={handleMenuItemClick}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link to="/events" className="user-menu-item desktop-only" onClick={handleMenuItemClick}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Events
                    </Link>
                    <Link to="/profile" className="user-menu-item" onClick={handleMenuItemClick}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    <Link to="/my-events" className="user-menu-item" onClick={handleMenuItemClick}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      My Events
                    </Link>
                    <div className="user-menu-divider"></div>
                    <button onClick={handleLogout} className="user-menu-item logout-item">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-lg">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

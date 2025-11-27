import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    ongoingEvents: 0,
    completedEvents: 0,
    totalUsers: 0,
    students: 0,
    teachers: 0,
    parents: 0,
    totalRegistrations: 0,
    revenue: 0,
    attendanceRate: 0,
    newUsers: 0
  });
  
  // Events state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Users state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'Sports',
    startDate: '',
    endDate: '',
    location: '',
    venue: '',
    capacity: 50,
    requiresRegistration: true,
    price: 0,
    isFeatured: false,
    tags: ''
  });

  const [imageFile, setImageFile] = useState(null);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'student',
    grade: '',
    status: 'active'
  });

  const [settings, setSettings] = useState({
    platformName: 'EventPulse',
    contactEmail: 'admin@eventpulse.com',
    timezone: 'UTC',
    defaultCapacity: 50,
    autoApproval: true,
    emailNotifications: true,
    smsNotifications: false,
    allowRegistration: true,
    maintenanceMode: false
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'events') {
      loadEvents();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      const [eventsRes, usersRes] = await Promise.all([
        eventsAPI.getAll({ limit: 1000 }),
        axios.get(`${process.env.REACT_APP_API_URL}/auth/users`).catch(() => ({ data: { users: [] } }))
      ]);

      const allEvents = eventsRes.data.events || [];
      const allUsers = usersRes.data.users || [];

      // Calculate stats
      const upcomingEvents = allEvents.filter(e => e.status === 'upcoming').length;
      const ongoingEvents = allEvents.filter(e => e.status === 'ongoing').length;
      const completedEvents = allEvents.filter(e => e.status === 'completed').length;
      
      const students = allUsers.filter(u => u.role === 'student').length;
      const teachers = allUsers.filter(u => u.role === 'teacher').length;
      const parents = allUsers.filter(u => u.role === 'parent').length;

      const totalRegistrations = allEvents.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
      const revenue = allEvents.reduce((sum, e) => sum + ((e.price || 0) * (e.registeredCount || 0)), 0);
      
      const totalCapacity = allEvents.reduce((sum, e) => sum + (e.capacity || 0), 0);
      const attendanceRate = totalCapacity > 0 ? ((totalRegistrations / totalCapacity) * 100).toFixed(1) : 0;

      // New users in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsers = allUsers.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length;

      setStats({
        totalEvents: allEvents.length,
        upcomingEvents,
        ongoingEvents,
        completedEvents,
        totalUsers: allUsers.length,
        students,
        teachers,
        parents,
        totalRegistrations,
        revenue,
        attendanceRate,
        newUsers
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getAll({ limit: 1000 });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users`);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventForm({
      ...eventForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        e.target.value = '';
        return;
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, GIF, and WebP images are allowed');
        e.target.value = '';
        return;
      }
      setImageFile(file);
    }
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value
    });
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      category: 'Sports',
      startDate: '',
      endDate: '',
      location: '',
      venue: '',
      capacity: 50,
      requiresRegistration: true,
      price: 0,
      isFeatured: false,
      tags: ''
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      category: event.category,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      location: event.location,
      venue: event.venue || '',
      capacity: event.capacity,
      requiresRegistration: event.requiresRegistration,
      price: event.price,
      isFeatured: event.isFeatured,
      tags: event.tags?.join(', ') || ''
    });
    setShowEventModal(true);
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...eventForm,
        tags: eventForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      let eventId;
      if (editingEvent) {
        await eventsAPI.update(editingEvent._id, eventData);
        eventId = editingEvent._id;
        toast.success('Event updated successfully!');
      } else {
        const response = await eventsAPI.create(eventData);
        eventId = response.data.event._id;
        toast.success('Event created successfully!');
      }

      // Upload image if selected
      console.log('Checking image upload - imageFile:', imageFile, 'eventId:', eventId);
      
      if (imageFile && eventId) {
        console.log('Uploading image for event:', eventId);
        console.log('Image file:', imageFile);
        
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
          console.log('Calling uploadImage API...');
          const response = await eventsAPI.uploadImage(eventId, formData);
          console.log('Upload response:', response);
          toast.success('Event image uploaded successfully!');
        } catch (imgError) {
          console.error('Error uploading image:', imgError);
          console.error('Error response:', imgError.response);
          const errorMsg = imgError.response?.data?.message || imgError.message || 'Unknown error';
          toast.error(`Image upload failed: ${errorMsg}`);
        }
      }

      setShowEventModal(false);
      setImageFile(null);
      loadEvents();
      loadDashboardData();
    } catch (error) {
      console.error('Error saving event:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save event';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventsAPI.delete(eventId);
      toast.success('Event deleted successfully!');
      loadEvents();
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  // Bulk event actions
  const handleSelectEvent = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAllEvents = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map(e => e._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedEvents.length} events?`)) return;

    try {
      await Promise.all(selectedEvents.map(id => eventsAPI.delete(id)));
      toast.success(`${selectedEvents.length} events deleted!`);
      setSelectedEvents([]);
      loadEvents();
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to delete some events');
    }
  };

  const handleBulkFeature = async (featured) => {
    try {
      await Promise.all(selectedEvents.map(id => 
        eventsAPI.update(id, { isFeatured: featured })
      ));
      toast.success(`${selectedEvents.length} events updated!`);
      setSelectedEvents([]);
      loadEvents();
    } catch (error) {
      toast.error('Failed to update events');
    }
  };

  // User handlers
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      grade: user.grade || '',
      status: user.status || 'active'
    });
    setShowUserModal(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/users/${editingUser._id}`,
        userForm
      );
      toast.success('User updated successfully!');
      setShowUserModal(false);
      loadUsers();
      loadDashboardData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/auth/users/${userId}`);
      toast.success('User deleted successfully!');
      loadUsers();
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Send password reset email to this user?')) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset-password-admin`, { userId });
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Failed to send reset email');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/auth/users/${userId}`, { status: newStatus });
      toast.success(`User ${newStatus}!`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('platformSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('platformSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Filters
  const filteredEvents = events.filter(event => {
    if (eventFilter === 'all') return true;
    return event.category.toLowerCase() === eventFilter.toLowerCase();
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Admin Control Panel</h1>
              <p>Manage your entire EventPulse platform</p>
            </div>
            <Link to="/admin/scanner" className="btn btn-primary">
              QR Scanner
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dashboard
          </button>
          <button 
            className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Events
          </button>
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </button>
          <button 
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
          <Link to="/admin/scanner" className="admin-tab qr-scanner-tab">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            QR Scanner
          </Link>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="admin-content">
            <div className="content-header">
              <h2>Dashboard Overview</h2>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalEvents}</h3>
                  <p>Total Events</p>
                  <div className="stat-breakdown">
                    <span>{stats.upcomingEvents} upcoming</span>
                    <span>{stats.ongoingEvents} ongoing</span>
                    <span>{stats.completedEvents} completed</span>
                  </div>
                </div>
              </div>

              <div className="stat-card green">
                <div className="stat-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                  <div className="stat-breakdown">
                    <span>{stats.students} students</span>
                    <span>{stats.teachers} teachers</span>
                    <span>{stats.parents} parents</span>
                  </div>
                </div>
              </div>

              <div className="stat-card purple">
                <div className="stat-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalRegistrations}</h3>
                  <p>Total Registrations</p>
                  <div className="stat-breakdown">
                    <span>{stats.attendanceRate}% attendance rate</span>
                  </div>
                </div>
              </div>

              <div className="stat-card orange">
                <div className="stat-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>${stats.revenue.toFixed(2)}</h3>
                  <p>Total Revenue</p>
                  <div className="stat-breakdown">
                    <span>From paid events</span>
                  </div>
                </div>
              </div>

              <div className="stat-card pink">
                <div className="stat-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{stats.newUsers}</h3>
                  <p>New Users</p>
                  <div className="stat-breakdown">
                    <span>Last 30 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button className="action-btn" onClick={() => { setActiveTab('events'); handleCreateEvent(); }}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Event
                </button>
                <button className="action-btn" onClick={() => setActiveTab('users')}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Manage Users
                </button>
                <button className="action-btn" onClick={() => setActiveTab('events')}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="admin-content">
            <div className="content-header">
              <h2>Events Management</h2>
              <button className="btn btn-primary" onClick={handleCreateEvent}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Event
              </button>
            </div>

            {/* Filters and Bulk Actions */}
            <div className="table-controls">
              <div className="filter-group">
                <label>Filter by Category:</label>
                <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="filter-select">
                  <option value="all">All Categories</option>
                  <option value="sports">Sports</option>
                  <option value="academic">Academic</option>
                  <option value="cultural">Cultural</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="debate">Debate</option>
                  <option value="workshop">Workshop</option>
                  <option value="social">Social</option>
                </select>
              </div>

              {selectedEvents.length > 0 && (
                <div className="bulk-actions">
                  <span>{selectedEvents.length} selected</span>
                  <button className="btn btn-sm btn-ghost" onClick={() => handleBulkFeature(true)}>
                    ⭐ Feature
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => handleBulkFeature(false)}>
                    Remove Feature
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={handleBulkDelete} style={{ color: 'var(--error)' }}>
                    Delete Selected
                  </button>
                </div>
              )}
            </div>

            <div className="events-table">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input 
                        type="checkbox" 
                        checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                        onChange={handleSelectAllEvents}
                      />
                    </th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event._id}>
                      <td>
                        <input 
                          type="checkbox"
                          checked={selectedEvents.includes(event._id)}
                          onChange={() => handleSelectEvent(event._id)}
                        />
                      </td>
                      <td className="event-title">{event.title}</td>
                      <td><span className="category-badge">{event.category}</span></td>
                      <td>{new Date(event.startDate).toLocaleDateString()}</td>
                      <td>{event.registeredCount} / {event.capacity}</td>
                      <td><span className={`status-badge ${event.status}`}>{event.status}</span></td>
                      <td>{event.isFeatured ? '⭐' : '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => handleEditEvent(event)} title="Edit">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="btn-icon delete" onClick={() => handleDeleteEvent(event._id)} title="Delete">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="admin-content">
            <div className="content-header">
              <h2>Users Management</h2>
              <input 
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="events-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="event-title">{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className="category-badge">{user.role}</span></td>
                      <td>{user.grade || '-'}</td>
                      <td>
                        <span className={`status-badge ${user.status === 'active' ? 'ongoing' : 'completed'}`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => handleEditUser(user)} title="Edit">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleToggleUserStatus(user._id, user.status || 'active')} 
                            title={user.status === 'active' ? 'Suspend' : 'Activate'}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                          <button className="btn-icon" onClick={() => handleResetPassword(user._id)} title="Reset Password">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </button>
                          <button className="btn-icon delete" onClick={() => handleDeleteUser(user._id)} title="Delete">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="admin-content">
            <div className="content-header">
              <h2>Platform Settings</h2>
              <button className="btn btn-primary" onClick={handleSaveSettings}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Settings
              </button>
            </div>

            <div className="settings-grid">
              {/* General Settings */}
              <div className="settings-section">
                <h3>General Settings</h3>
                <div className="form-group">
                  <label className="form-label">Platform Name</label>
                  <input
                    type="text"
                    name="platformName"
                    value={settings.platformName}
                    onChange={handleSettingsChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleSettingsChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleSettingsChange}
                    className="form-select"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Asia/Colombo">Sri Lanka Time</option>
                  </select>
                </div>
              </div>

              {/* Event Settings */}
              <div className="settings-section">
                <h3>Event Settings</h3>
                <div className="form-group">
                  <label className="form-label">Default Event Capacity</label>
                  <input
                    type="number"
                    name="defaultCapacity"
                    value={settings.defaultCapacity}
                    onChange={handleSettingsChange}
                    className="form-input"
                    min="1"
                  />
                </div>
                <div className="settings-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="autoApproval"
                      checked={settings.autoApproval}
                      onChange={handleSettingsChange}
                    />
                    <span>Auto-approve Registrations</span>
                  </label>
                  <p className="toggle-help">Automatically approve event registrations without manual review</p>
                </div>
                <div className="settings-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="allowRegistration"
                      checked={settings.allowRegistration}
                      onChange={handleSettingsChange}
                    />
                    <span>Allow User Registration</span>
                  </label>
                  <p className="toggle-help">Enable new users to register on the platform</p>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="settings-section">
                <h3>Notification Settings</h3>
                <div className="settings-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={handleSettingsChange}
                    />
                    <span>Email Notifications</span>
                  </label>
                  <p className="toggle-help">Send email notifications for events and updates</p>
                </div>
                <div className="settings-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={settings.smsNotifications}
                      onChange={handleSettingsChange}
                    />
                    <span>SMS Notifications</span>
                  </label>
                  <p className="toggle-help">Send SMS notifications for urgent updates</p>
                </div>
              </div>

              {/* System Settings */}
              <div className="settings-section">
                <h3>System Settings</h3>
                <div className="settings-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleSettingsChange}
                    />
                    <span>Maintenance Mode</span>
                  </label>
                  <p className="toggle-help">Enable maintenance mode to restrict access</p>
                </div>
                <div className="settings-info">
                  <h4>System Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Version:</span>
                      <span className="info-value">1.0.0</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Environment:</span>
                      <span className="info-value">{process.env.NODE_ENV || 'development'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Last Updated:</span>
                      <span className="info-value">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
              <button className="modal-close" onClick={() => setShowEventModal(false)}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmitEvent} className="event-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={eventForm.title}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    value={eventForm.category}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="Debate">Debate</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Social">Social</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Event Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-input"
                />
                <small style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  Upload an image for your event (JPG, PNG, GIF, WebP - Max 5MB)
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={eventForm.startDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={eventForm.endDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={eventForm.location}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Main Hall"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input
                    type="text"
                    name="venue"
                    value={eventForm.venue}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Building A, Room 101"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={eventForm.capacity}
                    onChange={handleInputChange}
                    className="form-input"
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={eventForm.price}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={eventForm.tags}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., sports, competition, annual"
                />
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="requiresRegistration"
                    checked={eventForm.requiresRegistration}
                    onChange={handleInputChange}
                  />
                  <span>Requires Registration</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={eventForm.isFeatured}
                    onChange={handleInputChange}
                  />
                  <span>⭐ Featured Event</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowEventModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmitUser} className="event-form">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={userForm.name}
                  onChange={handleUserInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={userForm.email}
                  onChange={handleUserInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
                    name="role"
                    value={userForm.role}
                    onChange={handleUserInputChange}
                    className="form-select"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <input
                    type="text"
                    name="grade"
                    value={userForm.grade}
                    onChange={handleUserInputChange}
                    className="form-input"
                    placeholder="e.g., 10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  name="status"
                  value={userForm.status}
                  onChange={handleUserInputChange}
                  className="form-select"
                  required
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;


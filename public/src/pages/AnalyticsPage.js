import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const socket = useSocket();

  useEffect(() => {
    loadAnalytics();
    
    // Real-time updates via Socket.IO
    if (socket) {
      socket.on('registration:created', loadAnalytics);
      socket.on('event:created', loadAnalytics);
      socket.on('event:updated', loadAnalytics);
      
      return () => {
        socket.off('registration:created', loadAnalytics);
        socket.off('event:created', loadAnalytics);
        socket.off('event:updated', loadAnalytics);
      };
    }
  }, [socket, timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Calculate stats from real data
  const totalEvents = analytics.totals?.events || 0;
  const totalRegistrations = analytics.totals?.registrations || 0;
  const totalUsers = analytics.totals?.users || 0;
  
  // Get active events count
  const activeEvents = analytics.eventsByStatus?.find(s => s._id === 'upcoming')?.count || 0;
  
  // Calculate attendance rate from registrations
  const attendedCount = analytics.eventsByStatus?.find(s => s._id === 'completed')?.count || 0;
  const attendanceRate = totalEvents > 0 ? Math.round((attendedCount / totalEvents) * 100) : 0;
  
  // Format categories for display
  const popularCategories = (analytics.eventsByCategory || []).map(cat => {
    const percentage = totalEvents > 0 ? Math.round((cat.count / totalEvents) * 100) : 0;
    return {
      name: cat._id || 'Other',
      count: cat.count,
      percentage
    };
  });
  
  // Format recent events
  const recentEvents = (analytics.recentEvents || []).map(event => ({
    name: event.title,
    registrations: event.registeredCount || 0,
    attendance: event.attendedCount || 0,
    rate: event.registeredCount > 0 ? Math.round(((event.attendedCount || 0) / event.registeredCount) * 100) : 0
  }));
  
  // Format registration trends for monthly view
  const monthlyTrend = (analytics.registrationTrends || []).slice(-6).map(trend => ({
    month: new Date(trend._id).toLocaleDateString('en-US', { month: 'short' }),
    events: trend.count,
    registrations: trend.count
  }));
  
  const stats = {
    totalEvents,
    activeEvents,
    totalRegistrations,
    totalAttendance: attendedCount,
    attendanceRate,
    popularCategories,
    recentEvents,
    monthlyTrend
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>Analytics Dashboard</h1>
              <p>Comprehensive insights and event statistics</p>
            </div>
            <div className="time-range-selector">
              <button 
                className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button 
                className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
              <button 
                className={`range-btn ${timeRange === 'year' ? 'active' : ''}`}
                onClick={() => setTimeRange('year')}
              >
                Year
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card purple">
            <div className="metric-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.totalEvents}</div>
              <div className="metric-label">Total Events</div>
              <div className="metric-change positive">+12% from last month</div>
            </div>
          </div>

          <div className="metric-card blue">
            <div className="metric-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.totalRegistrations.toLocaleString()}</div>
              <div className="metric-label">Total Registrations</div>
              <div className="metric-change positive">+8% from last month</div>
            </div>
          </div>

          <div className="metric-card green">
            <div className="metric-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.totalAttendance.toLocaleString()}</div>
              <div className="metric-label">Total Attendance</div>
              <div className="metric-change positive">+5% from last month</div>
            </div>
          </div>

          <div className="metric-card orange">
            <div className="metric-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.attendanceRate}%</div>
              <div className="metric-label">Attendance Rate</div>
              <div className="metric-change positive">+2% from last month</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Category Distribution */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Event Categories</h3>
              <button className="btn btn-sm btn-ghost">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>
            <div className="category-chart">
              {stats.popularCategories.map((category, index) => (
                <div key={index} className="category-bar">
                  <div className="category-info">
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">{category.count} events</span>
                  </div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: `${category.percentage}%`,
                        background: `hsl(${index * 60}, 70%, 60%)`
                      }}
                    ></div>
                  </div>
                  <span className="category-percentage">{category.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Monthly Trend</h3>
              <button className="btn btn-sm btn-ghost">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>
            <div className="trend-chart">
              {stats.monthlyTrend.map((month, index) => (
                <div key={index} className="trend-bar">
                  <div className="trend-value">{month.registrations}</div>
                  <div 
                    className="trend-column"
                    style={{ height: `${(month.registrations / 400) * 100}%` }}
                  ></div>
                  <div className="trend-label">{month.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Events Performance */}
        <div className="performance-card">
          <div className="chart-header">
            <h3>Recent Events Performance</h3>
            <button className="btn btn-sm btn-primary">View All Events</button>
          </div>
          <div className="performance-table">
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Registrations</th>
                  <th>Attendance</th>
                  <th>Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEvents.map((event, index) => (
                  <tr key={index}>
                    <td className="event-name">{event.name}</td>
                    <td>{event.registrations}</td>
                    <td>{event.attendance}</td>
                    <td>
                      <div className="rate-cell">
                        <div className="rate-bar">
                          <div 
                            className="rate-fill"
                            style={{ width: `${event.rate}%` }}
                          ></div>
                        </div>
                        <span>{event.rate}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${event.rate >= 95 ? 'badge-success' : event.rate >= 90 ? 'badge-info' : 'badge-warning'}`}>
                        {event.rate >= 95 ? 'Excellent' : event.rate >= 90 ? 'Good' : 'Average'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats-grid">
          <div className="quick-stat-card">
            <div className="quick-stat-icon purple">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">12</div>
              <div className="quick-stat-label">Active Events</div>
            </div>
          </div>

          <div className="quick-stat-card">
            <div className="quick-stat-icon blue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">2,847</div>
              <div className="quick-stat-label">Active Users</div>
            </div>
          </div>

          <div className="quick-stat-card">
            <div className="quick-stat-icon green">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">456</div>
              <div className="quick-stat-label">Badges Earned</div>
            </div>
          </div>

          <div className="quick-stat-card">
            <div className="quick-stat-icon orange">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">98%</div>
              <div className="quick-stat-label">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;



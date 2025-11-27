import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import UserQRCode from '../components/UserQRCode';
import { authAPI } from '../services/api';
import './ProfilePage.css';
import './ProfilePage-modal.css';

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    grade: user?.grade || '',
    house: user?.house || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile(formData);
    
    if (result.success) {
      setIsEditing(false);
    }
    
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      grade: user?.grade || '',
      house: user?.house || ''
    });
    setIsEditing(false);
  };

  const getHouseColor = (house) => {
    const colors = {
      Red: '#ef4444',
      Blue: '#3b82f6',
      Green: '#10b981',
      Yellow: '#f59e0b'
    };
    return colors[house] || '#6366f1';
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    
    setLoading(true);
    try {
      await authAPI.deleteAccount();
      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div className="container">
          <h1>My Profile</h1>
          <p>Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="container">
        <div className="profile-grid">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar-large">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="profile-header-info">
                <h2>{user?.name}</h2>
                <p className="profile-role">{user?.role}</p>
                {user?.house && (
                  <span 
                    className="house-badge" 
                    style={{ background: getHouseColor(user.house) }}
                  >
                    {user.house} House
                  </span>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-value">{user?.points || 0}</div>
                <div className="stat-label">Points</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{user?.badges?.length || 0}</div>
                <div className="stat-label">Badges</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Events</div>
              </div>
            </div>

            {/* Badges */}
            {user?.badges && user.badges.length > 0 && (
              <div className="badges-section">
                <h3>Achievements</h3>
                <div className="badges-grid">
                  {user.badges.map((badge, index) => (
                    <div key={index} className="badge-card">
                      <div className="badge-icon-large">{badge.icon || '🏆'}</div>
                      <div className="badge-name">{badge.name}</div>
                      <div className="badge-date">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Form */}
          <div className="profile-form-card">
            <div className="form-header">
              <h3>Personal Information</h3>
              {!isEditing ? (
                <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="form-actions-header">
                  <button className="btn btn-ghost btn-sm" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                />
              </div>

              {user?.role === 'student' && (
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="form-input"
                    disabled={!isEditing}
                    placeholder="e.g., 10"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">House</label>
                <select
                  name="house"
                  value={formData.house}
                  onChange={handleChange}
                  className="form-select"
                  disabled={!isEditing}
                >
                  <option value="">Select House</option>
                  <option value="Marsh">Marsh</option>
                  <option value="Reed">Reed</option>
                  <option value="Boake">Boake</option>
                  <option value="Harward">Harward</option>
                  <option value="Hartley">Hartley</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Account Type</label>
                <input
                  type="text"
                  value={user?.role}
                  className="form-input"
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Member Since</label>
                <input
                  type="text"
                  value={new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                  className="form-input"
                  disabled
                />
              </div>
            </form>

            {/* Notification Preferences */}
            <div className="preferences-section">
              <h3>Notification Preferences</h3>
              <div className="preferences-list">
                <label className="preference-item">
                  <div>
                    <div className="preference-label">Email Notifications</div>
                    <div className="preference-description">Receive event updates via email</div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle-switch"
                    defaultChecked={user?.preferences?.notifications?.email}
                  />
                </label>
                <label className="preference-item">
                  <div>
                    <div className="preference-label">Push Notifications</div>
                    <div className="preference-description">Get real-time push notifications</div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle-switch"
                    defaultChecked={user?.preferences?.notifications?.push}
                  />
                </label>
              </div>
            </div>

            {/* QR Code Section */}
            <UserQRCode 
              user={user}
            />

            {/* Danger Zone */}
            <div className="danger-zone">
              <h3>Danger Zone</h3>
              <div className="danger-actions">
                <button className="btn btn-outline" onClick={() => setShowPasswordModal(true)}>
                  Change Password
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{color: 'var(--error)', marginBottom: '1rem'}}>
                <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="form-group">
                <label className="form-label">Type <strong>DELETE</strong> to confirm</label>
                <input
                  type="text"
                  className="form-input"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                style={{background: 'var(--error)'}}
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirmText !== 'DELETE'}
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;



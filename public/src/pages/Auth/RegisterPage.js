import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    grade: '',
    house: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
    }

    let score = 0;
    const password = formData.password;

    // Length
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;

    // Contains lowercase and uppercase
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;

    // Contains numbers
    if (/\d/.test(password)) score += 1;

    // Contains special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    const strengths = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Weak', color: '#ef4444' },
      { score: 2, label: 'Fair', color: '#f59e0b' },
      { score: 3, label: 'Good', color: '#3b82f6' },
      { score: 4, label: 'Strong', color: '#10b981' },
      { score: 5, label: 'Very Strong', color: '#059669' }
    ];

    setPasswordStrength(strengths[score]);
  }, [formData.password]);

  // Real-time validation
  useEffect(() => {
    const newErrors = {};

    if (touched.name && !formData.name) {
      newErrors.name = 'Name is required';
    }

    if (touched.email) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    if (touched.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    if (touched.confirmPassword) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (formData.role === 'student') {
      if (touched.studentId) {
        if (!formData.studentId) {
          newErrors.studentId = 'Student ID is required';
        } else if (!/^\d{6}$/.test(formData.studentId)) {
          newErrors.studentId = 'Student ID must be 6 digits';
        }
      }

      if (touched.grade && !formData.grade) {
        newErrors.grade = 'Grade is required';
      }

      if (touched.house && !formData.house) {
        newErrors.house = 'House is required';
      }
    }

    setErrors(newErrors);
  }, [formData, touched]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBlur = (field) => {
    setTouched({
      ...touched,
      [field]: true
    });
  };

  const getFieldStatus = (field) => {
    if (!touched[field]) return '';
    if (errors[field]) return 'error';
    if (formData[field]) return 'success';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ['name', 'email', 'password', 'confirmPassword'];
    if (formData.role === 'student') {
      allFields.push('studentId', 'grade', 'house');
    }
    
    const newTouched = {};
    allFields.forEach(field => newTouched[field] = true);
    setTouched(newTouched);

    // Check for errors
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      setSubmitSuccess(true);
      setTimeout(() => navigate('/dashboard'), 800);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p>Join EventPulse and never miss an event</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className={`form-group ${getFieldStatus('name')}`}>
          <label className="form-label">Full Name</label>
          <div className="input-wrapper">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              className="form-input"
              placeholder="John Doe"
            />
            <div className="input-icon">
              {getFieldStatus('name') === 'success' && (
                <svg className="icon-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {getFieldStatus('name') === 'error' && (
                <svg className="icon-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          {errors.name && touched.name && (
            <div className="error-message slide-in">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.name}
            </div>
          )}
        </div>

        <div className={`form-group ${getFieldStatus('email')}`}>
          <label className="form-label">Email Address</label>
          <div className="input-wrapper">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className="form-input"
              placeholder="you@example.com"
            />
            <div className="input-icon">
              {getFieldStatus('email') === 'success' && (
                <svg className="icon-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {getFieldStatus('email') === 'error' && (
                <svg className="icon-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          {errors.email && touched.email && (
            <div className="error-message slide-in">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-select"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        {formData.role === 'student' && (
          <>
            <div className={`form-group ${getFieldStatus('studentId')}`}>
              <label className="form-label">Student ID</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  onBlur={() => handleBlur('studentId')}
                  className="form-input"
                  placeholder="123456"
                  maxLength="6"
                />
                <div className="input-icon">
                  {getFieldStatus('studentId') === 'success' && (
                    <svg className="icon-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {getFieldStatus('studentId') === 'error' && (
                    <svg className="icon-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
              {errors.studentId && touched.studentId && (
                <div className="error-message slide-in">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.studentId}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Grade</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  onBlur={() => handleBlur('grade')}
                  className="form-select"
                >
                  <option value="">Select Grade</option>
                  {[5, 6, 7, 8, 9, 10, 11, 12, 13].map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">House</label>
                <select
                  name="house"
                  value={formData.house}
                  onChange={handleChange}
                  onBlur={() => handleBlur('house')}
                  className="form-select"
                >
                  <option value="">Select House</option>
                  {['Marsh', 'Reed', 'Boake', 'Harward', 'Hartley'].map(house => (
                    <option key={house} value={house}>{house}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        <div className={`form-group ${getFieldStatus('password')}`}>
          <label className="form-label">Password</label>
          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              className="form-input"
              placeholder="••••••••"
            />
            <div className="input-icons">
              {getFieldStatus('password') === 'success' && (
                <svg className="icon-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {getFieldStatus('password') === 'error' && (
                <svg className="icon-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Password Strength Meter */}
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill" 
                  style={{ 
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: passwordStrength.color
                  }}
                ></div>
              </div>
              <span className="strength-label" style={{ color: passwordStrength.color }}>
                {passwordStrength.label}
              </span>
            </div>
          )}
          
          {errors.password && touched.password && (
            <div className="error-message slide-in">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.password}
            </div>
          )}
        </div>

        <div className={`form-group ${getFieldStatus('confirmPassword')}`}>
          <label className="form-label">Confirm Password</label>
          <div className="input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              className="form-input"
              placeholder="••••••••"
            />
            <div className="input-icons">
              {getFieldStatus('confirmPassword') === 'success' && (
                <svg className="icon-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {getFieldStatus('confirmPassword') === 'error' && (
                <svg className="icon-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <div className="error-message slide-in">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.confirmPassword}
            </div>
          )}
        </div>

        <label className="checkbox-label">
          <input type="checkbox" required />
          <span>
            I agree to the{' '}
            <Link to="/terms" className="auth-link">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="auth-link">Privacy Policy</Link>
          </span>
        </label>

        <button 
          type="submit" 
          className={`btn btn-primary btn-lg ${submitSuccess ? 'success' : ''}`}
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={loading || submitSuccess}
        >
          {submitSuccess ? (
            <div className="success-content">
              <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Success!
            </div>
          ) : loading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="auth-link-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;


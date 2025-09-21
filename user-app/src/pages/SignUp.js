import React, { useState } from 'react';
import { Eye, EyeOff, User, Phone, Lock, UserPlus } from 'lucide-react';

function Signup() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Basic validation
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, phoneNumber, password })
      });

      const data = await res.json();

      if (res.ok) {
        setErrors({ success: 'Registration successful! Redirecting...' });
        localStorage.setItem('token', data.token);
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        setErrors({ general: data.message || 'Signup failed' });
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 🎨 (your styles remain the same, only removed unused ones)
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #581c87 50%, #312e81 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const cardStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '450px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    overflow: 'hidden'
  };

  const headerStyle = {
    background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
    padding: '32px',
    textAlign: 'center',
    color: 'white'
  };

  const iconContainerStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 8px 0'
  };

  const subtitleStyle = {
    color: 'rgba(191, 219, 254, 1)',
    margin: '0',
    fontSize: '14px'
  };

  const formContainerStyle = {
    padding: '32px'
  };

  const fieldStyle = { marginBottom: '20px' };
  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' };
  const inputContainerStyle = { position: 'relative' };
  const inputIconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' };
  const inputStyle = { display: 'block', width: '100%', paddingLeft: '40px', paddingRight: '40px', paddingTop: '12px', paddingBottom: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', transition: 'all 0.2s ease', boxSizing: 'border-box', backgroundColor: '#fff' };
  const inputErrorStyle = { ...inputStyle, borderColor: '#fca5a5', backgroundColor: '#fef2f2' };
  const inputFocusStyle = { outline: 'none', borderColor: '#3b82f6', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' };
  const passwordToggleStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', transition: 'color 0.2s ease' };
  const errorStyle = { fontSize: '12px', color: '#dc2626', marginTop: '4px' };

  const messageBoxStyle = { padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' };
  const errorBoxStyle = { ...messageBoxStyle, backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' };
  const successBoxStyle = { ...messageBoxStyle, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' };

  const buttonStyle = { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: 'white', background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transform: 'scale(1)' };
  const buttonHoverStyle = { ...buttonStyle, background: 'linear-gradient(90deg, #1d4ed8 0%, #6d28d9 100%)', transform: 'scale(1.02)' };
  const buttonDisabledStyle = { ...buttonStyle, opacity: '0.5', cursor: 'not-allowed', transform: 'scale(1)' };

  const linkContainerStyle = { textAlign: 'center', fontSize: '14px', marginTop: '16px' };
  const linkStyle = { color: '#2563eb', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s ease', background: 'none', border: 'none', padding: '0' };

  const footerStyle = { padding: '16px 32px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', textAlign: 'center' };
  const footerTextStyle = { fontSize: '12px', color: '#6b7280', margin: '0' };

  const spinnerStyle = { animation: 'spin 1s linear infinite', borderRadius: '50%', width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid white', marginRight: '8px' };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={iconContainerStyle}>
            <UserPlus size={32} />
          </div>
          <h1 style={titleStyle}>Create Account</h1>
          <p style={subtitleStyle}>Join the SOS emergency network</p>
        </div>

        {/* Signup Form */}
        <div style={formContainerStyle}>
          {/* Full Name Field */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Full Name</label>
            <div style={inputContainerStyle}>
              <div style={inputIconStyle}>
                <User size={20} />
              </div>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={errors.fullName ? inputErrorStyle : inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, errors.fullName ? inputErrorStyle : inputStyle)}
              />
            </div>
            {errors.fullName && <p style={errorStyle}>{errors.fullName}</p>}
          </div>

          {/* Phone Number Field */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Phone Number</label>
            <div style={inputContainerStyle}>
              <div style={inputIconStyle}>
                <Phone size={20} />
              </div>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={errors.phoneNumber ? inputErrorStyle : inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, errors.phoneNumber ? inputErrorStyle : inputStyle)}
              />
            </div>
            {errors.phoneNumber && <p style={errorStyle}>{errors.phoneNumber}</p>}
          </div>

          {/* Password Field */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <div style={inputContainerStyle}>
              <div style={inputIconStyle}>
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={errors.password ? inputErrorStyle : inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, errors.password ? inputErrorStyle : inputStyle)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={passwordToggleStyle}
                onMouseEnter={(e) => e.target.style.color = '#6b7280'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p style={errorStyle}>{errors.password}</p>}
          </div>

          {/* Error/Success Messages */}
          {errors.general && <div style={errorBoxStyle}>{errors.general}</div>}
          {errors.success && <div style={successBoxStyle}>{errors.success}</div>}

          {/* Signup Button */}
          <button
            onClick={handleSignup}
            disabled={isLoading}
            style={isLoading ? buttonDisabledStyle : buttonStyle}
            onMouseEnter={(e) => !isLoading && Object.assign(e.target.style, buttonHoverStyle)}
            onMouseLeave={(e) => !isLoading && Object.assign(e.target.style, buttonStyle)}
            onMouseDown={(e) => !isLoading && (e.target.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => !isLoading && (e.target.style.transform = 'scale(1.02)')}
          >
            {isLoading ? (
              <>
                <div style={spinnerStyle}></div>
                Creating account...
              </>
            ) : (
              <>
                <UserPlus size={16} style={{ marginRight: '8px' }} />
                Create Account
              </>
            )}
          </button>

          {/* Login Link */}
          <div style={linkContainerStyle}>
            <button
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
              onMouseLeave={(e) => e.target.style.color = '#2563eb'}
              onClick={() => window.location.href = '/login'}
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <p style={footerTextStyle}>
            Your information is encrypted and secure
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Signup;

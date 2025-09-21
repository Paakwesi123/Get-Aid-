import React, { useState } from 'react';
import { AlertCircle, Shield, CheckCircle2, Eye, EyeOff } from 'lucide-react';

function TeamSignup() {
  const [teamName, setTeamName] = useState('');
  const [teamType, setTeamType] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!teamType) {
      setMessage({ type: 'error', text: 'Please select a team type' });
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('http://localhost:5000/api/teams/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, teamType, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: `Registration successful! Your team ID is ${data.team.teamId}` 
        });
        
        // Reset form after success
        setTimeout(() => {
          setTeamName('');
          setTeamType('');
          setPassword('');
          setMessage('');
          // navigate('/teamlogin'); // Uncomment when using router
        }, 4000);
        
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Server error during registration' });
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamTypeIcon = (type) => {
    switch(type) {
      case 'fire': return '🔥';
      case 'police': return '🚓';
      case 'ambulance': return '🚑';
      default: return '🚨';
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #f97316 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      pointerEvents: 'none'
    },
    patternDiv: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
      transform: 'skewY(-6deg)'
    },
    mainWrapper: {
      position: 'relative',
      width: '100%',
      maxWidth: '28rem',
      zIndex: 10
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      overflow: 'hidden'
    },
    header: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      padding: '1.5rem 2rem',
      textAlign: 'center'
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '0.5rem'
    },
    headerText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'white',
      margin: 0
    },
    headerSubtext: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '0.875rem',
      margin: 0
    },
    formContainer: {
      padding: '2rem'
    },
    inputGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      backgroundColor: '#f9fafb',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#ef4444',
      backgroundColor: 'white',
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
    },
    select: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      backgroundColor: '#f9fafb',
      transition: 'all 0.3s ease',
      outline: 'none',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.5em 1.5em',
      paddingRight: '2.5rem',
      boxSizing: 'border-box'
    },
    passwordContainer: {
      position: 'relative'
    },
    passwordInput: {
      width: '100%',
      padding: '0.75rem 3rem 0.75rem 1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      backgroundColor: '#f9fafb',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    passwordToggle: {
      position: 'absolute',
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      transition: 'color 0.2s ease'
    },
    button: {
      width: '100%',
      padding: '1rem',
      borderRadius: '0.75rem',
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    buttonHover: {
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-1px)'
    },
    buttonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    loadingSpinner: {
      width: '1.5rem',
      height: '1.5rem',
      border: '2px solid transparent',
      borderTop: '2px solid white',
      borderRadius: '50%',
      marginRight: '0.75rem',
      animation: 'spin 1s linear infinite'
    },
    messageContainer: {
      marginTop: '1.5rem',
      padding: '1rem',
      borderRadius: '0.75rem',
      borderLeft: '4px solid',
      display: 'flex',
      alignItems: 'center'
    },
    messageSuccess: {
      backgroundColor: '#f0fdf4',
      borderLeftColor: '#22c55e',
      color: '#166534'
    },
    messageError: {
      backgroundColor: '#fef2f2',
      borderLeftColor: '#ef4444',
      color: '#991b1b'
    },
    messageText: {
      fontWeight: '500',
      margin: 0,
      marginLeft: '0.75rem'
    },
    teamPreview: {
      marginTop: '1.5rem',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.75rem',
      border: '2px dashed #d1d5db',
      textAlign: 'center'
    },
    teamPreviewIcon: {
      fontSize: '2rem',
      marginBottom: '0.5rem'
    },
    teamPreviewText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: 0
    },
    teamPreviewHighlight: {
      fontWeight: '600',
      color: '#374151'
    },
    footer: {
      textAlign: 'center',
      marginTop: '1.5rem',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    footerText: {
      fontSize: '0.875rem',
      margin: 0
    },
    footerLink: {
      marginLeft: '0.25rem',
      color: 'white',
      fontWeight: '600',
      textDecoration: 'underline',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      transition: 'color 0.2s ease'
    },
    emergencyIcons: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      opacity: 0.05,
      zIndex: 1
    },
    floatingIcon: {
      position: 'absolute',
      fontSize: '3rem',
      animation: 'float 3s ease-in-out infinite'
    }
  };

  const [focusedInput, setFocusedInput] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(false);

  return (
    <div style={styles.container}>
      {/* Add CSS animations */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.05; }
            50% { opacity: 0.1; }
          }
        `}
      </style>
      
      {/* Background Pattern */}
      <div style={styles.backgroundPattern}>
        <div style={styles.patternDiv}></div>
      </div>
      
      <div style={styles.mainWrapper}>
        {/* Main Card */}
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerTitle}>
              <Shield size={32} color="white" style={{marginRight: '0.75rem'}} />
              <h1 style={styles.headerText}>Emergency SOS</h1>
            </div>
            <p style={styles.headerSubtext}>Team Registration Portal</p>
          </div>

          {/* Form Container */}
          <div style={styles.formContainer}>
            {/* Team Name Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Team Name</label>
              <input
                type="text"
                placeholder="Enter your team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onFocus={() => setFocusedInput('teamName')}
                onBlur={() => setFocusedInput(null)}
                required
                style={{
                  ...styles.input,
                  ...(focusedInput === 'teamName' ? styles.inputFocus : {})
                }}
              />
            </div>

            {/* Team Type Select */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Team Type</label>
              <select
                value={teamType}
                onChange={(e) => setTeamType(e.target.value)}
                onFocus={() => setFocusedInput('teamType')}
                onBlur={() => setFocusedInput(null)}
                required
                style={{
                  ...styles.select,
                  ...(focusedInput === 'teamType' ? styles.inputFocus : {})
                }}
              >
                <option value="">Select Team Type</option>
                <option value="fire">🔥 Fire Department</option>
                <option value="police">🚓 Police Department</option>
                <option value="ambulance">🚑 Medical Emergency</option>
              </select>
            </div>

            {/* Password Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Team Password</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  required
                  style={{
                    ...styles.passwordInput,
                    ...(focusedInput === 'password' ? styles.inputFocus : {})
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    ...styles.passwordToggle,
                    color: showPassword ? '#6b7280' : '#9ca3af'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSignup}
              disabled={isLoading}
              onMouseEnter={() => setHoveredButton(true)}
              onMouseLeave={() => setHoveredButton(false)}
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : hoveredButton ? styles.buttonHover : {})
              }}
            >
              {isLoading ? (
                <>
                  <div style={styles.loadingSpinner}></div>
                  Registering...
                </>
              ) : (
                <>
                  <Shield size={20} style={{marginRight: '0.5rem'}} />
                  Register Team
                </>
              )}
            </button>

            {/* Message Display */}
            {message && (
              <div style={{
                ...styles.messageContainer,
                ...(message.type === 'success' ? styles.messageSuccess : styles.messageError)
              }}>
                {message.type === 'success' ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <p style={styles.messageText}>{message.text}</p>
              </div>
            )}

            {/* Team Preview */}
            {teamType && (
              <div style={styles.teamPreview}>
                <div style={styles.teamPreviewIcon}>{getTeamTypeIcon(teamType)}</div>
                <p style={styles.teamPreviewText}>
                  Registering as: <span style={styles.teamPreviewHighlight}>
                    {teamType.charAt(0).toUpperCase() + teamType.slice(1)} Team
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?
            <button 
              style={{
                ...styles.footerLink,
                color: hoveredLink ? '#fef08a' : 'white'
              }}
              onMouseEnter={() => setHoveredLink(true)}
              onMouseLeave={() => setHoveredLink(false)}
              onClick={() => {
                // If you're using React Router, uncomment the line below:
                // navigate('/teamlogin');
                
                // For now, you can use window.location for navigation:
                window.location.href = '/teamlogin';
              }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* Emergency Icons Background */}
      <div style={styles.emergencyIcons}>
        <div style={{...styles.floatingIcon, top: '5rem', left: '5rem', animationDelay: '0s'}}>🚨</div>
        <div style={{...styles.floatingIcon, top: '10rem', right: '8rem', fontSize: '2.5rem', animationDelay: '1s'}}>🔥</div>
        <div style={{...styles.floatingIcon, bottom: '8rem', left: '4rem', animationDelay: '2s'}}>🚓</div>
        <div style={{...styles.floatingIcon, bottom: '5rem', right: '5rem', fontSize: '2.5rem', animationDelay: '0.5s'}}>🚑</div>
        <div style={{...styles.floatingIcon, top: '15rem', left: '50%', fontSize: '2rem', animationDelay: '1.5s'}}>⚡</div>
      </div>
    </div>
  );
}

export default TeamSignup;
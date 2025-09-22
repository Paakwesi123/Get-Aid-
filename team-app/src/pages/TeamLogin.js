import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle2, Eye, EyeOff, LogIn } from 'lucide-react';

const TeamLogin = ({ onLoginSuccess, onNavigateToSignup }) => {
  const [teamId, setTeamId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/teams/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful:', data);

      // Store team data in sessionStorage
      const teamData = { 
        teamId, 
        teamType: data.teamType || 'fire',
        token: data.token,
        loginTime: new Date().toISOString()
      };
      sessionStorage.setItem('teamData', JSON.stringify(teamData));

      // Show initializing message
      setLoading(false);
      setInitializing(true);
      
      // Simulate system initialization
      setTimeout(() => {
        setInitializing(false);
        
        // FIXED: Proper navigation handling
        if (onLoginSuccess) {
          // This is the preferred method - let parent component handle navigation
          onLoginSuccess(teamData);
        } else {
          // Fallback: If no onLoginSuccess callback, try different navigation methods
          console.warn('No onLoginSuccess callback provided, using fallback navigation');
          
          // Method 1: Try React Router if available
          if (window.history && window.history.pushState) {
            window.history.pushState({}, '', '/dashboard');
            // Trigger a popstate event to notify React Router
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
          
          // Method 2: If that doesn't work, try hash routing
          if (!document.querySelector('[data-react-router-rendered]')) {
            window.location.hash = '#/dashboard';
          }
          
          // Method 3: Last resort - full page reload to dashboard
          // Only use this if the above methods don't work
          // Uncomment the line below if needed:
          // window.location.href = '/dashboard';
        }
      }, 2000);

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid credentials. Please try again.');
      setLoading(false);
      setInitializing(false); // Reset initializing state on error
    }
  };

  const handleSignUpClick = () => {
    if (onNavigateToSignup) {
      onNavigateToSignup();
    } else {
      // Fallback navigation
      console.warn('No onNavigateToSignup callback provided, using fallback navigation');
      
      // Try hash routing first
      if (window.location.hash !== undefined) {
        window.location.hash = '#/teamsignup';
      } else {
        window.location.href = '/teamsignup';
      }
    }
  };

  // ... rest of your styles object remains the same ...
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
    welcomeText: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    welcomeTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#374151',
      margin: '0 0 0.5rem 0'
    },
    welcomeSubtitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: 0
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
      justifyContent: 'center',
      marginBottom: '1rem'
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
    initializingContainer: {
      textAlign: 'center',
      padding: '2rem'
    },
    initializingTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#374151',
      margin: '1rem 0 0.5rem 0'
    },
    initializingSubtitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: 0
    },
    progressBar: {
      width: '100%',
      height: '0.5rem',
      backgroundColor: '#e5e7eb',
      borderRadius: '0.25rem',
      overflow: 'hidden',
      marginTop: '1.5rem'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#ef4444',
      borderRadius: '0.25rem',
      animation: 'progress 2s ease-out forwards'
    },
    errorContainer: {
      marginBottom: '1.5rem',
      padding: '1rem',
      borderRadius: '0.75rem',
      borderLeft: '4px solid #ef4444',
      backgroundColor: '#fef2f2',
      color: '#991b1b',
      display: 'flex',
      alignItems: 'center'
    },
    errorText: {
      fontWeight: '500',
      margin: 0,
      marginLeft: '0.75rem'
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
    },
    securityBadge: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.75rem',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '0.5rem',
      marginTop: '1rem',
      fontSize: '0.875rem',
      color: '#dc2626',
      fontWeight: '500'
    }
  };

  // Show initializing screen
  if (initializing) {
    return (
      <div style={styles.container}>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            @keyframes progress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.7; }
              50% { opacity: 1; }
            }
          `}
        </style>
        
        <div style={styles.mainWrapper}>
          <div style={styles.card}>
            <div style={styles.header}>
              <div style={styles.headerTitle}>
                <Shield size={32} color="white" style={{marginRight: '0.75rem', animation: 'pulse 2s ease-in-out infinite'}} />
                <h1 style={styles.headerText}>Emergency SOS</h1>
              </div>
              <p style={styles.headerSubtext}>System Initialization</p>
            </div>
            
            <div style={styles.initializingContainer}>
              <CheckCircle2 size={64} color="#ef4444" style={{animation: 'pulse 1.5s ease-in-out infinite'}} />
              <h2 style={styles.initializingTitle}>Initializing Emergency Response System</h2>
              <p style={styles.initializingSubtitle}>Setting up your secure dashboard...</p>
              
              <div style={styles.progressBar}>
                <div style={styles.progressFill}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <p style={styles.headerSubtext}>Team Access Portal</p>
          </div>

          {/* Form Container */}
          <div style={styles.formContainer}>
            {/* Welcome Text */}
            <div style={styles.welcomeText}>
              <h2 style={styles.welcomeTitle}>Welcome Back</h2>
              <p style={styles.welcomeSubtitle}>Sign in to access your emergency response dashboard</p>
            </div>

            {/* Error Display */}
            {error && (
              <div style={styles.errorContainer}>
                <AlertCircle size={20} />
                <p style={styles.errorText}>{error}</p>
              </div>
            )}

            {/* Team ID Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Team ID</label>
              <input
                type="text"
                placeholder="Enter your team ID (e.g., TEAM-ABC123)"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                onFocus={() => setFocusedInput('teamId')}
                onBlur={() => setFocusedInput(null)}
                required
                style={{
                  ...styles.input,
                  ...(focusedInput === 'teamId' ? styles.inputFocus : {})
                }}
              />
            </div>

            {/* Password Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your team password"
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
              onClick={handleLogin}
              disabled={loading}
              onMouseEnter={() => setHoveredButton(true)}
              onMouseLeave={() => setHoveredButton(false)}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : hoveredButton ? styles.buttonHover : {})
              }}
            >
              {loading ? (
                <>
                  <div style={styles.loadingSpinner}></div>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={20} style={{marginRight: '0.5rem'}} />
                  Sign In
                </>
              )}
            </button>

            {/* Security Badge */}
            <div style={styles.securityBadge}>
              <Shield size={16} style={{marginRight: '0.5rem'}} />
              Secure Emergency Response Access
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?
            <button 
              style={{
                ...styles.footerLink,
                color: hoveredLink ? '#fef08a' : 'white'
              }}
              onMouseEnter={() => setHoveredLink(true)}
              onMouseLeave={() => setHoveredLink(false)}
              onClick={handleSignUpClick}
            >
              Sign Up
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
};

export default TeamLogin;
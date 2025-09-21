// src/App.js
import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleMap, Marker, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import io from 'socket.io-client';

import TeamSignup from './pages/TeamSignup';
import TeamLogin from './pages/TeamLogin';

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const containerStyle = {
  width: '100%',
  height: '450px',
  borderRadius: '12px',
  overflow: 'hidden'
};

const defaultCenter = {
  lat: 7.9465,
  lng: -1.0232
};

// Enhanced Icon Components
const MapIcon = () => <span style={{ fontSize: '20px' }}>🗺️</span>;
const ClockIcon = () => <span style={{ fontSize: '16px' }}>⏰</span>;
const AlertIcon = () => <span style={{ fontSize: '20px' }}>🚨</span>;
const CheckIcon = () => <span style={{ fontSize: '16px' }}>✅</span>;
const HistoryIcon = () => <span style={{ fontSize: '16px' }}>📋</span>;
const StatsIcon = () => <span style={{ fontSize: '16px' }}>📊</span>;
const BadgeIcon = () => <span style={{ fontSize: '20px' }}>👮</span>;
const WifiIcon = ({ connected }) => <span style={{ fontSize: '16px' }}>{connected ? '📶' : '📵'}</span>;
const LogoutIcon = () => <span style={{ fontSize: '16px' }}>🚪</span>;

// Professional Badge Component
const ProfessionalBadge = ({ teamType, teamId }) => {
  const getBadgeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'police':
        return { background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white' };
      case 'fire':
        return { background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', color: 'white' };
      case 'ambulance':
        return { background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white' };
      default:
        return { background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)', color: 'white' };
    }
  };

  return (
    <div style={{
      ...getBadgeStyle(teamType),
      padding: '12px 20px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      minWidth: '200px'
    }}>
      <BadgeIcon />
      <div>
        <div style={{ fontSize: '16px', fontWeight: '700' }}>{teamType?.toUpperCase() || 'EMERGENCY'} UNIT</div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>ID: {teamId}</div>
      </div>
    </div>
  );
};

// Statistics Card Component
const StatsCard = ({ title, value, subtitle, icon, color = '#3b82f6', trend }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: `2px solid ${color}20`
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div style={{ fontSize: '24px' }}>{icon}</div>
      {trend !== undefined && (
        <span style={{
          fontSize: '12px',
          padding: '4px 8px',
          borderRadius: '12px',
          backgroundColor: trend > 0 ? '#dcfce7' : '#fef2f2',
          color: trend > 0 ? '#166534' : '#991b1b'
        }}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div style={{ fontSize: '28px', fontWeight: '700', color, marginBottom: '4px' }}>{value}</div>
    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{title}</div>
    {subtitle && <div style={{ fontSize: '12px', color: '#6b7280' }}>{subtitle}</div>}
  </div>
);

// Emergency History Item
const HistoryItem = ({ emergency, index }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'assigned': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEmergencyIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'medical': return '🏥';
      case 'fire': return '🔥';
      case 'crime': return '👮';
      case 'accident': return '🚗';
      case 'domestic': return '🏠';
      default: return '🚨';
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{getEmergencyIcon(emergency.type)}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{(emergency.type || 'EMERGENCY').toUpperCase()}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>#{emergency.id}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: `${getStatusColor(emergency.status)}20`,
            color: getStatusColor(emergency.status),
            fontWeight: '600'
          }}>
            {emergency.status?.replace('_', ' ').toUpperCase()}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            {emergency.assignedAt}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px', lineHeight: '1.4' }}>
        {emergency.description}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
        <div style={{ color: '#6b7280' }}>
          <strong>Location:</strong> {emergency.latitude?.toFixed(4)}, {emergency.longitude?.toFixed(4)}
        </div>
        <div style={{ color: '#6b7280' }}>
          <strong>Duration:</strong> {emergency.duration || 'N/A'}
        </div>
      </div>
    </div>
  );
};

// Real-time Clock Component
const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div style={{
      background: '#1f2937',
      color: '#10b981',
      padding: '16px 20px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '18px',
      fontWeight: '700',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div>{time.toLocaleDateString()}</div>
      <div style={{ fontSize: '24px' }}>{time.toLocaleTimeString()}</div>
    </div>
  );
};

function MapComponent() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  // Existing state
  const [currentPosition, setCurrentPosition] = useState(null);
  const [emergencyLocation, setEmergencyLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [emergencyInfo, setEmergencyInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [isConnected, setIsConnected] = useState(false);
  const [teamInfo, setTeamInfo] = useState(null);
  const [TEAM_ID, setTEAM_ID] = useState(null);
  const [teamStatus, setTeamStatus] = useState('available');

  // New state for enhanced features
  const [activeTab, setActiveTab] = useState('dashboard');
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [statistics, setStatistics] = useState({
    totalEmergencies: 0,
    resolvedEmergencies: 0,
    activeTime: 0,
    averageResponseTime: 0,
    responseRadius: 0
  });
  const [shiftStartTime] = useState(new Date());
  const [currentShiftTime, setCurrentShiftTime] = useState(0);

  // Load stored data on mount
  useEffect(() => {
    const storedTeamData = localStorage.getItem('teamData');
    const storedTeamId = localStorage.getItem('currentTeamId');
    const storedHistory = localStorage.getItem(`emergencyHistory_${storedTeamId || 'default'}`);
    const storedStats = localStorage.getItem(`teamStats_${storedTeamId || 'default'}`);

    if (storedTeamData) {
      const teamData = JSON.parse(storedTeamData);
      setTeamInfo(teamData);
      setTEAM_ID(teamData.teamId || storedTeamId);
    } else if (storedTeamId) {
      setTEAM_ID(storedTeamId);
    } else {
      // If no team info, redirect to login page
      // We return null render for a moment then the App router will route to /teamlogin
      setTimeout(() => { window.location.href = '/teamlogin'; }, 10);
    }

    if (storedHistory) {
      try { setEmergencyHistory(JSON.parse(storedHistory)); } catch (e) { /* ignore */ }
    }

    if (storedStats) {
      try { setStatistics(JSON.parse(storedStats)); } catch (e) { /* ignore */ }
    }
  }, []);

  // Track current shift time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const shiftDuration = Math.floor((now - shiftStartTime) / 1000 / 60); // in minutes
      setCurrentShiftTime(shiftDuration);
    }, 60000);

    return () => clearInterval(timer);
  }, [shiftStartTime]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (TEAM_ID) {
      localStorage.setItem(`teamStats_${TEAM_ID}`, JSON.stringify(statistics));
      localStorage.setItem('teamData', JSON.stringify(teamInfo || {}));
      localStorage.setItem('currentTeamId', TEAM_ID);
    }
  }, [statistics, TEAM_ID, teamInfo]);

  useEffect(() => {
    if (TEAM_ID) {
      localStorage.setItem(`emergencyHistory_${TEAM_ID}`, JSON.stringify(emergencyHistory));
    }
  }, [emergencyHistory, TEAM_ID]);

  // Create socket connection
  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      console.log('✅ Connected to server', s.id);
      setConnectionStatus('Connected');
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setConnectionStatus('Disconnected');
      setIsConnected(false);
    });

    s.on('reconnect', () => {
      console.log('🔄 Reconnected to server');
      setConnectionStatus('Connected');
      setIsConnected(true);
      if (TEAM_ID) {
        s.emit('registerTeam', { teamId: TEAM_ID });
      }
    });

    // Enhanced emergency assignment handler
    const handleAssignEmergency = (data) => {
      console.log('📨 assignEmergency event received:', data);

      const emergencyData = {
        id: data.emergencyId || `E-${Date.now()}`,
        type: data.type || 'general',
        assignedAt: new Date().toLocaleString(),
        status: 'assigned',
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        description: data.description || `${(data.type || 'Emergency').toUpperCase()} Response Required`,
        priority: data.priority || 'medium',
        startTime: new Date()
      };

      setEmergencyInfo(emergencyData);
      const dest = { lat: Number(data.latitude), lng: Number(data.longitude) };
      setEmergencyLocation(dest);
      setTeamStatus('busy');

      // Add to history immediately
      setEmergencyHistory(prev => [emergencyData, ...prev]);

      // Update statistics
      setStatistics(prev => ({
        ...prev,
        totalEmergencies: prev.totalEmergencies + 1
      }));

      // Enhanced notifications
      if (window.Notification && Notification.permission === 'granted') {
        try {
          const notification = new Notification('🚨 EMERGENCY DISPATCH', {
            body: `${emergencyData.type.toUpperCase()}\nPriority: ${emergencyData.priority.toUpperCase()}\nLocation: ${emergencyData.latitude}, ${emergencyData.longitude}`,
            icon: '/favicon.ico',
            tag: 'emergency',
            requireInteraction: true
          });
          setTimeout(() => notification.close(), 10000);
        } catch (e) { /* ignore */ }
      }

      // Audio alert (data URI short beep)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqF');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        console.log('Audio alert failed:', e);
      }

      // Also show a simple alert for guaranteed attention
      try {
        alert(`🚨 EMERGENCY DISPATCH!\n\nType: ${emergencyData.type.toUpperCase()}\nPriority: ${emergencyData.priority.toUpperCase()}\nLocation: ${emergencyData.latitude}, ${emergencyData.longitude}\n\nRespond immediately!`);
      } catch (e) { /* maybe popup blocked */ }
    };

    s.on('assignEmergency', handleAssignEmergency);

    return () => {
      s.off('assignEmergency', handleAssignEmergency);
      s.disconnect();
      socketRef.current = null;
    };
  }, [TEAM_ID]);

  // Register team after socket connects and TEAM_ID available
  useEffect(() => {
    if (!socketRef.current || !TEAM_ID || !isConnected) return;
    console.log('🔷 Registering team on socket with ID:', TEAM_ID);
    socketRef.current.emit('registerTeam', { teamId: TEAM_ID });

    socketRef.current.once('teamRegistered', (data) => {
      console.log('✅ teamRegistered ack from server:', data);
    });
  }, [TEAM_ID, isConnected]);

  // Request notification permission
  useEffect(() => {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Enhanced location tracking
  useEffect(() => {
    if (!TEAM_ID || !teamInfo) return;

    let locationInterval;

    const updateLocation = () => {
      if (!navigator.geolocation) {
        console.error('Geolocation not supported by browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentPosition(coords);

          // Calculate patrol radius (simplified)
          if (emergencyHistory.length > 0) {
            const distances = emergencyHistory.slice(0, 10).map(emergency => {
              const R = 6371; // Earth's radius in km
              const dLat = (emergency.latitude - coords.lat) * Math.PI / 180;
              const dLng = (emergency.longitude - coords.lng) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(coords.lat * Math.PI / 180) * Math.cos(emergency.latitude * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              return R * c;
            });
            const avgRadius = distances.length ? (distances.reduce((a, b) => a + b, 0) / distances.length) : 0;
            setStatistics(prev => ({ ...prev, responseRadius: avgRadius.toFixed(1) }));
          }

          // Post location to backend for tracking
          fetch(`${SOCKET_URL}/api/teams/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teamId: TEAM_ID,
              latitude: coords.lat,
              longitude: coords.lng,
              teamType: teamInfo.teamType || 'general',
              status: teamStatus
            })
          }).then(r => {
            if (!r.ok) {
              console.error('Failed to POST team location', r.status);
            }
          }).catch(err => console.error('Location POST error', err));
        },
        (err) => console.error('❌ Error getting location', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    };

    updateLocation();
    locationInterval = setInterval(updateLocation, 15000);

    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [TEAM_ID, teamInfo, teamStatus, emergencyHistory]);

  // Calculate route
  useEffect(() => {
    if (!currentPosition || !emergencyLocation || !window.google) return;
    calculateRoute(currentPosition, emergencyLocation);
  }, [currentPosition, emergencyLocation]);

  const calculateRoute = (origin, destination) => {
    if (!window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        } else {
          console.error('❌ Error getting directions:', status);
        }
      }
    );
  };

  const updateTeamStatus = (newStatus) => {
    console.log(`Updating team status from ${teamStatus} to ${newStatus}`);
    setTeamStatus(newStatus);
    if (socketRef.current && TEAM_ID) {
      socketRef.current.emit('updateTeamStatus', { teamId: TEAM_ID, status: newStatus });
    }

    // Update active time statistics
    if (newStatus === 'available') {
      setStatistics(prev => ({
        ...prev,
        activeTime: prev.activeTime + 1
      }));
    }
  };

  const updateAssignmentStatus = (status) => {
    if (!emergencyInfo) return;

    const updatedEmergency = { ...emergencyInfo, status };

    if (status === 'in_progress') {
      updatedEmergency.responseTime = new Date();
    } else if (status === 'resolved') {
      updatedEmergency.completedAt = new Date().toLocaleString();
      updatedEmergency.duration = updatedEmergency.responseTime
        ? `${Math.round((new Date() - new Date(updatedEmergency.responseTime)) / 1000 / 60)}m`
        : 'N/A';
    }

    setEmergencyInfo(updatedEmergency);

    // Update history
    setEmergencyHistory(prev => prev.map(e => e.id === emergencyInfo.id ? updatedEmergency : e));

    if (status === 'resolved') {
      // Update statistics
      setStatistics(prev => {
        const newResolved = prev.resolvedEmergencies + 1;
        const responseTime = updatedEmergency.responseTime
          ? Math.round((new Date(updatedEmergency.responseTime) - new Date(updatedEmergency.startTime)) / 1000 / 60)
          : 0;

        return {
          ...prev,
          resolvedEmergencies: newResolved,
          averageResponseTime: Math.round(((prev.averageResponseTime * (newResolved - 1)) + responseTime) / newResolved)
        };
      });

      if (socketRef.current && TEAM_ID) {
        socketRef.current.emit('completeEmergency', { emergencyId: emergencyInfo.id, teamId: TEAM_ID });
      }
      updateTeamStatus('available');
      setTimeout(() => clearEmergency(), 2000);
    } else if (status === 'in_progress') {
      updateTeamStatus('busy');
    }
  };

  const clearEmergency = () => {
    setEmergencyLocation(null);
    setEmergencyInfo(null);
    setDirections(null);
    if (teamStatus !== 'available') updateTeamStatus('available');
  };

  const handleLogout = () => {
    updateTeamStatus('offline');
    localStorage.removeItem('teamData');
    localStorage.removeItem('teamToken');
    localStorage.removeItem('currentTeamId');
    if (socketRef.current) socketRef.current.disconnect();
    window.location.href = '/teamlogin';
  };

  const getTeamTypeEmoji = (teamType) => {
    switch ((teamType || '').toLowerCase()) {
      case 'police': return '👮‍♂️';
      case 'fire': return '🚒';
      case 'ambulance': return '🚑';
      default: return '🚨';
    }
  };

  const formatShiftTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getEfficiencyScore = () => {
    if (statistics.totalEmergencies === 0) return 0;
    const resolutionRate = (statistics.resolvedEmergencies / statistics.totalEmergencies) * 100;
    const responseScore = statistics.averageResponseTime <= 8 ? 100 : Math.max(0, 100 - (statistics.averageResponseTime - 8) * 5);
    return Math.round((resolutionRate + responseScore) / 2);
  };

  // If no TEAM_ID yet show initializing
  if (!TEAM_ID) {
    return (
      <div style={{ minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚨</div>
          <p style={{ fontSize: '18px', color: '#374151' }}>Initializing Emergency Response System...</p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Professional Header */}
      <header style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '32px' }}>🚨</div>
              <div>
                <h1 style={{ margin:0, fontSize: '24px', fontWeight: '700' }}>EMERGENCY RESPONSE SYSTEM</h1>
                <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Professional 911 Emergency Services Dashboard</p>
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
              <DigitalClock />

              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <div style={{
                  padding:'12px 16px',
                  borderRadius: '8px',
                  backgroundColor: isConnected ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                  border: `1px solid ${isConnected ? '#10b981' : '#ef4444'}`,
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <WifiIcon connected={isConnected} /> <span style={{ marginLeft: 4 }}>{connectionStatus}</span>
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    background:'rgba(255,255,255,0.1)',
                    border:'1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    cursor:'pointer',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600'
                  }}
                >
                  <LogoutIcon /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Team Badge & Quick Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ProfessionalBadge teamType={teamInfo?.teamType} teamId={TEAM_ID} />

            <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{statistics.totalEmergencies}</div>
                <div style={{ opacity: 0.9 }}>Total Calls</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{statistics.resolvedEmergencies}</div>
                <div style={{ opacity: 0.9 }}>Resolved</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{getEfficiencyScore()}%</div>
                <div style={{ opacity: 0.9 }}>Efficiency</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{formatShiftTime(currentShiftTime)}</div>
                <div style={{ opacity: 0.9 }}>On Duty</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{ background: 'white', borderBottom: '2px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex' }}>
          {[
            { id: 'dashboard', label: '🏠 Dashboard', icon: '🏠' },
            { id: 'history', label: '📋 Call History', icon: '📋' },
            { id: 'statistics', label: '📊 Analytics', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#374151',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display:'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Left Column - Map & Current Emergency */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Active Emergency Alert */}
              {emergencyInfo && (
                <div style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 8px 16px rgba(239,68,68,0.3)',
                  animation: 'pulse 2s infinite'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '28px' }}>🚨</span>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '700' }}>ACTIVE EMERGENCY</div>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>{emergencyInfo.type?.toUpperCase()} • Priority: {emergencyInfo.priority?.toUpperCase()}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {emergencyInfo.status?.replace('_', ' ').toUpperCase()}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                        {emergencyInfo.assignedAt}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '16px', marginBottom: '16px', lineHeight: '1.4' }}>
                    {emergencyInfo.description}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>LOCATION</div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>
                        {Number(emergencyInfo.latitude).toFixed(6)}, {Number(emergencyInfo.longitude).toFixed(6)}
                      </div>
                    </div>
                    {directions && directions.routes && directions.routes[0] && (
                      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>ETA</div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>
                          {directions.routes[0].legs[0].duration.text} • {directions.routes[0].legs[0].distance.text}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {emergencyInfo.status === 'assigned' && (
                      <button
                        onClick={() => updateAssignmentStatus('in_progress')}
                        style={{
                          padding: '12px 20px',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '700',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}
                      >
                        🚀 RESPONDING
                      </button>
                    )}
                    {emergencyInfo.status === 'in_progress' && (
                      <button
                        onClick={() => updateAssignmentStatus('resolved')}
                        style={{
                          padding: '12px 20px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '700',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}
                      >
                        ✅ RESOLVED
                      </button>
                    )}
                    <button
                      onClick={clearEmergency}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      🗑️ CLEAR
                    </button>
                  </div>
                </div>
              )}

              {/* Map Section */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>🗺️ Live Tactical Map</h2>
                  {currentPosition && (
                    <div style={{ fontSize: '12px', color: '#6b7280', background: '#f3f4f6', padding: '6px 12px', borderRadius: '20px' }}>
                      GPS: {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
                    </div>
                  )}
                </div>

                {!currentPosition && (
                  <div style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)',
                    border: '2px solid #f59e0b',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '20px' }}>🛰️</span>
                    <div>
                      <div style={{ fontWeight: '700' }}>Acquiring GPS Signal...</div>
                      <div style={{ fontSize: '14px' }}>Searching for satellites and positioning data</div>
                    </div>
                  </div>
                )}

                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={currentPosition || defaultCenter}
                    zoom={currentPosition ? 15 : 10}
                    options={{
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: true,
                      fullscreenControl: true,
                      styles: [
                        {
                          featureType: 'poi',
                          elementType: 'labels',
                          stylers: [{ visibility: 'off' }]
                        }
                      ]
                    }}
                  >
                    {currentPosition && (
                      <Marker
                        position={currentPosition}
                        icon={{
                          url: teamInfo?.teamType?.toLowerCase() === 'police'
                            ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                            : teamInfo?.teamType?.toLowerCase() === 'fire'
                              ? 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
                              : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                          scaledSize: new window.google.maps.Size(40,40)
                        }}
                        title={`${teamInfo?.name || TEAM_ID} - Current Position`}
                      />
                    )}

                    {emergencyLocation && (
                      <Marker
                        position={emergencyLocation}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                          scaledSize: new window.google.maps.Size(50,50)
                        }}
                        title="🚨 Emergency Location"
                        animation={window.google ? window.google.maps.Animation.BOUNCE : undefined}
                      />
                    )}

                    {directions && (
                      <DirectionsRenderer
                        directions={directions}
                        options={{
                          polylineOptions: {
                            strokeColor: '#ef4444',
                            strokeWeight: 8,
                            strokeOpacity: 0.9
                          },
                          suppressMarkers: true
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div style={{
                    height: 450,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px dashed #dee2e6'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗺️</div>
                      <div style={{ color: '#6b7280' }}>Loading tactical mapping system...</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Status & Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Team Status Control */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Unit Status Control</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {[
                    { status: 'available', label: '✅ AVAILABLE', color: '#10b981', bg: '#ecfdf5' },
                    { status: 'busy', label: '🟡 RESPONDING', color: '#f59e0b', bg: '#fffbeb' },
                    { status: 'offline', label: '🔴 OFF-DUTY', color: '#ef4444', bg: '#fef2f2' }
                  ].map(item => (
                    <button
                      key={item.status}
                      onClick={() => updateTeamStatus(item.status)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '8px',
                        border: teamStatus === item.status ? `2px solid ${item.color}` : '2px solid #e5e7eb',
                        backgroundColor: teamStatus === item.status ? item.bg : 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '700',
                        color: teamStatus === item.status ? item.color : '#6b7280',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Statistics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <StatsCard
                  title="Response Time"
                  value={statistics.averageResponseTime ? `${statistics.averageResponseTime}m` : '0m'}
                  subtitle="Average"
                  icon="⏱️"
                  color="#f59e0b"
                />
                <StatsCard
                  title="Success Rate"
                  value={statistics.totalEmergencies ? `${Math.round((statistics.resolvedEmergencies / statistics.totalEmergencies) * 100)}%` : '0%'}
                  subtitle="Resolution"
                  icon="📈"
                  color="#10b981"
                />
              </div>

              {/* Team Information */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Unit Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Unit ID:</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{TEAM_ID}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Type:</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                      {getTeamTypeEmoji(teamInfo?.teamType)} {teamInfo?.teamType?.toUpperCase() || 'GENERAL'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Call Sign:</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{teamInfo?.name || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Shift Duration:</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{formatShiftTime(currentShiftTime)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Patrol Radius:</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{statistics.responseRadius || '0'} km</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Recent Activity</h3>
                {emergencyHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                    <div>No emergency calls today</div>
                  </div>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {emergencyHistory.slice(0, 3).map((emergency, index) => (
                      <div key={emergency.id} style={{
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${emergency.status === 'resolved' ? '#10b981' : emergency.status === 'in_progress' ? '#f59e0b' : '#ef4444'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                            {emergency.type?.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '11px', color: '#6b7280' }}>
                            {emergency.assignedAt.split(' ')[1]}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {emergency.description?.substring(0, 50)}...
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>📋 Emergency Call History</h2>
                <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '16px' }}>Complete record of emergency responses</p>
              </div>
              <div style={{ background: '#f3f4f6', padding: '12px 20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>{emergencyHistory.length}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Calls</div>
              </div>
            </div>

            {emergencyHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#374151' }}>No Emergency Calls Yet</h3>
                <p>Your emergency response history will appear here once you start receiving assignments.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {emergencyHistory.map((emergency, index) => (
                  <HistoryItem key={emergency.id} emergency={emergency} index={index} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'statistics' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>📊 Performance Analytics</h2>
              <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '16px' }}>Comprehensive statistics and performance metrics</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <StatsCard
                title="Total Emergency Calls"
                value={statistics.totalEmergencies}
                subtitle="Since shift start"
                icon="📞"
                color="#3b82f6"
                trend={statistics.totalEmergencies > 0 ? 12 : 0}
              />
              <StatsCard
                title="Successfully Resolved"
                value={statistics.resolvedEmergencies}
                subtitle={`${statistics.totalEmergencies ? Math.round((statistics.resolvedEmergencies / statistics.totalEmergencies) * 100) : 0}% success rate`}
                icon="✅"
                color="#10b981"
                trend={statistics.resolvedEmergencies > 0 ? 8 : 0}
              />
              <StatsCard
                title="Average Response Time"
                value={statistics.averageResponseTime ? `${statistics.averageResponseTime} min` : '0 min'}
                subtitle="Time to scene"
                icon="⏱️"
                color="#f59e0b"
                trend={statistics.averageResponseTime <= 8 ? 15 : -5}
              />
              <StatsCard
                title="Patrol Coverage"
                value={`${statistics.responseRadius || 0} km`}
                subtitle="Response radius"
                icon="🎯"
                color="#8b5cf6"
                trend={5}
              />
            </div>

            {/* Performance Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>⚡ Efficiency Score</h3>
                <div style={{ position: 'relative', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: `conic-gradient(#10b981 0deg ${(getEfficiencyScore() / 100) * 360}deg, #e5e7eb ${(getEfficiencyScore() / 100) * 360}deg 360deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{getEfficiencyScore()}%</div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>EFFICIENCY</div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Based on response time and resolution rate
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>🏆 Performance Badges</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    {
                      name: 'Fast Response',
                      earned: statistics.averageResponseTime <= 5,
                      icon: '🚀',
                      desc: 'Average response under 5 minutes'
                    },
                    {
                      name: 'Perfect Resolution',
                      earned: statistics.resolvedEmergencies === statistics.totalEmergencies && statistics.totalEmergencies > 0,
                      icon: '⭐',
                      desc: '100% resolution rate'
                    },
                    {
                      name: 'Long Shift',
                      earned: currentShiftTime >= 480,
                      icon: '💪',
                      desc: 'Over 8 hours on duty'
                    },
                    {
                      name: 'High Volume',
                      earned: statistics.totalEmergencies >= 10,
                      icon: '🔥',
                      desc: '10+ emergency calls'
                    }
                  ].map(badge => (
                    <div key={badge.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: badge.earned ? '#ecfdf5' : '#f9fafb',
                      border: badge.earned ? '1px solid #10b981' : '1px solid #e5e7eb'
                    }}>
                      <span style={{
                        fontSize: '20px',
                        filter: badge.earned ? 'none' : 'grayscale(1) opacity(0.5)'
                      }}>
                        {badge.icon}
                      </span>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: badge.earned ? '#065f46' : '#6b7280'
                        }}>
                          {badge.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{badge.desc}</div>
                      </div>
                      {badge.earned && (
                        <div style={{ marginLeft: 'auto', color: '#10b981', fontSize: '16px' }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Type Breakdown */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>🏥 Emergency Type Analysis</h3>
              {emergencyHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
                  <div>No data available for analysis</div>
                </div>
              ) : (
                <div>
                  {(() => {
                    const typeCounts = emergencyHistory.reduce((acc, emergency) => {
                      const type = emergency.type || 'general';
                      acc[type] = (acc[type] || 0) + 1;
                      return acc;
                    }, {});

                    const typeData = Object.entries(typeCounts).map(([type, count]) => ({
                      type: type.charAt(0).toUpperCase() + type.slice(1),
                      count,
                      percentage: Math.round((count / emergencyHistory.length) * 100),
                      icon: type === 'medical' ? '🏥' : type === 'fire' ? '🔥' : type === 'crime' ? '👮' : type === 'accident' ? '🚗' : '🚨'
                    }));

                    return typeData.map(item => (
                      <div key={item.type} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>{item.icon}</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{item.type}</span>
                          </div>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>{item.count} calls ({item.percentage}%)</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${item.percentage}%`,
                            height: '100%',
                            backgroundColor: '#3b82f6',
                            borderRadius: '4px',
                            transition: 'width 1s ease'
                          }} />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Router setup
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/teamlogin" element={<TeamLogin />} />
        <Route path="/teamsignup" element={<TeamSignup />} />
        <Route path="/" element={<MapComponent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

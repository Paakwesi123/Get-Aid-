import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import io from 'socket.io-client';

const TEAM_ID = 'Team-A'; // Make sure this matches exactly what's used in the call center
const containerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = {
  lat: 7.9465,
  lng: -1.0232, // Centered on Ghana
};

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
 
  });

  const [socket, setSocket] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [emergencyLocation, setEmergencyLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [emergencyInfo, setEmergencyInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setConnectionStatus('Connected');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setConnectionStatus('Disconnected');
    });

    return () => newSocket.close();
  }, []);

  // Get GPS location every 30 seconds
  useEffect(() => {
    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setCurrentPosition(coords);
          console.log(`📍 Current position: ${coords.lat}, ${coords.lng}`);

          // Send to backend
          fetch('http://localhost:5000/api/teams/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teamId: TEAM_ID,
              latitude: coords.lat,
              longitude: coords.lng,
            }),
          }).then(response => {
            if (response.ok) {
              console.log('✅ Location sent successfully');
            } else {
              console.error('❌ Failed to send location');
            }
          }).catch((err) => {
            console.error('❌ Location update failed:', err);
          });
          
          // If there's an active emergency, update directions based on new position
          if (emergencyLocation) {
            calculateRoute(coords, emergencyLocation);
          }
        },
        (err) => {
          console.error('❌ Error getting location:', err);
          alert('Failed to get your location. Please enable GPS and refresh the page.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    };

    updateLocation(); // Get initial location
    const interval = setInterval(updateLocation, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [emergencyLocation]);

  // Listen for emergency assignment from call center
  useEffect(() => {
    if (!socket) return;

    const handleAssignment = (data) => {
      console.log('📨 Received assignment data:', data);
      
      // Check if this assignment is for our team
      if (data.teamId === TEAM_ID) {
        console.log('🚨 NEW EMERGENCY ASSIGNED TO OUR TEAM!');
        
        // Store emergency information
        setEmergencyInfo({
          id: data.emergencyId,
          type: data.type,
          assignedAt: new Date().toLocaleTimeString()
        });
        
        const destination = {
          lat: data.latitude,
          lng: data.longitude,
        };
        setEmergencyLocation(destination);

        // Get directions if we have current position
        if (currentPosition) {
          calculateRoute(currentPosition, destination);
        }
        
        // Show alert to team
        alert(`🚨 EMERGENCY ASSIGNED!\nType: ${data.type}\nLocation: ${data.latitude}, ${data.longitude}`);
      } else {
        console.log(`📨 Assignment for different team: ${data.teamId}`);
      }
    };

    socket.on('assignEmergency', handleAssignment);

    return () => {
      socket.off('assignEmergency', handleAssignment);
    };
  }, [socket, currentPosition]);
  
  // Function to calculate route
  const calculateRoute = (origin, destination) => {
    if (!window.google) {
      console.error('Google Maps not loaded');
      return;
    }
    
    console.log('🗺️ Calculating route from:', origin, 'to:', destination);
    
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          console.log('✅ Route calculated successfully');
          setDirections(result);
        } else {
          console.error('❌ Error getting directions:', status);
        }
      }
    );
  };

  // Clear emergency assignment
  const clearEmergency = () => {
    setEmergencyLocation(null);
    setEmergencyInfo(null);
    setDirections(null);
  };

  // Display emergency information panel
  const EmergencyPanel = () => {
    if (!emergencyInfo) return null;
    
    return (
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255, 0, 0, 0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 1000,
        minWidth: '250px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>🚨 EMERGENCY ASSIGNED</h3>
        <p style={{ margin: '5px 0' }}><strong>Type:</strong> {emergencyInfo.type.toUpperCase()}</p>
        <p style={{ margin: '5px 0' }}><strong>Team:</strong> {TEAM_ID}</p>
        <p style={{ margin: '5px 0' }}><strong>Assigned at:</strong> {emergencyInfo.assignedAt}</p>
        {directions && directions.routes && directions.routes[0] && (
          <>
            <p style={{ margin: '5px 0' }}><strong>Distance:</strong> {directions.routes[0].legs[0].distance.text}</p>
            <p style={{ margin: '5px 0' }}><strong>ETA:</strong> {directions.routes[0].legs[0].duration.text}</p>
          </>
        )}
        <button 
          onClick={clearEmergency}
          style={{
            backgroundColor: '#fff',
            color: '#000',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Clear Emergency
        </button>
      </div>
    );
  };

  // Status panel
  const StatusPanel = () => (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 1000
    }}>
      <p style={{ margin: '0' }}><strong>Team:</strong> {TEAM_ID}</p>
      <p style={{ margin: '0' }}><strong>Status:</strong> {connectionStatus}</p>
      <p style={{ margin: '0' }}><strong>GPS:</strong> {currentPosition ? 'Active' : 'Searching...'}</p>
    </div>
  );

  return isLoaded ? (
    <div style={{ position: 'relative' }}>
      <StatusPanel />
      <EmergencyPanel />
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition || defaultCenter}
        zoom={currentPosition ? 15 : 10}
      >
        {/* Show current position */}
        {currentPosition && (
          <Marker
            position={currentPosition}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            title={`${TEAM_ID} Current Location`}
          />
        )}
        
        {/* Show emergency location */}
        {emergencyLocation && (
          <Marker
            position={emergencyLocation}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(50, 50)
            }}
            title="🚨 Emergency Location"
            animation={window.google.maps.Animation.BOUNCE}
          />
        )}

        {/* Show route */}
        {directions && <DirectionsRenderer 
          directions={directions}
          options={{
            polylineOptions: {
              strokeColor: '#36454F',
              strokeWeight: 6,
              strokeOpacity: 0.8
            },
            suppressMarkers: true // We're using custom markers
          }}
        />}
      </GoogleMap>
    </div>
  ) : (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Loading Map...
    </div>
  );
}

export default App;
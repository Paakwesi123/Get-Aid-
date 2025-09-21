const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const cors = require('cors');
const mongoose = require('mongoose');

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static dashboard frontend

// ==================== DATABASE (MongoDB Atlas) ====================
const mongoURI = 'mongodb+srv://AndyTeye:Homiesboispartan4becks@cluster0.ooeepjc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Atlas connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// ==================== MODELS ====================
const Team = require('./models/team'); // ✅ Use the single team model
const Emergency = mongoose.model('Emergency', new mongoose.Schema({
  emergencyId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'assigned', 'resolved', 'cancelled'] },
  assignedTeams: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  priority: { type: String, default: 'high', enum: ['low', 'medium', 'high', 'critical'] },
  userId: { type: String }, // Optional user ID for tracking
  userInfo: { type: Object } // Additional user information
}));

// In-memory storage for active teams and their locations
const activeTeams = new Map();

// ==================== ROUTES ====================
app.get('/', (req, res) => {
  res.send('🚀 SOS System Backend is Running!');
});

// Import user routes (for signup/login)
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Import team routes (for team registration/login)
const teamRoutes = require('./routes/teams');
app.use('/api/teams', teamRoutes);

// ==================== TEAM MANAGEMENT ====================

// Get all active teams
app.get('/api/teams/active', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true }).select('-password');
    res.json(teams);
  } catch (error) {
    console.error('Error fetching active teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Update team location
app.post('/api/teams/location', async (req, res) => {
  try {
    const { teamId, latitude, longitude, teamType, status } = req.body;
    
    if (!teamId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update in-memory storage
    activeTeams.set(teamId, {
      teamId,
      latitude,
      longitude,
      teamType: teamType || 'general',
      status: status || 'available',
      lastUpdate: new Date()
    });

    console.log(`📍 Team ${teamId} location updated:`, { latitude, longitude, status });

    // Broadcast to admin dashboard
    io.emit('teamLocationUpdate', {
      teamId,
      latitude,
      longitude,
      teamType,
      status,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating team location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get nearby teams for emergency
app.post('/api/emergencies/nearby-teams', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10 } = req.body; // maxDistance in km

    const nearbyTeams = [];
    
    for (const [teamId, teamData] of activeTeams.entries()) {
      if (teamData.status !== 'available') continue;
      
      const distance = calculateDistance(
        latitude, longitude,
        teamData.latitude, teamData.longitude
      );
      
      if (distance <= maxDistance) {
        nearbyTeams.push({
          ...teamData,
          distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
        });
      }
    }
    
    // Sort by distance
    nearbyTeams.sort((a, b) => a.distance - b.distance);
    
    res.json(nearbyTeams);
  } catch (error) {
    console.error('Error finding nearby teams:', error);
    res.status(500).json({ error: 'Failed to find nearby teams' });
  }
});

// ==================== EMERGENCY MANAGEMENT ====================

// Get all active emergencies
app.get('/api/emergencies/active', async (req, res) => {
  try {
    const emergencies = await Emergency.find({ status: { $in: ['pending', 'assigned'] } })
      .sort({ timestamp: -1 });
    res.json(emergencies);
  } catch (error) {
    console.error('Error fetching active emergencies:', error);
    res.status(500).json({ error: 'Failed to fetch emergencies' });
  }
});

// Create new emergency (General endpoint)
app.post('/api/emergencies', async (req, res) => {
  try {
    const { type, latitude, longitude, priority = 'high' } = req.body;
    const emergencyId = 'EMG_' + Date.now();

    const newEmergency = new Emergency({
      emergencyId,
      type,
      latitude,
      longitude,
      priority,
      status: 'pending'
    });

    await newEmergency.save();

    // Find nearby teams for this emergency
    const nearbyTeams = [];
    for (const [teamId, teamData] of activeTeams.entries()) {
      if (teamData.status !== 'available') continue;
      
      const distance = calculateDistance(
        latitude, longitude,
        teamData.latitude, teamData.longitude
      );
      
      nearbyTeams.push({
        ...teamData,
        distance: Math.round(distance * 100) / 100
      });
    }
    
    nearbyTeams.sort((a, b) => a.distance - b.distance);

    // Emit SOS alert with nearby teams info
    io.emit('sosAlert', {
      id: emergencyId,
      emergencyId,
      type,
      latitude,
      longitude,
      priority,
      timestamp: newEmergency.timestamp,
      nearbyTeams: nearbyTeams.slice(0, 5) // Send top 5 closest teams
    });

    res.status(201).json({ message: 'Emergency created successfully', emergency: newEmergency });
  } catch (error) {
    console.error('Error creating emergency:', error);
    res.status(500).json({ error: 'Failed to create emergency' });
  }
});

// ==================== SOS ENDPOINT ====================
// Handle SOS requests from mobile app
app.post('/api/sos', async (req, res) => {
  try {
    const { type, latitude, longitude, priority = 'critical', userId, userInfo } = req.body;
    
    // Validate required fields
    if (!type || !latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: type, latitude, longitude' 
      });
    }

    const emergencyId = 'SOS_' + Date.now();

    // Create emergency record
    const newEmergency = new Emergency({
      emergencyId,
      type,
      latitude,
      longitude,
      priority,
      status: 'pending',
      // Add any additional user info if provided
      ...(userId && { userId }),
      ...(userInfo && { userInfo })
    });

    await newEmergency.save();

    // Find nearby teams
    const nearbyTeams = [];
    for (const [teamId, teamData] of activeTeams.entries()) {
      if (teamData.status !== 'available') continue;
      
      const distance = calculateDistance(
        latitude, longitude,
        teamData.latitude, teamData.longitude
      );
      
      if (distance <= 20) { // Within 20km radius for SOS
        nearbyTeams.push({
          ...teamData,
          distance: Math.round(distance * 100) / 100
        });
      }
    }
    
    nearbyTeams.sort((a, b) => a.distance - b.distance);

    // Emit SOS alert to all connected dashboards and teams
    io.emit('sosAlert', {
      id: emergencyId,
      emergencyId,
      type,
      latitude,
      longitude,
      priority,
      timestamp: newEmergency.timestamp,
      source: 'mobile_sos', // Identify this as a mobile SOS
      nearbyTeams: nearbyTeams.slice(0, 5),
      userInfo: userInfo || null
    });

    // Also emit to nearby teams specifically
    nearbyTeams.slice(0, 3).forEach(team => {
      io.to(`team-${team.teamId}`).emit('urgentSOS', {
        emergencyId,
        type,
        latitude,
        longitude,
        priority,
        distance: team.distance,
        timestamp: newEmergency.timestamp
      });
    });

    console.log(`🆘 SOS Alert created: ${emergencyId} - ${type} at (${latitude}, ${longitude})`);
    console.log(`📍 Found ${nearbyTeams.length} nearby teams`);

    res.status(201).json({ 
      success: true,
      message: 'SOS alert sent successfully', 
      emergencyId,
      nearbyTeams: nearbyTeams.length,
      timestamp: newEmergency.timestamp
    });

  } catch (error) {
    console.error('❌ Error processing SOS request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process SOS request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== UTILITY FUNCTIONS ====================

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// ==================== SOCKET.IO EVENTS ====================
io.on('connection', (socket) => {
  console.log('👤 A user connected:', socket.id);

  // Handle team registration
  socket.on('registerTeam', (data) => {
    console.log('🔷 Team registered:', data);
    socket.join(`team-${data.teamId}`);
    socket.teamId = data.teamId;
  });

  // Handle team status updates
  socket.on('updateTeamStatus', (data) => {
    const { teamId, status } = data;
    console.log(`📊 Team ${teamId} status updated to: ${status}`);
    
    if (activeTeams.has(teamId)) {
      const teamData = activeTeams.get(teamId);
      teamData.status = status;
      activeTeams.set(teamId, teamData);
      
      // Broadcast status update to admin
      io.emit('teamStatusUpdate', { teamId, status });
    }
  });

  // Handle emergency assignment from call center
  socket.on('assignEmergency', async (data) => {
    console.log('📢 Emergency assignment received:', data);

    try {
      const { teamIds, emergencyId, latitude, longitude, type } = data;

      if (!Array.isArray(teamIds) || teamIds.length === 0) {
        socket.emit('assignmentError', { error: 'Invalid team IDs provided' });
        return;
      }

      // Update emergency in database
      await Emergency.findOneAndUpdate(
        { emergencyId },
        { assignedTeams: teamIds, status: 'assigned' }
      );

      // Update team status to busy
      teamIds.forEach(teamId => {
        if (activeTeams.has(teamId)) {
          const teamData = activeTeams.get(teamId);
          teamData.status = 'busy';
          activeTeams.set(teamId, teamData);
        }
      });

      // Send assignment to specific teams
      teamIds.forEach(teamId => {
        io.to(`team-${teamId}`).emit('assignEmergency', {
          teamId,
          emergencyId,
          latitude,
          longitude,
          type,
          timestamp: new Date().toISOString()
        });
      });

      socket.emit('assignmentConfirmed', {
        success: true,
        message: `Emergency assigned to ${teamIds.length} team(s)`,
        assignedTeams: teamIds
      });

      console.log(`✅ Emergency ${emergencyId} assigned to teams: ${teamIds.join(', ')}`);
    } catch (error) {
      console.error('Error processing emergency assignment:', error);
      socket.emit('assignmentError', { error: 'Failed to assign emergency' });
    }
  });

  // Handle emergency completion
  socket.on('completeEmergency', async (data) => {
    const { emergencyId, teamId } = data;
    console.log(`✅ Emergency ${emergencyId} completed by team ${teamId}`);
    
    try {
      await Emergency.findOneAndUpdate(
        { emergencyId },
        { status: 'resolved', resolvedAt: new Date() }
      );
      
      // Update team status back to available
      if (activeTeams.has(teamId)) {
        const teamData = activeTeams.get(teamId);
        teamData.status = 'available';
        activeTeams.set(teamId, teamData);
      }
      
      io.emit('emergencyCompleted', { emergencyId, teamId });
    } catch (error) {
      console.error('Error completing emergency:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('👋 A user disconnected');
    
    // Remove team from active teams if it was a team connection
    if (socket.teamId) {
      activeTeams.delete(socket.teamId);
      io.emit('teamDisconnected', { teamId: socket.teamId });
    }
  });
});

// ==================== START SERVER ====================
http.listen(5000, () => {
  console.log('🌐 Backend server running on port 5000');
  
  // Clean up inactive teams every 5 minutes
  setInterval(() => {
    const now = new Date();
    for (const [teamId, teamData] of activeTeams.entries()) {
      const timeDiff = (now - teamData.lastUpdate) / (1000 * 60); // minutes
      if (timeDiff > 10) { // Remove teams inactive for more than 10 minutes
        console.log(`🧹 Removing inactive team: ${teamId}`);
        activeTeams.delete(teamId);
        io.emit('teamDisconnected', { teamId });
      }
    }
  }, 300000); // 5 minutes
});
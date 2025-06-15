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
// Replace this connection string with your MongoDB Atlas connection string
const mongoURI = 'mongodb+srv://AndyTeye:Homiesboispartan4becks@cluster0.ooeepjc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Atlas connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// ==================== ROUTES ====================
app.get('/', (req, res) => {
  res.send('🚀 SOS System Backend is Running!');
});

// Import user routes (for signup/login)
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// ==================== SOS ALERT HANDLING ====================
app.post('/api/sos', (req, res) => {
  const { latitude, longitude, type } = req.body;

  console.log('🚨 SOS Alert received:', { latitude, longitude, type });

  // Broadcast to all dashboards
  io.emit('sosAlert', { latitude, longitude, type });

  res.json({ message: '🚨 SOS sent and broadcasted!' });
});

// ==================== TEAM LOCATION TRACKING ====================
app.post('/api/teams/location', (req, res) => {
  const { teamId, latitude, longitude } = req.body;

  const locationData = {
    teamId,
    latitude,
    longitude,
    timestamp: new Date().toISOString()
  };

  console.log(`📍 Team ${teamId} location updated:`, locationData);

  // Broadcast to dashboards
  io.emit('teamLocationUpdate', locationData);

  res.json({ message: '✅ Team location received and broadcasted!' });
});

// ==================== SOCKET.IO EVENTS ====================
io.on('connection', (socket) => {
  console.log('👤 A user connected:', socket.id);

  // Listen for emergency assignment from call center
  socket.on('assignEmergency', (data) => {
    console.log('📢 Emergency assignment received:', data);

    if (!data.teamId || !data.latitude || !data.longitude) {
      console.error('❌ Invalid assignment data:', data);
      return;
    }

    // Broadcast to all connected team clients
    io.emit('assignEmergency', data);

    // Confirm back to sender
    socket.emit('assignmentConfirmed', {
      success: true,
      message: `Emergency assigned to ${data.teamId}`,
      data
    });
  });

  socket.on('disconnect', () => {
    console.log('👋 A user disconnected');
  });
});

// ==================== START SERVER ====================
http.listen(5000, () => {
  console.log('🌐 Backend server running on port 5000');
});
const express = require('express');
const router = express.Router();
const Team = require('../models/team');

router.post('/register', async (req, res) => {
  const { teamName, teamType, password } = req.body;

  console.log('Registration attempt:', { teamName, teamType, password: '***' });

  if (!teamName || !teamType || !password) {
    return res.status(400).json({ message: 'teamName, teamType, and password are required' });
  }

  // Validate teamType
  const validTypes = ['fire', 'police', 'ambulance'];
  if (!validTypes.includes(teamType.toLowerCase())) {
    return res.status(400).json({ message: 'teamType must be fire, police, or ambulance' });
  }

  try {
    // Get the highest team number and increment
    const lastTeam = await Team.findOne().sort({ teamNumber: -1 });
    const newTeamNumber = lastTeam ? lastTeam.teamNumber + 1 : 1;

    console.log('Creating team with number:', newTeamNumber);

    const team = new Team({
      name: teamName,
      teamType: teamType.toLowerCase(),
      teamNumber: newTeamNumber,
      password: password
    });

    const savedTeam = await team.save();
    console.log('Team saved successfully:', savedTeam._id);

    res.status(201).json({
      message: 'Team registered successfully',
      team: {
        id: savedTeam._id,
        name: savedTeam.name,
        teamType: savedTeam.teamType,
        teamNumber: savedTeam.teamNumber,
        teamId: `Team-${savedTeam.teamNumber}`,
        isActive: savedTeam.isActive
      }
    });
  } catch (err) {
    console.error('Error registering team:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Team number already exists' });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

router.post('/login', async (req, res) => {
  const { teamId, password } = req.body;

  console.log('Login attempt:', { teamId, password: '***' });

  if (!teamId || !password) {
    return res.status(400).json({ message: 'teamId and password are required' });
  }

  try {
    // Extract team number from teamId (e.g., "Team-6" -> 6)
    const teamNumber = parseInt(teamId.replace('Team-', ''));
    
    if (isNaN(teamNumber)) {
      return res.status(400).json({ message: 'Invalid teamId format' });
    }

    console.log('Looking for team number:', teamNumber);

    const team = await Team.findOne({ teamNumber, password });
    
    if (!team) {
      console.log('Team not found or invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!team.isActive) {
      return res.status(401).json({ message: 'Team account is inactive' });
    }

    console.log('Login successful for team:', team._id);

    res.json({
      message: 'Login successful',
      team: {
        id: team._id,
        name: team.name,
        teamType: team.teamType,
        teamNumber: team.teamNumber,
        teamId: `Team-${team.teamNumber}`,
        isActive: team.isActive
      }
    });
  } catch (err) {
    console.error('Error logging in team:', err);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Get team by ID (useful for verification)
router.get('/:teamId', async (req, res) => {
  try {
    const teamNumber = parseInt(req.params.teamId.replace('Team-', ''));
    const team = await Team.findOne({ teamNumber }).select('-password');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({
      team: {
        id: team._id,
        name: team.name,
        teamType: team.teamType,
        teamNumber: team.teamNumber,
        teamId: `Team-${team.teamNumber}`,
        isActive: team.isActive,
        location: team.location
      }
    });
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
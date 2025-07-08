const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret (keep this secure in production)
const JWT_SECRET = 'sos-app$backend@2025_secret_very_long_and_secure_key!';

// Input validation helper
const validateInput = (fullName, phoneNumber, password) => {
  const errors = [];
  
  if (!fullName || fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters');
  }
  
  if (!phoneNumber || !/^\d{10,15}$/.test(phoneNumber.replace(/\D/g, ''))) {
    errors.push('Phone number must be 10-15 digits');
  }
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  return errors;
};

// Register
router.post('/register', async (req, res) => {
  const { fullName, phoneNumber, password, medicalHistory } = req.body;

  try {
    // Validate input
    const validationErrors = validateInput(fullName, phoneNumber, password);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber: cleanPhoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      fullName: fullName.trim(),
      phoneNumber: cleanPhoneNumber,
      password: hashedPassword,
      medicalHistory: medicalHistory?.trim() || '',
    });

    await newUser.save();

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    // Basic validation
    if (!phoneNumber || !password) {
      return res.status(400).json({ message: 'Phone number and password are required' });
    }

    // Clean phone number
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');

    // Find user
    const user = await User.findOne({ phoneNumber: cleanPhoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this phone number' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      message: 'Login successful',
      token, 
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        phoneNumber: user.phoneNumber,
        medicalHistory: user.medicalHistory
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.patch('/medical-history', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.medicalHistory = req.body.medicalHistory;
    await user.save();

    res.json({ message: '✅ Medical history updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
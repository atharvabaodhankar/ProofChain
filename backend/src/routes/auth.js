const express = require('express');
const { verifyFirebaseToken } = require('../config/firebase');
const { authenticateUser, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Verify Firebase token
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'ID token is required' 
      });
    }
    
    const result = await verifyFirebaseToken(idToken);
    
    if (result.success) {
      res.json({
        success: true,
        user: result.user,
        message: 'Token verified successfully'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: result.error
      });
    }
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Token verification failed' 
    });
  }
});

// Get current user info (requires authentication)
router.get('/me', authenticateUser, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout (client-side only, but can be used for logging)
router.post('/logout', optionalAuth, (req, res) => {
  // Log the logout event if user was authenticated
  if (req.user) {
    console.log(`User ${req.user.email} logged out`);
  }
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
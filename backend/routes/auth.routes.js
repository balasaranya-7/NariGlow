const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user to NariGlow platform
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get session JWT token
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get user profile profile information (requires token)
 * @access  Private
 */
router.get('/me', protect, getUserProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile name, mobile or password (requires token)
 * @access  Private
 */
router.put('/profile', protect, updateUserProfile);

module.exports = router;

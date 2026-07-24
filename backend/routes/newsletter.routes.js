const express = require('express');
const router = express.Router();
const {
  subscribeNewsletter,
  getNewsletterSubscribers
} = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/auth');

/**
 * @route   POST /api/newsletter
 * @desc    Submit email for NariGlow updates and newsletter subscriptions
 * @access  Public
 */
router.post('/', subscribeNewsletter);

/**
 * @route   GET /api/newsletter
 * @desc    Retrieve subscribers list for export (restricted to Admins only)
 * @access  Private/Admin
 */
router.get('/', protect, admin, getNewsletterSubscribers);

module.exports = router;

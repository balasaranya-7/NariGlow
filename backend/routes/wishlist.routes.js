const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  syncWishlist
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

// All wishlist routes require active user login and authorization check
router.use(protect);

/**
 * @route   GET /api/wishlist
 * @desc    Get logged-in user's wishlist items
 * @access  Private
 */
router.get('/', getWishlist);

/**
 * @route   POST /api/wishlist/sync
 * @desc    Merge guest wishlist items with user's account wishlist database
 * @access  Private
 */
router.post('/sync', syncWishlist);

/**
 * @route   POST /api/wishlist/:id
 * @desc    Add product to wishlist (where :id is the Product ID)
 * @access  Private
 */
router.post('/:id', addToWishlist);

/**
 * @route   DELETE /api/wishlist/:id
 * @desc    Remove product from wishlist (where :id is the Product ID)
 * @access  Private
 */
router.delete('/:id', removeFromWishlist);

module.exports = router;

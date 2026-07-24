const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  syncCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// All cart routes require user login and authentication protection
router.use(protect);

/**
 * @route   GET /api/cart
 * @desc    Retrieve user's shopping bag items
 * @access  Private
 */
router.get('/', getCart);

/**
 * @route   POST /api/cart
 * @desc    Add product to cart or increment quantity
 * @access  Private
 */
router.post('/', addToCart);

/**
 * @route   POST /api/cart/sync
 * @desc    Sync local guest cart with user's backend database cart upon login
 * @access  Private
 */
router.post('/sync', syncCart);

/**
 * @route   PUT /api/cart/:id
 * @desc    Update quantity of product in user's cart (where :id is the Product ID)
 * @access  Private
 */
router.put('/:id', updateCartItem);

/**
 * @route   DELETE /api/cart/:id
 * @desc    Remove product completely from user's cart (where :id is the Product ID)
 * @access  Private
 */
router.delete('/:id', removeCartItem);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// All checkout and order routes require login
router.use(protect);

/**
 * @route   POST /api/orders
 * @desc    Place a new customer order and clear current database shopping cart
 * @access  Private
 */
router.post('/', createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get order history for currently logged-in user
 * @access  Private
 */
router.get('/', getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get details of a specific order by MongoDB ObjectId or custom orderId string
 * @access  Private
 */
router.get('/:id', getOrderById);

module.exports = router;

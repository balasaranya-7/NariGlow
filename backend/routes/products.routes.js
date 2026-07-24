const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

/**
 * @route   GET /api/products
 * @desc    Get all products (with text search, category filters, sorting, and page limits)
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product detail by its MongoDB ObjectId
 * @access  Public
 */
router.get('/:id', getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product (restricted to Admins only)
 * @access  Private/Admin
 */
router.post('/', protect, admin, createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product specification/details (restricted to Admins only)
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Remove a product catalog entry from database (restricted to Admins only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;

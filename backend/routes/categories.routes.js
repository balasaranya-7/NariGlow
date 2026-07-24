const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

/**
 * @route   GET /api/categories
 * @desc    Get all categories for NariGlow navigation and homepage grids
 * @access  Public
 */
router.get('/', getCategories);

/**
 * @route   GET /api/categories/:slug
 * @desc    Get details of a category by slug name, populated with associated products
 * @access  Public
 */
router.get('/:slug', getCategoryBySlug);

/**
 * @route   POST /api/categories
 * @desc    Create a new product category (restricted to Admins only)
 * @access  Private/Admin
 */
router.post('/', protect, admin, createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category info (restricted to Admins only)
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Remove category and manage association (restricted to Admins only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;

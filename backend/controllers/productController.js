const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * @desc    Get all products with searching, filtering, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const { categorySlug, category, search, q, sort, limit, page } = req.query;

    console.log('Fetching products with query:', req.query);

    // Build the query object
    const queryObj = {};

    // 1. Category Filters
    if (categorySlug) {
      queryObj.categorySlug = categorySlug.toLowerCase();
    }
    if (category) {
      queryObj.category = category;
    }

    // 2. Text Search logic (supports 'search' or 'q' parameters)
    const searchQuery = search || q;
    if (searchQuery) {
      // Use Mongo Text Index created in Product model
      queryObj.$text = { $search: searchQuery };
    }

    // 3. Setup Mongoose Query
    let query = Product.find(queryObj);

    // 4. Sorting logic
    if (sort) {
      // e.g. price_asc, price_desc, rating_desc, discount_desc
      const sortBy = sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      // Default sort (newest products first)
      query = query.sort('-createdAt');
    }

    // 5. Pagination logic
    const currentPage = parseInt(page, 10) || 1;
    const itemsLimit = parseInt(limit, 10) || 40;
    const skipCount = (currentPage - 1) * itemsLimit;

    query = query.skip(skipCount).limit(itemsLimit);

    // Execute query
    const products = await query;

    // Get total count for metadata
    const totalCount = await Product.countDocuments(queryObj);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        total: totalCount,
        page: currentPage,
        pages: Math.ceil(totalCount / itemsLimit),
        limit: itemsLimit
      },
      data: products
    });
  } catch (error) {
    console.error(`Error in getProducts: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving products catalogue',
      error: error.message
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Check if we can find by numerical id fallback if it's not a standard object id
      // Since original javascript products used numerical indexes, let's search by string/int fallback or normal ID
      // If we seed properly, each seeded product gets an ObjectId.
      // We will handle ObjectId queries:
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(`Error in getProductById: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving product details',
      error: error.message
    });
  }
};

/**
 * @desc    Create a product (Admin only)
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      categorySlug,
      price,
      oldPrice,
      discountPct,
      images,
      img,
      stock,
      material,
      care,
      desc,
      specifications
    } = req.body;

    // Simple validation
    if (!name || !brand || !category || !categorySlug || !price || !img) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, brand, category, categorySlug, price, and img'
      });
    }

    const product = await Product.create({
      name,
      brand,
      category,
      categorySlug: categorySlug.toLowerCase(),
      price,
      oldPrice: oldPrice || null,
      discountPct: discountPct || 0,
      images: images || [img],
      img,
      stock: stock || 'in',
      material: material || '',
      care: care || '',
      desc: desc || '',
      specifications: specifications || {}
    });

    console.log(`Product created by Admin: ${product._id}`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error(`Error in createProduct: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error creating product',
      error: error.message
    });
  }
};

/**
 * @desc    Update a product (Admin only)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    console.log(`Product updated by Admin: ${product._id}`);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error(`Error in updateProduct: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error updating product',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a product (Admin only)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(id);
    console.log(`Product deleted by Admin: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error(`Error in deleteProduct: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error deleting product',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

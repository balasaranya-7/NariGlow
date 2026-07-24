const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    console.log('Retrieving categories list');
    const categories = await Category.find().sort('name');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error(`Error in getCategories: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving categories list',
      error: error.message
    });
  }
};

/**
 * @desc    Get category details by slug (along with its products)
 * @route   GET /api/categories/:slug
 * @access  Public
 */
const getCategoryBySlug = async (req, res) => {
  try {
    const slugName = req.params.slug.toLowerCase();
    console.log(`Retrieving category details for slug: ${slugName}`);

    const category = await Category.findOne({ slug: slugName });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with slug "${slugName}" not found`
      });
    }

    // Fetch products belonging to this category slug
    const products = await Product.find({ categorySlug: slugName }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: {
        category,
        productsCount: products.length,
        products
      }
    });
  } catch (error) {
    console.error(`Error in getCategoryBySlug: ${error.message}`);
    res.status(500).json({
      success: false,
      message: `Server error retrieving category info for "${req.params.slug}"`,
      error: error.message
    });
  }
};

/**
 * @desc    Create new category (Admin only)
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res) => {
  try {
    const { name, slug, img } = req.body;

    if (!name || !slug || !img) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all category fields: name, slug, and img'
      });
    }

    const slugLower = slug.toLowerCase().trim();

    // Check if category slug already exists
    const categoryExists = await Category.findOne({ slug: slugLower });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: `Category slug "${slugLower}" already exists`
      });
    }

    const category = await Category.create({
      name,
      slug: slugLower,
      img
    });

    console.log(`Category created by Admin: ${category._id}`);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error(`Error in createCategory: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error creating category',
      error: error.message
    });
  }
};

/**
 * @desc    Update category by ID (Admin only)
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, img } = req.body;

    let category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (img) updateData.img = img;
    if (slug) {
      const slugLower = slug.toLowerCase().trim();
      // Ensure slug uniqueness if changed
      if (slugLower !== category.slug) {
        const slugExists = await Category.findOne({ slug: slugLower });
        if (slugExists) {
          return res.status(400).json({
            success: false,
            message: `Category slug "${slugLower}" already exists`
          });
        }
      }
      updateData.slug = slugLower;
    }

    category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    console.log(`Category updated by Admin: ${category._id}`);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error(`Error in updateCategory: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error updating category',
      error: error.message
    });
  }
};

/**
 * @desc    Delete category by ID (Admin only)
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Optional: Warn or handle products associated with this category
    // In a real database we might set category to general accessory or clean up. 
    // We will keep it simple and delete the category document.
    await Category.findByIdAndDelete(id);
    console.log(`Category deleted by Admin: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error(`Error in deleteCategory: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error deleting category',
      error: error.message
    });
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};

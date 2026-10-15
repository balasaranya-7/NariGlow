const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * @desc    Get current user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res) => {
  try {
    console.log(`Retrieving wishlist for user: ${req.user._id}`);

    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      model: 'Product'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: []
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error(`Error in getWishlist: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving wishlist',
      error: error.message
    });
  }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist/:id
 * @access  Private
 * @note    :id in URL is the Product ID (ObjectId or numerical ID index)
 */
const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(`Adding product ${productId} to wishlist of user ${req.user._id}`);

    let targetObjectId = productId;

    // Check if productId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      // Numerical ID fallback mapping
      const products = await Product.find().sort('createdAt');
      const numId = parseInt(productId, 10);
      if (!isNaN(numId) && numId >= 0 && numId < products.length) {
        targetObjectId = products[numId]._id.toString();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID format'
        });
      }
    }

    // Verify if product exists
    const product = await Product.findById(targetObjectId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    // Check if already in wishlist
    if (wishlist.products.some(id => id.toString() === targetObjectId.toString())) {
      return res.status(400).json({
        success: false,
        message: 'Product is already in your wishlist',
        data: wishlist
      });
    }

    // Add to array
    wishlist.products.push(targetObjectId);
    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');

    res.status(200).json({
      success: true,
      message: 'Added to wishlist successfully',
      data: populatedWishlist
    });
  } catch (error) {
    console.error(`Error in addToWishlist: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error adding product to wishlist',
      error: error.message
    });
  }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:id
 * @access  Private
 * @note    :id in URL is the Product ID
 */
const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(`Removing product ${productId} from wishlist of user ${req.user._id}`);

    let targetObjectId = productId;

    // Check if productId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      // Numerical ID fallback mapping
      const products = await Product.find().sort('createdAt');
      const numId = parseInt(productId, 10);
      if (!isNaN(numId) && numId >= 0 && numId < products.length) {
        targetObjectId = products[numId]._id.toString();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID format'
        });
      }
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found for this user'
      });
    }

    const itemIndex = wishlist.products.findIndex(id => id.toString() === targetObjectId.toString());
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in your wishlist'
      });
    }

    // Remove from array
    wishlist.products.splice(itemIndex, 1);
    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: populatedWishlist
    });
  } catch (error) {
    console.error(`Error in removeFromWishlist: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error removing product from wishlist',
      error: error.message
    });
  }
};

/**
 * @desc    Sync local wishlist with server wishlist database
 * @route   POST /api/wishlist/sync
 * @access  Private
 */
const syncWishlist = async (req, res) => {
  try {
    const { localIds } = req.body;
    console.log(`Syncing local wishlist IDs for user ${req.user._id}:`, localIds);

    if (!Array.isArray(localIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid local wishlist payload. Must be an array of IDs'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const dbProducts = await Product.find().sort('createdAt');

    for (const rawId of localIds) {
      let resolvedId = rawId;

      if (!mongoose.Types.ObjectId.isValid(rawId)) {
        // Fallback for numerical IDs
        const numId = parseInt(rawId, 10);
        if (!isNaN(numId) && numId >= 0 && numId < dbProducts.length) {
          resolvedId = dbProducts[numId]._id.toString();
        } else {
          continue; // Skip invalid IDs
        }
      }

      // Check if product exists in DB and is not already in the wishlist array
      const productExists = dbProducts.some(p => p._id.toString() === resolvedId.toString());
      if (productExists && !wishlist.products.some(id => id.toString() === resolvedId.toString())) {
        wishlist.products.push(resolvedId);
      }
    }

    await wishlist.save();
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');

    res.status(200).json({
      success: true,
      message: 'Wishlist successfully synced with server',
      data: populatedWishlist
    });
  } catch (error) {
    console.error(`Error in syncWishlist: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error syncing local wishlist',
      error: error.message
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  syncWishlist
};

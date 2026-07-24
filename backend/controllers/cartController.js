const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
  try {
    console.log(`Retrieving cart for user: ${req.user._id}`);
    
    // Find cart and populate product details
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      model: 'Product'
    });

    // If no cart exists, create a blank one for the user
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: []
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error(`Error in getCart: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving shopping cart',
      error: error.message
    });
  }
};

/**
 * @desc    Add product to cart or increase quantity
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const quantity = parseInt(qty, 10) || 1;

    console.log(`Adding product ${productId} with quantity ${quantity} to cart of user ${req.user._id}`);

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Verify if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get user's cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists in the cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Product exists, increment quantity
      cart.items[itemIndex].qty += quantity;
    } else {
      // Add new product item
      cart.items.push({ product: productId, qty: quantity });
    }

    await cart.save();
    
    // Fetch and populate before sending response
    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Product added to bag successfully',
      data: populatedCart
    });
  } catch (error) {
    console.error(`Error in addToCart: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error adding product to bag',
      error: error.message
    });
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:id
 * @access  Private
 * @note    :id in URL parameter is the Product ID
 */
const updateCartItem = async (req, res) => {
  try {
    const productId = req.params.id;
    const { qty } = req.body;
    const quantity = parseInt(qty, 10);

    console.log(`Updating quantity of product ${productId} to ${quantity} for user ${req.user._id}`);

    if (isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found for this user'
      });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in your cart'
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is zero or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].qty = quantity;
    }

    await cart.save();

    // Populate updated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: populatedCart
    });
  } catch (error) {
    console.error(`Error in updateCartItem: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error updating cart item',
      error: error.message
    });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:id
 * @access  Private
 * @note    :id in URL parameter is the Product ID
 */
const removeCartItem = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(`Removing product ${productId} from cart of user ${req.user._id}`);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found for this user'
      });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in your cart'
      });
    }

    // Remove the product
    cart.items.splice(itemIndex, 1);
    await cart.save();

    // Populate updated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Product removed from bag',
      data: populatedCart
    });
  } catch (error) {
    console.error(`Error in removeCartItem: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error removing cart item',
      error: error.message
    });
  }
};

/**
 * @desc    Sync local storage cart items into user's database cart
 * @route   POST /api/cart/sync
 * @access  Private
 */
const syncCart = async (req, res) => {
  try {
    const { localItems } = req.body; // Array of { id: <num/string>, qty: <num> } or { product: <ObjectId>, qty: <num> }
    
    console.log(`Syncing local items to cart for user ${req.user._id}:`, localItems);

    if (!Array.isArray(localItems)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid local items payload. Must be an array'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    for (const item of localItems) {
      let dbProductId = item.product || item.id;

      // Handle numerical product IDs if passed from old frontend logic
      // We will look up by index/id in Mongoose if necessary.
      // If we find product with Mongo id or find a way to map them.
      // To sync properly: We find product by either MongoDB ObjectId or by name mapping.
      // Since numerical ids exist in the original frontend (id: 0, 1, 2...), the database products have numerical ID mapped to their index during seeding, or we can look up by a mapping.
      // Wait! In the seed script, we generated products in a strict index order. If the frontend passes product ID, we can fetch all products from DB, get the corresponding database ID, and map it.
      // Let's do that!
      let productDoc;
      if (mongoose.Types.ObjectId.isValid(dbProductId)) {
        productDoc = await Product.findById(dbProductId);
      } else {
        // Fallback: If it's a number, find product by matching its generated properties, or we can find it by querying name or index.
        // During seed, we mapped products. If the numerical id is passed, we can query all products and find the one at that index.
        // Let's fetch all products and find the matching index.
        const products = await Product.find().sort('createdAt');
        const numId = parseInt(dbProductId, 10);
        if (!isNaN(numId) && numId >= 0 && numId < products.length) {
          productDoc = products[numId];
        }
      }

      if (productDoc) {
        const itemIdx = cart.items.findIndex(ci => ci.product.toString() === productDoc._id.toString());
        if (itemIdx > -1) {
          // If already in DB cart, choose the larger quantity or sum them. We will merge by summing.
          cart.items[itemIdx].qty += item.qty;
        } else {
          cart.items.push({ product: productDoc._id, qty: item.qty });
        }
      }
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Local bag successfully synced with server',
      data: populatedCart
    });
  } catch (error) {
    console.error(`Error in syncCart: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error syncing local cart',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  syncCart
};

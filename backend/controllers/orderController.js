const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const mongoose = require('mongoose');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
  try {
    const { shippingInfo, paymentMethod, couponApplied, items } = req.body;

    console.log(`Order placement initiated for user: ${req.user._id}`);

    // 1. Validation: Verify items exist in request
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    // 2. Validation: Verify shipping info
    if (!shippingInfo || !shippingInfo.name || !shippingInfo.phone || !shippingInfo.email || 
        !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all fields in the shipping address'
      });
    }

    // 3. Resolve order items, fetch updated prices & info from database to prevent price spoofing
    const orderItems = [];
    let dbSubtotal = 0;

    for (const item of items) {
      let productId = item.product || item.id || item._id;

      // Numerical ID fallback (if numerical IDs are passed from the frontend)
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        const dbProducts = await Product.find().sort('createdAt');
        const numId = parseInt(productId, 10);
        if (!isNaN(numId) && numId >= 0 && numId < dbProducts.length) {
          productId = dbProducts[numId]._id.toString();
        } else {
          return res.status(400).json({
            success: false,
            message: `Invalid product reference: ${productId}`
          });
        }
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`
        });
      }

      const itemQty = parseInt(item.qty, 10) || 1;
      const itemSubtotal = product.price * itemQty;
      dbSubtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        qty: itemQty,
        img: product.img,
        category: product.category
      });
    }

    // 4. Calculate pricing totals matching the exact frontend formulas
    // Subtotal
    const subtotal = dbSubtotal;
    // Coupon Discount: 10% off (GLOW10)
    const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
    // Shipping: Free above 1499, else 79. Free if order is 0.
    const shipping = subtotal > 1499 || subtotal === 0 ? 0 : 79;
    // Taxable
    const taxable = subtotal - discount;
    // Tax: 5%
    const tax = Math.round(taxable * 0.05);
    // Total
    const total = taxable + shipping + tax;

    // 5. Generate unique Order ID (NG + last 8 digits of current timestamp)
    const orderId = 'NG' + Date.now().toString().slice(-8);

    // 6. Calculate estimated delivery date (current date + 5 days)
    const estimatedDelivery = new Date(Date.now() + 5 * 86400000);

    // 7. Save Order to Database
    const order = await Order.create({
      orderId,
      user: req.user._id,
      items: orderItems,
      shippingInfo,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid', // UPI / Card assumed paid in checkout
      subtotal,
      discount,
      shipping,
      tax,
      total,
      estimatedDelivery
    });

    console.log(`Order created successfully: ${order.orderId} (${order._id})`);

    // 8. Clear User's Database Cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
      console.log(`Cart cleared for user: ${req.user._id}`);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error(`Error in createOrder: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error placing order. Please try again',
      error: error.message
    });
  }
};

/**
 * @desc    Get order details by orderId (NGxxxx) or ObjectId
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let queryObj = {};

    console.log(`Retrieving order for id/orderId: ${id}`);

    if (mongoose.Types.ObjectId.isValid(id)) {
      queryObj._id = id;
    } else {
      // Look up by custom orderId string e.g. NG12345678
      queryObj.orderId = id;
    }

    const order = await Order.findOne(queryObj).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Authorization: User can only see their own orders unless they are Admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order details'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(`Error in getOrderById: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving order details',
      error: error.message
    });
  }
};

/**
 * @desc    Get all orders of the logged-in user
 * @route   GET /api/orders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
  try {
    console.log(`Retrieving orders history for user: ${req.user._id}`);

    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error(`Error in getMyOrders: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving your orders list',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders
};

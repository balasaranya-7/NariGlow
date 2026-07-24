const Newsletter = require('../models/Newsletter');

/**
 * @desc    Subscribe to the newsletter
 * @route   POST /api/newsletter
 * @access  Public
 */
const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    console.log(`Newsletter subscription request received for email: ${email}`);

    // 1. Validation: Check if email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // 2. Validation: Pattern check
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    const emailTrimmed = email.toLowerCase().trim();

    // 3. Check if email is already registered in our newsletter list
    const existingSubscription = await Newsletter.findOne({ email: emailTrimmed });
    if (existingSubscription) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: 'Email address is already on our newsletter subscription list',
        data: existingSubscription
      });
    }

    // 4. Save subscription to database
    const subscription = await Newsletter.create({
      email: emailTrimmed
    });

    console.log(`Newsletter subscription recorded: ${subscription._id}`);

    res.status(201).json({
      success: true,
      alreadySubscribed: false,
      message: "You're on the list — welcome to NariGlow",
      data: subscription
    });
  } catch (error) {
    console.error(`Error in subscribeNewsletter: ${error.message}`);
    
    // Catch MongoDB unique constraint violation (just in case of race conditions)
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: 'Email address is already on our newsletter subscription list'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error processing your subscription request. Please try again',
      error: error.message
    });
  }
};

/**
 * @desc    Get all newsletter subscribers (Admin only - for audit and export)
 * @route   GET /api/newsletter
 * @access  Private/Admin
 */
const getNewsletterSubscribers = async (req, res) => {
  try {
    console.log('Retrieving newsletter subscribers list');
    const subscribers = await Newsletter.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    console.error(`Error in getNewsletterSubscribers: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving newsletter list',
      error: error.message
    });
  }
};

module.exports = {
  subscribeNewsletter,
  getNewsletterSubscribers
};

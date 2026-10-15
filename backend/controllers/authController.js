const User = require('../models/User');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();
    const mobile = String(req.body.mobile || '').trim();

    console.log(`Registration attempt for email: ${email}`);

    // 1. Validation: Check missing fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, mobile, and password'
      });
    }

    // 2. Validation: Email pattern check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // 3. Validation: Mobile number pattern check (exactly 10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number'
      });
    }

    // 4. Validation: Password length check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // 5. Check if user already exists (by email)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // 6. Create the User
    const user = await User.create({
      name,
      email,
      mobile,
      password
    });

    if (user) {
      // Initialize an empty Cart and Wishlist for the user in database
      await Cart.create({ user: user._id, items: [] });
      await Wishlist.create({ user: user._id, products: [] });

      console.log(`User created successfully: ${user._id}`);

      // Respond with user details and authentication token
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          isAdmin: user.isAdmin,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data provided'
      });
    }
  } catch (error) {
    console.error(`Error in registerUser: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again later',
      error: error.message
    });
  }
};

/**
 * @desc    Authenticate user & get token (login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    console.log(`Login attempt for email: ${email}`);

    // 1. Validation: Check fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // 2. Find user in the database
    const user = await User.findOne({ email });

    // 3. Verify user and match password
    if (user && (await user.matchPassword(password))) {
      console.log(`Login successful for user: ${user._id}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          isAdmin: user.isAdmin,
          token: generateToken(user._id)
        }
      });
    } else {
      console.log(`Failed login attempt for email: ${email}`);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error(`Error in loginUser: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again later',
      error: error.message
    });
  }
};

/**
 * @desc    Get user profile details
 * @route   GET /api/auth/me
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    // req.user is set by the auth protection middleware
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.status(200).json({
        success: true,
        data: user
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }
  } catch (error) {
    console.error(`Error in getUserProfile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile details',
      error: error.message
    });
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private (Extra feature to ensure natural file depth and completeness)
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.mobile = req.body.mobile || user.mobile;
      
      if (req.body.password) {
        if (!req.body.currentPassword || !(await user.matchPassword(req.body.currentPassword))) {
          return res.status(400).json({ success: false, message: 'Enter your current password to set a new one' });
        }
        if (req.body.password.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters long'
          });
        }
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      console.log(`User profile updated: ${updatedUser._id}`);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          isAdmin: updatedUser.isAdmin,
          token: generateToken(updatedUser._id)
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error(`Error in updateUserProfile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile details',
      error: error.message
    });
  }
};

const requestPasswordReset = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const genericResponse = { success: true, message: 'If an account exists for that email, a reset link will be sent.' };
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return res.status(503).json({ success: false, message: 'Password reset email is not configured yet.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json(genericResponse);

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const baseUrl = (process.env.APP_URL || 'http://localhost:5000').replace(/\/$/, '');
    const resetUrl = `${baseUrl}/?reset=${encodeURIComponent(rawToken)}`;
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [user.email],
        subject: 'Reset your NariGlow password',
        html: `<p>Hi ${user.name.replace(/[&<>"']/g, '')},</p><p>Use this link to reset your password. It expires in 15 minutes.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`
      })
    });
    if (!emailResponse.ok) throw new Error(`Email provider returned ${emailResponse.status}`);
    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error(`Password reset request failed: ${error.message}`);
    if (email) await User.updateOne({ email }, { $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } }).catch(() => {});
    return res.status(503).json({ success: false, message: 'Password reset email is not available right now. Please try again later.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Provide a valid reset token and a password with at least 6 characters.' });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: new Date() } });
    if (!user) return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired. Request a new one.' });

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: 'Password updated. You can now log in.' });
  } catch (error) {
    console.error(`Password reset failed: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Could not reset password. Please try again.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  requestPasswordReset,
  resetPassword
};

const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for the user.
 * @param {string} id - User ID to embed in the payload
 * @returns {string} - Signed JWT token string
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = generateToken;

// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

// Middleware to protect routes (User must be logged in)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // पहले Admin टेबल में खोजें
      let user = await Admin.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      // अगर एडमिन नहीं है, तो User टेबल में खोजें
      if (!user) {
        user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
      }

      req.user = user;

      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

// Middleware to check for admin role
const admin = async (req, res, next) => {
  // req.user को protect मिडलवेयर द्वारा सेट किया जाना चाहिए
  if (req.user) {
    // चेक करें कि क्या यह यूजर Admin टेबल से आया है
    const isAdmin = await Admin.findByPk(req.user.id);
    if (isAdmin) {
      next();
    } else {
      res.status(403).json({ success: false, error: 'Not authorized as an admin' });
    }
  } else {
    res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

module.exports = { protect, admin };
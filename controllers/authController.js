// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.checkUser = async (req, res) => {
  const { mobileNo } = req.body;
  const user = await User.findOne({ where: { mobileNo } });
  if (user) {
    res.json({ exists: true });
  } else {
    res.json({ exists: false });
  }
};

exports.sendOtp = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'OTP service is not configured'
  });
};

exports.verifyOtp = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'OTP service is not configured'
  });
};

exports.signup = async (req, res) => {
  const { name, email, mobileNo, password, role = 'Volunteer' } = req.body; // Default role to Volunteer
  try {
    const userExists = await User.findOne({ where: { mobileNo } });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const rolePrefix = role.substring(0, 3).toUpperCase();
    const count = await User.count({ where: { role } });
    const volunteer_id = `MV-${rolePrefix}-${1001 + count}`;

    const user = await User.create({ name, email, mobileNo, password, role, volunteer_id });

    res.status(201).json({
      success: true,
      token: generateToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, mobileNo: user.mobileNo, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.findOne({ where: { mobileNo: identifier } });
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user.id),
        user: { id: user.id, name: user.name, email: user.email, mobileNo: user.mobileNo, role: user.role },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

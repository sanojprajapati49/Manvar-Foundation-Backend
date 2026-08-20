// controllers/formController.js
const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const crypto = require('crypto');

exports.handleContactForm = async (req, res) => {
  try {
    const newMessage = await Message.create(req.body);
    res.status(201).json({ success: true, message: 'Message received!', data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.handleJoinForm = async (req, res) => {
  try {
    const { mobileNo, password } = req.body;

    // अगर मोबाइल नंबर नहीं है तो एरर भेजें
    if (!mobileNo) {
      return res.status(400).json({ success: false, error: 'Mobile number is required.' });
    }

    // Generate a unique 6-digit random volunteer ID
    const randomPart = crypto.randomInt(100000, 999999).toString();
    const volunteer_id = `MV-${randomPart}`;

    // अगर पासवर्ड नहीं भेजा गया है, तो मोबाइल नंबर के आखिरी 4 अंक को डिफ़ॉल्ट पासवर्ड बना दें
    const finalPassword = password || mobileNo.slice(-4);

    const newVolunteer = await User.create({ ...req.body, password: finalPassword, volunteer_id });

    // फॉर्म सबमिट होते ही यूजर को लॉग-इन करने के लिए टोकन भी भेजें
    const token = generateToken(newVolunteer.id);

    res.status(201).json({ 
      success: true, message: `Application submitted! Your ID is ${volunteer_id}`, data: newVolunteer 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchVolunteer = async (req, res) => {
    const { query } = req.body;
    try {
        // Search by volunteer_id or mobileNo
        const volunteer = await User.findOne({
            where: { [Op.or]: [{ volunteer_id: query }, { mobileNo: query }] }
        });

        if (volunteer) {
            res.json({ success: true, volunteer });
        } else {
            res.status(404).json({ success: false, error: 'No record found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const volunteer = await User.findOne({
            where: { volunteer_id: volunteerId },
            attributes: { exclude: ['password'] } // सुरक्षा के लिए पासवर्ड न भेजें
        });

        if (volunteer) {
            res.json({ success: true, volunteer });
        } else {
            res.status(404).json({ success: false, error: 'Volunteer not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const User = require('../models/User');
const Admin = require('../models/Admin');
const CsrRegistration = require('../models/CsrRegistration');
const Donation = require('../models/Donation');
const Message = require('../models/Message');
const Story = require('../models/Story');
const Event = require('../models/Event');
const Media = require('../models/Media');
const ImpactStat = require('../models/ImpactStat');
const Banner = require('../models/Banner');
const Comment = require('../models/Comment');
const sequelize = require('../config/db');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const uploadedFileUrl = (file) => {
  if (!file) return null;
  return `uploads/${file.filename}`.replace(/\\/g, '/');
};

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// --- Admin Authentication ---
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }

  try {
    const adminUser = await Admin.findOne({ where: { email } });

    if (adminUser && (await adminUser.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(adminUser.id),
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials or not an admin' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Content Management ---
exports.createSuccessStory = async (req, res) => {
  try {
    const { title, description } = req.body;
    const url = uploadedFileUrl(req.file);
    const newStory = await Story.create({ title, description, url, type: 'image' });
    res.status(201).json({ success: true, data: newStory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = uploadedFileUrl(req.file);
    const newEvent = await Event.create({ title, description, image });
    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createMediaCoverage = async (req, res) => {
  try {
    const { title, publisher, date, link } = req.body;
    const image = uploadedFileUrl(req.file);
    const newMedia = await Media.create({ title, publisher, date, link, image });
    res.status(201).json({ success: true, data: newMedia });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const removeUploadedFile = async (fileUrl) => {
  const normalizedUrl = String(fileUrl || '').replace(/\\/g, '/');
  const match = normalizedUrl.match(/^\/?uploads\/([^/]+)$/);
  if (!match) return;

  try {
    await fs.promises.unlink(path.join(__dirname, '..', 'uploads', match[1]));
  } catch (error) {
    if (error.code !== 'ENOENT') console.warn('Unable to remove uploaded file:', error.message);
  }
};

const deleteContent = (model, fileField, commentModel) => async (req, res) => {
  try {
    const deletedItem = await sequelize.transaction(async (transaction) => {
      const item = await model.findByPk(req.params.id, { transaction });
      if (!item) return null;

      if (commentModel) {
        await Comment.destroy({
          where: { refId: item.id, refModel: commentModel },
          transaction,
        });
      }

      const fileUrl = item[fileField];
      await item.destroy({ transaction });
      return { fileUrl };
    });

    if (deletedItem === null) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    await removeUploadedFile(deletedItem.fileUrl);
    return res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteSuccessStory = deleteContent(Story, 'url', 'Story');
exports.deleteEvent = deleteContent(Event, 'image', 'Event');
exports.deleteMediaCoverage = deleteContent(Media, 'image');

// --- Settings Management ---
exports.updateImpactStats = async (req, res) => {
  try {
    const stats = req.body; // Expects an array of { stat_label: '...', stat_value: '...' }
    const updatePromises = stats.map(stat => 
      ImpactStat.update({ stat_value: stat.stat_value }, { where: { stat_label: stat.stat_label } })
    );
    await Promise.all(updatePromises);
    res.status(200).json({ success: true, message: 'Impact stats updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateBanner = async (req, res) => {
    try {
        const { banner_key } = req.body;
        const imageUrl = uploadedFileUrl(req.file);

        if (!banner_key || !imageUrl) {
            return res.status(400).json({ success: false, error: 'Banner key and image are required.' });
        }

        await Banner.update({ imageUrl }, { where: { banner_key } });
        res.status(200).json({ success: true, message: 'Banner updated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Dashboard Data Fetching ---
exports.getDashboardSummary = async (req, res) => {
    try {
        const totalRegistrations = await CsrRegistration.count();
        const totalDonations = await Donation.sum('amount');
        const totalVolunteers = await User.count({ where: { role: 'Volunteer' } });
        const totalMessages = await Message.count();
        res.json({
            registrations: totalRegistrations,
            donations: totalDonations || 0,
            volunteers: totalVolunteers,
            messages: totalMessages
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getAll = (model) => async (req, res) => {
    try {
        const items = await model.findAll({ order: [['createdAt', 'DESC']] });
        res.json(items);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllRegistrations = getAll(CsrRegistration);
exports.getAllDonations = getAll(Donation);
exports.getAllMessages = getAll(Message);

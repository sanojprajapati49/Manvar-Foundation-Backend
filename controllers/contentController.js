// controllers/contentController.js
const Event = require('../models/Event');
const Story = require('../models/Story');
const Media = require('../models/Media');
const Comment = require('../models/Comment');
const ImpactStat = require('../models/ImpactStat');
const Banner = require('../models/Banner');

// Generic function to handle getting content
const getContent = (model) => async (req, res) => {
  try {
    const options = {};
    // केवल तभी सॉर्ट करें जब मॉडल में 'date' एट्रिब्यूट हो
    if (model.rawAttributes.date) {
      options.order = [['date', 'DESC']];
    }
    const items = await model.findAll(options);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEvents = getContent(Event);
exports.getSuccessStories = getContent(Story);
exports.getMediaCoverage = getContent(Media);
exports.getImpactStats = getContent(ImpactStat);
exports.getBanners = getContent(Banner);

// Generic function for interactions
const handleInteraction = (model, field) => async (req, res) => {
    try {
        await model.increment(field, { where: { id: req.params.id } });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.incrementEventView = handleInteraction(Event, 'views');
exports.likeEvent = handleInteraction(Event, 'likes');
exports.incrementStoryView = handleInteraction(Story, 'views');
exports.likeStory = handleInteraction(Story, 'likes');

// Generic function for comments
const getComments = (refModel) => async (req, res) => {
    try {
        const comments = await Comment.findAll({ where: { refId: req.params.id, refModel }, order: [['createdAt', 'DESC']] });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const postComment = (refModel, parentModel) => async (req, res) => {
    try {
        const newComment = await Comment.create({
            name: req.body.name, // पब्लिक यूजर से नाम लें
            email: req.body.email, // पब्लिक यूजर से ईमेल लें
            comment: req.body.comment,
            refId: req.params.id,
            refModel,
        });
        // Increment comment count on parent
        await parentModel.increment('comments', { where: { id: req.params.id } });
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEventComments = getComments('Event');
exports.postEventComment = postComment('Event', Event);
exports.getStoryComments = getComments('Story');
exports.postStoryComment = postComment('Story', Story);

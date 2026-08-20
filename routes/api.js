const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const contentController = require('../controllers/contentController');
const donationController = require('../controllers/donationController');
const formController = require('../controllers/formController');
const adminController = require('../controllers/adminController');
const csrController = require('../controllers/csrController');
const { protect, admin } = require('../middleware/authMiddleware');
const csrUpload = require('../middleware/csrUploadMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- Auth Routes (login.html) ---
router.post('/check-user', authController.checkUser);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// --- Form Submission Routes (app.js) ---
router.post('/messages', formController.handleContactForm);
router.post('/join', formController.handleJoinForm);
router.post('/search-volunteer', protect, admin, formController.searchVolunteer); // Admin only

// Public route to get volunteer profile by their unique ID for certificate download
router.get('/volunteer/:volunteerId', formController.getMyProfile);

// --- Dynamic Content Routes (app.js) ---
router.get('/events', contentController.getEvents);
router.get('/success-stories', contentController.getSuccessStories);
router.get('/media-coverage', contentController.getMediaCoverage);
router.get('/impact-stats', contentController.getImpactStats);
router.get('/get-banners', contentController.getBanners);

// --- Interaction Routes (Likes, Views, Comments) ---
router.post('/events/:id/view', contentController.incrementEventView);
router.post('/events/:id/like', protect, contentController.likeEvent); // Must be logged in to like
router.get('/events/:id/comments', contentController.getEventComments);
router.post('/events/:id/comments', contentController.postEventComment);

router.post('/success-stories/:id/view', contentController.incrementStoryView);
router.post('/success-stories/:id/like', protect, contentController.likeStory); // Must be logged in to like
router.get('/success-stories/:id/comments', contentController.getStoryComments);
router.post('/success-stories/:id/comments', contentController.postStoryComment);

// --- Donation/Razorpay Routes (app.js) ---
router.get('/get-razorpay-key', donationController.getRazorpayKey);
router.post('/create-order', donationController.createOrder);
router.post('/save-donation', donationController.saveDonation);

// --- CSR Lok Bharti Routes ---
router.post('/csr-registration', csrUpload.fields([
  { name: 'address_proof', maxCount: 1 },
  { name: 'equipment_list', maxCount: 1 }
]), csrController.handleCsrRegistration);

// Admin route to download PDF
router.get('/csr-registration/:id/download-pdf', protect, admin, csrController.downloadCsrPdf);

// --- Admin Panel Routes ---
router.post('/admin/login', adminController.adminLogin);

// Content Management (Admin)
router.post('/admin/success-stories', protect, admin, upload.single('media'), adminController.createSuccessStory);
router.post('/admin/events', protect, admin, upload.single('image'), adminController.createEvent);
router.post('/admin/media-coverage', protect, admin, upload.single('image'), adminController.createMediaCoverage);

// Settings Management (Admin)
router.post('/admin/update-stats', protect, admin, adminController.updateImpactStats);
router.post('/admin/update-banner', protect, admin, upload.single('bannerImage'), adminController.updateBanner);

// Commission Plan (assuming a model and table exist)
// router.get('/aeps/commission-plan', aepsController.getCommissionPlan);
// router.post('/admin/update-commission', protect, admin, aepsController.updateCommissionPlan);

// --- Admin Dashboard Data ---
router.get('/admin/dashboard-summary', protect, admin, adminController.getDashboardSummary);
router.get('/admin/registrations', protect, admin, adminController.getAllRegistrations);
router.get('/admin/donations', protect, admin, adminController.getAllDonations);
router.get('/admin/messages', protect, admin, adminController.getAllMessages);

module.exports = router;

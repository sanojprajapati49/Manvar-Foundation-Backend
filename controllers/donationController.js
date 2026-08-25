// controllers/donationController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Donation = require('../models/Donation');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getRazorpayErrorMessage = (error) => {
  return error?.error?.description
    || error?.error?.reason
    || error?.description
    || error?.message
    || 'Unable to create Razorpay order';
};

exports.getRazorpayKey = (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};

exports.createOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay credentials are not configured' });
    }

    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'A valid donation amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    const message = getRazorpayErrorMessage(error);
    console.error('Razorpay order error:', message);
    res.status(500).json({ error: message });
  }
};

exports.saveDonation = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Signature is valid, save donation to DB
      const { firstName, lastName, email, phone, amount, pan, address, country, state, district, pincode, frequency } = req.body;
      const newDonation = await Donation.create({
        ...req.body
      });
      res.status(201).json({ success: true, data: newDonation });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

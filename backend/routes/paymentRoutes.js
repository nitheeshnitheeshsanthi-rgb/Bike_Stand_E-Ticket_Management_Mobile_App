const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// All payment routes are relative to /api/payments

// Create Razorpay Order
router.post('/create-order', paymentController.createOrder);

// Verify Razorpay Payment Signature
router.post('/verify-payment', paymentController.verifyPayment);

// Mark Paid (Manual by Staff)
router.post('/mark-paid', paymentController.markAsPaid);

module.exports = router;

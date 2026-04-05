const Razorpay = require('razorpay');
const crypto = require('crypto');
const Ticket = require('../models/Ticket');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_key_secret'
});

/**
 * Create Razorpay Order
 * POST /api/payments/create-order
 */
exports.createOrder = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'Ticket already paid' });
    }

    // Ensure fee is calculated (if not already done)
    if (!ticket.fee || ticket.fee === 0) {
       // Mock calculation logic if not closed
       // If exiting, closure should have been called.
       // Let's assume fee is at least ₹10 for testing
       ticket.fee = 10; 
    }

    const amount = Math.round(ticket.fee * 100); // Amount in paise
    const currency = 'INR';

    const options = {
      amount,
      currency,
      receipt: `receipt_${ticket.ticketId}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      ticketId: ticket.ticketId,
      fee: ticket.fee
    });

  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: 'Error creating Razorpay order' });
  }
};

/**
 * Verify Razorpay Payment Signature
 * POST /api/payments/verify-payment
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      ticketId,
      paymentMethod
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'your_key_secret';
    
    // Verify signature correctly
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (isSignatureValid) {
      // Update ticket status
      const ticket = await Ticket.findOne({ ticketId });
      if (ticket) {
        ticket.exitTime = new Date();
        ticket.calculateClosure(); // This sets status='COMPLETED' and calculates final fee
        ticket.paymentStatus = 'PAID';
        ticket.paymentId = razorpay_payment_id;
        ticket.paymentMethod = paymentMethod || 'UPI';
        ticket.paidAt = new Date();
        await ticket.save();

        res.status(200).json({ 
          success: true, 
          message: 'Payment verified successfully',
          ticket 
        });
      } else {
        res.status(404).json({ message: 'Ticket not found' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

/**
 * Mark as Paid (Manual) - Supports Cash or Manual UPI with Reference
 * POST /api/payments/mark-paid
 */
exports.markAsPaid = async (req, res) => {
  try {
    const { ticketId, paymentMethod, upiReference } = req.body;
    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.exitTime = new Date();
    ticket.calculateClosure(); // This sets status='COMPLETED' and calculates final fee
    ticket.paymentStatus = 'PAID';
    ticket.paymentMethod = paymentMethod || 'Cash';
    ticket.paymentId = upiReference || `CASH_${Date.now()}`;
    ticket.paidAt = new Date();
    
    await ticket.save();

    res.status(200).json({ 
      success: true, 
      message: `Ticket successfully marked as PAID (${ticket.paymentMethod})`,
      ticket 
    });

  } catch (error) {
    console.error('Manual Payment Error:', error);
    res.status(500).json({ message: 'Error marking manual payment' });
  }
};

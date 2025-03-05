import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import OrderData from '../models/order.js';
import crypto from 'crypto';

dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Order
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`, // Unique receipt ID
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
};

// ✅ Verify Order
export const verifyOrder = async (req, res) => {
  try {
    const userId = req.userId; // Ensure this comes from authenticated middleware
    const {
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartData, // Expecting array of cart items
    } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    if (!Array.isArray(cartData) || cartData.length === 0) {
      return res.status(400).json({ error: 'Cart data is required and must be an array' });
    }

    // Verify payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature, payment verification failed' });
    }

    // Save order
    const orderData = new OrderData({
      userId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      paymentStatus: 'success',
      subTotalAmt: amount,
      invoice_receipt: razorpay_signature,
      products: cartData, // Assuming the schema supports array of products
    });

    await orderData.save();

    res.status(200).json({ message: 'Payment verified and order saved successfully!' });
  } catch (err) {
    console.error('Error verifying Razorpay payment:', err);
    res.status(500).json({ error: 'Failed to verify Razorpay payment' });
  }
};

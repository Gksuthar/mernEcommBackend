import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import OrderData from '../models/order.js';
import crypto from 'crypto';

dotenv.config();
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;


    // Validate amount
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Math.random() * 1000}`,
    };
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
};
export const verifyOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartData, // ✅ Should be an array of cart items
    } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // ✅ Verify payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature, payment verification failed' });
    }

    // ✅ Map cartData to products array
    const products = cartData.map(item => ({
      productId: item._id,
      name: item.name,
      image: item.image, // assuming it's an array of strings
      quantity: item.qty, // or whatever field holds the quantity
      price: item.price,
    }));

    // ✅ Save the verified order
    const orderData = new OrderData({
      userId: userId,
      orderId: razorpay_order_id,
      products: products,
      paymentId: razorpay_payment_id,
      paymentStatus: 'success',
      subTotalAmt: amount,
      invoice_receipt: razorpay_signature,
    });

    await orderData.save();

    res.status(200).json({ message: 'Payment verified and order saved successfully!' });
  } catch (err) {
    console.error('Error verifying Razorpay payment:', err);
    res.status(500).json({ error: 'Failed to verify Razorpay payment' });
  }
};

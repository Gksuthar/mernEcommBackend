import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import OrderData from '../models/order.js'; 
import OrderData from '../models/order.js';

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
    const userId = req.userId
    const { amount,razorpay_order_id,razorpay_payment_id,razorpay_signature } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const OrderData = new OrderData({
      userId : userId,
      orderId:razorpay_order_id,
      productId:cartData.productId,
      product_details: cartData,
      paymentId : razorpay_payment_id,
      paymentStatus : "success",
      subTotalAmt:amount,
      invoice_receipt: razorpay_signature
    })
    await OrderData.save()
    // const options = {
    //   amount: amount * 100, // Convert to paise
    //   currency: 'INR',
    //   receipt: `receipt_${Math.random() * 1000}`,
    // };
    // const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
};
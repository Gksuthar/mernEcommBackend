import Razorpay from "razorpay";
import dotenv from "dotenv";
import OrderData from "../models/order.js";
import crypto from "crypto";
import mongoose from "mongoose";
import AddressModel from "../models/address.js";
dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`, // Unique receipt ID
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json(order);
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res
      .status(500)
      .json({ error: "Failed to create Razorpay order", details: err.message });
  }
};


export const verifyOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      amount,
      delivery_address,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartData,
    } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (
      !razorpay_order_id ||
      !delivery_address ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({ error: "Missing payment details or delivery address" });
    }

    // Validate delivery address format
    if (!mongoose.Types.ObjectId.isValid(delivery_address)) {
      return res.status(400).json({ error: "Invalid delivery address format" });
    }

    // Check if delivery address exists and belongs to the user
    const addressExists = await AddressModel.findOne({
      _id: delivery_address,
      userId: userId,
    });
    if (!addressExists) {
      return res.status(404).json({ error: "Delivery address not found or does not belong to the user" });
    }

    // Validate cartData
    if (!Array.isArray(cartData) || cartData.length === 0) {
      return res.status(400).json({ error: "Cart data is required and must be an array" });
    }

    // Validate each item in cartData
    for (const item of cartData) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ error: "Invalid product ID in cart data" });
      }
      if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ error: "Invalid quantity in cart data" });
      }
    }

    // Verify Razorpay signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.error("Signature mismatch:", { generated_signature, razorpay_signature });
      return res.status(400).json({ error: "Invalid signature, payment verification failed" });
    }

    // Save order data
    const orderData = new OrderData({
      userId,
      delivery_address,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      paymentStatus: "success",
      subTotalAmt: amount,
      // products: cartData.map(item => ({
      //   productId: item.productId,
      //   quantity: item.quantity,
      // })),
        productId: cartData[0].productId,
      Quantity:cartData[0].quantity,
      invoice_receipt: razorpay_signature,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await orderData.save();

    res.status(200).json({ message: "Payment verified and order saved successfully!" });
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    res.status(500).json({
      error: "Failed to verify Razorpay payment",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};
export const getOrder = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "User is invalid", success: false, error: true });
    }

    // const orders = await OrderData.find({ userId }).populate('productId')
    const orders = await OrderData.find({ userId })
      .populate("productId")
      .populate("userId")
      .populate("delivery_address");

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "Orders not found", success: false, error: true });
    }

    return res.status(200).json({
      message: "Your orders are fetch",
      data: orders,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: true,
    });
  }
};

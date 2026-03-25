


const stripe = require("../config/stripe");
const Order = require("../models/orderModel");


const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    
    if (!orderId)
      return res.status(400).json({ message: "Order ID is required" });

    const order = await Order.findById(orderId);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    if (order.paymentStatus === "paid")
      return res.status(400).json({ message: "Order already paid" });

    if (order.orderStatus === "cancelled")
      return res.status(400).json({ message: "Cannot pay for a cancelled order" });

    if (order.stripePaymentIntentId) {
      return res.status(200).json({
        message: "Payment already initialized",
        paymentIntentId: order.stripePaymentIntentId,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100),
      currency: "inr",
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    order.stripePaymentIntentId = paymentIntent.id;
    order.paymentStatus = "pending";

    await order.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const verifyPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId || !orderId)
      return res.status(400).json({ message: "All fields are required" });

    const order = await Order.findById(orderId);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    if (order.paymentStatus === "paid")
      return res.status(400).json({ message: "Order already paid" });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Enforce in production only
    if (process.env.NODE_ENV === "production") {
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          message: `Payment not successful. Status: ${paymentIntent.status}`,
        });
      }
    }

    if (paymentIntent.metadata.orderId !== orderId.toString())
      return res.status(400).json({ message: "Payment intent does not match order" });

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.stripePaymentIntentId = paymentIntentId;
    order.paidAt = Date.now();

    await order.save();

    res.json({
      success: true,
      message: "Payment verified successfully",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPayment, verifyPayment };




const express = require("express");
const router = express.Router();
const stripe = require("../config/stripe");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

// webhookRoutes.js — remove express.raw from here
router.post("/stripe", async (req, res) => {  // ← no express.raw()
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }


  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.payment_status !== "paid") {
      return res.json({ received: true });
    }

    const orderId = session.metadata.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      console.error("❌ Order not found:", orderId);
      return res.json({ received: true });
    }

    if (order.paymentStatus === "paid") {
      return res.json({ received: true });
    }

    order.stripePaymentIntentId = session.payment_intent;
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paidAt = Date.now();
    await order.save();


    await Cart.findOneAndUpdate(
      { user: order.user },
      { items: [] }
    );

    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty },
      });
      const updatedProduct = await Product.findById(item.product);
      if (updatedProduct) {
        global.io?.emit("stockUpdated", {
          productId: item.product.toString(),
          stock: updatedProduct.stock,
        });
      }
    }

    const populatedOrder = await Order.findById(orderId).populate("user", "name email");
    global.io?.to("adminRoom").emit("order_updated", populatedOrder);
    global.io?.to(order.user.toString()).emit("orderStatusUpdated", {
      orderId: order._id,
      orderStatus: "confirmed",
      paymentStatus: "paid",
      message: "Payment successful! Your order is confirmed ✅",
    });
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    const order = await Order.findById(orderId);

    if (order) {
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";
      await order.save();

      const populatedOrder = await Order.findById(orderId).populate("user", "name email");
      global.io?.to("adminRoom").emit("order_updated", populatedOrder);
      global.io?.to(order.user.toString()).emit("orderStatusUpdated", {
        orderId: order._id,
        orderStatus: "cancelled",
        paymentStatus: "failed",
        message: "Payment failed. Your order has been cancelled ❌",
      });
    }
  }

  res.json({ received: true });
});

module.exports = router;
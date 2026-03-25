const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  try {

    const { orderId } = req.body;

    if (!orderId)
      return res.status(400).json({ error: "orderId is required" });

    const order = await Order.findById(orderId);

    if (!order)
      return res.status(404).json({ error: "Order not found" });


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: order.orderItems.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      mode: "payment",
      metadata: { orderId: order._id.toString() },
      success_url: `http://localhost:5173/payment-success?orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:5173/cart",
    });


    res.json({ url: session.url });

  } catch (error) {
    console.error("❌ Stripe error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify-session", async (req, res) => {
  try {
    const { sessionId, orderId } = req.body;

    if (!sessionId || !orderId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      if (order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.stripePaymentIntentId = session.payment_intent;
        order.paidAt = Date.now();
        await order.save();

        // Ensure user cart is cleared
        await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

        // Decrement product stock
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.qty }
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

      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

  } catch (error) {
    console.error("❌ Verify session error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
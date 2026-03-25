
const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// Create new order + check stock + reduce stock + clear cart
const addOrderItems = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  // Check stock availability for all items first
  for (const item of cart.items) {
    const product = item.product;
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    if (product.stock < item.qty) {
      res.status(400);
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock}`
      );
    }
  }

  const orderItems = cart.items.map((item) => ({
    name: item.product.name,
    qty: item.qty,
    image: item.product.images[0]?.url,
    price: item.product.price,
    product: item.product._id,
  }));

  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    totalPrice: itemsPrice,
    // ✅ COD confirmed immediately, online waits for webhook
    orderStatus: paymentMethod === "COD" ? "confirmed" : "pending",
  });

  // ✅ Notify admin dashboard in real-time
  // ✅ Notify admin dashboard in real-time
  const io = req.app.get("io");
  if (io) {
    const populatedOrder = await Order.findById(order._id).populate("user", "name email");

    // ✅ Emit correct format with amount and message
    io.to("admins").emit("newOrder", {
      orderId: order._id,
      amount: order.totalPrice,
      customer: populatedOrder.user?.name,
      paymentMethod: order.paymentMethod,
      message: `New order ₹${order.totalPrice} from ${populatedOrder.user?.name}`,
    });
  }


  // ✅ Only reduce stock immediately for COD
  // For Online — stock is reduced in webhookRoutes after payment confirmed
  if (paymentMethod === "COD") {
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.qty },
      });

      // ✅ Emit stock update to ALL users
      const io = req.app.get("io");
      if (io) {
        const updatedProduct = await Product.findById(item.product._id);
        io.emit("stockUpdated", {
          productId: item.product._id.toString(),
          stock: updatedProduct.stock,
        });
      }
    }
  }

  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

// Get logged in user orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json(order);
});

// Update order to paid
// ✅ FIXED: updateOrderToPaid — now blocked for online payments
// Online payments must only be confirmed via Stripe webhook
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // ✅ Block this route for online payments entirely
  // Only COD can be manually marked paid (e.g. by admin)
  if (order.paymentMethod !== "COD") {
    res.status(400);
    throw new Error(
      "Online payment orders are confirmed automatically via Stripe webhook. This route is for COD only."
    );
  }

  if (order.paymentStatus === "paid") {
    res.status(400);
    throw new Error("Order already paid");
  }

  order.paymentStatus = "paid";
  order.orderStatus = "confirmed";
  order.paidAt = Date.now();

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

const updateOrderToRefunded = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.paymentStatus !== "refund in progress") {
    res.status(400);
    throw new Error("Order is not in refund in progress state");
  }

  order.paymentStatus = "refunded";
  order.refundedAt = Date.now();
  const updatedOrder = await order.save();

  const io = req.app.get("io");
  if (io) {
    // ✅ Emit correct format matching MyOrders.jsx listener
    io.to(order.user.toString()).emit("orderStatusUpdated", {
      orderId: order._id,
      orderStatus: order.orderStatus,
      paymentStatus: "refunded", // ✅ correct format
      message: "Your refund has been processed! 🔵",
    });

    // ✅ Update admin panel
    io.to("adminRoom").emit("order_updated", updatedOrder);

  }


  res.json({ success: true, message: "Order refunded successfully", order: updatedOrder });
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.orderStatus = "delivered";
  const updatedOrder = await order.save();

  const io = req.app.get("io");
  if (io) {
    // ✅ Correct format
    io.to(order.user.toString()).emit("orderStatusUpdated", {
      orderId: order._id,
      orderStatus: "delivered",
      paymentStatus: order.paymentStatus,
      message: "Your order has been delivered! 🏠",
    });

    io.to("adminRoom").emit("order_updated", updatedOrder);
  }



  res.json(updatedOrder);
});



// Get all orders (Admin)
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");
  res.json(orders);
});

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToRefunded,
  updateOrderToDelivered,
  getOrders,
};
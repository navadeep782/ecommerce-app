const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");


// DASHBOARD STATS
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      orderStatusCounts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: "Cannot change your own role" });

    user.role = role;
    await user.save();

    res.status(200).json({ message: "User role updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: "Cannot delete your own account" });

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ORDER MANAGEMENT


const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Add this OUTSIDE and ABOVE updateOrderStatus function
function getStatusMessage(status) {
  switch (status) {
    case "confirmed":  return "Your order has been confirmed! ✅";
    case "processing": return "Your order is being processed ⚙️";
    case "shipped":    return "Your order is on the way! 🚚";
    case "delivered":  return "Your order has been delivered! 🏠";
    case "cancelled":  return "Your order has been cancelled ❌";
    default:           return "Your order status has been updated";
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const io = req.app.get("io");
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(orderStatus))
      return res.status(400).json({ message: "Invalid order status" });

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.orderStatus === "delivered")
      return res.status(400).json({ message: "Order already delivered" });

    if (order.orderStatus === "cancelled")
      return res.status(400).json({ message: "Cannot update a cancelled order" });

    // ✅ Block status change if online payment not paid
    if (order.paymentMethod !== "COD" && order.paymentStatus !== "paid") {
      return res.status(400).json({
        message: `Cannot update order to "${orderStatus}" — payment is still ${order.paymentStatus}.`,
      });
    }

    if (orderStatus === "cancelled") {
      // ✅ Only restore stock if it was actually reduced
      // COD → reduced at creation
      // Online → reduced only after payment confirmed in webhook
      const stockWasReduced =
        order.paymentMethod === "COD" || order.paymentStatus === "paid";

      if (stockWasReduced) {
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.qty },
          });

          const updatedProduct = await Product.findById(item.product);
          if (updatedProduct) {
            io?.emit("stockUpdated", {
              productId: item.product.toString(),
              stock: updatedProduct.stock,
            });
          }
        }
      }

      // ✅ Only trigger refund flow if payment was actually made
      if (order.paymentStatus === "paid") {
        order.paymentStatus = "refund in progress";
      }
    }

    order.orderStatus = orderStatus;

    if (orderStatus === "delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save();

    if (io) {
      const populatedOrder = await Order.findById(order._id).populate("user");
      io.to("adminRoom").emit("order_updated", populatedOrder);
      io.to(order.user.toString()).emit("orderStatusUpdated", {
        orderId: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        message: getStatusMessage(orderStatus),
      });
    }

    res.status(200).json({ success: true, message: "Order status updated", order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateOrderToRefunded = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  const io = req.app.get("io");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.paymentStatus !== "refund in progress") {
    res.status(400);
    throw new Error("Order is not in refund in progress state");
  }

  if (order.stripePaymentIntentId) {
    const stripe = require("../config/stripe");
    await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
    });
  }

  order.paymentStatus = "refunded";
  order.refundedAt = Date.now();
  await order.save();

 



  // ✅ Emit to user in real-time
  
  if (io) {
    io.to(order.user.toString()).emit("orderStatusUpdated", {
      orderId: order._id,
      orderStatus: order.orderStatus,
      paymentStatus: "refunded",
      message: "Your refund has been processed! 🔵",
    });
  }

  res.json({ success: true, message: "Order refunded successfully", order });
});

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    await order.deleteOne();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// PRODUCT MANAGEMENT

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderToRefunded ,
  deleteOrder,
  getAllProducts,
  getProductById,
  deleteProduct,
};
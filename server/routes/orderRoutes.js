const express = require("express");
const router = express.Router();

const {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToRefunded,
  updateOrderToDelivered,
  getOrders,
} = require("../controllers/orderController");

const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").post(protect, addOrderItems).get(protect, admin, getOrders);

router.route("/my").get(protect, getMyOrders);

router.route("/:id").get(protect, getOrderById);

router.route("/:id/pay").put(protect, updateOrderToPaid);

// Add this route
router.route("/:id/refund").put(protect, admin, updateOrderToRefunded);

router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered);

module.exports = router;
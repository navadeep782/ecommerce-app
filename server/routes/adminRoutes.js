const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getAllProducts,
  getProductById,
  deleteProduct,
} = require("../controllers/adminController");

// All routes protected + admin only
router.use(protect, admin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Users
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Orders
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.put("/orders/:id/status", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);

// Products
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.delete("/products/:id", deleteProduct);

module.exports = router;
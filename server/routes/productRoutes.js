const express = require('express');
const router  = express.Router();
const Product = require("../models/productModel"); // ✅ add this
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const upload = require("../middleware/uploadMiddleware");

// router.post("/",upload.single("image"), createProduct);

  router.post(
  "/",
  
  upload.single("image"),
  createProduct
);

router.put(
  "/:id",
  upload.single("image"),
  updateProduct
);

router.get('/',    getProducts);

// ✅ Add this TEMPORARILY — remove after running once
router.put("/reset-stock", async (req, res) => {
  try {
    await Product.updateMany({ stock: { $lte: 0 } }, { $set: { stock: 50 } });
    res.json({ message: "✅ Stock reset for all out-of-stock products" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 


router.get('/:id', getProductById);

//router.post('/',      protect, admin, createProduct);
router.put('/:id',    protect, admin, updateProduct);

router.delete('/:id', protect, admin, deleteProduct);

router.post('/:id/reviews', protect, createProductReview);

module.exports = router;
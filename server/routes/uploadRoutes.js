const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, admin, upload.single("image"), (req, res) => {
  res.status(200).json({
    message: "Image uploaded successfully",
    imageUrl: req.file.path,
  });
});

module.exports = router;
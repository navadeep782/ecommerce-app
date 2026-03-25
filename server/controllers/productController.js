const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");


const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const filter = {};

  // Search
  if (req.query.keyword) {
    filter.$or = [
      { name: { $regex: req.query.keyword, $options: "i" } },
      { description: { $regex: req.query.keyword, $options: "i" } },
    ];
  }

  // Category
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Price filter
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};

    if (req.query.minPrice)
      filter.price.$gte = Number(req.query.minPrice);

    if (req.query.maxPrice)
      filter.price.$lte = Number(req.query.maxPrice);
  }

  // Rating filter
  if (req.query.rating) {
    filter.rating = {
      $gte: Number(req.query.rating),
      $ne: 0,
    };
  }

  // Sorting
  let sort = { createdAt: -1 };

  if (req.query.sort === "price_asc") sort = { price: 1 };
  if (req.query.sort === "price_desc") sort = { price: -1 };
  if (req.query.sort === "rating") sort = { rating: -1 };

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / pageSize),
    products,
  });
});


const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("user", "name email");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(200).json({ success: true, product });
});


const createProduct = asyncHandler(async (req, res) => {
  try {
   
    const { name, description, price, category, brand, stock } = req.body;

    
    if (!name || !description || !price || !category || !brand) {
      res.status(400);
      throw new Error("Please provide all required product fields");
    }
    
    const existingProduct = await Product.findOne({ name });

    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    let imageUrl = "https://via.placeholder.com/300";

    if (req.file) {
      imageUrl = req.file.path;
    }

    const product = await Product.create({
      //user: req.user ? req.user._id : null,
      name,
      description,
      price,
      category,
      brand,
      stock: stock || 0,
      images: [{ url: imageUrl }],
    });

    res.status(201).json({ success: true, product });

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.name = req.body.name ?? product.name;
  product.description = req.body.description ?? product.description;
  product.price = req.body.price ?? product.price;
  product.category = req.body.category ?? product.category;
  product.brand = req.body.brand ?? product.brand;
  product.stock = req.body.stock ?? product.stock;

  if (req.file) {
    product.images = [{ url: req.file.path }];
  }

  const updatedProduct = await product.save();

  res.status(200).json({
    success: true,
    product: updatedProduct,
  });
});


const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});


const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    res.status(400);
    throw new Error("Please provide rating and comment");
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Allow review only if purchased
  const order = await Order.findOne({
    user: req.user._id,
    "orderItems.product": product._id,
  });

  if (!order) {
    res.status(400);
    throw new Error("You can review only purchased products");
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You already reviewed this product");
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);

  product.numReviews = product.reviews.length;

  product.rating =
    product.reviews.reduce((acc, item) => acc + item.rating, 0) /
    product.reviews.length;

  await product.save();

  res.status(201).json({
    success: true,
    message: "Review added successfully",
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};
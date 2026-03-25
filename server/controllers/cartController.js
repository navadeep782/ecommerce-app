const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");


const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body;
  const quantity = Number(qty);

  if (!productId || !quantity || quantity <= 0) {
    res.status(400);
    throw new Error("Valid productId and qty are required");
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }       
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }   
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );  
  if (itemIndex > -1) {
    cart.items[itemIndex].qty += quantity;
  } else {
    cart.items.push({ product: productId, qty: quantity });   
   
  }  
  await cart.save();

  res.status(200).json(cart);
}); 

const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name price image"
  );

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  res.status(200).json(cart);
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  res.status(200).json(cart);
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  cart.items = [];

  await cart.save();

  res.json({ message: "Cart cleared" });
});

module.exports = {
     addToCart, 
     getCart,   
     removeFromCart,
     clearCart 
    };        
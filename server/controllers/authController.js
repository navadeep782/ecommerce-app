const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password });
  // After user created
  const io = req.app.get("io");
  if (io) {
    io.to("adminRoom").emit("newUser", {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  }

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  //const user = await      User.findOne({ email });   
  const user = await User.findOne({ email }).select("+password");   
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  
  const token = generateToken(user._id);   
  res.status(200).json({      
    success: true,        
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
}); 

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, password } = req.body || {};

  if (email) {
    const emailExists = await User.findOne({ email });

    if (
      emailExists &&
      emailExists._id.toString() !== req.user._id.toString()
    ) {
      res.status(400);
      throw new Error("Email already registered");
    }
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;
  
  const updated = await user.save();

  res.status(200).json({
    success: true,
    user: updated,
  });
});

module.exports = { registerUser, loginUser, logoutUser, getMe, updateProfile };
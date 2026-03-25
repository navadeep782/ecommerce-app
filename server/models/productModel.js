const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
     // required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    category: {
      type: String,
      required: true,
     // enum: ['Electronics', 'Clothing', 'Food', 'Books', 'Beauty', 'Sports', 'Other'],
    },
    brand:  { type: String, required: true },
    stock:  { type: Number, default: 0, min: 0 },
    images: [
      {
        public_id: { type: String },
        url:       { type: String, required: true },
      },
    ],
    reviews:    [reviewSchema],
    numReviews: { type: Number, default: 0 },
    rating:     { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
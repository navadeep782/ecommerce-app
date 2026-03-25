const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [orderItemSchema],

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      default: "Razorpay",
    },

    stripePaymentIntentId: { type: String },

   

    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    paidAt: {
      type: Date,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    refundedAt: {
        type: Date,
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refund in progress", "refunded", "failed"],
        default: "pending",
      },

    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
orderSchema.index({ user: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model("Order", orderSchema);
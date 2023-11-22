const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  status: {
    type: "String",
    required: true,
    default: "Pending",
  },
  totalPrice: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

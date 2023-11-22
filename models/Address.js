const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  isHome: {
    type: Boolean,
  },
  isWork: {
    type: Boolean,
  },
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Address = require("../models/Address");

router.get("/", async (req, res) => {
  const allAddresses = await Address.find();

  if (allAddresses.length < 1) {
    return res.status(500).json({ message: "Not able to get addresses" });
  }
  res.json(allAddresses);
});

router.get("/:id", async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (address) {
    return res.json(address);
  } else {
    return res
      .status(500)
      .json({ message: "Not able to get address with given id" });
  }
});

router.post("/create/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  const parsedAddress = req.body;
  if (user) {
    const newAddress = {
      addressLine1: parsedAddress.addressLine1,
      addressLine2: parsedAddress.addressLine2,
      city: parsedAddress.city,
      state: parsedAddress.pincode,
      country: parsedAddress.country,
      pincode: parsedAddress.pincode,
      isHome: parsedAddress.isHome,
      isWork: parsedAddress.isWork,
    };

    const address = new Address(newAddress);

    const result = await address.save();

    user.addresses.push(result._id);
    await user.save();

    if (result) {
      return res.json({ message: "Address created successfully", result });
    } else {
      return res.status(500).json({ message: "Error while saving address" });
    }
  } else {
    return res
      .status(411)
      .json({ message: "User not found, Please login to create Address" });
  }
});

router.put("/update/:id", async (req, res) => {
  const address = await Address.findById(req.params.id);
  if (address) {
    const {
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      pincode,
      isHome,
      isWork,
    } = req.body;
    const updatedDetails = {
      addressLine1: addressLine1 ? addressLine1 : address.addressLine1,
      addressLine2: addressLine2 ? addressLine2 : address.addressLine2,
      city: city ? city : address.city,
      state: state ? state : address.state,
      country: country ? country : address.country,
      pincode: pincode ? pincode : address.pincode,
      isHome: isHome == undefined ? address.isHome : isHome,
      isWork: isWork == undefined ? address.isWork : isWork,
    };
    try {
      const updatedAddress = await Address.findByIdAndUpdate(
        req.params.id,
        updatedDetails,
        { new: true }
      );
      return res.json({
        message: "Address updated successfully",
        updatedAddress,
      });
    } catch (err) {
      return res.status(500).json({ message: "Error while updating address" });
    }
  } else {
    return res
      .status(411)
      .json({ message: "Address not found, Please give correct Address id" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const address = await Address.findByIdAndDelete(req.params.id);

  if (address) {
    return res.json({ message: "Deletion Success" });
  } else {
    return res.status(411).json({ message: "Provide correct id" });
  }
});

module.exports = router;

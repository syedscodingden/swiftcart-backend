const express = require("express");
const router = express.Router();
const User = require('../models/User');

router.get("/users", async (req, res) => {
  const allUsers = await User.find().select("-password").populate("addresses");

  if (allUsers.length < 1) {
    return res.status(500).json({ message: "Not able to get Users" });
  }

  res.json(allUsers);
});

module.exports = router;

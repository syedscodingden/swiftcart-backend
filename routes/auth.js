require('dotenv').config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const middlewareExports = require("../middleware");

const userAuthenticateJWT = middlewareExports.userAuthenticateJWT;

const router = express.Router();
const secret = `${process.env.USER_SECRET}`;

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    const newUser = new User({ ...req.body });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id, role: "user" }, secret, {
      expiresIn: "1h",
    });
    res.json({ msg: "user created", token });
  } else {
    res.status(403).json({ message: "User already exists" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user._id, role: "user" }, secret, {
        expiresIn: "1h",
      });
      req.headers.userId = user.username;
      return res.json({ msg: "Logged in successfully", token });
    } else {
      res.status(403).json({ message: "Invalid Password" });
    }
  } else {
    res.status(403).json({ message: "Invalid username, User Not found" });
  }
});

router.put("/update", userAuthenticateJWT, (req, res) => {
  res.json({ msg: "success" });
});

router.get("/me", userAuthenticateJWT, async (req, res) => {
  const userId = req.headers["userId"];
  const user = await User.findOne({ _id: userId });
  if (user) {
    res.json({ username: user.username });
  } else {
    res.status(403).json({ message: "User not logged in" });
  }
});

module.exports = router;

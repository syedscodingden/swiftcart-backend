const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
require("dotenv").config();

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const addressRoutes = require("./routes/address");
const infoRoutes = require("./routes/information");
const orderRoutes = require("./routes/orders");
const cartRoutes = require("./routes/cart");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/address", addressRoutes);
app.use("/information", infoRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);

app.listen(PORT, () => {
  console.log(`Server listening at ${PORT}`);
});

mongoose.connect(`${process.env.DATABASE_URL}`, { dbName: "ecommerce" });

const express = require("express");
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

router.get("/", async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "-password")
    .populate("shippingAddress")
    .populate("orderItems")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ message: "Failed to get orders" });
  } else {
    res.json(orderList);
  }
});

router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "-password")
    .populate("shippingAddress")
    .populate({ path: "orderItems", populate: "product" });

  if (!order) {
    res.status(500).json({ message: "Failed to get orders" });
  } else {
    res.json(order);
  }
});

router.post("/create-order", async (req, res) => {
  const orderItemIds = Promise.all(
    req.body.orderItems.map(async (item) => {
      let newOrderItem = new OrderItem({
        quantity: item.quantity,
        product: item.product,
      });

      const orderItem = await newOrderItem.save();
      return orderItem._id;
    })
  );

  const orderItemIdsResolved = await orderItemIds;

  const totalPrices = await Promise.all(
    orderItemIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      if (!orderItem) {
        return 0;
      }
      const totalPrice =
        parseInt(orderItem.product.price) * +orderItem.quantity;

      return totalPrice;
    })
  );
  let date = new Date();
  let order = {
    orderItems: orderItemIdsResolved,
    shippingAddress: req.body.shippingAddress,
    mobile: req.body.mobile,
    status: req.body.status,
    totalPrice: totalPrices.reduce((acc, val) => acc + val, 0),
    user: req.body.user,
    dateOrdered: date,
    deliveryDate: new Date(date.setTime(date.getTime() + 5 * 86400000)),
  };

  const isValidOrder = order;

  let dbOrder = new Order(isValidOrder);

  dbOrder = await dbOrder.save();

  if (!dbOrder) {
    return res.status(400).json({ message: "The order couldnt be create" });
  } else {
    res.json(dbOrder);
  }
});

router.put("/update/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!order) {
    return res.status(400).json({ message: "order cannot be updated" });
  }
  res.json({ message: "Success", order });
});

router.delete("/delete/:id", async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (order) {
    await order.orderItems.map(async (orderItem) => {
      await OrderItem.findByIdAndDelete(orderItem);
    });
    return res.json({ message: "Deletion Success" });
  }
  return res.status(400).json({ message: "order cannot be deleted" });
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res
      .status(400)
      .json({ message: "The total sales could not be generated" });
  }

  res.json({ totalSales });
});

router.get("/get/user-orders/:id", async (req, res) => {
  const orders = await Order.find({ user: req.params.id })
    .populate("shippingAddress")
    .populate({ path: "orderItems", populate: "product" });

  if (!orders) {
    res.status(500).json({ message: "Failed to get orders" });
  } else {
    res.json(orders);
  }
});

module.exports = router;

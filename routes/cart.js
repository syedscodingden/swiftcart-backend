const express = require("express");
const router = express.Router();
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');

router.get("/get/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (!user.cart) {
      return res.json([]);
    } else {
      const cartItems = await Promise.all(
        user.cart.map(async (orderItemId) => {
          const orderItem = await OrderItem.findById(orderItemId).populate(
            "product"
          );
          return orderItem;
        })
      );

      return res.json(cartItems);
    }
  } else {
    return res
      .status(403)
      .json({ message: "User does not exist please signup" });
  }
});

// router.post("/create/:id", async (req, res) => {
//   const user = await User.findById(req.params.id);
//   if (user) {
//     const parsedAddress = addressInput.safeParse(req.body);
//     if (!parsedAddress.success) {
//       return res
//         .status(400)
//         .json({ message: "Please enter valid values in the address fields " });
//     }
//     const newAddress: AddressZod = {
//       addressLine1: parsedAddress.data.addressLine1,
//       addressLine2: parsedAddress.data.addressLine2,
//       city: parsedAddress.data.city,
//       state: parsedAddress.data.pincode,
//       country: parsedAddress.data.country,
//       pincode: parsedAddress.data.pincode,
//       isHome: parsedAddress.data.isHome,
//       isWork: parsedAddress.data.isWork,
//     };

//     const address = new Address(newAddress);

//     const result = await address.save();

//     user.addresses.push(result._id);
//     await user.save();

//     if (result) {
//       return res.json({ message: "Address created successfully", result });
//     } else {
//       return res.status(500).json({ message: "Error while saving address" });
//     }
//   } else {
//     return res
//       .status(411)
//       .json({ message: "User not found, Please login to create Address" });
//   }
// });

router.put("/update/:id", async (req, res) => {
  const newItem = req.body;
  const user = await User.findById(req.params.id).populate({
    path: "cart",
    populate: { path: "product" },
  });

  if (user) {
    const cartItems = await Promise.all(
      user.cart.map(async (cartItem) => {
        const orderItem = await OrderItem.findById(cartItem).populate(
          "product",
          "_id"
        );
        if (!orderItem) {
          return;
        }
        return orderItem;
      })
    );
    if (cartItems.length > 0) {
      const cartItem = cartItems.find(
        (orderItemId) =>
          orderItemId?.product._id.toHexString() === newItem.product.toString()
      );
      if (cartItem) {
        const orderItem = await OrderItem.findById(cartItem);
        if (orderItem) {
          if (newItem.quantity === 0) {
            const removedOrderItem = await orderItem.deleteOne({
              _id: cartItem,
            });
            const index = user.cart.findIndex(
              (itemId) => itemId === cartItem._id
            );
            user.cart.splice(index, 1);
            const cartUpdate = await user.save();
            if (removedOrderItem && cartUpdate) {
              return res.json({ message: "Removed Order Item from Cart" });
            } else {
              return res
                .status(500)
                .json({ message: "Cart Item not found, could not delete" });
            }
          } else {
            Object.assign(orderItem, newItem); //test this out
            try {
              await orderItem.save();
              return res.json({ message: "Updated Order Item in Cart" });
            } catch (err) {
              return res
                .status(500)
                .json({ message: "Error while saving updated cart Item" });
            }
          }
        } else {
          return res
            .status(500)
            .json({ message: "Cart Item not found, could not update" });
        }
      } else {
        if (newItem.quantity > 0) {
          try {
            let newOrderItem = new OrderItem({
              quantity: newItem.quantity,
              product: newItem.product,
            });

            const createdOrderItem = await newOrderItem.save();
            user.cart.push(createdOrderItem._id);
            await user.save();
            return res.json({
              message: "Added item to existing cart",
              createdOrderItem,
            });
          } catch (err) {
            return res
              .status(500)
              .json({ message: "Error while adding item to existing Cart" });
          }
        } else {
          return res
            .status(411)
            .json({ message: "Send a valid quantity to add to existing cart" });
        }
      }
    } else {
      if (newItem.quantity > 0) {
        try {
          let newOrderItem = new OrderItem({
            quantity: newItem.quantity,
            product: newItem.product,
          });

          const createdOrderItem = await newOrderItem.save();
          user.cart.push(createdOrderItem._id);
          await user.save();
          return res.json({ message: "Added item to cart", createdOrderItem });
        } catch (err) {
          return res
            .status(500)
            .json({ message: "Error while adding item to Cart" });
        }
      } else {
        return res.status(411).json({ message: "Send a valid quantity" });
      }
    }
  } else {
    return res
      .status(411)
      .json({ message: "User not found, Please login or signup" });
  }
});

// router.delete("/delete/:id", async (req, res) => {
//   const address = await Address.findByIdAndDelete(req.params.id);

//   if (address) {
//     return res.json({ message: "Deletion Success" });
//   } else {
//     return res.status(411).json({ message: "Provide correct id" });
//   }
// });

module.exports = router;

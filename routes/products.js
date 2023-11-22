const express = require("express");
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const middlewareExports = require("../middleware");

const paginatedResults = middlewareExports.paginatedResults;

router.get("/", paginatedResults(Product), async (req, res) => {
  const products = res.paginatedRes;

  if (!products || products.length < 1) {
    return res.status(500).json({ message: "Failed to get products" });
  }

  res.json({ products });
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    return res.status(500).json({ message: "Failed to find the product" });
  }

  res.json(product);
});

router.post("/", async (req, res) => {
  //create zod file for products

  const category = await Category.find({ name: req.body.category });

  if (category.length > 0) {
    const product = {
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      images: [...req.body.images],
      brand: req.body.brand,
      price: req.body.price,
      category: category[0]._id,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
      dateCreated: new Date(),
    };
    const newProduct = new Product(product);
    const prod = await newProduct.save();

    if (!prod) {
      return res.status(411).json({ msg: "Product could not be created" });
    }
    res.json({ prod });
  } else {
    return res.status(411).json({ msg: "Category not found" });
  }
});

router.put("/:id", async (req, res) => {
  //create zod file for products
  const product = await Product.findById(req.params.id);
  let updatedCategory = null;
  if (product) {
    if (req.body.category != null) {
      updatedCategory = await Category.find({ name: req.body.category });
      product.category = updatedCategory[0]._id;
    }
   
    const updatedProduct = {
      name: req.body.name ? req.body.name : product.name,
      description: req.body.description
        ? req.body.description
        : product.description,
      image: req.body.image ? req.body.image : product.image,
      images: req.body.images
        ? [...product.images, ...req.body.images]
        : [...product.images],
      brand: req.body.brand ? req.body.brand : product.brand,
      price: req.body.price ? req.body.price : product.price,
      category: product.category,
      countInStock: req.body.countInStock
        ? req.body.countInStock
        : product.countInStock,
      rating: req.body.rating ? req.body.rating : product.rating,
      isFeatured: req.body.isFeatured
        ? req.body.isFeatured
        : product.isFeatured,
      dateCreated: req.body.dateCreated
        ? req.body.dateCreated
        : product.dateCreated,
    };
    let prod = await Product.findByIdAndUpdate(req.params.id, updatedProduct, {
      new: true,
    });

    if (!prod) {
      return res.status(411).json({ msg: "Product could not be created" });
    }
    return res.json(prod);
  } else {
    return res.status(411).json({ msg: "Product Not found" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const delResult = await Product.findByIdAndDelete(req.params.id);

    if (delResult) {
      res.json({ message: "Deletion success" });
    } else {
      throw new Error();
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Product doesnt exist or provide proper id" });
  }
});

module.exports = router;

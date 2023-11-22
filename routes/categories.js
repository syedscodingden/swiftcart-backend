const express = require("express");
const router = express.Router();
const Category = require('../models/Category');
const middlewareExports = require("../middleware");

const userAuthenticateJWT = middlewareExports.userAuthenticateJWT;

router.get("/", async (req, res) => {
  const categoryList = await Category.find();

  if (categoryList == null) {
    res.status(500).json({ msg: "failed to get categories" });
  }
  res.json({ categories: categoryList });
});

router.get("/:id", async (req, res) => {
  const foundCategory = await Category.findById(req.params.id);

  if (foundCategory == null) {
    res.status(500).json({
      msg: "Failed to get the category, check id or category doesnt exist",
    });
  }
  res.json({ category: foundCategory });
});

router.post("/", async (req, res) => {
  // add safeparse, create zod file for this
  const isValidCategoryInput = req.body;
 
  let category = {
    name: isValidCategoryInput.data.name,
    subCat: isValidCategoryInput.data.subCat,
    icon: isValidCategoryInput.data.icon,
  };

  let existingCategory = await Category.find({
    name: isValidCategoryInput.data.name,
    subCat: isValidCategoryInput.data.subCat
      ? isValidCategoryInput.data.subCat
      : null,
  });

  if (existingCategory.length < 1) {
    let createdCategory = new Category(category);
    let dbCat = await createdCategory.save();

    if (!dbCat) {
      return res.status(404).json({ msg: "Error while saving to db" });
    }
    res.json({ category: dbCat });
  } else {
    return res.status(411).json({ msg: "Category already exists" });
  }
});

router.put("/:id", userAuthenticateJWT, async (req, res) => {

  let existingCategory = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
    },
    { new: true }
  );

  if (!existingCategory) {
    return res
      .status(411)
      .json({ msg: "Category doesnt exists or check the id" });
  }
  return res.status(404).json({ existingCategory, msg: "Category Updated" });
});

router.delete("/:id", userAuthenticateJWT, async (req, res) => {
  try {
    let deleteSuccess = await Category.findByIdAndDelete(req.params.id);
    if (deleteSuccess) {
      res.json({ message: "Deletion success" });
    } else {
      throw new Error();
    }
  } catch (err) {
    return res
      .status(411)
      .json({ msg: "Category doesnt exist or provide proper id" });
  }
});

module.exports = router;

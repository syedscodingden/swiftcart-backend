const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
require("dotenv").config();

const secret = `${process.env.USER_SECRET}`;

const userAuthenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader?.split(" ")[1];

    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        return res.status(403).json({ message: "Error while verifyng" });
      }
      if (!payload) {
        res.status(403).json({ message: "Invalid token" });
        return;
      }
      if (typeof payload === "string") {
        res.status(403).json({ message: "Invalid Credentials" });
        return;
      }
      req.headers["userId"] = payload.id;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

const paginatedResults = (model) => {
  return async (req, res, next) => {
    let page = req.query.page;
    let limit = req.query.limit;

    let startIndex;
    let endIndex;
    if (page && limit) {
      startIndex = (parseInt(page) - 1) * parseInt(limit);
      endIndex = parseInt(page) * parseInt(limit);
    } else {
      return res.json({ message: "please enter valid page and limit values" });
    }

    page = parseInt(page);
    limit = parseInt(limit);

    let count = await Product.countDocuments();
    let nextAttr = {
      page: null,
      limit: null,
    };
    if (endIndex < count) {
      nextAttr = {
        page: page + 1,
        limit: limit,
      };
    }
    let prevAttr = {
      page: null,
      limit: null,
    };

    if (startIndex > 0) {
      prevAttr = {
        page: page - 1,
        limit: limit,
      };
    }

    const fetchedResults = await model.find().skip(startIndex).limit(limit);
    const results = {
      next: nextAttr,
      previous: prevAttr,
      results: fetchedResults,
    };

    res.paginatedRes = results;

    next();
  };
};

module.exports = {
  userAuthenticateJWT,
  paginatedResults,
};

const Product = require("../models/Product");
const Users = require("../models/User.js");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const app = express();
const cloudinary = require("../utils/cloudinary.js");
require("dotenv").config();

// Middleware

app.use(express.json());
app.use(cors());

// API Creation for default route

const getHome = (req, res) => {
  res.send("Express App is Running");
};

// API for getting images

const getImages = async (req, res) => {
  try {
    const products = await Product.find({});
    const images = products.map((product) => ({
      id: product.id,
      imageUrl: product.image.url,
    }));
    res.json({ status: "Images Fetched", images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Error fetching images" });
  }
};

// API for adding product

const addProduct = async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }
  const result = await cloudinary.uploader.upload(req.body.image, {
    folder: "products",
  });
  const product = new Product({
    id: id,
    name: req.body.name,
    image: {
      public_id: result.public_id,
      url: result.secure_url,
    },
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  await product.save();
  console.log("Saved");
  res.json({
    success: true,
    name: req.body.name,
  });
};

// API for removing product

const removeProduct = async (req, res) => {
  const imgId = req.body.image.public_id;
  if (imgId) {
    await cloudinary.uploader.destroy(imgId);
  }
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  });
};

// API for getting all products

const getAllProducts = async (req, res) => {
  let products = await Product.find({});
  console.log("All Products Fetched");
  res.send(products);
};

// API for registering new user

const signup = async (req, res) => {
  console.log("Signup API is Executing ");
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res
      .status(400)
      .json({ success: false, errors: "existing user found with same email" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, process.env.SECRET_KEY);
  res.json({ success: true, token });
};

// API for user login

const login = async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, process.env.SECRET_KEY);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: "Wrong Password" });
    }
  } else {
    res.json({ success: false, errors: "Wrong Email Id" });
  }
};

// API for getting new collection

const getNewCollection = async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log("NewCollection Fetched");
  res.send(newcollection);
};

// API for getting popular in womens section

const getPopularInWomen = async (req, res) => {
  let products = await Product.find({ category: "women" });
  let popular_in_women = products.slice(0, 4);
  console.log("Popular in women fetched");
  res.send(popular_in_women);
};

// API to fetch user data

const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  } else {
    try {
      const data = jwt.verify(token, process.env.SECRET_KEY);
      req.user = data.user;
      next();
    } catch (error) {
      res
        .status(401)
        .send({ errors: "Please authenticate using a valid token" });
    }
  }
};

// API for adding product to cart

const addToCart = async (req, res) => {
  console.log("Added ", req.body.itemId);
  let userData = await Users.findOne({ _id: req.user.id });

  // Ensuring that userData and userData.cartData are initialized
  if (!userData) {
    userData = {};
  }
  if (!userData.cartData) {
    userData.cartData = {};
  }
  userData.cartData[req.body.itemId] =
    (userData.cartData[req.body.itemId] || 0) + 1;

  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.json({ message: "Added to Cart" });
};

// API for removing product from cart

const removeFromCart = async (req, res) => {
  console.log("Removed ", req.body.itemId);
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Removed from Cart");
};

// API for getting cart data

const getCart = async (req, res) => {
  try {
    console.log("Get Cart Data");

    let userData = await Users.findOne({ _id: req.user.id });

    if (!userData) {
      return res.status(404).json({ errors: "User not found" });
    }

    res.json(userData.cartData);
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).json({ errors: "Internal Server Error" });
  }
};

module.exports = {
  getHome,
  getImages,
  addProduct,
  removeProduct,
  getAllProducts,
  signup,
  login,
  fetchUser,
  getNewCollection,
  getPopularInWomen,
  addToCart,
  removeFromCart,
  getCart,
};

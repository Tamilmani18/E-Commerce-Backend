const express = require("express");
const cors = require("cors");
const app = express();

// Middleware

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

const {
  getHome,
  uploadImage,
  addProduct,
  removeProduct,
  getAllProducts,
  signup,
  login,
  getNewCollection,
  getPopularInWomen,
  addToCart,
  removeFromCart,
  getCart,
  fetchUser,
  upload,
} = require("../controllers/controller");
const router = express.Router();

// API for getting home page 
router.get("/", getHome);

// API for uploading image
router.use("/images", express.static(path.join(__dirname, '/upload/images')));
// router.use("/images", express.static("upload/images"));
router.post("/upload", upload.single("product"), uploadImage);

// API for adding product
router.post("/addproduct", addProduct);

// API for removing product
router.post("/removeproduct", removeProduct);

// API for getting all products
router.get("/allproducts", getAllProducts);

// API for signup
router.post("/signup", signup);

// API for login
router.post("/login", login);

// API for getting new collection
router.get("/newcollection", getNewCollection);

// API for getting popular in women section
router.get("/popularinwomen", getPopularInWomen);

// API for adding product to cart
router.post("/addtocart", fetchUser, addToCart);

// API for getting cart data
router.post("/getcart", fetchUser, getCart);

// API for removing product from cart
router.post("/removefromcart", fetchUser, removeFromCart);

module.exports = router;

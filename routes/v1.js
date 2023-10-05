const express = require("express");
const UserController = require("../controller/user.controller");
const CategoriesController = require("../controller/category.controller");
const ProductsController = require("../controller/product.controller");
const router = express.Router();
const passport = require("passport");

const { jwtAuth } = require("../middleware/passport");

const authUser = jwtAuth(passport).authenticate("jwt", { session: false });

router.get("/", (req, res) => {
  return res.json({ message: "Nothing here in this route" });
});

//************** User related Api's ******************//

router.post("/user", UserController.createUser); // Api to register user
router.get("/user", authUser, UserController.getUser); // Api to get user by token
router.post("/login", UserController.login); // Api to login user
router.post("/users", authUser, UserController.getAllUsers); // Api to get all users
router.get("/user", authUser, UserController.getUser); // Api to get a specific user details with token
router.get("/user/:id", authUser, UserController.getUserById); // Api to get a specific user details
router.put("/user/:id", authUser, UserController.updateUser); // Api to update a specific user
router.delete("/user/:id", authUser, UserController.deleteUser); // Api to delete a specific user

// **************** Bikes related Api's *************** //

router.post("/category", authUser, CategoriesController.createCategory); // Api to create a category
router.get("/categories", authUser, CategoriesController.getAllCategories); // Api to get all categories
router.get(
  "/categories/tree",
  authUser,
  CategoriesController.getAllListCategories
); // Api to get all categories as a tree
router.get(
  "/categories/admin",
  authUser,
  CategoriesController.getCategoriesByAdmin
); // Api to get a category for admin in a tree structure

router.get("/category/:id", authUser, CategoriesController.getCategoryById); // Api to get a partucular category

router.put("/category/:id", authUser, CategoriesController.updateCategory); // Api to update a category

router.delete("/category/:id", authUser, CategoriesController.deleteCategory); // Api to delete a category

// **************** Product related Api's ************** //

router.post("/product", authUser, ProductsController.createProduct); // Api to create product

router.get("/products", authUser, ProductsController.getAllProducts); // Api to get all products

router.get("/products/admin", authUser, ProductsController.getProductsByAdmin); // Api to get all products for admin

router.get("/product/:id", authUser, ProductsController.getProductById); // Api to get a particular product

router.post(
  "/products/filter",
  authUser,
  ProductsController.getProductByFilter
); // Api to filter the products

router.put("/product/:id", authUser, ProductsController.updateProduct); // Api to update a product

router.delete("/product/:id", authUser, ProductsController.Deleteproduct); // Api to delete a product

// *************** Admin Api's **************** //

router.post("/admin/login", UserController.adminLogin); // Api to login as an admin

module.exports = router;

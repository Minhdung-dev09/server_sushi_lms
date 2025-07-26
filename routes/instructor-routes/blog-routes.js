const express = require("express");
const router = express.Router();
const {
  getInstructorBlogs,
  getBlogDetails,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../../controllers/instructor-controller/blog-controller");
const authenticate = require("../../middleware/auth-middleware");

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all blogs for instructor
router.get("/get", getInstructorBlogs);

// Get blog details by ID
router.get("/get/details/:id", getBlogDetails);

// Create new blog
router.post("/add", createBlog);

// Update blog
router.put("/update/:id", updateBlog);

// Delete blog
router.delete("/delete/:id", deleteBlog);

module.exports = router;

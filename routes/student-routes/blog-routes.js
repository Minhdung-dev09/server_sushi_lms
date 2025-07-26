const express = require("express");
const router = express.Router();
const {
  getPublishedBlogs,
  getBlogDetails,
  getBlogsByCategory,
  getBlogsByTag,
  getPopularBlogs,
  getRecentBlogs,
  searchBlogs,
} = require("../../controllers/student-controller/blog-controller");

// Get all published blogs
router.get("/get", getPublishedBlogs);

// Get blog details by ID
router.get("/get/details/:id", getBlogDetails);

// Get blogs by category
router.get("/category/:category", getBlogsByCategory);

// Get blogs by tag
router.get("/tag/:tag", getBlogsByTag);

// Get popular blogs
router.get("/popular", getPopularBlogs);

// Get recent blogs
router.get("/recent", getRecentBlogs);

// Search blogs
router.get("/search", searchBlogs);

module.exports = router;

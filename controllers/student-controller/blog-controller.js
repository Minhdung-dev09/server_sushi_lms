const Blog = require("../../models/Blog");

// Get all published blogs for students
const getPublishedBlogs = async (req, res) => {
  try {
    const {
      status = "published",
      category,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    // Build filter - only published blogs
    const filter = { status: "published" };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("instructorId", "userName userEmail")
      .select("-content"); // Don't send full content in list view

    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting published blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get blog details by ID (student view)
const getBlogDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findOne({ _id: id, status: "published" }).populate(
      "instructorId",
      "userName userEmail"
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found or not published",
      });
    }

    // Increment view count
    await blog.incrementViewCount();

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Error getting blog details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get blogs by category
const getBlogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const filter = { status: "published", category };

    // Pagination
    const skip = (page - 1) * limit;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("instructorId", "userName userEmail")
      .select("-content");

    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting blogs by category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get blogs by tag
const getBlogsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const filter = { status: "published", tags: { $in: [tag] } };

    // Pagination
    const skip = (page - 1) * limit;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("instructorId", "userName userEmail")
      .select("-content");

    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting blogs by tag:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get popular blogs (by view count)
const getPopularBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.find({ status: "published" })
      .sort({ viewCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate("instructorId", "userName userEmail")
      .select("-content");

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.error("Error getting popular blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get recent blogs
const getRecentBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("instructorId", "userName userEmail")
      .select("-content");

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.error("Error getting recent blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Search blogs
const searchBlogs = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const filter = {
      status: "published",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ],
    };

    // Pagination
    const skip = (page - 1) * limit;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("instructorId", "userName userEmail")
      .select("-content");

    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error searching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getPublishedBlogs,
  getBlogDetails,
  getBlogsByCategory,
  getBlogsByTag,
  getPopularBlogs,
  getRecentBlogs,
  searchBlogs,
};

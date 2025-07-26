const Blog = require("../../models/Blog");
const User = require("../../models/User");

// Get all blogs for instructor
const getInstructorBlogs = async (req, res) => {
  try {
    const { _id: instructorId } = req.user;
    const { status, category, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { instructorId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Pagination
    const skip = (page - 1) * limit;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("instructorId", "userName userEmail");

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
    console.error("Error getting instructor blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get blog details by ID (instructor)
const getBlogDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: instructorId } = req.user;

    const blog = await Blog.findOne({ _id: id, instructorId }).populate(
      "instructorId",
      "userName userEmail"
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

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

// Create new blog
const createBlog = async (req, res) => {
  try {
    const { _id: instructorId } = req.user;
    const { title, summary, content, category, author, image, tags, status } =
      req.body;

    // Check if instructor exists
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    // Check for duplicate title within the same instructor
    const existingBlog = await Blog.findOne({ title, instructorId });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: "A blog with this title already exists",
      });
    }

    // Validate image URL format
    if (image && !isValidImageUrl(image)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image URL format",
      });
    }

    // Validate tags length
    if (tags && tags.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Cannot have more than 10 tags",
      });
    }

    const blog = new Blog({
      title,
      summary,
      content,
      category,
      author,
      image,
      tags: tags || [],
      status,
      instructorId,
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: instructorId } = req.user;
    const { title, summary, content, category, author, image, tags, status } =
      req.body;

    // Find blog and check ownership
    const blog = await Blog.findOne({ _id: id, instructorId });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Check for duplicate title (excluding current blog)
    if (title && title !== blog.title) {
      const existingBlog = await Blog.findOne({
        title,
        instructorId,
        _id: { $ne: id },
      });
      if (existingBlog) {
        return res.status(400).json({
          success: false,
          message: "A blog with this title already exists",
        });
      }
    }

    // Validate image URL format
    if (image && !isValidImageUrl(image)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image URL format",
      });
    }

    // Validate tags length
    if (tags && tags.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Cannot have more than 10 tags",
      });
    }

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        summary,
        content,
        category,
        author,
        image,
        tags,
        status,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: instructorId } = req.user;

    const blog = await Blog.findOne({ _id: id, instructorId });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Helper function to validate image URL
const isValidImageUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

module.exports = {
  getInstructorBlogs,
  getBlogDetails,
  createBlog,
  updateBlog,
  deleteBlog,
};

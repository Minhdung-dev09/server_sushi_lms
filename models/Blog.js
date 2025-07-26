const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
      trim: true,
    },
    summary: {
      type: String,
      maxlength: [500, "Summary cannot exceed 500 characters"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    category: {
      type: String,
      enum: [
        "Học tập",
        "Kỹ năng",
        "Phát triển",
        "Công nghệ",
        "Ngôn ngữ",
        "Giáo dục",
        "Khác",
      ],
      default: "Khác",
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        maxlength: [50, "Each tag cannot exceed 50 characters"],
      },
    ],
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "draft",
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor ID is required"],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
blogSchema.index({ instructorId: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to sanitize content
blogSchema.pre("save", function (next) {
  // Basic HTML sanitization - remove script tags
  if (this.content) {
    this.content = this.content.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );
  }
  next();
});

// Method to increment view count
blogSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

// Method to increment like count
blogSchema.methods.incrementLikeCount = function () {
  this.likeCount += 1;
  return this.save();
};

// Method to decrement like count
blogSchema.methods.decrementLikeCount = function () {
  if (this.likeCount > 0) {
    this.likeCount -= 1;
  }
  return this.save();
};

module.exports = mongoose.model("Blog", blogSchema);

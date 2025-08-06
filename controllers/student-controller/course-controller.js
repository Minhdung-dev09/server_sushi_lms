const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

const getStudentViewCourseList = async (req, res) => {
  try {
    const {
      category = [],
      level = [],
      primaryLanguage = [],
      sortBy = "price-lowtohigh",
    } = req.query;

    console.log(req.query, "req.query");

    let filters = {};
    if (category.length) {
      filters.category = { $in: category.split(",") };
    }
    if (level.length) {
      filters.level = { $in: level.split(",") };
    }
    if (primaryLanguage.length) {
      filters.primaryLanguage = { $in: primaryLanguage.split(",") };
    }

    let sortParam = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sortParam.pricing = 1;

        break;
      case "price-hightolow":
        sortParam.pricing = -1;

        break;
      case "title-atoz":
        sortParam.title = 1;

        break;
      case "title-ztoa":
        sortParam.title = -1;

        break;

      default:
        sortParam.pricing = 1;
        break;
    }

    const coursesList = await Course.find(filters).sort(sortParam);

    res.status(200).json({
      success: true,
      data: coursesList,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getStudentViewCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "No course details found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const checkCoursePurchaseInfo = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const studentCourses = await StudentCourses.findOne({
      userId: studentId,
    });

    let ifStudentAlreadyBoughtCurrentCourse = false;
    if (studentCourses && Array.isArray(studentCourses.courses)) {
      ifStudentAlreadyBoughtCurrentCourse =
        studentCourses.courses.findIndex((item) => item.courseId === id) > -1;
    }

    res.status(200).json({
      success: true,
      data: ifStudentAlreadyBoughtCurrentCourse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// Enroll in free course
const enrollFreeCourse = async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
    } = req.body;

    // Check if course is actually free
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.pricing !== 0) {
      return res.status(400).json({
        success: false,
        message: "This course is not free",
      });
    }

    // Check if user already enrolled
    const existingEnrollment = await StudentCourses.findOne({
      userId: userId,
      "courses.courseId": courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    // Add course to student's courses
    const studentCourses = await StudentCourses.findOne({
      userId: userId,
    });

    if (studentCourses) {
      studentCourses.courses.push({
        courseId: courseId,
        title: courseTitle,
        instructorId: instructorId,
        instructorName: instructorName,
        dateOfPurchase: new Date(),
        courseImage: courseImage,
      });

      await studentCourses.save();
    } else {
      const newStudentCourses = new StudentCourses({
        userId: userId,
        courses: [
          {
            courseId: courseId,
            title: courseTitle,
            instructorId: instructorId,
            instructorName: instructorName,
            dateOfPurchase: new Date(),
            courseImage: courseImage,
          },
        ],
      });

      await newStudentCourses.save();
    }

    // Update course schema students
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: {
        students: {
          studentId: userId,
          studentName: userName,
          studentEmail: userEmail,
          paidAmount: "0",
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully enrolled in free course",
      data: {
        courseId: courseId,
        courseTitle: courseTitle,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = {
  getStudentViewCourseList,
  getStudentViewCourseDetails,
  checkCoursePurchaseInfo,
  enrollFreeCourse,
};

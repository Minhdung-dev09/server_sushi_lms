const express = require("express");
const {
  getStudentViewCourseDetails,
  getStudentViewCourseList,
  checkCoursePurchaseInfo,
  enrollFreeCourse,
} = require("../../controllers/student-controller/course-controller");
const authenticate = require("../../middleware/auth-middleware");
const router = express.Router();

router.get("/get", getStudentViewCourseList);
router.get("/get/details/:id", getStudentViewCourseDetails);
router.get("/purchase-info/:id/:studentId", checkCoursePurchaseInfo);
router.post("/enroll-free", authenticate, enrollFreeCourse);

module.exports = router;

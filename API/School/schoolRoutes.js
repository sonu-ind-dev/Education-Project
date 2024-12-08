const express = require("express");
const {
  Signup,
  Signin,
  EditSchoolProfile,
  AddClass,
  ChangeClassNumber,
  AddClassSection,
  RenameClassSection,
  AddTeacherIntoSchool,
  RemoveTeacherFromSchool,
} = require("./school");
const sendResponse = require("../../responseFormat");
const School = require("../../models/school");
const ClassModel = require("../../models/class");
const { isTeacherExists } = require("../Teacher/teacher");

const router = express.Router();

/**
 * Middleware to check if a school exists by school_id.
 */
exports.isSchoolExists = async (req, res, next) => {
  try {
    const school_id =
      req.params.school_id || req.query.school_id || req.body.school_id;

    if (!school_id) {
      return sendResponse(res, false, "school_id not provided!");
    }

    const school = await School.findByPk(school_id);
    if (!school) {
      return sendResponse(
        res,
        false,
        `School not found with the provided school_id: ${school_id}`
      );
    }

    req.school = school;
    next();
  } catch (error) {
    console.error("Error in isSchoolExists middleware:", error);
    sendResponse(res, false, "Failed to verify school existence.", {}, error);
  }
};

/**
 * Middleware to check if a class exists by class_id.
 */
exports.isClassExists = async (req, res, next) => {
  try {
    const class_id =
      req.params.class_id || req.query.class_id || req.body.class_id;

    if (!class_id) {
      return sendResponse(res, false, "class_id not provided!");
    }

    const Class = await ClassModel.findByPk(class_id);
    if (!Class) {
      return sendResponse(
        res,
        false,
        `Class not found with the provided class_id: ${class_id}`
      );
    }

    req.Class = Class;
    next();
  } catch (error) {
    console.error("Error in isClassExists middleware:", error);
    sendResponse(res, false, "Failed to verify class existence.", {}, error);
  }
};

// Routes
router.post("/signup", Signup); // School signup
router.get("/signin", Signin); // School signin

router.put(
  "/school_id/:school_id/editSchoolProfile",
  this.isSchoolExists,
  EditSchoolProfile
); // Edit school profile

router.post("/school_id/:school_id/addClass", this.isSchoolExists, AddClass); // Add a class
router.put(
  "/school_id/:school_id/class_id/:class_id/changeClassNumber",
  this.isSchoolExists,
  this.isClassExists,
  ChangeClassNumber
); // Change class number

// router.post("/:school_id/:class_id/deleteClass", isClassExists, DeleteClass);

router.post(
  "/school_id/:school_id/class_id/:class_id/addClassSection",
  this.isSchoolExists,
  this.isClassExists,
  AddClassSection
); // Add a class section

router.put(
  "/school_id/:school_id/class_id/:class_id/renameClassSection",
  this.isSchoolExists,
  this.isClassExists,
  RenameClassSection
); // Rename class section

// router.post("/:school_id/:class_id/deleteSection", isSchoolExists, isClassExists, DeleteSection);

router.post(
  "/school_id/:school_id/teacher_id/:teacher_id/addTeacherIntoSchool",
  this.isSchoolExists,
  isTeacherExists,
  AddTeacherIntoSchool
); // Add a teacher in school

router.delete(
  "/school_id/:school_id/teacher_id/:teacher_id/removeTeacherFromSchool",
  this.isSchoolExists,
  isTeacherExists,
  RemoveTeacherFromSchool
); // Remove a teacher from school

module.exports = router;

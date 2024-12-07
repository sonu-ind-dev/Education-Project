const express = require("express");
const {
  Signup,
  Signin,
  EditSchoolProfile,
  AddClass,
  ChangeClassNumber,
  AddClassSection,
  RenameClassSection,
} = require("./school");
const sendResponse = require("../../responseFormat");
const School = require("../../models/school");
const ClassModel = require("../../models/class");

const router = express.Router();

const isSchoolExists = async (req, res, next) => {
  const school_id =
    req?.params?.school_id || req?.query?.school_id || res?.body?.school_id || req?.school_id;

  if (!school_id) {
    return sendResponse(req, false, "school_id not found!");
  } else {
    const school = await School.findByPk(school_id);
    if (!school) {
      return sendResponse(
        res,
        false,
        `School not found with the provided school_id: ${school_id}`
      );
    } else {
      req.school = school;
    }
  }

  next();
};

const isClassExists = async (req, res, next) => {
  const class_id =
    req?.params?.class_id || req?.query?.class_id || res?.body?.class_id || req?.class_id;

  if (!class_id) {
    return sendResponse(req, false, "class_id not found!");
  } else {
    const Class = await ClassModel.findByPk(class_id);
    if (!Class) {
      return sendResponse(
        res,
        false,
        `Class not found with the provided class_id: ${class_id}`
      );
    } else {
      req.Class = Class;
    }
  }

  next();
};

router.post("/signup", Signup);
router.get("/signin", Signin);
router.put("/editSchoolProfile/:school_id", isSchoolExists, EditSchoolProfile);

router.post("/:school_id/addClass", isSchoolExists, AddClass);
router.put(
  "/:school_id/:class_id/changeClassNumber",
  isSchoolExists,
  isClassExists,
  ChangeClassNumber
);
// router.post("/:school_id/deleteClass", isClassExists, DeleteClass);
router.post(
  "/:school_id/:class_id/addClassSection",
  isSchoolExists,
  isClassExists,
  AddClassSection
);
router.put(
  "/:school_id/:class_id/renameClassSection",
  isSchoolExists,
  isClassExists,
  RenameClassSection
);
// router.post("/:school_id/:class_id/deleteSection", isSchoolExists, isClassExists, DeleteSection);

module.exports = router;

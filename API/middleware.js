const sendResponse = require("../responseFormat");
const School = require("../models/school");
const ClassModel = require("../models/class");
const Teacher = require("../models/teacher");

/**
 * Middleware to check if a school exists by school_id.
 */
exports.isSchoolExists = async (req, res, next) => {
  try {
    let school_id =
      req.params.school_id || req.query.school_id || req.body.school_id;

    school_id = Number(school_id);

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
    let class_id =
      req.params.class_id || req.query.class_id || req.body.class_id;

    class_id = Number(class_id);

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

/**
 * Middleware to check if a teacher exists by teacher_id.
 */
exports.isTeacherExists = async (req, res, next) => {
  try {
    let teacher_id =
      req.params.teacher_id || req.query.teacher_id || req.body.teacher_id;

    teacher_id = Number(teacher_id);

    if (!teacher_id) {
      return sendResponse(res, false, "teacher_id not provided!");
    }

    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher) {
      return sendResponse(
        res,
        false,
        `Teacher not found with the provided teacher_id: ${teacher_id}`
      );
    }

    req.teacher = teacher;
    next();
  } catch (error) {
    console.error("Error in isTeacherExists middleware:", error);
    sendResponse(res, false, "Failed to verify teacher existence.", {}, error);
  }
};

/**
 * Middleware to check if a student exists by student_id.
 */
exports.isStudentExists = async (req, res, next) => {
  try {
    let student_id =
      req.params.student_id || req.query.student_id || req.body.student_id;

    student_id = Number(student_id);

    if (!student_id) {
      return sendResponse(res, false, "teacher_id not provided!");
    }

    const student = await Teacher.findByPk(student_id);
    if (!student) {
      return sendResponse(
        res,
        false,
        `Teacher not found with the provided teacher_id: ${student_id}`
      );
    }

    req.student = student;
    next();
  } catch (error) {
    console.error("Error in isTeacherExists middleware:", error);
    sendResponse(res, false, "Failed to verify teacher existence.", {}, error);
  }
};

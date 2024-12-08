const { Op } = require("sequelize");
const sequelize = require("../../database/db");
const sendResponse = require("../../responseFormat");
const Teacher = require("../../models/teacher");
const TeacherCredential = require("../../models/teacher_credential");

/**
 * Middleware to check if a teacher exists by teacher_id.
 */
exports.isTeacherExists = async (req, res, next) => {
  try {
    const teacher_id =
      req.params.teacher_id || req.query.teacher_id || req.body.teacher_id;

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

// Create Teacher Account & Save Credentials
exports.Signup = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { teacher_email, teacher_password, teacher_phone_number } = req.body;
    delete req.body.school_password;

    if (!teacher_email || !teacher_phone_number || !teacher_password) {
      return sendResponse(
        res,
        false,
        "Signin failed. Missing required details."
      );
    }

    const duplicateEntry = await Teacher.findOne({
      where: {
        [Op.or]: [{ teacher_email }, { teacher_phone_number }],
      },
    });

    if (duplicateEntry) {
      const errorMessage =
        duplicateEntry.teacher_email === teacher_email
          ? `The email '${teacher_email}' is already registered.`
          : `The phone number '${teacher_phone_number}' is already registered.`;

      return sendResponse(res, false, errorMessage);
    }

    const teacherInfo = await Teacher.create(req.body, { transaction });

    await TeacherCredential.create(
      {
        teacher_id: teacherInfo.teacher_id,
        teacher_phone_number,
        teacher_password,
      },
      { transaction }
    );

    await transaction.commit();

    sendResponse(
      res,
      true,
      "Teacher account has been created successfully.",
      teacherInfo
    );
  } catch (error) {
    await transaction.rollback();

    console.error("Error while creating teacher account:", error);

    sendResponse(
      res,
      false,
      `Account creation failed. Reason: ${error.message}`,
      {},
      error
    );
  }
};

// Signin As Teacher
exports.Signin = async (req, res) => {
  try {
    const { teacher_phone_number, teacher_password } = req.query;

    if (!teacher_phone_number || !teacher_password) {
      return sendResponse(
        res,
        false,
        "Signin failed. Missing phone number or password."
      );
    }

    const { teacher_id } =
      (await TeacherCredential.findOne({
        where: { teacher_phone_number, teacher_password },
        attributes: ["teacher_id"],
      })) || {};

    if (!teacher_id) {
      return sendResponse(
        res,
        false,
        "No teacher found. Please check the provided values."
      );
    }

    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher) {
      return sendResponse(
        res,
        false,
        "Teacher credential matched but teacher details not found."
      );
    }

    sendResponse(res, true, "Signin successful.", teacher);
  } catch (error) {
    console.error("Error during signin:", error);
    sendResponse(
      res,
      false,
      `Signin failed. Reason: ${error.message}`,
      {},
      error
    );
  }
};
